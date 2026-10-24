import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

test('index.html loader structure and CSP compliance', async () => {
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('id="loading-screen"'), 'loading screen container exists');
  assert.ok(html.includes('class="loader-hint"'), 'loader hint element exists');
  assert.ok(html.includes('id="loader-error"'), 'loader error element exists');
  assert.ok(html.includes('id="loader-retry"'), 'loader retry element exists');
  assert.ok(html.includes('min-height: 44px') || html.includes('min-height:44px'), 'retry button touch height >= 44px');
  assert.ok(html.includes('#loader-retry:focus-visible'), 'retry button has visible focus outline');
  assert.ok(!html.includes('blob:'), 'no blob allowance in HTML');
  // Initial alert role should not be present before an actual error is published
  assert.ok(!html.includes('<p id="loader-error" role="alert"'), 'alert role only applied on active error');
});

test('src/main.jsx loading screen controller wiring and no bypass timeout', async () => {
  const code = await fs.readFile(path.join(root, 'src/main.jsx'), 'utf8');
  assert.ok(!code.includes('3500'), 'unconditional 3.5s bypass timer is removed');
  assert.ok(code.includes('window.dismissLoadingScreen'), 'dismissLoadingScreen defined');
  assert.ok(code.includes('window.updateLoadingScreen'), 'updateLoadingScreen defined');
  assert.ok(code.includes('loader-retry'), 'retry button wired to reload');
  assert.ok(!code.includes('innerHTML'), 'safe textContent only, no innerHTML injection');
});

test('deskSceneBuilder computer scale and lamp removal', async () => {
  const builderCode = await fs.readFile(path.join(root, 'src/components/deskSceneBuilder.js'), 'utf8');
  // Computer peripherals x2 scale
  assert.ok(builderCode.includes('model.group.scale.setScalar(2)'), 'desktop scaled x2 not x3');
  assert.ok(builderCode.includes('multiplyScalar(2)'), 'keyboard center scaled x2');
  assert.ok(builderCode.includes('homeScale: new THREE.Vector3(2, 2, 2)'), 'desktop home scale is [2, 2, 2]');
  assert.ok(!builderCode.includes('homeScale: new THREE.Vector3(3, 3, 3)'), 'old 3x home scale removed');

  // Desk lamp removal
  assert.ok(!builderCode.includes('props.lamp,'), 'props.lamp placement removed');
  assert.ok(!builderCode.includes('deskSpot'), 'desk lamp spot light removed');
  assert.ok(!builderCode.includes('props.lampBulbMat'), 'props.lampBulbMat removed');

  // Animation policy
  assert.ok(!builderCode.includes('let isPaused = reducedMotion'), 'isPaused state removed');
  assert.ok(!builderCode.includes('.room-pause-btn'), 'pause button removed from builder');

  // Dismissal gate
  assert.ok(builderCode.includes('allModelsReady'), 'checks all models ready before dismissal');
  assert.ok(builderCode.includes('hasErrors'), 'blocks dismissal on asset/texture errors');

  // Exact DefaultLoadingManager handler cleanup
  assert.ok(builderCode.includes('DefaultLoadingManager.onError === installedDefaultOnError'), 'restores exact installed handler');
  assert.ok(!builderCode.includes('DefaultLoadingManager.onError === prevDefaultOnError'), 'removes invalid prevDefaultOnError comparison');

  // Resource disposal on rejection / missing textures
  assert.ok(builderCode.includes('m.dispose()'), 'disposes Iron Man resources on texture failure');
  assert.ok(builderCode.includes('model.dispose()'), 'disposes Bulletin Board resources on texture failure');

  // Scaffolding removal
  assert.ok(!builderCode.includes('pause: () =>'), 'pause API scaffolding removed');
  assert.ok(!builderCode.includes('resume: () =>'), 'resume API scaffolding removed');
});

test('DeskScene and App clean pause removal', async () => {
  const deskScene = await fs.readFile(path.join(root, 'src/components/DeskScene.jsx'), 'utf8');
  assert.ok(!deskScene.includes('room-pause-btn'), 'pause button removed from DeskScene');
  assert.ok(!deskScene.includes('isPaused'), 'isPaused removed from DeskScene props/state');
  assert.ok(!deskScene.includes('room-model-status'), 'in-room model status banner removed');
  assert.ok(!deskScene.includes('modelStatus'), 'obsolete modelStatus state removed from DeskScene');
  assert.ok(!deskScene.includes('modelErrors'), 'obsolete modelErrors state removed from DeskScene');
  assert.ok(!deskScene.includes('onModelStatus'), 'duplicate onModelStatus callback removed from DeskScene');

  const app = await fs.readFile(path.join(root, 'src/App.jsx'), 'utf8');
  assert.ok(!app.includes('isPaused'), 'isPaused state removed from App');

  const css = await fs.readFile(path.join(root, 'src/styles/desk-scene.css'), 'utf8');
  assert.ok(!css.includes('.room-pause-btn'), 'room-pause-btn styles removed');
  assert.ok(!css.includes('.room-model-status'), 'room-model-status styles removed');
});
