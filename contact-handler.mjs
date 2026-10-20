import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { isIP } from 'node:net';

export const RECIPIENT_EMAIL = 'chuquanganh00@gmail.com';
const MAX_BODY_BYTES = 12 * 1024; // 12KiB
const PROD_HIMALAYA_BIN = '/home/opc/.local/bin/himalaya';
const PROD_ARGS = ['message', 'send', '--account', 'primary', '--backend', 'smtp', '--no-save', '--json', '--log-level', 'off'];

// Helper to encode string into RFC 2047 encoded-words split on UTF-8 codepoint boundaries
export function encodeRfc2047Words(text, maxBytes = 30) {
  if (!text) return [];
  const words = [];
  let currentWord = '';
  let currentBytes = 0;
  for (const char of text) {
    const charBytes = Buffer.byteLength(char, 'utf8');
    if (currentBytes + charBytes > maxBytes) {
      if (currentWord) {
        words.push(`=?UTF-8?B?${Buffer.from(currentWord, 'utf8').toString('base64')}?=`);
      }
      currentWord = char;
      currentBytes = charBytes;
    } else {
      currentWord += char;
      currentBytes += charBytes;
    }
  }
  if (currentWord) {
    words.push(`=?UTF-8?B?${Buffer.from(currentWord, 'utf8').toString('base64')}?=`);
  }
  return words;
}

// Fold header lines containing RFC 2047 words so lines do not exceed 76 characters
export function formatEncodedHeader(headerName, words, suffix = '') {
  if (!words.length) {
    return suffix ? `${headerName}: ${suffix}` : `${headerName}:`;
  }
  const lines = [];
  let line = `${headerName}: ${words[0]}`;
  for (let i = 1; i < words.length; i++) {
    lines.push(line);
    line = ` ${words[i]}`;
  }
  if (suffix) {
    if ((line + ' ' + suffix).length <= 76) {
      line += ' ' + suffix;
    } else {
      lines.push(line);
      line = ` ${suffix}`;
    }
  }
  lines.push(line);
  return lines.join('\r\n');
}

// RFC 5322 / MIME message builder
export function buildRfc822Message({ name, email, comments }) {
  const cleanName = String(name || '').replace(/[\r\n\0]+/g, ' ').trim().slice(0, 100).toWellFormed();
  const cleanEmail = String(email || '').replace(/[\r\n\0]+/g, ' ').trim().slice(0, 100).toWellFormed();
  const cleanComments = String(comments || '').replace(/\0/g, '').trim().slice(0, 2000).toWellFormed();

  const messageId = `<${randomUUID()}@portfolio.hollow-agent.xyz>`;
  const dateStr = new Date().toUTCString();

  const subjectWords = encodeRfc2047Words(`Portfolio Contact from ${cleanName}`, 30);
  const subjectHeader = formatEncodedHeader('Subject', subjectWords);

  const nameWords = encodeRfc2047Words(cleanName, 30);
  const replyToHeader = formatEncodedHeader('Reply-To', nameWords, `<${cleanEmail}>`);

  const bodyPlain = `Name: ${cleanName}\r\nEmail: ${cleanEmail}\r\n\r\nMessage:\r\n${cleanComments}\r\n`;
  const base64Body = Buffer.from(bodyPlain, 'utf8').toString('base64').match(/.{1,76}/g)?.join('\r\n') || '';

  return [
    `From: Chu Quang Anh Portfolio <${RECIPIENT_EMAIL}>`,
    `To: <${RECIPIENT_EMAIL}>`,
    replyToHeader,
    subjectHeader,
    `Date: ${dateStr}`,
    `Message-ID: ${messageId}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body,
    '',
  ].join('\r\n');
}

export function sendViaHimalaya(rfc822, { himalayaBin = PROD_HIMALAYA_BIN, himalayaArgs = PROD_ARGS, timeoutMs = 20000 } = {}) {
  // ponytail: stdlib bounds output and kills on timeout; no SMTP implementation or automatic retries.
  return new Promise((resolve, reject) => {
    let inputFailed = false;
    const child = execFile(himalayaBin, himalayaArgs, {
      shell: false, timeout: timeoutMs, killSignal: 'SIGKILL', maxBuffer: 64 * 1024,
    }, error => {
      if (error || inputFailed) reject(new Error('Message delivery not confirmed'));
      else resolve();
    });
    child.stdin.on('error', () => { inputFailed = true; });
    child.stdin.end(rfc822, 'utf8');
  });
}

function getClientIp(req) {
  const remote = req.socket?.remoteAddress || '';
  const isLoopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
  if (isLoopback) {
    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string' && isIP(cfIp.trim())) {
      return cfIp.trim();
    }
  }
  return isIP(remote) ? remote : '127.0.0.1';
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin || typeof origin !== 'string') return false;
  if (origin === 'https://portfolio.hollow-agent.xyz') return true;
  const localPort = req.socket?.localPort;
  if (localPort && origin === `http://127.0.0.1:${localPort}`) return true;
  return false;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function createContactHandler(options = {}) {
  const himalayaBin = options.himalayaBin || PROD_HIMALAYA_BIN;
  const himalayaArgs = options.himalayaArgs || PROD_ARGS;
  const timeoutMs = options.timeoutMs ?? 20000;
  const sendCommand = options.sendCommand || ((rfc822) => sendViaHimalaya(rfc822, { himalayaBin, himalayaArgs, timeoutMs }));

  // ponytail: single instance in-memory rate limiting; upgrade to shared limiter (Redis/KV) only if scaled.
  const ipRequests = new Map(); // ip -> [timestamp]
  const globalRequests = [];
  const IP_LIMIT = options.ipLimit ?? 3;
  const IP_WINDOW_MS = options.ipWindowMs ?? 15 * 60 * 1000; // 15 mins
  const GLOBAL_LIMIT = options.globalLimit ?? 20;
  const GLOBAL_WINDOW_MS = options.globalWindowMs ?? 60 * 60 * 1000; // 1 hour
  const MAX_CONCURRENCY = options.maxConcurrency ?? 2;
  const MAX_MAP_ENTRIES = options.maxMapEntries ?? 10000;

  let activeSends = 0;

  function prune(now) {
    const minIpTime = now - IP_WINDOW_MS;
    for (const [ip, times] of ipRequests.entries()) {
      const fresh = times.filter((t) => t > minIpTime);
      if (fresh.length === 0) ipRequests.delete(ip);
      else ipRequests.set(ip, fresh);
    }
    const minGlobalTime = now - GLOBAL_WINDOW_MS;
    while (globalRequests.length > 0 && globalRequests[0] <= minGlobalTime) {
      globalRequests.shift();
    }
  }

  return async function handleContactRequest(req, res) {
    const origin = req.headers.origin;

    const sendJson = (status, payload, extraHeaders = {}) => {
      if (res.destroyed) return;
      if (!req.complete) {
        res.shouldKeepAlive = false;
        res.setHeader('Connection', 'close');
        res.once('finish', () => req.destroy());
      }
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'Vary': 'Origin',
        ...extraHeaders,
      };
      if (origin && isAllowedOrigin(req)) {
        headers['Access-Control-Allow-Origin'] = origin;
      }
      res.writeHead(status, headers);
      res.end(JSON.stringify(payload));
    };

    if (req.method !== 'POST') {
      return sendJson(405, { error: 'Method not allowed' }, { Allow: 'POST' });
    }

    if (!isAllowedOrigin(req)) {
      return sendJson(403, { error: 'Forbidden' });
    }

    const rawContentType = (req.headers['content-type'] || '').trim();
    const mediaType = rawContentType.split(';')[0].trim().toLowerCase();
    if (mediaType !== 'application/json') {
      return sendJson(415, { error: 'Unsupported media type' });
    }

    // Read body bounded to MAX_BODY_BYTES, safe against split UTF-8 chunks and connection stalls
    let chunks = [];
    let bodyBytes = 0;
    let payloadTooLarge = false;

    const readBody = new Promise((resolve, reject) => {
      let settled = false;
      let timer = null;

      const finish = (err, val) => {
        if (settled) return;
        settled = true;
        if (timer) { clearTimeout(timer); timer = null; }
        req.removeListener('data', onData);
        req.removeListener('end', onEnd);
        req.removeListener('error', onError);
        req.removeListener('close', onClose);
        if (err) reject(err);
        else resolve(val);
      };

      const bodyTimeoutMs = options.bodyTimeoutMs ?? 10000;
      if (bodyTimeoutMs > 0) {
        timer = setTimeout(() => {
          chunks = null;
          finish(new Error('Body read timeout'));
        }, bodyTimeoutMs);
        timer.unref();
      }

      function onData(chunk) {
        bodyBytes += chunk.length;
        if (bodyBytes > MAX_BODY_BYTES) {
          payloadTooLarge = true;
          chunks = null; // stop retaining body
          req.pause();
          finish(null, null);
          return;
        }
        if (chunks) {
          chunks.push(chunk);
        }
      }

      function onEnd() {
        if (chunks) {
          const text = Buffer.concat(chunks).toString('utf8');
          chunks = null;
          finish(null, text);
        } else {
          finish(null, null);
        }
      }

      function onError(err) {
        chunks = null;
        finish(err);
      }

      function onClose() {
        if (!settled && !req.readableEnded) {
          chunks = null;
          finish(new Error('Request closed before end'));
        }
      }

      req.on('data', onData);
      req.on('end', onEnd);
      req.on('error', onError);
      req.on('close', onClose);
    });

    let bodyText;
    try {
      bodyText = await readBody;
    } catch {
      return sendJson(400, { error: 'Invalid request body' });
    }

    if (payloadTooLarge) {
      return sendJson(413, { error: 'Payload too large' });
    }

    let parsed;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      return sendJson(400, { error: 'Invalid JSON' });
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return sendJson(400, { error: 'Invalid payload' });
    }

    // Reject unknown or extra fields
    const allowedKeys = new Set(['name', 'email', 'comments', 'website']);
    for (const key of Object.keys(parsed)) {
      if (!allowedKeys.has(key)) {
        return sendJson(400, { error: 'Unknown field rejected' });
      }
    }

    // Honeypot check
    if (parsed.website !== undefined) {
      if (typeof parsed.website !== 'string' || parsed.website.trim().length > 0) {
        return sendJson(400, { error: 'Bot detected' });
      }
    }

    // Field validation
    const { name, email, comments } = parsed;
    if (typeof name !== 'string' || typeof email !== 'string' || typeof comments !== 'string') {
      return sendJson(400, { error: 'Invalid field types' });
    }

    // Check for CRLF / header injection
    if (/[\r\n\0]/.test(name) || /[\r\n\0]/.test(email)) {
      return sendJson(400, { error: 'Header injection detected' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedComments = comments.trim();

    if (trimmedName.length < 1 || trimmedName.length > 100) {
      return sendJson(400, { error: 'Name must be 1 to 100 characters' });
    }

    if (trimmedEmail.length < 3 || trimmedEmail.length > 100 || !EMAIL_REGEX.test(trimmedEmail)) {
      return sendJson(400, { error: 'Invalid email address' });
    }

    if (trimmedComments.length < 1 || trimmedComments.length > 2000) {
      return sendJson(400, { error: 'Message must be 1 to 2000 characters' });
    }

    // Rate Limiting
    const now = Date.now();
    prune(now);

    const clientIp = getClientIp(req);
    const ipHits = ipRequests.get(clientIp) || [];
    if (ipHits.length >= IP_LIMIT) {
      return sendJson(429, { error: 'Too many requests from this IP. Please try again later.' });
    }

    if (globalRequests.length >= GLOBAL_LIMIT) {
      return sendJson(429, { error: 'Service rate limit reached. Please try again later.' });
    }

    // Concurrency limit
    if (activeSends >= MAX_CONCURRENCY) {
      return sendJson(503, { error: 'Service busy. Please try again shortly.' });
    }

    // Synchronous reservation before await sendCommand (even failed sends consume quota)
    ipHits.push(now);
    ipRequests.set(clientIp, ipHits);
    globalRequests.push(now);

    // Bound memory footprint of IP map
    if (ipRequests.size > MAX_MAP_ENTRIES) {
      const oldestKey = ipRequests.keys().next().value;
      if (oldestKey) ipRequests.delete(oldestKey);
    }

    activeSends++;
    try {
      const rfc822 = buildRfc822Message({
        name: trimmedName,
        email: trimmedEmail,
        comments: trimmedComments,
      });

      await sendCommand(rfc822);
      return sendJson(200, { ok: true, message: 'Message sent successfully.' });
    } catch {
      // Transport failure: 503 Service Unavailable without exposing internal secrets
      return sendJson(503, { error: 'Message delivery was not confirmed. Please contact me directly before resending.' });
    } finally {
      activeSends--;
    }
  };
}
