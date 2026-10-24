import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildRoomDressing, LAYOUT } from '../src/components/scene/roomDressing.js';
import { normalizeBulletinBoard, loadBulletinBoard } from '../src/components/scene/gamingSetup.js';

const ctx = {
  track: x => x,
  makeCanvasTex: () => new THREE.Texture(),
  mats: Object.fromEntries(['metalDark', 'deskLegs', 'warmGold', 'rug'].map(n => [n, new THREE.MeshStandardMaterial()]))
};
const dressing = buildRoomDressing(ctx);
dressing.group.updateMatrixWorld(true);
const bounds = object => new THREE.Box3().setFromObject(object);
const rawBoard = () => {
  const root = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(.9, .614, .03), new THREE.MeshStandardMaterial());
  mesh.name = 'OPM0036_OPM0036_0'; mesh.castShadow = true; root.add(mesh); return root;
};
const casters = root => { const names = []; root.traverse(o => { if (o.isMesh && o.castShadow) names.push(o.name); }); return names; };

test('board normalization and real loader clear every mesh caster', async () => {
  assert.deepEqual(casters(normalizeBulletinBoard(rawBoard()).group), []);
  const previous = GLTFLoader.prototype.loadAsync;
  GLTFLoader.prototype.loadAsync = async () => ({ scene: rawBoard() });
  let model;
  try { model = await loadBulletinBoard(); assert.deepEqual(casters(model.group), []); }
  finally { GLTFLoader.prototype.loadAsync = previous; model?.dispose(); }
});

test('pot cap and soil have real depth clearance, with coplanar negative control', () => {
  const cylinders = dressing.floorPlant.children.filter(o => o.isMesh && o.geometry.type === 'CylinderGeometry');
  assert.equal(cylinders.length, 2);
  const [pot, soil] = cylinders;
  const clear = () => bounds(soil).max.y - bounds(pot).max.y > .001;
  assert.equal(clear(), true);
  const saved = soil.position.y;
  try { soil.position.y = .49; dressing.group.updateMatrixWorld(true); assert.equal(clear(), false); }
  finally { soil.position.y = saved; dressing.group.updateMatrixWorld(true); }
});

test('floor lamp creation, layout, returned handle and detached shadow are absent', () => {
  assert.equal('floorLamp' in LAYOUT, false);
  assert.equal('floorLamp' in dressing, false);
  assert.equal(Boolean(dressing.group.getObjectByName('FloorLamp')), false);
  assert.equal(dressing.contactShadows.some(s => s.name === 'ContactShadow_FloorLamp'), false);
});

test('production floor, baseboard and actual plank instances cover corrected support', () => {
  const source = fs.readFileSync(new URL('../src/components/deskSceneBuilder.js', import.meta.url), 'utf8');
  const start = source.indexOf('  const floorGeo =');
  const end = source.indexOf('  const rugGeo =', start);
  assert.ok(start > 0 && end > start);
  const roomGroup = new THREE.Group();
  const floor = vm.runInNewContext(source.slice(start, end) + '\nfloor;', { THREE, track: x => x, matFloor: ctx.mats.rug, roomGroup });
  const floorBox = bounds(floor);
  assert.ok(Math.abs(floorBox.min.x + 5) < .001 && Math.abs(floorBox.max.x - 8) < .001, `floor x=${floorBox.min.x}..${floorBox.max.x}`);
  const boardBoxes = dressing.baseboards.children.map(bounds);
  assert.ok(boardBoxes.some(b => b.max.x >= 7.999));
  const planks = dressing.planks, matrix = new THREE.Matrix4();
  const geometryBox = new THREE.Box3().setFromBufferAttribute(planks.geometry.attributes.position);
  for (let i = 0; i < planks.count; i++) {
    planks.getMatrixAt(i, matrix);
    const b = geometryBox.clone().applyMatrix4(matrix).applyMatrix4(planks.matrixWorld);
    assert.ok(b.min.x >= floorBox.min.x - .001 && b.max.x <= floorBox.max.x + .001 && b.min.z >= floorBox.min.z - .001 && b.max.z <= floorBox.max.z + .001, `plank ${i} outside actual floor`);
  }
  for (let z = -3.5; z < 6.3; z += .188) for (const x of [5.4, 6.6, 7.98]) {
    const ray = new THREE.Raycaster(new THREE.Vector3(x, 1, z), new THREE.Vector3(0, -1, 0));
    assert.ok(ray.intersectObject(planks).length > 0, `bare added floor at ${x},${z}`);
  }
});
