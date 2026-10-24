import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildDeskProps, LAYOUT as DESK_LAYOUT } from '../src/components/scene/deskProps.js';
import { buildRoomDressing, LAYOUT as ROOM_LAYOUT } from '../src/components/scene/roomDressing.js';

console.log('--- Running Layout Polish Verification Tests ---');

const dummyCtx = {
  fillStyle: '', strokeStyle: '', font: '',
  fillRect() {}, strokeRect() {}, fillText() {},
  beginPath() {}, arc() {}, fill() {}, stroke() {},
  createRadialGradient() { return { addColorStop() {} }; }
};

const mats = {
  metalDark: new THREE.MeshStandardMaterial({ color: 0x323a4e }),
  deskTop: new THREE.MeshStandardMaterial({ color: 0x342a22 }),
  deskLegs: new THREE.MeshStandardMaterial({ color: 0x30374a }),
  warmGold: new THREE.MeshStandardMaterial({ color: 0xffb74d }),
  chair: new THREE.MeshStandardMaterial({ color: 0x272d3e }),
  robotBody: new THREE.MeshStandardMaterial({ color: 0xe2e6ef }),
  robotJoint: new THREE.MeshStandardMaterial({ color: 0x363e52 }),
  rug: new THREE.MeshStandardMaterial({ color: 0x262f42 })
};

const ctx = {
  THREE,
  track: x => x,
  makeCanvasTex: paint => {
    paint(dummyCtx, 512, 256);
    return new THREE.Texture();
  },
  mats,
  RoundedBoxGeometry
};

// -----------------------------------------------------------------------------
// Test 1: Desk Lamp Removal
// -----------------------------------------------------------------------------
console.log('[Test 1] Verifying desk lamp removal and floor lamp preservation...');
const deskProps = buildDeskProps(ctx);

assert.equal(deskProps.lamp, undefined, 'deskProps.lamp must not be returned');
assert.equal(deskProps.lampBulbMat, undefined, 'deskProps.lampBulbMat must not be returned');
assert.equal(DESK_LAYOUT.lamp, undefined, 'DESK_LAYOUT.lamp must not exist');

let foundDeskLampMesh = false;
deskProps.desk.traverse(node => {
  if (node.name === 'DeskLamp') foundDeskLampMesh = true;
});
assert.equal(foundDeskLampMesh, false, 'No DeskLamp mesh allowed in desk group');

const dressing = buildRoomDressing(ctx);
assert.ok(dressing.floorLamp, 'dressing.floorLamp must be preserved');
const floorLampShadow = dressing.contactShadows.find(s => s.name === 'ContactShadow_FloorLamp');
assert.ok(floorLampShadow, 'Floor lamp contact shadow must be preserved');
console.log('  ✓ Desk lamp completely removed; floor lamp preserved');

// -----------------------------------------------------------------------------
// Test 2: Bookshelf Left Wall Placement & Room-Facing Orientation
// -----------------------------------------------------------------------------
console.log('[Test 2] Verifying bookshelf left wall placement and orientation...');
assert.ok(ROOM_LAYOUT.bookshelf, 'ROOM_LAYOUT.bookshelf must exist');
assert.ok(ROOM_LAYOUT.bookshelf.x < -3.8, `Bookshelf x=${ROOM_LAYOUT.bookshelf.x} must be on left wall (x < -3.8)`);
assert.ok(ROOM_LAYOUT.bookshelf.z > -1.0, `Bookshelf z=${ROOM_LAYOUT.bookshelf.z} must be on foreground side of Resume board (z > -1.0)`);
assert.ok(
  Math.abs(ROOM_LAYOUT.bookshelf.yaw - Math.PI / 2) < 0.01 || Math.abs(ROOM_LAYOUT.bookshelf.rotY - Math.PI / 2) < 0.01,
  'Bookshelf LAYOUT yaw/rotY must be PI/2'
);

assert.ok(
  Math.abs(dressing.bookshelf.rotation.y - Math.PI / 2) < 0.01,
  `Bookshelf rotation.y=${dressing.bookshelf.rotation.y} must face into room (+x, PI/2)`
);

dressing.bookshelf.updateMatrixWorld(true);
const shelfBox = new THREE.Box3().setFromObject(dressing.bookshelf);
assert.ok(Math.abs(shelfBox.min.y - 0.0) <= 0.02, `Bookshelf lowest vertex must be floor level, got y=${shelfBox.min.y}`);
assert.ok(shelfBox.max.x < -3.8, `Bookshelf front edge x=${shelfBox.max.x} must remain on left wall side`);
assert.ok(shelfBox.min.z > -1.0, `Bookshelf rear edge z=${shelfBox.min.z} must stay clear of resume board (z > -1.0)`);
console.log(`  ✓ Bookshelf bounds: X [${shelfBox.min.x.toFixed(2)}, ${shelfBox.max.x.toFixed(2)}], Y [${shelfBox.min.y.toFixed(2)}, ${shelfBox.max.y.toFixed(2)}], Z [${shelfBox.min.z.toFixed(2)}, ${shelfBox.max.z.toFixed(2)}]`);

// -----------------------------------------------------------------------------
// Test 3: Bookshelf Contact Shadow Synchronization
// -----------------------------------------------------------------------------
console.log('[Test 3] Verifying bookshelf contact shadow synchronization...');
const shelfShadow = dressing.contactShadows.find(s => s.name === 'ContactShadow_Bookshelf');
assert.ok(shelfShadow, 'ContactShadow_Bookshelf must exist in contactShadows');
assert.ok(Math.abs(shelfShadow.position.x - ROOM_LAYOUT.bookshelf.x) < 0.01, 'Shadow X must match bookshelf X');
assert.ok(Math.abs(shelfShadow.position.z - ROOM_LAYOUT.bookshelf.z) < 0.01, 'Shadow Z must match bookshelf Z');
assert.ok(Math.abs(shelfShadow.position.y - 0.006) < 0.001, 'Shadow Y must be at floor offset 0.006');
assert.ok(Math.abs(shelfShadow.rotation.z - Math.PI / 2) < 0.01, 'Shadow rotation around normal must match bookshelf yaw (PI/2)');

shelfShadow.updateMatrixWorld(true);
const shadowBox = new THREE.Box3().setFromObject(shelfShadow);
const shadowSize = shadowBox.getSize(new THREE.Vector3());
assert.ok(Math.abs(shadowSize.x - 0.50) < 0.02, `Shadow width along X must be ~0.50m (depth axis), got ${shadowSize.x.toFixed(3)}`);
assert.ok(Math.abs(shadowSize.z - 1.40) < 0.02, `Shadow length along Z must be ~1.40m (width axis), got ${shadowSize.z.toFixed(3)}`);
console.log(`  ✓ Contact shadow synchronized: pos=(${shelfShadow.position.x}, ${shelfShadow.position.z}), size=${shadowSize.x.toFixed(2)}x${shadowSize.z.toFixed(2)}`);

// -----------------------------------------------------------------------------
// Test 4: Collision / Overlap Checks
// -----------------------------------------------------------------------------
console.log('[Test 4] Verifying exclusion zones...');
const resumeBoardBox = new THREE.Box3(
  new THREE.Vector3(-4.6, 1.90, -3.2),
  new THREE.Vector3(-3.8, 3.40, -1.0)
);
assert.ok(!shelfBox.intersectsBox(resumeBoardBox), 'Bookshelf must not intersect Resume board!');

const deskBox = new THREE.Box3(
  new THREE.Vector3(-1.65, 0.0, -0.60),
  new THREE.Vector3(1.65, 1.25, 1.00)
);
assert.ok(!shelfBox.intersectsBox(deskBox), 'Bookshelf must not intersect desk!');

const plantBox = new THREE.Box3().setFromObject(dressing.floorPlant);
assert.ok(!shelfBox.intersectsBox(plantBox), 'Bookshelf must not intersect floor plant!');
console.log('  ✓ Bookshelf does not overlap Resume board, desk, or floor plant');

console.log('\n--- ALL LAYOUT POLISH TESTS PASSED SUCCESSFULLY! ---');
