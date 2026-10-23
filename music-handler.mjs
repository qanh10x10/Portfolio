import { constants, createReadStream } from 'node:fs';
import { readdir, open } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';

const TYPES = { '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.wav': 'audio/wav', '.flac': 'audio/flac', '.webm': 'audio/webm' };
const safeName = name => name && !name.startsWith('.') && !/[\\/\x00-\x1f\x7f]/.test(name) && Buffer.byteLength(name) <= 255 && Object.hasOwn(TYPES, extname(name).toLowerCase());

// ponytail: one flat owner-managed folder; add a manifest only when custom metadata/order is needed.
export function createMusicHandler({ directory = process.env.MUSIC_DIR || '/data/portfolio-media/music' } = {}) {
  const root = resolve(directory);
  return async (req, res) => {
    const raw = (req.url || '').split('?')[0];
    const listing = raw === '/api/music';
    if (!listing && !raw.startsWith('/media/music/')) return false;
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', listing ? 'no-store' : 'no-cache');
    const fail = (code, message) => {
      const body = JSON.stringify({ error: message });
      res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
      res.end(req.method === 'HEAD' ? undefined : body);
      return true;
    };
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      return fail(405, 'Method not allowed');
    }
    if (listing) {
      try {
        let entries;
        try { entries = await readdir(root, { withFileTypes: true }); }
        catch (error) { if (error.code === 'ENOENT') entries = []; else throw error; }
        const tracks = entries.filter(e => e.isFile() && safeName(e.name))
          .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
          .map(({ name }) => ({ id: name, title: name.slice(0, -extname(name).length), url: `/media/music/${encodeURIComponent(name)}` }));
        const body = JSON.stringify({ tracks });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
        res.end(req.method === 'HEAD' ? undefined : body);
        return true;
      } catch { return fail(503, 'Local music playlist is temporarily unavailable.'); }
    }
    let name;
    try { name = decodeURIComponent(raw.slice('/media/music/'.length)); }
    catch { return fail(400, 'Invalid URL'); }
    if (!safeName(name)) return fail(404, 'Track not found');
    let file;
    try {
      // O_NOFOLLOW closes the listing/open race for symbolic links; never serve arbitrary assets.
      file = await open(resolve(root, name), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
      const info = await file.stat();
      if (!info.isFile()) return fail(404, 'Track not found');
      let start = 0, end = info.size - 1, code = 200;
      if (req.headers.range && req.method === 'GET') {
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        const first = match?.[1] ? Number(match[1]) : null;
        const last = match?.[2] ? Number(match[2]) : null;
        if (!match || (first === null && last === null) || (first !== null && !Number.isSafeInteger(first)) || (last !== null && !Number.isSafeInteger(last))) {
          res.setHeader('Content-Range', `bytes */${info.size}`);
          return fail(416, 'Invalid range');
        }
        if (first !== null) { start = first; if (last !== null) end = Math.min(last, end); }
        else start = Math.max(0, info.size - last);
        if (start > end || start >= info.size) {
          res.setHeader('Content-Range', `bytes */${info.size}`);
          return fail(416, 'Invalid range');
        }
        code = 206;
        res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
      }
      res.writeHead(code, { 'Content-Type': TYPES[extname(name).toLowerCase()], 'Content-Length': Math.max(0, end - start + 1), 'Accept-Ranges': 'bytes' });
      if (req.method === 'HEAD' || !info.size) res.end();
      else await pipeline(createReadStream(null, { fd: file.fd, autoClose: false, start, end }), res);
      return true;
    } catch (error) {
      if (res.headersSent) { res.destroy(); return true; }
      return fail(['ENOENT', 'ENOTDIR', 'EACCES', 'ELOOP'].includes(error.code) ? 404 : 503, 'Track unavailable');
    } finally { await file?.close(); }
  };
}
