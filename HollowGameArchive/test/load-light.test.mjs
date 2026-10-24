import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import * as THREE from 'three';
import { initDeskScene } from '../src/components/deskSceneBuilder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Helper to extract and run main.jsx loader controller in a controlled VM environment
async function setupMainControllerEnv() {
  const mainCode = await fs.readFile(path.join(root, 'src/main.jsx'), 'utf8');
  const controllerPrefix = mainCode.split(/import React/)[0];

  const classListSet = new Set();
  const attributes = new Map();
  let reloaded = false;
  let removedFromParent = false;

  const loadingScreenEl = {
    classList: {
      add(cls) { classListSet.add(cls); },
      remove(cls) { classListSet.delete(cls); },
      contains(cls) { return classListSet.has(cls); },
    },
    parentNode: {
      removeChild(child) {
        if (child === loadingScreenEl) removedFromParent = true;
      },
    },
  };

  const hintEl = { textContent: '' };
  const alertEl = {
    textContent: '',
    hidden: true,
    attributes: {},
    setAttribute(name, val) { this.attributes[name] = val; },
    removeAttribute(name) { delete this.attributes[name]; },
    getAttribute(name) { return this.attributes[name] ?? null; },
  };

  let retryClickHandler = null;
  const retryEl = {
    hidden: true,
    addEventListener(evt, fn) {
      if (evt === 'click') retryClickHandler = fn;
    },
  };

  const barClasses = new Set(['indeterminate']);
  const barEl = {
    style: {},
    classList: {
      add(cls) { barClasses.add(cls); },
      remove(cls) { barClasses.delete(cls); },
      contains(cls) { return barClasses.has(cls); },
    },
  };

  const barWrapEl = {
    attributes: { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100' },
    setAttribute(name, val) { this.attributes[name] = val; },
    removeAttribute(name) { delete this.attributes[name]; },
    getAttribute(name) { return this.attributes[name] ?? null; },
  };

  const pendingTimers = [];
  const fakeSetTimeout = (fn, ms) => {
    const timer = { fn, ms, executed: false };
    pendingTimers.push(timer);
    return timer;
  };

  const fakeWindow = {
    location: {
      reload() { reloaded = true; },
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
      if (sel === '.loader-bar') return barEl;
      if (sel === '.loader-bar-wrap') return barWrapEl;
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
    barEl,
    barWrapEl,
    loadingScreenEl,
    triggerRetryClick() { retryClickHandler?.(); },
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

test('main.jsx controller: truthful progress, indeterminate fallback and error semantics in vm', async () => {
  const env = await setupMainControllerEnv();
  assert.equal(typeof env.window.updateLoadingScreen, 'function');
  assert.equal(typeof env.window.dismissLoadingScreen, 'function');

  // 1. Initial state without total: indeterminate fallback
  env.window.updateLoadingScreen({ loaded: 0 });
  assert.equal(env.hintEl.textContent, 'Loading 3D Workspace…');
  assert.ok(env.barEl.classList.contains('indeterminate'), 'indeterminate class when total is not supplied');
  assert.equal(env.barEl.style.width, '');
  assert.equal(env.barWrapEl.getAttribute('aria-valuenow'), null);

  // 2. Truthful progress reflecting loaded / total callbacks
  env.window.updateLoadingScreen({ loaded: 3, total: 7 });
  assert.equal(env.hintEl.textContent, 'Loading 3D Workspace (3/7)…');
  assert.ok(!env.barEl.classList.contains('indeterminate'), 'indeterminate class removed when total exists');
  assert.equal(env.barEl.style.width, '43%');
  assert.equal(env.barWrapEl.getAttribute('aria-valuenow'), '43');

  // 3. Model count alone cannot assert rendered readiness.
  env.window.updateLoadingScreen({ loaded: 7, total: 7 });
  assert.equal(env.hintEl.textContent, 'Loading 3D Workspace (7/7)…');
  assert.equal(env.barEl.style.width, '99%');
  assert.equal(env.barWrapEl.getAttribute('aria-valuenow'), '99');

  // 4. Error state handling
  env.window.updateLoadingScreen({
    loaded: 2,
    total: 7,
    errors: { mesh1: 'Chair model failed', mesh2: 'Texture missing' },
  });
  assert.equal(env.alertEl.hidden, false);
  assert.equal(env.alertEl.textContent, 'Chair model failed. Texture missing');
  assert.equal(env.alertEl.getAttribute('role'), 'alert');
  assert.equal(env.retryEl.hidden, false);

  // 5. Accessible reload trigger
  env.triggerRetryClick();
  assert.ok(env.reloaded, 'retry button triggers window reload');

  // 6. Dismissal lifecycle
  assert.ok(!env.loadingScreenEl.classList.contains('fade-out'));
  env.window.dismissLoadingScreen();
  assert.equal(env.barWrapEl.getAttribute('aria-valuenow'), '100', 'only rendered scene readiness completes the bar');
  assert.ok(env.loadingScreenEl.classList.contains('fade-out'), 'adds fade-out class');
  assert.equal(env.isRemoved, false);
  env.flushTimers();
  assert.ok(env.isRemoved, 'removes element after transition timeout');
});

test('deskSceneBuilder: ceiling lamp debugHandle contract, warm-yellow lighting, day/night switching & exposure', async () => {
  class MockRenderer {
    constructor(canvas) {
      this.domElement = canvas;
      this.toneMapping = 0;
      this.toneMappingExposure = 1.15;
      this.shadowMap = { enabled: false, type: 0 };
    }
    setSize() {}
    setPixelRatio() {}
    render() {}
    dispose() { this.disposed = true; }
    forceContextLoss() {}
  }

  const canvas = {
    clientWidth: 800,
    clientHeight: 600,
    style: {},
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; },
  };
  const container = { clientWidth: 800, clientHeight: 600 };

  // Set up mock window and document for Three diorama setup
  const prevWindow = globalThis.window;
  const prevDoc = globalThis.document;
  const prevRO = globalThis.ResizeObserver;
  const prevRAF = globalThis.requestAnimationFrame;
  const prevCAF = globalThis.cancelAnimationFrame;

  globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
  };
  globalThis.document = {
    addEventListener() {},
    removeEventListener() {},
    visibilityState: 'visible',
    hidden: false,
    createElement(tag) {
      if (tag === 'canvas') {
        return {
          width: 512,
          height: 512,
          getContext() {
            return {
              fillStyle: '',
              strokeStyle: '',
              font: '',
              fillRect() {},
              strokeRect() {},
              fillText() {},
              beginPath() {},
              arc() {},
              fill() {},
              stroke() {},
              clip() {},
              save() {},
              restore() {},
              moveTo() {},
              lineTo() {},
              closePath() {},
              createLinearGradient() { return { addColorStop() {} }; },
              createRadialGradient() { return { addColorStop() {} }; },
              roundRect() {},
              measureText() { return { width: 10 }; },
            };
          },
        };
      }
      return {};
    },
  };
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};

  try {
    const mockRenderer = new MockRenderer(canvas);
    const sceneHandle = initDeskScene(canvas, container, {
      isDay: false,
      renderer: mockRenderer,
    });

    const debugHandle = globalThis.window.__THREE_ROOM_DEBUG__;
    assert.ok(debugHandle, 'debugHandle exposed on window.__THREE_ROOM_DEBUG__');
    assert.ok(debugHandle.ceilingLamp, 'debugHandle.ceilingLamp exposed');

    const { group, light, bulb } = debugHandle.ceilingLamp;

    // 1. Structural semantic contract
    assert.ok(group instanceof THREE.Group, 'ceilingLamp.group must be a THREE.Group');
    assert.equal(group.name, 'CeilingLamp', 'group must have semantic name CeilingLamp');
    assert.ok(light instanceof THREE.PointLight, 'ceilingLamp.light must be a THREE.PointLight');
    assert.equal(light.name, 'CeilingLight', 'light must have semantic name CeilingLight');
    assert.ok(bulb instanceof THREE.Mesh, 'ceilingLamp.bulb must be a THREE.Mesh');
    assert.equal(bulb.name, 'CeilingBulb', 'bulb must have semantic name CeilingBulb');
    assert.equal(light.castShadow, false, 'no shadow map cost on ceiling point light');

    // 2. Position anchored above workstation
    assert.equal(group.position.z, 0.2, 'ceiling lamp positioned above workstation (z=0.2)');

    // 3. Night state: warmly lit
    assert.ok(light.intensity > 1.5, `night light intensity must be warm and lit (got ${light.intensity})`);
    assert.equal(light.color.getHex(), 0xffd09c, 'warm ceiling emitter colour');
    const hemi = debugHandle.scene.children.find(o => o.isHemisphereLight);
    const wall = debugHandle.scene.getObjectByName('RoomGroup').children.find(o => o.isMesh && o.position.x === -4.5);
    assert.equal(hemi.color.getHex(), 0xe9e3db, 'neutral reflected fill preserves warm local-light contrast');
    assert.equal(wall.material.color.getHex(), 0x9c9389, 'night albedo remains reflective instead of blue-black');
    assert.ok(bulb.material.emissiveIntensity > 0, 'bulb is emissive at night');
    assert.equal(mockRenderer.toneMappingExposure, 1.15, 'outside exposure remains unchanged');
    const room = debugHandle.roomLighting;
    assert.equal(room.radiance.value, 0.444 / 1.15, 'only room radiance reproduces approved dimming');
    assert.equal(room.neon.visible, true);
    assert.equal(room.neon.children.filter(o => o.isMesh).length, 2);
    assert.equal(room.light.castShadow, false);
    const shader = { uniforms: {}, fragmentShader: '#include <tonemapping_fragment>' };
    wall.material.onBeforeCompile(shader);
    assert.equal(shader.uniforms.roomRadianceScale, room.radiance);
    assert.ok(shader.fragmentShader.includes('gl_FragColor.rgb *= roomRadianceScale;'));
    assert.ok(shader.fragmentShader.indexOf('gl_FragColor.rgb *=') < shader.fragmentShader.indexOf('#include <tonemapping_fragment>'));
    const outside = debugHandle.scene.getObjectByName('OutsideCity');
    outside.traverse(o => {
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (!m) continue;
        const exteriorShader = { uniforms: {}, fragmentShader: '#include <tonemapping_fragment>' };
        m.onBeforeCompile(exteriorShader);
        assert.equal(exteriorShader.uniforms.roomRadianceScale, undefined, 'exterior shader is never dimmed');
      }
    });

    // 4. Pixel-toggle proof: parent can toggle light or group visibility directly
    const originalLightIntensity = light.intensity;
    light.intensity = 0;
    assert.equal(light.intensity, 0, 'light intensity can be toggled for pixel differential tests');
    light.intensity = originalLightIntensity;

    // 5. Day state: light off, exposure 5-10% darker than baseline 1.15
    sceneHandle.setDaytime(true);
    assert.equal(light.intensity, 0, 'ceiling light must be off (intensity 0) during day');
    assert.equal(bulb.material.emissiveIntensity, 0, 'bulb emissive off during day');
    assert.equal(mockRenderer.toneMappingExposure, 1.0, 'day exposure is calibrated against rendered room luminance, not its numeric ratio');
    assert.equal(wall.material.color.getHex(), 0xd4dce5, 'day albedo unchanged');
    assert.equal(hemi.color.getHex(), 0xf8fafc, 'day fill unchanged');
    assert.equal(room.radiance.value, 1);
    assert.equal(room.neon.visible, false);
    assert.equal(room.light.intensity, 0);

    // 6. Return to night
    sceneHandle.setDaytime(false);
    assert.equal(light.intensity, 14.0, 'ceiling light restores calibrated warm night state');
    assert.equal(wall.material.color.getHex(), 0x9c9389);
    assert.equal(hemi.color.getHex(), 0xe9e3db);
    assert.equal(mockRenderer.toneMappingExposure, 1.15, 'night exterior exposure remains baseline');
    assert.equal(room.radiance.value, 0.444 / 1.15);
    assert.equal(room.neon.visible, true);
    assert.equal(room.light.intensity, 0.65);

    // 7. Shared metal is cloned for the room; exterior originals keep their program.
    const roomMetal = group.getObjectByName('CeilingCanopy').material;
    const streetMetal = outside.children.find(o => o.isMesh && o.geometry.type === 'CylinderGeometry').material;
    assert.notEqual(roomMetal, streetMetal);
    assert.notEqual(roomMetal.customProgramCacheKey(), streetMetal.customProgramCacheKey());
    assert.equal(roomMetal.color.getHex(), streetMetal.color.getHex(), 'shared albedo restored after day/night round trip');
    assert.equal(streetMetal.emissiveIntensity, 1, 'shared metal is non-emissive, so no emissive sync is needed');
    const resources = new Set([roomMetal]);
    for (const root of [group, room.neon]) root.traverse(o => {
      if (o.geometry) resources.add(o.geometry);
      if (o.material) resources.add(o.material);
    });
    const disposedResources = new Set();
    for (const item of resources) item.addEventListener('dispose', () => disposedResources.add(item));
    sceneHandle.dispose();
    assert.ok(mockRenderer.disposed, 'renderer disposed cleanly');
    assert.equal(disposedResources.size, resources.size, 'all new fixtures and cloned material are disposed');
    assert.equal(globalThis.window.__THREE_ROOM_DEBUG__, undefined);
  } finally {
    globalThis.window = prevWindow;
    globalThis.document = prevDoc;
    globalThis.ResizeObserver = prevRO;
    globalThis.requestAnimationFrame = prevRAF;
    globalThis.cancelAnimationFrame = prevCAF;
  }
});

test('index.html loader structure, reduced-motion, and accessible touch target', async () => {
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');

  // Loader identity and structure
  assert.ok(html.includes('id="loading-screen"'), 'loading screen container exists');
  assert.ok(html.includes('class="loader-robot"'), 'robot avatar element exists');
  assert.ok(html.includes('CHU QUANG ANH'), 'preserves developer name');
  assert.ok(html.includes('Unity Game Developer'), 'preserves role');
  assert.ok(html.includes('class="loader-bar-wrap"'), 'progress bar wrap exists');
  assert.ok(html.includes('class="loader-bar'), 'progress bar exists');
  assert.ok(html.includes('class="loader-hint"'), 'loader hint element exists');
  assert.ok(html.includes('id="loader-error"'), 'loader error element exists');
  assert.ok(html.includes('id="loader-retry"'), 'loader retry element exists');

  // Understated workspace outline styling
  assert.ok(html.includes('border: 1px solid rgba(0, 242, 254, 0.15)'), 'understated cyan workspace outline');
  assert.ok(html.includes('max-width: calc(100vw - 32px)'), 'loading content fits narrow viewports');

  // Reduced motion media query
  assert.ok(html.includes('@media (prefers-reduced-motion: reduce)'), 'reduced motion media query present');
  assert.ok(html.includes('animation: none !important'), 'disables animations on reduced motion');

  // Touch target and keyboard accessibility
  assert.ok(html.includes('min-height: 44px') || html.includes('min-height:44px'), 'retry button touch height >= 44px');
  assert.ok(html.includes('#loader-retry:focus-visible'), 'focus-visible ring styled for retry');
});
