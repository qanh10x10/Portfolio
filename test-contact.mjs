import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createConnection } from 'node:net';
import { mkdtemp, rm, writeFile, chmod, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { execFileSync } from 'node:child_process';
import { createPortfolioServer } from './server.mjs';
import { createContactHandler, buildRfc822Message, RECIPIENT_EMAIL } from './contact-handler.mjs';

console.log('Running Contact Form API & Himalayan CLI Fixture Tests...');

const tempDir = await mkdtemp(join(tmpdir(), 'contact-test-'));
const fakeHimalayaPath = join(tempDir, 'fake-himalaya.mjs');
const capturedMailPath = join(tempDir, 'captured.eml');

// Fake Himalayan CLI fixture that writes stdin to a file and exits 0 (or fails on trigger)
const fakeCliScript = `#!/usr/bin/env node
import { readFileSync, appendFileSync } from 'node:fs';

const input = readFileSync(0, 'utf8');

if (process.env.TRIGGER_CLI_FAILURE === '1') {
  console.error('Simulated CLI error');
  process.exit(1);
}

appendFileSync(${JSON.stringify(capturedMailPath)}, '---MSG_START---\\n' + input + '\\n---MSG_END---\\n');
console.log(JSON.stringify({ status: 'ok' }));
process.exit(0);
`;

await writeFile(fakeHimalayaPath, fakeCliScript, 'utf8');
await chmod(fakeHimalayaPath, 0o755);

// Create primary server with test fixture configuration
const primaryHandler = createContactHandler({
  himalayaBin: process.execPath,
  himalayaArgs: [fakeHimalayaPath],
  ipLimit: 3,
  ipWindowMs: 60000,
  globalLimit: 10,
  globalWindowMs: 60000,
  maxConcurrency: 2,
  timeoutMs: 20000,
});

const server = createPortfolioServer({ contactHandler: primaryHandler });
server.listen(0, '127.0.0.1');
await once(server, 'listening');

const port = server.address().port;
const localOrigin = `http://127.0.0.1:${port}`;

function makeRequest(targetServer, { method = 'POST', path = '/api/contact', headers = {}, body = null }) {
  const srvPort = targetServer.address().port;
  const originUrl = `http://127.0.0.1:${srvPort}`;

  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Origin': originUrl,
      'Content-Type': 'application/json',
      ...headers,
    };
    if (headers.Origin === null) delete defaultHeaders.Origin;
    if (headers['Content-Type'] === null) delete defaultHeaders['Content-Type'];

    const req = request(originUrl, { method, path, headers: defaultHeaders }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: data, json });
      });
    });
    req.on('error', reject);
    if (body !== null) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

try {
  // 1. Valid submission with ASCII data
  console.log('[Test 1] Valid submission sends compliant RFC5322 email');
  await writeFile(capturedMailPath, '', 'utf8');
  const validRes = await makeRequest(server, {
    body: { name: 'Alice Smith', email: 'alice@example.com', comments: 'Looking forward to collaborating!' },
  });
  assert.equal(validRes.status, 200);
  assert.equal(validRes.json.ok, true);
  assert.equal(validRes.headers['cache-control'], 'no-store');
  assert.equal(validRes.headers['access-control-allow-origin'], localOrigin);

  const captured1 = await readFile(capturedMailPath, 'utf8');
  assert.ok(captured1.includes(`From: Chu Quang Anh Portfolio <${RECIPIENT_EMAIL}>`));
  assert.ok(captured1.includes(`To: <${RECIPIENT_EMAIL}>`));
  assert.ok(!captured1.toLowerCase().includes('bcc:'));
  assert.ok(captured1.includes('<alice@example.com>'));
  assert.ok(captured1.includes('Subject: =?UTF-8?B?'));
  assert.ok(captured1.includes('Message-ID: <'));
  assert.ok(captured1.includes('@portfolio.hollow-agent.xyz>'));
  assert.ok(captured1.includes('MIME-Version: 1.0'));
  assert.ok(captured1.includes('Content-Transfer-Encoding: base64'));

  // Decode base64 body from captured message
  const bodyBase64Match = captured1.match(/\r?\n\r?\n([A-Za-z0-9+/=\r\n]+)\r?\n---MSG_END---/);
  assert.ok(bodyBase64Match, 'Body base64 payload should be present');
  const decodedBody1 = Buffer.from(bodyBase64Match[1].replace(/[\r\n]/g, ''), 'base64').toString('utf8');
  assert.ok(decodedBody1.includes('Name: Alice Smith'));
  assert.ok(decodedBody1.includes('Email: alice@example.com'));
  assert.ok(decodedBody1.includes('Looking forward to collaborating!'));

  // 2. Max 100-character non-ASCII name byte preservation & RFC2047 header folding compliance
  console.log('[Test 2] Max non-ASCII name byte preservation & RFC2047 line/word compliance');
  await writeFile(capturedMailPath, '', 'utf8');
  const name100 = 'Đặng Vũ Hoàng Long - Trương Gia Bình - Nguyễn Thế Vinh - Lê Bá Khánh Trình - Vũ Như Tô - Trần Hưng Đạo'.slice(0, 100);
  assert.equal(name100.length, 100);

  const maxNameRes = await makeRequest(server, {
    body: { name: name100, email: 'nguyen@example.vn', comments: 'Xin chào! Game rất tuyệt vời 🎮.' },
  });
  assert.equal(maxNameRes.status, 200);

  const captured2 = await readFile(capturedMailPath, 'utf8');
  const emlContent = captured2.slice(captured2.indexOf('---MSG_START---\n') + '---MSG_START---\n'.length, captured2.indexOf('\n---MSG_END---'));

  // Verify header lines and word lengths
  const headerSection = emlContent.split(/\r?\n\r?\n/)[0];
  const headerLines = headerSection.split(/\r?\n/);
  for (const line of headerLines) {
    if (line.includes('=?UTF-8?B?')) {
      assert.ok(line.length <= 76, `Header line with encoded words must not exceed 76 chars, got ${line.length}: ${line}`);
    }
    const words = line.trim().split(/\s+/);
    for (const word of words) {
      if (word.startsWith('=?') && word.endsWith('?=')) {
        assert.ok(word.length <= 75, `RFC2047 encoded-word must not exceed 75 chars, got ${word.length}: ${word}`);
      }
    }
  }

  // Verify body line wrapping <= 76
  const bodySection = emlContent.split(/\r?\n\r?\n/)[1] || '';
  for (const bodyLine of bodySection.split(/\r?\n/)) {
    assert.ok(bodyLine.length <= 76, `Base64 body line must be <= 76 chars: got ${bodyLine.length}`);
  }

  // Decode captured message using python3 standard email library to verify exact byte preservation
  const pyMimeScript = `
import email, sys
from email.header import decode_header
import email.utils

msg = email.message_from_string(sys.stdin.read())
s_parts = decode_header(msg['Subject'])
s_decoded = ''.join(b.decode(enc or 'ascii') if isinstance(b, bytes) else b for b, enc in s_parts)

r_name, r_addr = email.utils.parseaddr(msg['Reply-To'])
r_parts = decode_header(r_name)
r_decoded = ''.join(b.decode(enc or 'ascii') if isinstance(b, bytes) else b for b, enc in r_parts)

assert s_decoded == 'Portfolio Contact from ' + sys.argv[1], f"Subject mismatch: {s_decoded}"
assert r_decoded == sys.argv[1], f"Name mismatch: {r_decoded}"
assert r_addr == 'nguyen@example.vn', f"Addr mismatch: {r_addr}"
print("OK")
`;
  const pyCheck = execFileSync('python3', ['-c', pyMimeScript, name100], { input: emlContent, encoding: 'utf8' });
  assert.equal(pyCheck.trim(), 'OK', 'Standard RFC MIME parser must decode 100-char name exactly');

  // 3. Multibyte characters split across streamed request chunks
  console.log('[Test 3] Streamed request with split UTF-8 multibyte boundary');
  await writeFile(capturedMailPath, '', 'utf8');
  const splitPayloadObj = {
    name: 'Player One',
    email: 'player@example.com',
    comments: 'Test multibyte split: Xin chào Hà Nội 🎮 và các bạn!',
  };
  const splitPayloadStr = JSON.stringify(splitPayloadObj);
  const fullBytes = Buffer.from(splitPayloadStr, 'utf8');

  // Find a multibyte byte sequence (e.g. within "chào" or "Hà" or emoji) and split inside it
  const emojiIndex = fullBytes.indexOf(Buffer.from('🎮'));
  assert.ok(emojiIndex > 0);
  const splitPos = emojiIndex + 2; // split 4-byte emoji right in the middle (2 bytes in chunk1, 2 bytes in chunk2)

  const chunkA = fullBytes.subarray(0, splitPos);
  const chunkB = fullBytes.subarray(splitPos);

  const streamRes = await new Promise((resolve, reject) => {
    const req = request(localOrigin, {
      method: 'POST',
      path: '/api/contact',
      headers: {
        'Origin': localOrigin,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    req.write(chunkA);
    setTimeout(() => {
      req.write(chunkB);
      req.end();
    }, 20);
  });

  assert.equal(streamRes.status, 200);
  const capturedStream = await readFile(capturedMailPath, 'utf8');
  const streamBodyMatch = capturedStream.match(/\r?\n\r?\n([A-Za-z0-9+/=\r\n]+)\r?\n---MSG_END---/);
  assert.ok(streamBodyMatch, 'Body base64 payload should be present');
  const decodedStreamBody = Buffer.from(streamBodyMatch[1].replace(/[\r\n]/g, ''), 'base64').toString('utf8');
  assert.ok(decodedStreamBody.includes('🎮'), 'Streamed emoji must not be corrupted by chunk split');
  assert.ok(decodedStreamBody.includes('Hà Nội'), 'Streamed Vietnamese text must not be corrupted');

  // 4. Exact Content-Type MIME requirement
  console.log('[Test 4] Content-Type strict MIME matching and parameter parsing');
  // Substring exploit attempt: text/plain; x=application/json must be rejected with 415
  const spoofCtRes = await makeRequest(server, {
    headers: { 'Content-Type': 'text/plain; x=application/json' },
    body: JSON.stringify({ name: 'Spoof', email: 'spoof@example.com', comments: 'Hello' }),
  });
  assert.equal(spoofCtRes.status, 415);

  const jsonPatchCtRes = await makeRequest(server, {
    headers: { 'Content-Type': 'application/json-patch+json' },
    body: JSON.stringify({ name: 'Spoof', email: 'spoof@example.com', comments: 'Hello' }),
  });
  assert.equal(jsonPatchCtRes.status, 415);

  // Valid with charset parameter must succeed
  const validCtWithCharset = await makeRequest(server, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ name: 'Valid Charset', email: 'valid@example.com', comments: 'Hello' }),
  });
  // Note: rate limit on primary server may be reached if 3 requests from same IP; let's check
  assert.ok([200, 429].includes(validCtWithCharset.status));

  // 5. Header injection prevention
  console.log('[Test 5] Reject CRLF header injection');
  const crlfNameRes = await makeRequest(server, {
    body: { name: 'Alice\r\nBcc: evil@example.com', email: 'alice@example.com', comments: 'Hello' },
  });
  assert.equal(crlfNameRes.status, 400);

  const crlfEmailRes = await makeRequest(server, {
    body: { name: 'Alice', email: 'alice@example.com\r\nTo: hacked@example.com', comments: 'Hello' },
  });
  assert.equal(crlfEmailRes.status, 400);

  // 6. Reject unexpected / extra fields
  console.log('[Test 6] Reject extra / arbitrary recipient fields');
  for (const extraKey of ['to', 'cc', 'bcc', 'from', 'subject', 'headers', 'extra']) {
    const extraRes = await makeRequest(server, {
      body: { name: 'Alice', email: 'alice@example.com', comments: 'Hello', [extraKey]: 'evil@example.com' },
    });
    assert.equal(extraRes.status, 400, `Must reject payload with extra key: ${extraKey}`);
  }

  // 7. Honeypot check
  console.log('[Test 7] Reject honeypot spam bot');
  const botRes = await makeRequest(server, {
    body: { name: 'SpamBot', email: 'bot@example.com', comments: 'Buy crypto', website: 'https://spam.com' },
  });
  assert.equal(botRes.status, 400);

  // 8. Field bounds and email validation
  console.log('[Test 8] Field bounds and email validation');
  const badEmailRes = await makeRequest(server, {
    body: { name: 'Alice', email: 'not-an-email', comments: 'Hello' },
  });
  assert.equal(badEmailRes.status, 400);

  const emptyCommentsRes = await makeRequest(server, {
    body: { name: 'Alice', email: 'alice@example.com', comments: '   ' },
  });
  assert.equal(emptyCommentsRes.status, 400);

  const longCommentsRes = await makeRequest(server, {
    body: { name: 'Alice', email: 'alice@example.com', comments: 'A'.repeat(2001) },
  });
  assert.equal(longCommentsRes.status, 400);

  // 9. Strict Origin enforcement
  console.log('[Test 9] Strict Origin enforcement');
  const badOrigin = await makeRequest(server, {
    headers: { Origin: 'https://evil-attacker.com' },
    body: { name: 'Alice', email: 'alice@example.com', comments: 'Hello' },
  });
  assert.equal(badOrigin.status, 403);

  const missingOrigin = await makeRequest(server, {
    headers: { Origin: null },
    body: { name: 'Alice', email: 'alice@example.com', comments: 'Hello' },
  });
  assert.equal(missingOrigin.status, 403);

  // 10. Method gate
  console.log('[Test 10] Method gate');
  const getRes = await makeRequest(server, { method: 'GET' });
  assert.equal(getRes.status, 405);
  assert.equal(getRes.headers.allow, 'POST');

  // 11. Payload too large (>12KiB)
  console.log('[Test 11] Payload too large (413)');
  const largeBody = JSON.stringify({
    name: 'Alice',
    email: 'alice@example.com',
    comments: 'X'.repeat(13 * 1024),
  });
  const largeRes = await makeRequest(server, { body: largeBody });
  assert.equal(largeRes.status, 413);

  // 12. Rate limiting synchronous reservation & failures count
  console.log('[Test 12] Rate limiting: concurrent same-IP reservation, failed send counting, global cap, window expiry');
  {
    // A. Concurrent reservation on same IP: limit 1, 2 simultaneous requests
    const limitHandler = createContactHandler({
      himalayaBin: process.execPath,
      himalayaArgs: [fakeHimalayaPath],
      ipLimit: 1,
      ipWindowMs: 60000,
      globalLimit: 10,
      maxConcurrency: 2,
    });
    const limitServer = createPortfolioServer({ contactHandler: limitHandler });
    limitServer.listen(0, '127.0.0.1');
    await once(limitServer, 'listening');

    try {
      const [r1, r2] = await Promise.all([
        makeRequest(limitServer, { body: { name: 'One', email: 'one@example.com', comments: 'First' } }),
        makeRequest(limitServer, { body: { name: 'Two', email: 'two@example.com', comments: 'Second' } }),
      ]);
      const statuses = [r1.status, r2.status].sort();
      assert.deepEqual(statuses, [200, 429], 'Concurrent same-IP requests must reserve quota synchronously without limit bypass');
    } finally {
      limitServer.close();
    }

    // B. Failed send attempts count towards rate limit
    let failAttempt = 0;
    const countingHandler = createContactHandler({
      sendCommand: async () => {
        failAttempt++;
        throw new Error('Simulated SMTP failure');
      },
      ipLimit: 1,
      ipWindowMs: 60000,
      globalLimit: 10,
    });
    const countingServer = createPortfolioServer({ contactHandler: countingHandler });
    countingServer.listen(0, '127.0.0.1');
    await once(countingServer, 'listening');

    try {
      // First attempt fails at SMTP -> returns 503
      const firstRes = await makeRequest(countingServer, { body: { name: 'Failer', email: 'fail@example.com', comments: 'Try 1' } });
      assert.equal(firstRes.status, 503, 'Failed transport must return 503');
      assert.equal(failAttempt, 1);

      // Second attempt from same IP must be rate-limited (429), proving failures count
      const secondRes = await makeRequest(countingServer, { body: { name: 'Failer', email: 'fail@example.com', comments: 'Try 2' } });
      assert.equal(secondRes.status, 429, 'Failed attempts must count towards rate limit quota');
      assert.equal(failAttempt, 1, 'Rate-limited request must not attempt sendCommand');
    } finally {
      countingServer.close();
    }

    // C. Multiple IP global cap
    const globalCapHandler = createContactHandler({
      himalayaBin: process.execPath,
      himalayaArgs: [fakeHimalayaPath],
      ipLimit: 10,
      globalLimit: 2,
      globalWindowMs: 60000,
    });
    const globalCapServer = createPortfolioServer({ contactHandler: globalCapHandler });
    globalCapServer.listen(0, '127.0.0.1');
    await once(globalCapServer, 'listening');

    try {
      const g1 = await makeRequest(globalCapServer, {
        headers: { 'cf-connecting-ip': '1.1.1.1' },
        body: { name: 'IP1', email: 'ip1@example.com', comments: 'Hi from 1' },
      });
      assert.equal(g1.status, 200);

      const g2 = await makeRequest(globalCapServer, {
        headers: { 'cf-connecting-ip': '2.2.2.2' },
        body: { name: 'IP2', email: 'ip2@example.com', comments: 'Hi from 2' },
      });
      assert.equal(g2.status, 200);

      // 3rd request from brand-new IP must be blocked by globalLimit: 2
      const g3 = await makeRequest(globalCapServer, {
        headers: { 'cf-connecting-ip': '3.3.3.3' },
        body: { name: 'IP3', email: 'ip3@example.com', comments: 'Hi from 3' },
      });
      assert.equal(g3.status, 429);
      assert.match(g3.json.error, /Service rate limit reached/);
    } finally {
      globalCapServer.close();
    }

    // D. Window expiry
    const expiryHandler = createContactHandler({
      himalayaBin: process.execPath,
      himalayaArgs: [fakeHimalayaPath],
      ipLimit: 1,
      ipWindowMs: 100, // 100ms window
      globalLimit: 10,
    });
    const expiryServer = createPortfolioServer({ contactHandler: expiryHandler });
    expiryServer.listen(0, '127.0.0.1');
    await once(expiryServer, 'listening');

    try {
      const exp1 = await makeRequest(expiryServer, { body: { name: 'Exp', email: 'exp@example.com', comments: 'Hi' } });
      assert.equal(exp1.status, 200);

      const exp2 = await makeRequest(expiryServer, { body: { name: 'Exp', email: 'exp@example.com', comments: 'Hi' } });
      assert.equal(exp2.status, 429);

      // Wait for window to expire
      await new Promise((r) => setTimeout(r, 150));

      const exp3 = await makeRequest(expiryServer, { body: { name: 'Exp', email: 'exp@example.com', comments: 'Hi' } });
      assert.equal(exp3.status, 200, 'After window expiry, requests must succeed again');
    } finally {
      expiryServer.close();
    }
  }

  // 13. Subprocess Transport Resilience
  console.log('[Test 13] Subprocess transport resilience: missing bin, EPIPE/immediate exit, flooded output, sleeping timeout');
  {
    // A. Missing executable (ENOENT)
    const missingBinHandler = createContactHandler({
      himalayaBin: '/path/to/nonexistent-binary-12345',
      ipLimit: 10,
    });
    const missingBinServer = createPortfolioServer({ contactHandler: missingBinHandler });
    missingBinServer.listen(0, '127.0.0.1');
    await once(missingBinServer, 'listening');

    try {
      const missingRes = await makeRequest(missingBinServer, {
        body: { name: 'Tester', email: 'tester@example.com', comments: 'Missing bin' },
      });
      assert.equal(missingRes.status, 503, 'Missing binary must return 503 without leaking error details');
      assert.ok(!missingRes.json.ok);
      assert.match(missingRes.json.error, /Message delivery was not confirmed/);
    } finally {
      missingBinServer.close();
    }

    // B. Child immediate exit with closed stdin while writing (EPIPE prevention)
    const immediateExitScript = join(tempDir, 'immediate-exit.mjs');
    await writeFile(immediateExitScript, `#!/usr/bin/env node\nprocess.exit(1);\n`, 'utf8');
    await chmod(immediateExitScript, 0o755);

    const immediateHandler = createContactHandler({
      himalayaBin: process.execPath,
      himalayaArgs: [immediateExitScript],
      ipLimit: 10,
    });
    const immediateServer = createPortfolioServer({ contactHandler: immediateHandler });
    immediateServer.listen(0, '127.0.0.1');
    await once(immediateServer, 'listening');

    try {
      const immRes = await makeRequest(immediateServer, {
        body: { name: 'Tester', email: 'tester@example.com', comments: 'Immediate exit' },
      });
      assert.equal(immRes.status, 503);
      assert.match(immRes.json.error, /Message delivery was not confirmed/);
    } finally {
      immediateServer.close();
    }

    // C. Flooded output: Child writes 5MB to stdout and stderr without reading stdin
    const floodScript = join(tempDir, 'flood.mjs');
    await writeFile(floodScript, `#!/usr/bin/env node
const chunk = 'F'.repeat(64 * 1024);
for (let i = 0; i < 80; i++) {
  process.stdout.write(chunk);
  process.stderr.write(chunk);
}
process.exit(0);
`, 'utf8');
    await chmod(floodScript, 0o755);

    const floodHandler = createContactHandler({
      himalayaBin: process.execPath,
      himalayaArgs: [floodScript],
      ipLimit: 10,
    });
    const floodServer = createPortfolioServer({ contactHandler: floodHandler });
    floodServer.listen(0, '127.0.0.1');
    await once(floodServer, 'listening');

    try {
      const floodRes = await makeRequest(floodServer, {
        body: { name: 'Flooder', email: 'flood@example.com', comments: 'Flood test' },
      });
      assert.equal(floodRes.status, 503, 'Excess output is bounded and must not claim delivery');
      assert.ok(!floodRes.body.includes('FFFF')); assert.ok(!floodRes.json.ok);
    } finally {
      floodServer.close();
    }

    // D. Sleeping CLI timeout kills child process without leak
    const sleepScript = join(tempDir, 'sleep.mjs');
    const sleepPidFile = join(tempDir, 'sleep.pid');
    await writeFile(sleepScript, `#!/usr/bin/env node
import {writeFileSync} from 'node:fs';
writeFileSync(${JSON.stringify(sleepPidFile)}, String(process.pid));
process.on('SIGTERM', () => process.exit(0));
setInterval(() => {}, 1000);
`, 'utf8');
    await chmod(sleepScript, 0o755);

    const timeoutHandler = createContactHandler({
      himalayaBin: process.execPath,
      himalayaArgs: [sleepScript],
      timeoutMs: 300, // 300ms timeout
      ipLimit: 10,
    });
    const timeoutServer = createPortfolioServer({ contactHandler: timeoutHandler });
    timeoutServer.listen(0, '127.0.0.1');
    await once(timeoutServer, 'listening');

    try {
      const tStart = Date.now();
      const timeoutRes = await makeRequest(timeoutServer, {
        body: { name: 'Sleeper', email: 'sleep@example.com', comments: 'Sleep test' },
      });
      const tElapsed = Date.now() - tStart;
      assert.equal(timeoutRes.status, 503, 'Timed-out child must return 503');
      assert.ok(tElapsed >= 250 && tElapsed <= 2000, `Elapsed time was ${tElapsed}ms`);
      assert.match(timeoutRes.json.error, /Message delivery was not confirmed/);
      const pid = Number(await readFile(sleepPidFile, 'utf8'));
      await new Promise(resolve => setImmediate(resolve));
      assert.throws(() => process.kill(pid, 0), error => error.code === 'ESRCH', 'Child must be gone after timeout response');
    } finally {
      timeoutServer.close();
    }
  }

  // Real socket cleanup: rejecting an incomplete request must close it, not retain a paused reader.
  const readServer = createPortfolioServer({ contactOptions: {
    bodyTimeoutMs: 40, sendCommand: async () => { throw Error('Must never send'); },
  } });
  await new Promise(resolve => readServer.listen(0, '127.0.0.1', resolve));
  try {
    for (const [bytes,expected] of [[1,400],[13000,413]]) {
      const socket = createConnection(readServer.address().port, '127.0.0.1');
      let received = '';
      socket.setEncoding('utf8');socket.on('data', d => { received += d; });
      const closed = once(socket, 'close');
      await once(socket, 'connect');
      socket.write(`POST /api/contact HTTP/1.1\r\nHost: localhost\r\nOrigin: http://127.0.0.1:${readServer.address().port}\r\nContent-Type: application/json\r\nContent-Length: 20000\r\n\r\n${'X'.repeat(bytes)}`);
      const timer = setTimeout(() => socket.destroy(Error('Request socket was not closed')), 1500);
      try { await closed; } finally { clearTimeout(timer); }
      assert.match(received, new RegExp(`^HTTP/1.1 ${expected} `));
    }
  } finally { await new Promise(resolve => readServer.close(resolve)); }

  // 14. Concurrency limit (returns 503 when saturated)
  console.log('[Test 14] Concurrency saturation returns 503');
  {
    let releaseSlow;
    const slowHandler = createContactHandler({
      sendCommand: () => new Promise((resolve) => { releaseSlow = resolve; }),
      ipLimit: 100,
      maxConcurrency: 1,
    });
    const concServer = createPortfolioServer({ contactHandler: slowHandler });
    concServer.listen(0, '127.0.0.1');
    await once(concServer, 'listening');

    try {
      const p1 = makeRequest(concServer, { body: { name: 'Conc1', email: 'c1@example.com', comments: 'First' } });
      // Second concurrent request should hit maxConcurrency: 1
      const res2 = await makeRequest(concServer, { body: { name: 'Conc2', email: 'c2@example.com', comments: 'Second' } });
      assert.equal(res2.status, 503);
      assert.match(res2.json.error, /Service busy/);
      releaseSlow();
      const res1 = await p1;
      assert.equal(res1.status, 200);
    } finally {
      concServer.close();
    }
  }

  console.log('\n✓ ALL Contact Form, Rate Limiting, MIME, and Subprocess Tests Passed Successfully!');
} finally {
  server.close();
  await rm(tempDir, { recursive: true, force: true });
}
