import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROJECTS, CATEGORIES, ALL_PROJECT_DETAIL_KEYS } from '../src/data/projects.js';
import { buildMailtoDraft, RECIPIENT_EMAIL } from '../src/utils/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('Running Portfolio React Regression Tests...');

// 1. Navigation declarations (actual UI behavior is checked against the browser).
console.log('[Test 1] Verifying navigation declarations');
const navbar = fs.readFileSync(path.join(rootDir, 'src/components/Navbar.jsx'), 'utf8');
for (const tab of ['about', 'resume', 'portfolio', 'contact']) assert.ok(navbar.includes(`id: '${tab}'`));

// 2. Portfolio Filtering Logic
console.log('[Test 2] Verifying Portfolio Category Filtering');
assert.equal(CATEGORIES.length, 4, 'There must be 4 categories: All, Unity, Unreal, Applications');
assert.equal(PROJECTS.length, 16, 'Portfolio must contain 16 project cards');

assert.equal(PROJECTS.filter(p => p.category === 'unity').length, 15);
assert.equal(PROJECTS.filter(p => p.category === 'unreal').length, 1);
assert.equal(PROJECTS.filter(p => p.category === 'applications').length, 0);
assert.equal(new Set(PROJECTS.map(p => p.id)).size, PROJECTS.length);
console.log('  ✓ Actual project dataset and categories passed');

// 3. Project Details & Back Button Logic
console.log('[Test 3] Verifying Project Detail Content');
assert.equal(ALL_PROJECT_DETAIL_KEYS.length, 19, 'Must preserve all 19 project-detail components');

// Verify all 16 portfolio cards map to an existing project detail
for (const p of PROJECTS) {
  assert.ok(
    ALL_PROJECT_DETAIL_KEYS.includes(p.id),
    `Project card "${p.id}" must have a corresponding project detail component`
  );
}

// Verify the additional 3 project details are present
assert.ok(ALL_PROJECT_DETAIL_KEYS.includes('rpgRun'), 'rpgRun detail must be present');
assert.ok(ALL_PROJECT_DETAIL_KEYS.includes('betakuma'), 'betakuma detail must be present');
assert.ok(ALL_PROJECT_DETAIL_KEYS.includes('mugenHorror'), 'mugenHorror detail must be present');

// Verify ProjectDetails.jsx file defines all 19 keys
const projectDetailsSource = fs.readFileSync(path.join(rootDir, 'src/components/ProjectDetails.jsx'), 'utf8');
for (const key of ALL_PROJECT_DETAIL_KEYS) {
  assert.ok(
    projectDetailsSource.includes(`"${key}":`),
    `ProjectDetails.jsx must define handler for "${key}"`
  );
}

console.log('  ✓ Project cards and all 19 source details are consistent');

// 4. Secure Contact Draft Generation
console.log('[Test 4] Verifying Contact Form Security & Mailto Draft');
assert.equal(RECIPIENT_EMAIL, 'chuquanganh00@gmail.com');

const draft = buildMailtoDraft('Alice & Bob', 'alice@example.com', 'Hello! Looking for a game dev.');
assert.ok(draft.startsWith('mailto:chuquanganh00@gmail.com?'), 'Draft must target public email');
assert.ok(draft.includes('subject=Portfolio%20Contact%20from%20Alice%20%26%20Bob'), 'Subject must be URI-encoded');
assert.ok(draft.includes('alice%40example.com'), 'Email must be included in URI-encoded body');

// Bounded input test: long inputs truncated
const longName = 'A'.repeat(500);
const longEmail = 'b'.repeat(500) + '@example.com';
const longComments = 'C'.repeat(5000);
const boundedDraft = buildMailtoDraft(longName, longEmail, longComments);
assert.ok(boundedDraft.length < 5000, 'Draft length must be bounded to prevent URI overflow');
// UTF-16 boundaries and CR/LF must not corrupt or inject mail headers.
assert.doesNotThrow(() => buildMailtoDraft('a'.repeat(99) + '😀', 'qa@example.com', 'ok'));
const injected = new URL(buildMailtoDraft('Alice\r\nBcc: nobody@example.com', 'qa@example.com', 'Hi & subject=bad'));
assert.ok(!/[\r\n]/.test(injected.searchParams.get('subject')));
assert.equal(injected.searchParams.size, 2);
console.log('  ✓ Secure contact draft generation passed');

// 5. Build Artifact & Security Audit
console.log('[Test 5] Verifying Build Outputs, Security, and Public Domain in dist');
assert.ok(fs.existsSync(distDir), 'dist directory must exist after build');
const distHtmlPath = path.join(distDir, 'index.html');
assert.ok(fs.existsSync(distHtmlPath), 'dist/index.html must exist');

const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
assert.ok(distHtml.includes('https://portfolio.hollow-agent.xyz/'), 'dist/index.html must use canonical domain');
assert.ok(!distHtml.includes('n8n-f48v.onrender.com'), 'No unsolicited n8n webhook allowed');
assert.ok(!distHtml.includes('serviceWorker.register'), 'No service worker registration allowed');
assert.ok(!distHtml.includes('unpkg.com/ionicons'), 'No unpkg ionicons script tag allowed');
assert.ok(!distHtml.includes('jquery'), 'No jQuery runtime allowed');

// Ensure dangerous old files are NOT in dist
assert.ok(!fs.existsSync(path.join(distDir, 'assets/js/contact.js')), 'contact.js must not be in dist');
assert.ok(!fs.existsSync(path.join(distDir, 'assets/js/service-worker.js')), 'service-worker.js must not be in dist');
assert.ok(!fs.existsSync(path.join(distDir, '.env')), '.env must not be in dist');

// Ensure dangerous old files are NOT in working tree under assets/js
assert.ok(!fs.existsSync(path.join(rootDir, 'assets/js/contact.js')), 'contact.js must be removed from working tree');

for (const game of ['Archero', 'Sudoku', 'TileCandy', 'Tilesmatch3']) {
  const gameRoot = path.join(distDir, 'Games', game);
  const html = fs.readFileSync(path.join(gameRoot, 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(gameRoot, 'index.js'), 'utf8');
  assert.ok(html.includes('href="/"'));
  assert.ok(!js.includes('serviceWorker.register'));
  for (const file of js.matchAll(/(?:dataUrl|frameworkUrl|codeUrl): buildUrl \+ "\/([^"]+)"/g)) assert.ok(fs.existsSync(path.join(gameRoot, 'Build', file[1])), file[1]);
}
console.log('  ✓ Build artifacts, game demos, security checks, and domain validation passed');

console.log('\nAll Regression Tests Passed Successfully!');
