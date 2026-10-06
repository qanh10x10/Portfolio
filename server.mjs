import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { getRoute } from './HollowGameArchive/src/utils/routes.js';

// ponytail: static portfolio only; add an API only for an actual server-side feature.
const root = await realpath(process.env.DIST_DIR || fileURLToPath(new URL('./HollowGameArchive/dist', import.meta.url)));
const port = Number(process.env.PORT || 29800);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.wasm': 'application/wasm', '.data': 'application/octet-stream',
  '.webmanifest': 'application/manifest+json', '.apk': 'application/vnd.android.package-archive',
};
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  const gameRequest = /^\/Games\/(Archero|Sudoku|TileCandy|Tilesmatch3|SurvivorIO)\//.test(req.url || '');
  // ponytail: WebAssembly capability applies only to the five existing demo paths.
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self'${gameRequest ? " 'wasm-unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' https:; frame-src https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self'; worker-src ${gameRequest ? "'self' blob:" : "'none'"}; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`);
  const fail = (code, text) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(text); };
  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return fail(405, 'Method not allowed'); }
  let path;
  try { path = decodeURIComponent((req.url || '').split('?')[0]); }
  catch { return fail(400, 'Invalid URL'); }
  // Only known client routes serve the shell; missing assets and secrets still return 404.
  if (getRoute(path)) path = '/index.html';
  if (path.includes('\\') || path.includes('\0') || path.split('/').some(part => part.startsWith('.')) || path.endsWith('/ServiceWorker.js') || !(path === '/index.html' || path.startsWith('/assets/') || /^\/Games\/(Archero|Sudoku|TileCandy|Tilesmatch3|SurvivorIO)\//.test(path))) return fail(404, 'Not found');
  const type = mime[extname(path).toLowerCase()];
  if (!type) return fail(404, 'Not found');
  try {
    const file = await realpath(resolve(root, `.${path}`));
    if (!file.startsWith(root + sep)) return fail(404, 'Not found');
    const info = await stat(file);
    if (!info.isFile()) return fail(404, 'Not found');
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', /-[A-Za-z0-9_-]{8,}\.(js|css)$/.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');
    let start = 0, end = info.size - 1, status = 200;
    if (req.headers.range && req.method === 'GET') {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!range || (!range[1] && !range[2])) { res.setHeader('Content-Range', `bytes */${info.size}`); return fail(416, 'Invalid range'); }
      if (range[1]) { start = Number(range[1]); end = range[2] ? Math.min(Number(range[2]), end) : end; }
      else { start = Math.max(0, info.size - Number(range[2])); }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) { res.setHeader('Content-Range', `bytes */${info.size}`); return fail(416, 'Invalid range'); }
      status = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
    }
    res.setHeader('Content-Length', Math.max(0, end - start + 1));
    res.writeHead(status);
    if (req.method === 'HEAD' || !info.size) return res.end();
    await pipeline(createReadStream(file, { start, end }), res);
  } catch (error) {
    if (res.headersSent) { res.destroy(); return; }
    if (['ENOENT', 'ENOTDIR', 'EACCES'].includes(error.code)) return fail(404, 'Not found');
    console.error('Static request failed:', error.code || error.name);
    fail(500, 'Server error');
  }
});
server.requestTimeout = 30000;
server.headersTimeout = 15000;
server.keepAliveTimeout = 5000;
server.maxRequestsPerSocket = 100;
server.on('error', error => { console.error('Server failed:', error.code || error.name); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`Portfolio listening on 127.0.0.1:${server.address().port}`));
process.on('SIGTERM', () => { server.close(); server.closeIdleConnections(); });
