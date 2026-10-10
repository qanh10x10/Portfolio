import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ponytail: static portfolio build cleanup; removes local node_modules only when dist/index.html is verified.
export function cleanService(projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const root = path.resolve(projectDir);
  const distDir = path.join(root, 'dist');
  const indexHtml = path.join(distDir, 'index.html');

  if (!fs.existsSync(distDir)) {
    throw new Error(`Refusing cleanup: build directory missing at ${distDir}`);
  }

  const distStat = fs.lstatSync(distDir);
  if (distStat.isSymbolicLink() || !distStat.isDirectory()) throw new Error('Refusing cleanup: symlink or invalid dist');

  let stat;
  try {
    stat = fs.lstatSync(indexHtml);
  } catch {
    throw new Error(`Refusing cleanup: valid build output missing at ${indexHtml}`);
  }

  if (stat.isSymbolicLink()) {
    throw new Error(`Refusing cleanup: symlink rejected at ${indexHtml}`);
  }

  if (!stat.isFile() || stat.size === 0) {
    throw new Error(`Refusing cleanup: valid build output missing or empty at ${indexHtml}`);
  }

  const cleanupTargets = new Set([
    path.join(root, 'node_modules'),
    path.join(root, '.tsbuildinfo'),
    path.join(root, 'tsconfig.tsbuildinfo'),
  ]);

  try {
    for (const entry of fs.readdirSync(root)) {
      if (entry.endsWith('.tsbuildinfo')) {
        cleanupTargets.add(path.join(root, entry));
      }
    }
  } catch {
    // ignore readdir errors
  }

  for (const target of cleanupTargets) {
    if (fs.existsSync(target) || fs.lstatSync(target, { throwIfNoEntry: false })) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    cleanService();
    console.log('Cleaned unnecessary files after valid build.');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
