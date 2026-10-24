import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformWithOxc } from 'vite';


test('About renders a personal introduction, without a second Work/project gallery', async () => {
  const source = await fs.readFile(new URL('../src/components/AboutTab.jsx', import.meta.url), 'utf8');
  const { code } = await transformWithOxc(source, 'AboutTab.jsx', { jsx: { runtime: 'classic' } });
  const AboutTab = vm.runInNewContext(code.replace(/^import .*;$/gm, '').replace('export default ', '') + '\nAboutTab;', {
    React,
  });
  const html = renderToStaticMarkup(React.createElement(AboutTab));
  assert.ok(!html.includes('id="work"'), 'About must not start with Work');
  assert.ok(!html.includes('Project picture') && !html.includes('work-item'), 'project gallery belongs to Projects');
  assert.ok(html.includes('with 5 years in the game industry') && html.includes('Chu Quang Anh'));
  assert.ok(html.includes('href="/resume#skills"'), 'personal skill details remain reachable');
  assert.ok(!html.includes('class="jobs"') && !html.includes('id="contact"'), 'dedicated Resume/Contact content is not duplicated');
  assert.ok(html.includes('3D model credits') && html.includes('CC BY 4.0'), 'retain asset attribution');
});
