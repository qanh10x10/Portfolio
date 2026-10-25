import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import React from 'react';
import { transformWithOxc } from 'vite';
import { getRoute } from '../src/utils/routes.js';

test('PortfolioChat: source URL normalization, modifier handling and strict allowlist', async () => {
  const source = await fs.readFile(new URL('../src/components/PortfolioChat.jsx', import.meta.url), 'utf8');
  const { code } = await transformWithOxc(source, 'PortfolioChat.jsx', { jsx: { runtime: 'classic' } });

  // Evaluate the transformed module in VM
  const moduleContext = {
    React,
    getRoute,
    exports: {},
  };
  const executable = code
    .replace(/^import .*;$/gm, '')
    .replace(/export const ([a-zA-Z0-9_]+) =/g, 'const $1 = exports.$1 =')
    .replace(/export function ([a-zA-Z0-9_]+)/g, 'function $1')
    .replace(/export default function ([a-zA-Z0-9_]+)/g, 'function $1') +
    '\nexports.normalizeSourceUrl = normalizeSourceUrl;\nexports.isModifiedEvent = isModifiedEvent;\nexports.ALLOWED_INTERNAL_SOURCE_RE = ALLOWED_INTERNAL_SOURCE_RE;';

  vm.runInNewContext(executable, moduleContext);
  const { normalizeSourceUrl, isModifiedEvent, ALLOWED_INTERNAL_SOURCE_RE } = moduleContext.exports;

  assert.ok(typeof normalizeSourceUrl === 'function', 'normalizeSourceUrl must be a function');
  assert.ok(typeof isModifiedEvent === 'function', 'isModifiedEvent must be a function');

  // Source /about MUST open actual About (/about#about, monitor with About dock), not /about home
  assert.equal(normalizeSourceUrl('/about'), '/about#about', '/about must normalize to /about#about');
  assert.equal(normalizeSourceUrl('/about#about'), '/about#about', '/about#about is preserved');
  assert.equal(normalizeSourceUrl('  /about  '), '/about#about', 'whitespace invalid falls back to /about#about');

  // Resume anchors and portfolio detail IDs preserve semantics
  assert.equal(normalizeSourceUrl('/contact'), '/contact');
  assert.equal(normalizeSourceUrl('/resume'), '/resume');
  assert.equal(normalizeSourceUrl('/resume#skills'), '/resume#skills');
  assert.equal(normalizeSourceUrl('/resume#experience'), '/resume#experience');
  assert.equal(normalizeSourceUrl('/portfolio'), '/portfolio');
  assert.equal(normalizeSourceUrl('/portfolio/archero'), '/portfolio/archero');
  assert.equal(normalizeSourceUrl('/portfolio/MeowFlow'), '/portfolio/MeowFlow');
  assert.equal(normalizeSourceUrl('/portfolio/unknown'), '/about#about', 'unknown portfolio slug falls back to /about#about');

  // External URLs fall back to /about#about
  assert.equal(normalizeSourceUrl('https://example.com'), '/about#about');

  // Malformed, invalid or script URLs fallback to /about#about
  assert.equal(normalizeSourceUrl('javascript:alert(1)'), '/about#about');
  assert.equal(normalizeSourceUrl('//malicious.com'), '/about#about');
  assert.equal(normalizeSourceUrl(''), '/about#about');
  assert.equal(normalizeSourceUrl(null), '/about#about');
  assert.equal(normalizeSourceUrl(undefined), '/about#about');

  // Strict internal allowlisting regex
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('/about#about'), true);
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('/about'), true);
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('/contact'), true);
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('/resume#skills'), true);
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('/portfolio/archero'), true);
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('https://example.com'), false);
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('//example.com'), false);
  assert.equal(ALLOWED_INTERNAL_SOURCE_RE.test('javascript:alert(1)'), false);

  // Modified event handling (ctrl, meta, shift, alt, middle click)
  assert.equal(isModifiedEvent({ button: 0 }), false, 'plain left click');
  assert.equal(isModifiedEvent({ button: 1 }), true, 'middle click');
  assert.equal(isModifiedEvent({ button: 2 }), true, 'right click');
  assert.equal(isModifiedEvent({ button: 0, metaKey: true }), true, 'meta key');
  assert.equal(isModifiedEvent({ button: 0, ctrlKey: true }), true, 'ctrl key');
  assert.equal(isModifiedEvent({ button: 0, shiftKey: true }), true, 'shift key');
  assert.equal(isModifiedEvent({ button: 0, altKey: true }), true, 'alt key');
});

test('DeskScene and App: day/night manual override and toggle semantics', async () => {
  const deskSceneSource = await fs.readFile(new URL('../src/components/DeskScene.jsx', import.meta.url), 'utf8');
  const appSource = await fs.readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const cssSource = await fs.readFile(new URL('../src/styles/desk-scene.css', import.meta.url), 'utf8');

  // 1. Theme toggle button markup and aria semantics
  assert.ok(deskSceneSource.includes('className="room-theme-toggle"'), 'Theme toggle must use class .room-theme-toggle');
  assert.ok(deskSceneSource.includes('aria-label={isDay ? \'Switch to night mode\' : \'Switch to day mode\'}'));
  assert.ok(deskSceneSource.includes('aria-pressed={!isDay}'));
  assert.ok(deskSceneSource.includes('onClick={onToggleDayNight}'));

  // 2. CSS specs: >=44px touch target, safe area, cyan color, z-index 100
  assert.ok(cssSource.includes('.room-theme-toggle {'));
  assert.ok(cssSource.includes('min-width: 44px;'));
  assert.ok(cssSource.includes('min-height: 44px;'));
  assert.ok(cssSource.includes('color: #8adcd9;'));
  assert.ok(cssSource.includes('z-index: 100;'));
  assert.ok(cssSource.includes('env(safe-area-inset-top'));

  // 3. App manual session override logic
  assert.ok(appSource.includes('manualDay !== null ? manualDay : autoDay'));
  assert.ok(appSource.includes('setManualDay(!isDay)'));
  assert.ok(appSource.includes('onToggleDayNight={handleToggleDayNight}'));

  // 4. PortfolioChat wiring in DeskScene (both WebGL and fallback)
  const chatOccurrences = (deskSceneSource.match(/<PortfolioChat[\s\S]*?\/>/g) || []);
  assert.equal(chatOccurrences.length, 2, 'PortfolioChat must be wired in both WebGL and fallback modes');
  for (const occurrence of chatOccurrences) {
    assert.ok(occurrence.includes('onNavigate={onNavigate}'), 'Each PortfolioChat must receive onNavigate');
  }
});

test('DeskScene: two-stage chat->destination transition contract', async () => {
  const deskSceneSource = await fs.readFile(new URL('../src/components/DeskScene.jsx', import.meta.url), 'utf8');

  // Verify two-stage reset -> focus transition logic
  assert.ok(
    deskSceneSource.includes("if (activeFocusRef.current === 'chat' && currentFocus !== 'chat')"),
    'Must detect chat to another object transition'
  );
  assert.ok(
    deskSceneSource.includes('pendingFocusRef.current = currentFocus;'),
    'Must store pending destination'
  );
  assert.ok(
    deskSceneSource.includes('controllerRef.current.reset();'),
    'Must call reset first'
  );
  assert.ok(
    deskSceneSource.includes('controllerRef.current?.focus(next);'),
    'Must call focus on transition end of reset'
  );

  // Verify destination overlay hiding during transition
  assert.ok(
    deskSceneSource.includes('const hidden = isTransitioning || Boolean(pendingFocusRef.current);'),
    'Destination surface must be hidden while transitioning or pending'
  );
  assert.ok(
    deskSceneSource.includes("opacity: hidden ? 0 : 1,"),
    'Opacity must be 0 while hidden'
  );
  assert.ok(
    deskSceneSource.includes("pointerEvents: hidden ? 'none' : 'auto'"),
    'Pointer events must be none while hidden'
  );

  // Verify focus management to Back button
  assert.ok(
    deskSceneSource.includes("document.getElementById('back')?.focus({ preventScroll: true });"),
    'Must focus Back button so focus is never lost on body'
  );
});
