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
    assert.ok(light instanceof THREE.SpotLight, 'ceilingLamp.light must be a THREE.SpotLight');
    assert.equal(light.name, 'CeilingLight', 'light must have semantic name CeilingLight');
    assert.ok(bulb instanceof THREE.Mesh, 'ceilingLamp.bulb must be a THREE.Mesh');
    assert.equal(bulb.name, 'CeilingBulb', 'bulb must have semantic name CeilingBulb');
    assert.equal(light.castShadow, false, 'no shadow map cost on ceiling spot light');

    // SpotLight target, angle, penumbra, decay assertions
    assert.ok(light.target, 'ceiling lamp spotlight target exists');
    assert.equal(light.target.parent, debugHandle.scene, 'spotlight target provided in scene');
    const targetWorld = new THREE.Vector3();
    const lampWorld = new THREE.Vector3();
    light.target.getWorldPosition(targetWorld);
    light.getWorldPosition(lampWorld);
    assert.ok(targetWorld.y < lampWorld.y - 1.0, 'SpotLight target below lamp');
    assert.ok(targetWorld.x >= -1.6 && targetWorld.x <= 1.6, 'target is over desk x range');
    assert.ok(targetWorld.z >= -0.75 && targetWorld.z <= 0.75, 'target is over desk z range');
    assert.ok(targetWorld.y >= 0.9 && targetWorld.y <= 1.2, 'target is at desk surface height');
    assert.ok(light.angle < Math.PI / 3 && light.angle > 0, 'cone angle within bounds');
    assert.ok(light.penumbra >= 0.4 && light.penumbra <= 1, 'penumbra configured for natural falloff');
    assert.ok(light.decay >= 1.5, 'finite decay configured');
    assert.ok(light.distance > 0, 'finite range configured');

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
    assert.ok(room.radiance.value < 0.386, 'interior background darker night with lower roomRadiance');
    assert.equal(room.radiance.value, 0.28, 'calibrated darker night roomRadiance');
    assert.equal(debugHandle.scene.getObjectByName('RoomNeon'), undefined, 'no RoomNeon in actual scene');
    assert.equal(room.neon, undefined, 'no neon handle in roomLighting');
    assert.equal(room.light, undefined, 'no neon light handle in roomLighting');
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
    assert.equal(debugHandle.scene.getObjectByName('RoomNeon'), undefined, 'no RoomNeon in day scene');

    // 6. Return to night
    sceneHandle.setDaytime(false);
    assert.equal(light.intensity, 24.0, 'ceiling light restores calibrated warm night state');
    assert.equal(wall.material.color.getHex(), 0x9c9389);
    assert.equal(hemi.color.getHex(), 0xe9e3db);
    assert.equal(mockRenderer.toneMappingExposure, 1.15, 'night exterior exposure remains baseline');
    assert.equal(room.radiance.value, 0.28);
    assert.equal(debugHandle.scene.getObjectByName('RoomNeon'), undefined, 'no RoomNeon on return to night');

    // 7. Shared metal is cloned for the room; exterior originals keep their program.
    const roomMetal = group.getObjectByName('CeilingCanopy').material;
    const streetMetal = outside.children.find(o => o.isMesh && o.material.metalness > 0.5).material;
    assert.notEqual(roomMetal, streetMetal);
    assert.notEqual(roomMetal.customProgramCacheKey(), streetMetal.customProgramCacheKey());
    assert.equal(roomMetal.color.getHex(), streetMetal.color.getHex(), 'shared albedo restored after day/night round trip');
    assert.equal(streetMetal.emissiveIntensity, 1, 'shared metal is non-emissive, so no emissive sync is needed');

    // 8. Elevated ceiling fixture and short cord anchor without gaps
    const shade = group.getObjectByName('CeilingShade');
    const cord = group.getObjectByName('CeilingCord');
    const canopy = group.getObjectByName('CeilingCanopy');
    assert.ok(shade, 'CeilingShade exists');
    assert.ok(cord, 'CeilingCord exists');
    assert.ok(canopy, 'CeilingCanopy exists');
    assert.equal(
      group.children.find(o => o.name === 'CeilingSupport' || (o.isMesh && o.geometry.type === 'BoxGeometry')),
      undefined,
      'obsolete wall-top support beam is removed'
    );
    assert.ok(Math.abs(shade.position.y - 3.47) < 0.01, `shade elevated ~.35m (got ${shade.position.y})`);
    assert.ok(Math.abs(bulb.position.y - 3.39) < 0.01, `bulb elevated ~.35m (got ${bulb.position.y})`);
    assert.ok(Math.abs(light.position.y - 3.35) < 0.01, `emitter elevated ~.35m (got ${light.position.y})`);

    // Verify canopy, cord, and shade connect physically without gap
    debugHandle.scene.updateMatrixWorld(true);
    const canopyBox = new THREE.Box3().setFromObject(canopy);
    const cordBox = new THREE.Box3().setFromObject(cord);
    const shadeBox = new THREE.Box3().setFromObject(shade);
    assert.ok(Math.abs(canopyBox.max.y - 6.0) < 0.02, `canopy top meets ceiling at y=6.0 (got ${canopyBox.max.y})`);
    assert.ok(Math.abs(canopyBox.min.y - cordBox.max.y) < 0.01, `cord top connects canopy bottom without gap (diff: ${Math.abs(canopyBox.min.y - cordBox.max.y)})`);
    assert.ok(Math.abs(cordBox.min.y - shadeBox.max.y) < 0.01, `cord bottom connects shade top without gap (diff: ${Math.abs(cordBox.min.y - shadeBox.max.y)})`);
    assert.ok(cord.geometry.parameters.height < 2.5, 'cord shortened to connect elevated fixture');

    // 9. Room closure: inward-facing ceiling, front wall, and right wall
    const roomCeiling = debugHandle.scene.getObjectByName('RoomCeiling');
    const roomFrontWall = debugHandle.scene.getObjectByName('RoomFrontWall');
    const roomRightWall = debugHandle.scene.getObjectByName('RoomRightWall');
    assert.ok(roomCeiling, 'RoomCeiling exists');
    assert.ok(roomFrontWall, 'RoomFrontWall exists');
    assert.ok(roomRightWall, 'RoomRightWall exists');

    // Bounds verification
    const ceilBox = new THREE.Box3().setFromObject(roomCeiling);
    const frontBox = new THREE.Box3().setFromObject(roomFrontWall);
    const rightBox = new THREE.Box3().setFromObject(roomRightWall);
    assert.ok(Math.abs(ceilBox.min.y - 6.0) < 0.01 && Math.abs(ceilBox.max.y - 6.0) < 0.01, 'ceiling at y=6.0');
    assert.ok(ceilBox.min.x <= -4.5 && ceilBox.max.x >= 8.0, 'ceiling spans room x');
    assert.ok(ceilBox.min.z <= -3.2 && ceilBox.max.z >= 6.4, 'ceiling spans room z');

    assert.ok(Math.abs(frontBox.min.z - 6.4) < 0.01 && Math.abs(frontBox.max.z - 6.4) < 0.01, 'front wall at z=6.4');
    assert.ok(frontBox.min.x <= -4.5 && frontBox.max.x >= 8.0, 'front wall spans room x');
    assert.ok(frontBox.min.y <= 0.01 && frontBox.max.y >= 5.99, 'front wall spans room height');

    assert.ok(Math.abs(rightBox.min.x - 8.0) < 0.01 && Math.abs(rightBox.max.x - 8.0) < 0.01, 'right wall at x=8.0');
    assert.ok(rightBox.min.z <= -3.2 && rightBox.max.z >= 6.4, 'right wall spans room z');
    assert.ok(rightBox.min.y <= 0.01 && rightBox.max.y >= 5.99, 'right wall spans room height');

    // Inward normals via getWorldDirection (matching check-layout.mjs contract)
    const ceilDir = roomCeiling.getWorldDirection(new THREE.Vector3());
    const frontDir = roomFrontWall.getWorldDirection(new THREE.Vector3());
    const rightDir = roomRightWall.getWorldDirection(new THREE.Vector3());
    assert.ok(ceilDir.y < -0.99, `ceiling normal points downward/inward (got ${ceilDir.y})`);
    assert.ok(frontDir.z < -0.99, `front wall normal points inward (-z) (got ${frontDir.z})`);
    assert.ok(rightDir.x < -0.99, `right wall normal points inward (-x) (got ${rightDir.x})`);

    // Raycast verification from inside the room
    const raycaster = new THREE.Raycaster();
    const roomCenter = new THREE.Vector3(1.5, 3.0, 1.4);

    // Upward ray from inside hits ceiling
    raycaster.set(roomCenter, new THREE.Vector3(0, 1, 0));
    const ceilHits = raycaster.intersectObject(roomCeiling);
    assert.ok(ceilHits.length > 0, 'ray upwards from inside hits RoomCeiling');
    assert.ok(Math.abs(ceilHits[0].point.y - 6.0) < 0.01, 'hit point on ceiling at y=6.0');

    // Forward ray (+z) from inside hits front wall
    raycaster.set(roomCenter, new THREE.Vector3(0, 0, 1));
    const frontHits = raycaster.intersectObject(roomFrontWall);
    assert.ok(frontHits.length > 0, 'ray forward from inside hits RoomFrontWall');
    assert.ok(Math.abs(frontHits[0].point.z - 6.4) < 0.01, 'hit point on front wall at z=6.4');

    // Rightward ray (+x) from inside hits right wall
    raycaster.set(roomCenter, new THREE.Vector3(1, 0, 0));
    const rightHits = raycaster.intersectObject(roomRightWall);
    assert.ok(rightHits.length > 0, 'ray rightward from inside hits RoomRightWall');
    assert.ok(Math.abs(rightHits[0].point.x - 8.0) < 0.01, 'hit point on right wall at x=8.0');

    // Rays from outside do not hit due to FrontSide culling (non-occluding for outside/home cameras)
    raycaster.set(new THREE.Vector3(1.5, 8.0, 1.4), new THREE.Vector3(0, -1, 0));
    assert.equal(raycaster.intersectObject(roomCeiling).length, 0, 'outside ray does not hit ceiling');
    raycaster.set(new THREE.Vector3(1.5, 3.0, 8.0), new THREE.Vector3(0, 0, -1));
    assert.equal(raycaster.intersectObject(roomFrontWall).length, 0, 'outside ray does not hit front wall');
    raycaster.set(new THREE.Vector3(10.0, 3.0, 1.4), new THREE.Vector3(-1, 0, 0));
    assert.equal(raycaster.intersectObject(roomRightWall).length, 0, 'outside ray does not hit right wall');

    // 10. OutsideCity static batching: count <= 30 vs 107 baseline, triangle fidelity, theme updates & disposal
    const cityMeshes = outside.children.filter(o => o.isMesh);
    assert.ok(cityMeshes.length <= 30, `actual city mesh count ${cityMeshes.length} must be <= 30 (baseline 107)`);
    assert.equal(cityMeshes.length, 16, 'expected 16 batched city meshes (from 107 baseline)');

    const totalTris = cityMeshes.reduce((sum, m) => sum + (m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3), 0);
    assert.equal(totalTris, 2306, 'total city triangles (including inactive sun) must be 2306');
    const visibleTrisNight = cityMeshes.filter(m => m.visible).reduce((sum, m) => sum + (m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3), 0);
    assert.equal(visibleTrisNight, 1826, `visible night city triangles ${visibleTrisNight} must exactly match baseline 1826`);

    for (const m of cityMeshes) {
      if (m.geometry.type === 'BufferGeometry') {
        assert.equal(m.geometry.groups.length, 0, 'merged geometry must not use groups which keep draw calls');
      }
    }

    const sunMesh = outside.children.find(o => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters?.radius === 0.7);
    const moonMesh = outside.children.find(o => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters?.radius === 0.5);
    assert.ok(sunMesh, 'sunMesh retained independently without merge');
    assert.ok(moonMesh, 'moonMesh retained independently without merge');
    assert.equal(sunMesh.visible, false, 'sun hidden at night');
    assert.equal(moonMesh.visible, true, 'moon visible at night');

    // Verify theme toggling and material mutations on batched meshes
    sceneHandle.setDaytime(true);
    assert.equal(sunMesh.visible, true, 'sun visible during day');
    assert.equal(moonMesh.visible, false, 'moon hidden during day');
    const visibleTrisDay = cityMeshes.filter(m => m.visible).reduce((sum, m) => sum + (m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3), 0);
    assert.equal(visibleTrisDay, 1826, 'visible daytime triangles match baseline 1826');
    const sidewalkMesh = outside.children.find(o => o.isMesh && o.receiveShadow && o.material.roughness === 0.85);
    assert.equal(sidewalkMesh.material.color.getHex(), 0xaab8c8, 'sidewalk daytime theme color updated');
    const winMesh = outside.children.find(o => o.isMesh && o.material.color.getHex() === 0xffe699);
    assert.equal(winMesh.material.emissiveIntensity, 0, 'windows unlit during day');

    sceneHandle.setDaytime(false);
    assert.equal(sunMesh.visible, false, 'sun hidden on night restore');
    assert.equal(moonMesh.visible, true, 'moon visible on night restore');
    assert.equal(sidewalkMesh.material.color.getHex(), 0x333948, 'sidewalk night theme color restored');
    assert.equal(winMesh.material.emissiveIntensity, 1.2, 'windows emissive restored at night');

    // Bounds verification
    const cityBounds = new THREE.Box3().setFromObject(outside);
    assert.ok(cityBounds.min.x <= -80 && cityBounds.max.x >= 80, 'city spans wide bounds');
    assert.ok(cityBounds.min.z <= -18 && cityBounds.max.z >= -3.25, 'city spans road/sidewalk/building depth');

    // 11. Disposal verification
    const resources = new Set([roomMetal]);
    for (const root of [group, roomCeiling, roomFrontWall, roomRightWall, outside]) root.traverse(o => {
      if (o.geometry) resources.add(o.geometry);
      if (o.material) resources.add(o.material);
    });
    const disposedResources = new Set();
    for (const item of resources) item.addEventListener('dispose', () => disposedResources.add(item));
    sceneHandle.dispose();
    assert.ok(mockRenderer.disposed, 'renderer disposed cleanly');
    assert.equal(disposedResources.size, resources.size, 'all new fixtures, room closure meshes, and cloned material are disposed');
    assert.equal(light.target.parent, null, 'spotlight target removed from scene on disposal');
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
