import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

const dir = await mkdtemp(join(tmpdir(), 'portfolio-server-'));
await mkdir(join(dir, 'dist/assets'), { recursive: true });
await writeFile(join(dir, 'dist/index.html'), '<html>Hollow test</html>');
await writeFile(join(dir, 'dist/assets/video.mp4'), '0123456789');
await writeFile(join(dir, 'dist/assets/index-abcd1234.js'), 'console.log("test")');
await writeFile(join(dir, 'dist/assets/empty.pdf'), '');
await mkdir(join(dir, 'dist/Games/Archero/Build'), { recursive: true });
await writeFile(join(dir, 'dist/Games/Archero/index.html'), '<canvas>Game</canvas>');
await writeFile(join(dir, 'dist/Games/Archero/Build/test.wasm'), 'wasm');
await writeFile(join(dir, 'private.txt'), 'not public');
await symlink(join(dir, 'private.txt'), join(dir, 'dist/assets/out.pdf'));
const child = spawn(process.execPath, [new URL('./server.mjs', import.meta.url).pathname], {
  env: { ...process.env, PORT: '0', DIST_DIR: join(dir, 'dist') }, stdio: ['ignore', 'pipe', 'pipe'],
});
let origin;
try {
  origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timeout')), 5000);
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/127\.0\.0\.1:(\d+)/);
      if (match) { clearTimeout(timer); resolve(`http://127.0.0.1:${match[1]}`); }
    });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited ${code}`)); });
    child.once('error', error => { clearTimeout(timer); reject(error); });
  });
  const get = (path, options = {}) => new Promise((resolve, reject) => {
    const req = request(origin + path, options, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ code: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
  const home = await get('/');
  assert.equal(home.code, 200); assert.match(home.body, /Hollow test/);
  assert.equal(home.headers['x-content-type-options'], 'nosniff');
  assert.match(home.headers['content-security-policy'], /connect-src 'self'/);
  assert.match(home.headers['cache-control'], /no-cache/);
  const asset = await get('/assets/index-abcd1234.js?v=1');
  assert.equal(asset.code, 200); assert.match(asset.headers['content-type'], /javascript/);
  assert.match(asset.headers['cache-control'], /immutable/);
  const game = await get('/Games/Archero/index.html');
  assert.equal(game.code, 200); assert.match(game.headers['content-security-policy'], /wasm-unsafe-eval/);
  assert.ok(!home.headers['content-security-policy'].includes('wasm-unsafe-eval'));
  const wasm = await get('/Games/Archero/Build/test.wasm');
  assert.equal(wasm.code, 200); assert.equal(wasm.headers['content-type'], 'application/wasm');
  assert.equal((await get('/Games/Tele_GameFI/index.html')).code, 404);
  assert.equal((await get('/Games/Archero/ServiceWorker.js')).code, 404);
  const head = await get('/assets/video.mp4', { method: 'HEAD' });
  assert.equal(head.code, 200); assert.equal(head.body, ''); assert.equal(head.headers['content-length'], '10');
  const range = await get('/assets/video.mp4', { headers: { Range: 'bytes=2-4' } });
  assert.equal(range.code, 206); assert.equal(range.body, '234'); assert.equal(range.headers['content-range'], 'bytes 2-4/10');
  assert.equal((await get('/assets/video.mp4', { headers: { Range: 'bytes=-3' } })).body, '789');
  assert.equal((await get('/assets/video.mp4', { headers: { Range: 'bytes=9-' } })).body, '9');
  for (const value of ['bytes=30-', 'bytes=5-3', 'bytes=-0', 'bytes=0-1,5-6', 'invalid']) {
    assert.equal((await get('/assets/video.mp4', { headers: { Range: value } })).code, 416, value);
  }
  assert.equal((await get('/assets/empty.pdf')).code, 200);
  assert.equal((await get('/assets/empty.pdf', { headers: { Range: 'bytes=0-' } })).code, 416);
  for (const path of ['/.env', '/server.mjs', '/src/main.jsx', '/package.json', '/assets/.env', '/assets/../private.txt', '/assets/%2e%2e/private.txt', '/assets/%00.pdf', '/assets/%5Cprivate.pdf', '/assets/out.pdf', '/assets/missing.js', '/assets/index.js.map', '/assets/']) {
    assert.equal((await get(path)).code, 404, path);
  }
  assert.equal((await get('/assets/%ZZ')).code, 400);
  const post = await get('/', { method: 'POST' });
  assert.equal(post.code, 405); assert.equal(post.headers.allow, 'GET, HEAD');
  console.log('PASS: static origin, HEAD, cache/CSP, video ranges, malformed paths, symlink/source/secret rejection, method allowlist');
} finally {
  const closed = once(child, 'exit');
  child.kill('SIGTERM');
  await closed;
  await rm(dir, { recursive: true, force: true });
}
