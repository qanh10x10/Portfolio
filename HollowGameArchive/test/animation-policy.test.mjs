import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function setupMainControllerEnv() {
  const mainSource = await fs.readFile(path.join(root, 'src/main.jsx'), 'utf8');
  const controllerPrefix = mainSource.split('import React')[0];

  const listeners = {};
  let reloaded = false;

  const hintEl = { textContent: '' };
  const alertEl = {
    textContent: '',
    hidden: true,
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    removeAttribute(k) { delete this.attributes[k]; },
    getAttribute(k) { return this.attributes[k] ?? null; },
  };
  const retryEl = {
    hidden: true,
    addEventListener(event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    click() {
      (listeners.click || []).forEach((fn) => fn());
    },
  };

  let removedFromParent = false;
  const loadingScreenEl = {
    classList: {
      items: new Set(),
      add(cls) { this.items.add(cls); },
      contains(cls) { return this.items.has(cls); },
    },
    parentNode: {
      removeChild(node) {
        if (node === loadingScreenEl) {
          removedFromParent = true;
          loadingScreenEl.parentNode = null;
        }
      },
    },
  };

  const pendingTimers = [];
  const fakeSetTimeout = (fn, ms) => {
    const timer = { fn, ms, executed: false };
    pendingTimers.push(timer);
    return timer;
  };

  const fakeWindow = {
    location: {
      reload() {
        reloaded = true;
      },
    },
  };

  const fakeDocument = {
    getElementById(id) {
      if (id === 'loading-screen') return loadingScreenEl;
      if (id === 'loader-error') return alertEl;
      if (id === 'loader-retry') return retryEl;
      return null;
    },
    querySelector(sel) {
      if (sel === '.loader-hint') return hintEl;
      return null;
    },
  };

  const context = vm.createContext({
    window: fakeWindow,
    document: fakeDocument,
    setTimeout: fakeSetTimeout,
    clearTimeout: () => {},
    console,
  });

  vm.runInContext(controllerPrefix, context);

  return {
    window: fakeWindow,
    hintEl,
    alertEl,
    retryEl,
    loadingScreenEl,
    pendingTimers,
    flushTimers() {
      pendingTimers.forEach((t) => {
        if (!t.executed) {
          t.executed = true;
          t.fn();
        }
      });
    },
    get reloaded() { return reloaded; },
    get isRemoved() { return removedFromParent; },
  };
}

test('production main.jsx controller handles progress and success state', async () => {
  const env = await setupMainControllerEnv();
  assert.equal(typeof env.window.updateLoadingScreen, 'function');
  assert.equal(typeof env.window.dismissLoadingScreen, 'function');

  // Initial update
  env.window.updateLoadingScreen({ loaded: 0, errors: {} });
  assert.equal(env.hintEl.textContent, 'Loading 3D Workspace (0/5)…');
  assert.equal(env.alertEl.hidden, true);
  assert.equal(env.retryEl.hidden, true);

  // Partial progress
  env.window.updateLoadingScreen({ loaded: 3, errors: {} });
  assert.equal(env.hintEl.textContent, 'Loading 3D Workspace (3/5)…');
  assert.equal(env.alertEl.hidden, true);
  assert.equal(env.alertEl.getAttribute('role'), null);
  assert.equal(env.retryEl.hidden, true);

  // Success state: 5/5 ready, no errors
  env.window.updateLoadingScreen({ loaded: 5, errors: {} });
  assert.equal(env.hintEl.textContent, 'Loading 3D Workspace (5/5)…');
  assert.equal(env.alertEl.hidden, true);
  assert.equal(env.alertEl.getAttribute('role'), null);
  assert.equal(env.retryEl.hidden, true);

  // No premature dismissal: updating screen never dismisses loader prematurely
  assert.equal(env.loadingScreenEl.classList.contains('fade-out'), false);
  assert.equal(env.pendingTimers.length, 0);
  assert.equal(env.isRemoved, false);
});

test('production main.jsx controller enforces error text non-injection and alert state', async () => {
  const env = await setupMainControllerEnv();
  const dangerousPayload = '<img src="x" onerror="alert(1)"> <script>malicious()</script>';

  env.window.updateLoadingScreen({
    loaded: 2,
    errors: {
      chair: 'Gaming chair could not be loaded',
      xss: dangerousPayload,
    },
  });

  // textContent must safely contain the exact raw string without innerHTML parsing
  assert.equal(env.alertEl.hidden, false);
  assert.equal(env.alertEl.getAttribute('role'), 'alert');
  assert.ok(env.alertEl.textContent.includes(dangerousPayload));
  assert.equal(env.alertEl.innerHTML, undefined, 'no innerHTML assignment or execution');
  assert.equal(env.retryEl.hidden, false);

  // Clearing errors restores hidden alert and removes alert role
  env.window.updateLoadingScreen({ loaded: 5, errors: {} });
  assert.equal(env.alertEl.hidden, true);
  assert.equal(env.alertEl.getAttribute('role'), null);
  assert.equal(env.retryEl.hidden, true);
});

test('production main.jsx controller wires reload handler to retry button', async () => {
  const env = await setupMainControllerEnv();
  assert.equal(env.reloaded, false);

  env.retryEl.click();
  assert.equal(env.reloaded, true, 'retry click must trigger window.location.reload()');
});

test('production main.jsx controller manages dismissal lifecycle without premature dismissal', async () => {
  const env = await setupMainControllerEnv();

  // Loader must remain until explicitly dismissed
  assert.equal(env.loadingScreenEl.classList.contains('fade-out'), false);
  assert.equal(env.isRemoved, false);

  // Trigger explicit dismissal
  env.window.dismissLoadingScreen();
  assert.equal(env.loadingScreenEl.classList.contains('fade-out'), true);
  assert.equal(env.pendingTimers.length, 1);
  assert.equal(env.pendingTimers[0].ms, 500);
  assert.equal(env.isRemoved, false, 'element remains visible during 500ms fade transition');

  // Advance fade transition timer
  env.flushTimers();
  assert.equal(env.isRemoved, true, 'loading screen removed from DOM after fade-out transition');

  // Repeated call is idempotent and does not schedule further removal
  env.window.dismissLoadingScreen();
  assert.equal(env.pendingTimers.length, 1);
});
