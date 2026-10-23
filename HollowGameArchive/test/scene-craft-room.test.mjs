import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildRoomDressing, LAYOUT } from '../src/components/scene/roomDressing.js';
import { buildDeskProps } from '../src/components/scene/deskProps.js';

console.log('--- Running Scene Craft v3 Room Dressing Unit Tests ---');

const trackedDisposables = [];
function trackStub(item) {
  trackedDisposables.push(item);
  return item;
}

const canvasCalls = [];
function makeCanvasTexStub(paint, w, h) {
  canvasCalls.push({ w, h });
  const dummyCtx = {
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
    createRadialGradient() {
      return { addColorStop() {} };
    }
  };
  try {
    paint(dummyCtx, w, h);
  } catch (err) {
    console.error('Error in stub makeCanvasTex:', err);
    throw err;
  }
  return new THREE.Texture();
}

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
  track: trackStub,
  makeCanvasTex: makeCanvasTexStub,
  mats,
  RoundedBoxGeometry
};

const dressing = buildRoomDressing(ctx);

// Helper to compute world bbox of an Object3D
function getWorldBox(obj) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  return box;
}

// -----------------------------------------------------------------------------
// Test 1: Handles and exports
// -----------------------------------------------------------------------------
console.log('[Test 1] Verifying handles and exports...');
assert.ok(dressing.group, 'dressing.group must exist');
assert.ok(Array.isArray(dressing.contactShadows), 'dressing.contactShadows must be an array');
assert.ok(dressing.contactShadows.length >= 6, 'contactShadows must contain at least 6 shadow meshes');
assert.ok(dressing.LAYOUT, 'dressing.LAYOUT must exist');
assert.ok(LAYOUT, 'named export LAYOUT must exist');
assert.ok(dressing.bookshelf, 'dressing.bookshelf must exist');
assert.ok(dressing.floorPlant, 'dressing.floorPlant must exist');
assert.ok(dressing.floorLamp, 'dressing.floorLamp must exist');
assert.ok(dressing.cat, 'dressing.cat must exist');
assert.ok(dressing.wallFrames, 'dressing.wallFrames must exist');
assert.ok(dressing.planks, 'dressing.planks must exist');
console.log('  ✓ All required handles and exports present');

// -----------------------------------------------------------------------------
// Test 2: Budget and NaN checks
// -----------------------------------------------------------------------------
console.log('[Test 2] Verifying budget and NaN checks...');
dressing.group.updateMatrixWorld(true);
const groupBBox = getWorldBox(dressing.group);
assert.ok(!Number.isNaN(groupBBox.min.x) && !Number.isNaN(groupBBox.max.x), 'Room dressing bbox contains NaN');

let meshCount = 0;
let triangleCount = 0;

dressing.group.traverse(node => {
  if (node.isMesh || node.isInstancedMesh) {
    meshCount++;
    const geo = node.geometry;
    if (geo) {
      let tri = 0;
      if (geo.index) {
        tri = geo.index.count / 3;
      } else if (geo.attributes.position) {
        tri = geo.attributes.position.count / 3;
      }
      if (node.isInstancedMesh) {
        tri *= node.count;
      }
      triangleCount += tri;
    }
  }
});

console.log(`  Total mesh count: ${meshCount} (budget <= 250)`);
console.log(`  Total triangle count: ${Math.round(triangleCount)} (budget <= 80,000)`);
assert.ok(meshCount <= 250, `Mesh count exceeded: ${meshCount} > 250`);
assert.ok(triangleCount <= 80000, `Triangle count exceeded: ${triangleCount} > 80000`);

// -----------------------------------------------------------------------------
// Test 3: Prop lowest vertex within +-0.02 of floor y=0 (or shelf surface)
// -----------------------------------------------------------------------------
console.log('[Test 3] Verifying prop vertical bounds and floor contact...');
const floorProps = [
  { name: 'bookshelf', obj: dressing.bookshelf },
  { name: 'floorPlant', obj: dressing.floorPlant },
  { name: 'floorLamp', obj: dressing.floorLamp },
  { name: 'cat', obj: dressing.cat }
];

floorProps.forEach(({ name, obj }) => {
  const box = getWorldBox(obj);
  assert.ok(
    Math.abs(box.min.y - 0.0) <= 0.02,
    `${name} lowest vertex must be within +-0.02 of floor y=0, got ${box.min.y}`
  );
  console.log(`  ✓ ${name} lowest vertex y = ${box.min.y.toFixed(4)} (within +-0.02)`);
});

// Planks and contact shadows at floor or rug surface
dressing.contactShadows.forEach(s => {
  if (s.name === 'ContactShadow_Desk' || s.name === 'ContactShadow_Cat') {
    assert.ok(Math.abs(s.position.y - 0.0165) <= 0.001, `${s.name} position y must be 0.0165 (elevated over rug), got ${s.position.y}`);
  } else {
    assert.ok(Math.abs(s.position.y - 0.006) <= 0.001, `${s.name} position y must be 0.006, got ${s.position.y}`);
  }
});
console.log('  ✓ Contact shadows correctly positioned (desk & cat at y=0.0165 over rug, others at y=0.006 on floor)');

// -----------------------------------------------------------------------------
// Test 4: Exclusion boxes (no prop intersects forbidden zones)
// -----------------------------------------------------------------------------
console.log('[Test 4] Verifying exclusion zones (no collisions)...');
// Expanded desk box (x -1.6..1.6, z -0.55..0.95, y 0..1.2 expanded 0.05)
const deskBox = new THREE.Box3(
  new THREE.Vector3(-1.65, 0.0, -0.60),
  new THREE.Vector3(1.65, 1.25, 1.00)
);

// Audio table box (x 1.8..3.1, z -3.0..-2.2, y 0..1.2)
const audioTableBox = new THREE.Box3(
  new THREE.Vector3(1.8, 0.0, -3.0),
  new THREE.Vector3(3.1, 1.3, -2.2)
);

// Chair/robot zone (x 0.5..1.9, z -1.5..0.2, y 0..2.2)
const chairRobotBox = new THREE.Box3(
  new THREE.Vector3(0.5, 0.0, -1.5),
  new THREE.Vector3(1.9, 2.2, 0.2)
);

// Resume wall zone (x=-4.5, z -2.2..1.0, y 1.6..3.8)
const resumeWallBox = new THREE.Box3(
  new THREE.Vector3(-4.6, 1.6, -2.2),
  new THREE.Vector3(-4.4, 3.8, 1.0)
);

const testedProps = [
  { name: 'bookshelf', obj: dressing.bookshelf },
  { name: 'floorPlant', obj: dressing.floorPlant },
  { name: 'floorLamp', obj: dressing.floorLamp },
  { name: 'cat', obj: dressing.cat },
  { name: 'wallFrames', obj: dressing.wallFrames }
];

testedProps.forEach(({ name, obj }) => {
  const pBox = getWorldBox(obj);
  assert.ok(!pBox.intersectsBox(deskBox), `${name} intersects desk box!`);
  assert.ok(!pBox.intersectsBox(audioTableBox), `${name} intersects audio table box!`);
  assert.ok(!pBox.intersectsBox(chairRobotBox), `${name} intersects chair/robot box!`);
  assert.ok(!pBox.intersectsBox(resumeWallBox), `${name} intersects resume wall zone!`);
});
console.log('  ✓ All props strictly outside desk, audio table, chair/robot, and resume wall zones');

// -----------------------------------------------------------------------------
// Test 5: Bookshelf books inside shelf bounds
// -----------------------------------------------------------------------------
console.log('[Test 5] Verifying bookshelf books inside shelf bounds...');
const shelfBox = getWorldBox(dressing.bookshelf);
let booksMesh = null;
dressing.bookshelf.traverse(node => {
  if (node.isInstancedMesh && node.name === 'BookshelfBooks') {
    booksMesh = node;
  }
});
assert.ok(booksMesh, 'BookshelfBooks instanced mesh found');
assert.ok(booksMesh.count >= 35 && booksMesh.count <= 45, `Expected ~40 books, found ${booksMesh.count}`);

// Verify all instance positions are within shelf outer bounds
const m = new THREE.Matrix4();
const pos = new THREE.Vector3();
for (let i = 0; i < booksMesh.count; i++) {
  booksMesh.getMatrixAt(i, m);
  pos.setFromMatrixPosition(m);
  // Transform to world coordinates
  const worldPos = pos.clone().applyMatrix4(dressing.bookshelf.matrixWorld);
  assert.ok(
    worldPos.x >= shelfBox.min.x && worldPos.x <= shelfBox.max.x &&
    worldPos.z >= shelfBox.min.z && worldPos.z <= shelfBox.max.z &&
    worldPos.y >= shelfBox.min.y && worldPos.y <= shelfBox.max.y,
    `Book ${i} at (${worldPos.x}, ${worldPos.y}, ${worldPos.z}) is outside bookshelf bounds!`
  );
}
console.log(`  ✓ All ${booksMesh.count} books are securely inside bookshelf bounds`);

// -----------------------------------------------------------------------------
// Test 6: Cat dimensions (< 0.7m long)
// -----------------------------------------------------------------------------
console.log('[Test 6] Verifying cat dimensions...');
const catBox = getWorldBox(dressing.cat);
const catSize = new THREE.Vector3();
catBox.getSize(catSize);
const catLength = Math.max(catSize.x, catSize.z);
console.log(`  Cat bounding size: length=${catLength.toFixed(3)}m, height=${catSize.y.toFixed(3)}m`);
assert.ok(catLength < 0.7, `Cat is too big: ${catLength} >= 0.7m`);
assert.ok(catLength >= 0.25, `Cat is too small: ${catLength} < 0.25m`);
console.log('  ✓ Cat is appropriately sized (< 0.7m long)');

// -----------------------------------------------------------------------------
// Test 7: Raycast from above desk-top mug and notebook
// -----------------------------------------------------------------------------
console.log('[Test 7] Verifying raycast hit from above desk mug and notebook...');
const deskPropsObj = buildDeskProps(ctx);
deskPropsObj.desk.updateMatrixWorld(true);

// Raycast above mug (local x~1.25, z~-0.15)
let mugMesh = null;
deskPropsObj.desk.traverse(node => {
  if (node.isMesh && node.name === 'MugBody') {
    mugMesh = node;
  }
});
assert.ok(mugMesh, 'Mug mesh found on desk');
const mugPosWorld = mugMesh.getWorldPosition(new THREE.Vector3());
const rayMug = new THREE.Raycaster(
  new THREE.Vector3(mugPosWorld.x, mugPosWorld.y + 0.5, mugPosWorld.z),
  new THREE.Vector3(0, -1, 0)
);
const mugHits = rayMug.intersectObjects(deskPropsObj.desk.children, true).filter(h => h.object.visible);
assert.ok(mugHits.length > 0, 'Ray above mug produced no hit');
assert.ok(
  mugHits[0].object === mugMesh || mugHits[0].object.name.startsWith('Mug'),
  `Ray above mug should hit mug first, hit: ${mugHits[0].object.name}`
);
console.log(`  ✓ Raycast above mug hit ${mugHits[0].object.name} at y=${mugHits[0].point.y.toFixed(4)}`);

// Raycast above notebook (local x~0.95, z~0.10)
let notebookMesh = null;
deskPropsObj.desk.traverse(node => {
  if (node.isMesh && node.name === 'NotebookCover') {
    notebookMesh = node;
  }
});
assert.ok(notebookMesh, 'Notebook mesh found on desk');
const nbPosWorld = notebookMesh.getWorldPosition(new THREE.Vector3());
const rayNb = new THREE.Raycaster(
  new THREE.Vector3(nbPosWorld.x, nbPosWorld.y + 0.5, nbPosWorld.z),
  new THREE.Vector3(0, -1, 0)
);
const nbHits = rayNb.intersectObjects(deskPropsObj.desk.children, true).filter(h => h.object.visible);
assert.ok(nbHits.length > 0, 'Ray above notebook produced no hit');
assert.ok(
  nbHits[0].object === notebookMesh || nbHits[0].object.name.startsWith('Notebook'),
  `Ray above notebook should hit notebook first, hit: ${nbHits[0].object.name}`
);
console.log(`  ✓ Raycast above notebook hit ${nbHits[0].object.name} at y=${nbHits[0].point.y.toFixed(4)}`);

// -----------------------------------------------------------------------------
// Test 8: Floor planks bounds and continuous coverage verification (CP3)
// -----------------------------------------------------------------------------
console.log('[Test 8] Verifying floor planks instance bounds and rug exclusion...');
const planks = dressing.planks;
assert.ok(planks && planks.isInstancedMesh, 'Planks must be an InstancedMesh');
assert.ok(planks.count > 0, 'Planks count must be > 0');

const plankMatrix = new THREE.Matrix4();
const plankPos = new THREE.Vector3();
const plankW = planks.geometry.parameters.width || 1.20;
const plankD = planks.geometry.parameters.depth || 0.18;

for (let i = 0; i < planks.count; i++) {
  planks.getMatrixAt(i, plankMatrix);
  plankPos.setFromMatrixPosition(plankMatrix);

  // Bounds: x in [-4.9, 4.9], z in [-3.5, 6.3]
  assert.ok(
    plankPos.x >= -4.901 && plankPos.x <= 4.901,
    `Plank ${i} center x=${plankPos.x} outside [-4.9, 4.9]`
  );
  assert.ok(
    plankPos.z >= -3.501 && plankPos.z <= 6.301,
    `Plank ${i} center z=${plankPos.z} outside [-3.5, 6.3]`
  );

  // Never spawn planks outside x > 5.0
  const px1 = plankPos.x + plankW / 2;
  assert.ok(
    px1 <= 5.001,
    `Plank ${i} extends outside room x > 5.0 (px1=${px1})`
  );

  // Planks may continue under the raised opaque rug; excluding whole crossing boards leaves visible bare stair-steps.
  const actual = new THREE.Box3().setFromBufferAttribute(planks.geometry.attributes.position).applyMatrix4(plankMatrix);
  assert.ok(actual.min.x >= -5.001 && actual.max.x <= 5.001 && actual.min.z >= -3.601 && actual.max.z <= 6.401, `Plank ${i} extends beyond the actual floor`);
}
planks.updateMatrixWorld(true);
for (const x of [-2.2, 2.4]) for (let z = -1.3; z < 2.2; z += .188) {
  const ray = new THREE.Raycaster(new THREE.Vector3(x, 1, z), new THREE.Vector3(0, -1, 0));
  assert.ok(ray.intersectObject(planks).length, `Missing wood floor beside rug at ${x},${z}`);
}
console.log(`  ✓ All ${planks.count} floor planks stay within floor bounds with no bare stair-step beside rug`);

// -----------------------------------------------------------------------------
// Test 9: Wall frames and baseboards room-facing surface verification (CP3)
// -----------------------------------------------------------------------------
console.log('[Test 9] Verifying wall frames and baseboards placement on room surfaces...');
// Back wall inner surface is at z = -3.10
LAYOUT.wallFrames.forEach((frame, idx) => {
  assert.ok(
    frame.z >= -3.10,
    `WallFrame ${idx + 1} at z=${frame.z} is buried inside wall geometry (wall surface z=-3.10)`
  );
});

// Wall frames group meshes
dressing.wallFrames.children.forEach((fGroup, idx) => {
  const fBox = getWorldBox(fGroup);
  assert.ok(
    fBox.min.z >= -3.105,
    `WallFrame mesh ${idx + 1} min z=${fBox.min.z.toFixed(4)} is buried inside wall (z < -3.10)`
  );
});

// Baseboards: window baseboard at z >= -3.10, left baseboard at x >= -4.40
assert.ok(dressing.baseboards, 'dressing.baseboards must exist');
dressing.baseboards.children.forEach(bb => {
  const bbBox = getWorldBox(bb);
  // If baseboard is along window wall (spans X):
  if (bb.geometry.parameters.width > 2.0) {
    assert.ok(
      bbBox.min.z >= -3.105,
      `Window wall baseboard min z=${bbBox.min.z.toFixed(4)} is buried inside back wall (z < -3.10)`
    );
  }
  // If baseboard is along left wall (spans Z):
  if (bb.geometry.parameters.depth > 2.0) {
    assert.ok(
      bbBox.min.x >= -4.405,
      `Left wall baseboard min x=${bbBox.min.x.toFixed(4)} is buried inside left wall (x < -4.40)`
    );
  }
});
console.log('  ✓ Wall frames and baseboards confirmed on room-facing surfaces of walls');

console.log('\n--- ALL ROOM DRESSING TESTS PASSED SUCCESSFULLY! ---');
