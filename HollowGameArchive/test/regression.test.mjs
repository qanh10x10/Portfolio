import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROJECTS, CATEGORIES, ALL_PROJECT_DETAIL_KEYS } from '../src/data/projects.js';
import { buildMailtoDraft, RECIPIENT_EMAIL } from '../src/utils/contact.js';
import { getRoute } from '../src/utils/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = process.env.DIST_DIR || path.resolve(rootDir, 'dist');

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

const demoRoutes = { Archero: 'archero', Sudoku: 'sudoku', TileCandy: 'tilecandy', Tilesmatch3: 'tilesmatch3', SurvivorIO: 'surviver' };
for (const [game, project] of Object.entries(demoRoutes)) {
  const gameRoot = path.join(distDir, 'Games', game);
  const html = fs.readFileSync(path.join(gameRoot, 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(gameRoot, 'index.js'), 'utf8');
  assert.ok(html.includes(`href="/portfolio/${project}"`));
  assert.ok(!js.includes('serviceWorker.register'));
  for (const file of js.matchAll(/(?:dataUrl|frameworkUrl|codeUrl): buildUrl \+ "\/([^"]+)"/g)) assert.ok(fs.existsSync(path.join(gameRoot, 'Build', file[1])), file[1]);
}
console.log('  ✓ Build artifacts, game demos, security checks, and domain validation passed');

// 6. Route Parser & Validator Unit Tests (getRoute)
console.log('[Test 6] Verifying Pure Route Parser and Exact Detail Validation');
assert.deepEqual(getRoute('/'), { tab: 'about', detail: null });
assert.deepEqual(getRoute('/index.html'), { tab: 'about', detail: null });
assert.deepEqual(getRoute('/about'), { tab: 'about', detail: null });
assert.deepEqual(getRoute('/about/'), { tab: 'about', detail: null });
assert.deepEqual(getRoute('/resume'), { tab: 'resume', detail: null });
assert.deepEqual(getRoute('/resume/'), { tab: 'resume', detail: null });
assert.deepEqual(getRoute('/portfolio'), { tab: 'portfolio', detail: null });
assert.deepEqual(getRoute('/portfolio/'), { tab: 'portfolio', detail: null });
assert.deepEqual(getRoute('/contact'), { tab: 'contact', detail: null });
assert.deepEqual(getRoute('/contact/'), { tab: 'contact', detail: null });

// Project detail routes
for (const key of ALL_PROJECT_DETAIL_KEYS) {
  assert.deepEqual(getRoute(`/portfolio/${key}`), { tab: 'portfolio', detail: key });
  assert.deepEqual(getRoute(`/portfolio/${key}/`), { tab: 'portfolio', detail: key });
}

// Case sensitivity: MeowFlow must match exact case, meowflow must fail
assert.deepEqual(getRoute('/portfolio/MeowFlow'), { tab: 'portfolio', detail: 'MeowFlow' });
assert.equal(getRoute('/portfolio/meowflow'), null, 'getRoute must enforce exact case for detail id');

// Query parameter and hash tolerance
assert.deepEqual(getRoute('/portfolio/archero?from=nav'), { tab: 'portfolio', detail: 'archero' });
assert.deepEqual(getRoute('/resume#skills'), { tab: 'resume', detail: null });

// Invalid paths must return null
const invalidPaths = [
  '/unknown',
  '/portfolio/unknown',
  '/portfolio/archero/extra',
  '/about/private',
  '/portfolio/.env',
  '/portfolio/../about',
  '/portfolio/archero.map',
  '/assets/index.js',
  '/Games/Archero/index.html',
  '//',
  '',
  null,
  undefined,
];
for (const p of invalidPaths) {
  assert.equal(getRoute(p), null, `Path "${p}" must return null`);
}

console.log('  ✓ getRoute tabs, details, aliases, and rejection rules verified');

// 7. Source Game Demo Backlinks
console.log('[Test 7] Verifying Source Game Demo Return Links to Current Portfolio');
const gameMap = {
  'Archero': '/portfolio/archero',
  'Sudoku': '/portfolio/sudoku',
  'TileCandy': '/portfolio/tilecandy',
  'Tilesmatch3': '/portfolio/tilesmatch3',
  'SurvivorIO': '/portfolio/surviver',
  'Tele_GameFI': '/portfolio',
  'ToiletTapTap': '/portfolio',
};

for (const [gameDir, expectedBack] of Object.entries(gameMap)) {
  const filePath = path.join(rootDir, 'Games', gameDir, 'index.html');
  assert.ok(fs.existsSync(filePath), `Game file ${filePath} must exist`);
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(
    content.includes(`href="${expectedBack}"`),
    `${gameDir} must link back to "${expectedBack}"`
  );
  assert.ok(
    !content.includes('portfolio-hollow.vercel.app'),
    `${gameDir} must not link to old vercel portfolio`
  );
}

// Check MAD_WebGL template return link
const madTemplatePath = path.join(rootDir, 'Template/WebGLTemplates/MAD_WebGL/index.html');
if (fs.existsSync(madTemplatePath)) {
  const madContent = fs.readFileSync(madTemplatePath, 'utf8');
  assert.ok(madContent.includes('href="/portfolio"'));
  assert.ok(!madContent.includes('portfolio-hollow.vercel.app'));
}
console.log('  ✓ Game demo return links point to current origin routes');

// 8. Asset Paths & Anchors in Frontend Source
console.log('[Test 8] Verifying Root-Relative Assets, Game Hrefs, and Anchor Navigation in Source');
// Check projects.js images
for (const p of PROJECTS) {
  assert.ok(
    p.image.startsWith('/assets/') || p.image.startsWith('https://'),
    `Project "${p.id}" image "${p.image}" must be root-relative or HTTPS`
  );
}

// All literal local media references must exist; catch accidental path renames.
for (const file of fs.readdirSync(path.join(rootDir, 'src/components'))) {
  if (!file.endsWith('.jsx')) continue;
  const source = fs.readFileSync(path.join(rootDir, 'src/components', file), 'utf8');
  for (const match of source.matchAll(/(?:src|poster)=["']([^"']+)["']/g)) {
    const url = match[1];
    assert.ok(!url.startsWith('assets/'), `${file}: relative asset ${url}`);
    if (url.startsWith('/assets/')) assert.ok(fs.existsSync(path.join(rootDir, url.slice(1))), `${file}: missing ${url}`);
  }
}

// Check ProjectDetails.jsx
assert.ok(!projectDetailsSource.includes('portfolio-hollow.vercel.app'), 'ProjectDetails must not contain old vercel portfolio link');
assert.ok(projectDetailsSource.includes('href="/Games/Archero/index.html"'), 'Archero game link must be /Games/...');
assert.ok(projectDetailsSource.includes('href="/Games/Sudoku/index.html"'), 'Sudoku game link must be /Games/...');
assert.ok(projectDetailsSource.includes('href="/Games/TileCandy/index.html"'), 'TileCandy game link must be /Games/...');
assert.ok(projectDetailsSource.includes('href="/Games/Tilesmatch3/index.html"'), 'Tilesmatch3 game link must be /Games/...');

// Check Navbar.jsx uses native anchors
assert.ok(navbar.includes('<a'), 'Navbar must use anchor elements for tabs');
assert.ok(navbar.includes('href={`/${tab.id}`}'), 'Navbar anchors must have tab href');
assert.ok(navbar.includes('data-nav-link'), 'Navbar must retain data-nav-link attribute');

// Check PortfolioTab.jsx uses native anchors and inline back button
const portfolioTabSource = fs.readFileSync(path.join(rootDir, 'src/components/PortfolioTab.jsx'), 'utf8');
assert.ok(portfolioTabSource.includes('href={`/portfolio/${project.id}`}'), 'Project cards must be anchor links with detail href');
assert.ok(portfolioTabSource.includes('href="/portfolio"'), 'Portfolio detail header must have inline Back to portfolio link');
assert.ok(portfolioTabSource.includes('back-to-portfolio-link'), 'Inline back link must have class back-to-portfolio-link');

// Check AboutTab.jsx skill CTA
const aboutTabSource = fs.readFileSync(path.join(rootDir, 'src/components/AboutTab.jsx'), 'utf8');
assert.ok(aboutTabSource.includes('href="/resume#skills"'), 'About skill CTA must link to /resume#skills');
assert.ok(aboutTabSource.includes('id="skills-button"'), 'About skill CTA must retain id skills-button');
assert.ok(aboutTabSource.includes('with 5 years in the game industry'));
assert.ok(!aboutTabSource.includes('with 4+ years in the game industry'));

// Check App.jsx floating back button
const appSource = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
assert.ok(appSource.includes('id="portfolio-back-button"'), 'App must retain id portfolio-back-button');
assert.ok(appSource.includes('href="/portfolio"'), 'Floating back button must link to /portfolio');
console.log('  ✓ Root-relative assets, native anchors, and inline back buttons verified');

console.log('\nAll Regression Tests Passed Successfully!');
