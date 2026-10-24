import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {transformWithOxc} from 'vite';
import {JOBS, SKILL_GROUPS} from '../src/data/jobs.js';

const source = new URL('../src/components/ResumeTab.jsx', import.meta.url);
const transformed = await transformWithOxc(await fs.readFile(source, 'utf8'), source.pathname);
const code = transformed.code
  .replaceAll('"react"', JSON.stringify(import.meta.resolve('react')))
  .replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve('react/jsx-runtime')))
  .replaceAll('"../data/jobs.js"', JSON.stringify(new URL('../src/data/jobs.js', import.meta.url).href));
const {default: ResumeTab} = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const experience = renderToStaticMarkup(React.createElement(ResumeTab));
assert.equal((experience.match(/class="resume-paper resume-job"/g) || []).length, JOBS.length);
assert.equal((experience.match(/<li>/g) || []).length, JOBS.reduce((n, job) => n + job.bullets.length, 0));
for (const job of JOBS) assert.ok(experience.includes(job.company));
assert.ok(experience.includes('<details') && experience.includes('<summary>'));
assert.ok(!/employee-card|lanyard|barcode/.test(experience));
const skills = renderToStaticMarkup(React.createElement(ResumeTab, {currentHash: '#skills'}));
assert.equal((skills.match(/class="resume-paper resume-skills"/g) || []).length, SKILL_GROUPS.length);
assert.equal((skills.match(/<li>/g) || []).length, SKILL_GROUPS.reduce((n, group) => n + group.skills.length, 0));
assert.ok(skills.includes('aria-label="Resume board"'));
console.log('PASS: rendered source Resume board preserves every job/bullet/skill and native paper disclosures; no retired badge UI');
