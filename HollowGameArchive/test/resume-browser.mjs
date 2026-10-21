import assert from 'node:assert/strict';
import fs from 'node:fs';

// ponytail: real-browser check without a new dependency; point PLAYWRIGHT_MODULE at an installed Playwright.
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node test/resume-browser.mjs http://127.0.0.1:29811 /path/to/evidence
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:29811';
const out = process.argv[3];
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser', args: ['--no-sandbox'] });
const report = [];
const errors = [];
const expectedGroups = [
  ['Engines & frameworks', 'Unity', 'Cocos / Cocos Creator', 'React.js', 'PixiJS', 'Phaser', 'Unreal'],
  ['Languages', 'C#', 'C++', 'C', 'Lua', 'TypeScript', 'JavaScript', 'PHP', 'HTML5'],
  ['Engineering practices', 'OOP', 'Design Patterns', 'SOLID', 'TDD', 'DRY', 'KISS', 'YAGNI'],
  ['Ways of working', 'Agile', 'Communication', 'Teamwork', 'Self-planning', 'RnD', 'Critical Thinking', 'Problem Solving'],
  ['Tools', 'Git', 'Github Project', 'AI Agent', 'Notion', 'Blender', 'Jira', 'Photoshop'],
  ['Editors', 'Rider', 'Visual Studio Code', 'Visual Studio'],
  ['DevOps', 'Github Action', 'Docker'],
];
try {
  for (const width of [1440, 1024, 821, 820, 601, 600, 390, 381, 380, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => { if (new URL(request.url()).origin === new URL(base).origin) errors.push(request.url() + ': ' + request.failure()?.errorText); });
    page.on('response', response => { if (new URL(response.url()).origin === new URL(base).origin && response.status() >= 400) errors.push(response.url() + ': ' + response.status()); });
    await page.goto(new URL('/resume', base).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate(() => {
      const visible = [...document.querySelectorAll('.resume h1,.resume h2,.resume h3,.resume a,.skills-item,.timeline-description-list li,nav a')];
      return {
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        font: document.fonts.check('400 16px Poppins') && getComputedStyle(document.querySelector('.skills-item')).fontFamily.includes('Poppins'),
        groups: [...document.querySelectorAll('.skills-category')].map(node => [node.querySelector('h3').textContent, ...[...node.querySelectorAll('li')].map(x => x.textContent)]),
        jobs: [...document.querySelectorAll('.timeline-meta')].map(node => [node.querySelector('h3').textContent, node.querySelector('span').textContent]),
        bullets: document.querySelectorAll('.timeline-description-list li').length,
        sectionOrder: [...document.querySelectorAll('.resume > section')].map(node => node.id),
        clipped: visible.filter(node => { const r = node.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(node => node.textContent),
        targets: [...document.querySelectorAll('.resume-links a,nav a')].every(node => { const r = node.getBoundingClientRect(); return r.height >= 44 && r.width >= 44; }),
        primarySizes: [...document.querySelectorAll('.skills-primary .skills-item:first-child')].map(node => parseFloat(getComputedStyle(node).fontSize)),
      };
    });
    assert.ok(state.scrollWidth <= width + 1, `Overflow at ${width}`);
    assert.deepEqual(state.clipped, [], `Clipping at ${width}`);
    assert.ok(state.font, 'Poppins must be loaded and applied');
    assert.ok(state.targets, 'Navigation targets must be at least 44px tall');
    assert.deepEqual(state.groups, expectedGroups);
    assert.deepEqual(state.jobs, [['ADNX', 'August 2024 — present'], ['Rise Up', 'Dec 2023 — May 2024'], ['Gamota - Gabros Team', 'May 2023 — Oct 2023'], ['WeeGoon', 'Feb 2021 — April 2023']]);
    assert.equal(state.bullets, 21);
    assert.deepEqual(state.sectionOrder, ['skills', 'experience']);
    assert.ok(state.primarySizes.every(size => size === (width <= 600 ? 36 : 44)));
    if (out && [1440, 390].includes(width)) {
      await page.screenshot({ path: `${out}/first-${width}.png` });
      await page.screenshot({ path: `${out}/full-${width}.png`, fullPage: true });
    }
    const experience = page.locator('.resume-links a[href="#experience"]');
    await experience.focus();
    assert.notEqual(await experience.evaluate(node => getComputedStyle(node).outlineStyle), 'none', 'Keyboard focus must be visible');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/resume#experience');
    assert.ok(Math.abs(await page.locator('#experience').evaluate(node => node.getBoundingClientRect().top) - 24) < 2);
    if (out && [1440, 390].includes(width)) await page.screenshot({ path: `${out}/experience-${width}.png` });
    await page.reload({ waitUntil: 'networkidle' });
    assert.ok(Math.abs(await page.locator('#experience').evaluate(node => node.getBoundingClientRect().top) - 24) < 2, 'Deep link must survive reload');
    await page.locator('.resume-links a[href="#skills"]').click();
    await page.waitForURL('**/resume#skills');
    assert.ok(Math.abs(await page.locator('#skills').evaluate(node => node.getBoundingClientRect().top) - 24) < 2);
    report.push({ width, contentPreserved: true, noOverflow: true, keyboardAnchorsAndReload: true });
    await page.close();
  }
  assert.deepEqual(errors, [], 'No application errors or failed same-origin requests');
  console.log(JSON.stringify({ passed: report.length, checks: report, errors }, null, 2));
  if (out) fs.writeFileSync(`${out}/report.json`, JSON.stringify({ checks: report, errors }, null, 2));
} finally { await browser.close(); }
