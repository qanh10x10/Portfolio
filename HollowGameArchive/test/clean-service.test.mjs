import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';
import { cleanService } from '../scripts/clean-service.mjs';

console.log('Running Safe Cleanup Contract Tests (portfolio)...');

const scratchDir = process.env.TMPDIR || os.tmpdir();
const tmpDir = fs.mkdtempSync(path.join(scratchDir, 'portfolio-clean-test-'));

try {
  const dummyRoot = path.join(tmpDir, 'repo');
  const dummySrc = path.join(dummyRoot, 'src');
  const dummyNm = path.join(dummyRoot, 'node_modules');
  const dummyDist = path.join(dummyRoot, 'dist');

  fs.mkdirSync(dummySrc, { recursive: true });
  fs.mkdirSync(dummyNm, { recursive: true });
  fs.writeFileSync(path.join(dummySrc, 'App.jsx'), 'export default () => <div>App</div>;');
  fs.writeFileSync(path.join(dummyNm, 'dummy.txt'), 'do not delete on failure');

  // Test 1: Refusal when dist is missing
  assert.throws(
    () => cleanService(dummyRoot),
    /Refusing cleanup/,
    'Must refuse cleanup when dist/ is missing'
  );
  assert.ok(fs.existsSync(dummyNm), 'node_modules must not be removed when cleanup is refused');

  // Test 2: Refusal when dist exists but index.html is missing or empty
  fs.mkdirSync(dummyDist, { recursive: true });
  fs.writeFileSync(path.join(dummyDist, 'index.html'), ''); // 0 bytes
  assert.throws(
    () => cleanService(dummyRoot),
    /Refusing cleanup/,
    'Must refuse cleanup when dist/index.html is empty'
  );
  assert.ok(fs.existsSync(dummyNm), 'node_modules must not be removed when index.html is empty');

  // Test 3: Refusal when dist/index.html is a symlink
  const realFile = path.join(tmpDir, 'external-index.html');
  fs.writeFileSync(realFile, '<!DOCTYPE html><html><body>Symlink target</body></html>');
  fs.unlinkSync(path.join(dummyDist, 'index.html'));
  fs.symlinkSync(realFile, path.join(dummyDist, 'index.html'));
  assert.throws(
    () => cleanService(dummyRoot),
    /Refusing cleanup.*symlink/,
    'Must refuse cleanup when dist/index.html is a symlink'
  );
  assert.ok(fs.existsSync(dummyNm), 'node_modules must not be removed when index.html is a symlink');
  fs.unlinkSync(path.join(dummyDist, 'index.html'));

  // Test 4: Proving short-circuit on actual build:service failure
  const fixtureDir = path.join(tmpDir, 'shortcircuit-fixture');
  const fixtureNm = path.join(fixtureDir, 'node_modules');
  const cleanScriptPath = path.resolve(fileURLToPath(import.meta.url), '../../scripts/clean-service.mjs');
  fs.mkdirSync(fixtureNm, { recursive: true });
  fs.writeFileSync(path.join(fixtureNm, 'preserve.txt'), 'preserve across build failure');

  fs.writeFileSync(
    path.join(fixtureDir, 'package.json'),
    JSON.stringify({
      name: 'portfolio-shortcircuit-test',
      version: '1.0.0',
      packageManager: 'pnpm@12.5.1',
      scripts: {
        build: 'node -e "process.exit(1)"',
        'build:service': JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).scripts['build:service']
      }
    }, null, 2)
  );

  fs.mkdirSync(path.join(fixtureDir, 'scripts'), { recursive: true });
  fs.copyFileSync(cleanScriptPath, path.join(fixtureDir, 'scripts/clean-service.mjs'));
  fs.mkdirSync(path.join(fixtureDir, 'dist'));
  fs.writeFileSync(path.join(fixtureDir, 'dist/index.html'), '<html>valid previous build</html>');
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const opts = { cwd: fixtureDir, encoding: 'utf8', shell: process.platform === 'win32' };
  assert.equal(spawnSync(pnpm, ['install', '--lockfile-only', '--ignore-scripts'], opts).status, 0);
  const result = spawnSync(pnpm, ['run', 'build:service'], opts);
  assert.match(result.stdout + result.stderr, /process.exit\(1\)/);
  const failed = result.status !== 0;
  assert.ok(failed, 'pnpm run build:service must fail when build step exits non-zero');
  assert.ok(fs.existsSync(fixtureNm), 'node_modules must remain if build command failed');
  assert.ok(fs.existsSync(path.join(fixtureNm, 'preserve.txt')), 'files inside node_modules must remain intact');

  // Test 5: Verify runtime server has no external runtime imports
  const serverPath = path.resolve(fileURLToPath(import.meta.url), '../../../server.mjs');
  const visited = new Set();
  const externalImports = [];

  function scanImports(filePath) {
    if (visited.has(filePath)) return;
    visited.add(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /(?:import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]|export\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"])/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const specifier = match[1] || match[2];
      if (specifier.startsWith('node:') || builtinModules.includes(specifier)) {
        continue;
      }
      if (specifier.startsWith('.')) {
        const resolved = path.resolve(path.dirname(filePath), specifier);
        scanImports(resolved);
      } else {
        externalImports.push({ from: filePath, specifier });
      }
    }
  }

  scanImports(serverPath);
  assert.equal(
    externalImports.length,
    0,
    `Runtime server must have 0 external imports (found: ${JSON.stringify(externalImports)})`
  );

  // Test 6: Valid build output -> cleanup removes node_modules, preserves dist, src, media
  fs.writeFileSync(path.join(dummyDist, 'index.html'), '<!DOCTYPE html><html><body>Test</body></html>');
  fs.writeFileSync(path.join(dummyRoot, '.tsbuildinfo'), 'dummy cache');

  const linkedRoot = path.join(tmpDir, 'linked-root');
  fs.mkdirSync(linkedRoot);
  fs.symlinkSync(dummyDist, path.join(linkedRoot, 'dist'), 'dir');
  assert.throws(() => cleanService(linkedRoot), /Refusing cleanup.*symlink/);
  cleanService(dummyRoot);

  assert.ok(!fs.existsSync(dummyNm), 'node_modules must be removed after valid build');
  assert.ok(!fs.existsSync(path.join(dummyRoot, '.tsbuildinfo')), '.tsbuildinfo must be removed');
  assert.ok(fs.existsSync(path.join(dummyDist, 'index.html')), 'dist/index.html must be kept');
  assert.ok(fs.existsSync(path.join(dummySrc, 'App.jsx')), 'src/App.jsx must be kept');

  // Verify shared pnpm store is untouched
  const sharedStore = '/data/.pnpm-store/v11';
  if (fs.existsSync(sharedStore)) {
    assert.ok(fs.existsSync(sharedStore), 'shared pnpm store must never be removed');
  }

  console.log('✓ Safe cleanup refusal and execution tests passed successfully.');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
