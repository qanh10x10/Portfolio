import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildDeskProps, LAYOUT } from '../src/components/scene/deskProps.js';

console.log('--- Running Scene Craft v3 Desk Props Unit Tests ---');

// Track canvas creations
const canvasCalls = [];
function makeCanvasTexStub(paint, w, h) {
  canvasCalls.push({ w, h });
  // Call paint with dummy 2D context to verify paint function does not throw
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
    stroke() {}
  };
  try {
    paint(dummyCtx, w, h);
  } catch (err) {
    console.error('Error executing paint function:', err);
    throw err;
  }
  return new THREE.Texture();
}

const trackedDisposables = [];
function trackStub(item) {
  trackedDisposables.push(item);
  return item;
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

const props = buildDeskProps(ctx);

// Helper to check if a node is descendant of root
function isDescendant(parent, child) {
  let curr = child.parent;
  while (curr) {
    if (curr === parent) return true;
    curr = curr.parent;
  }
  return false;
}

// Helper to compute world bbox of an Object3D
function getWorldBox(obj) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  return box;
}

// -----------------------------------------------------------------------------
// Test 1: Required handles and exports
// -----------------------------------------------------------------------------
console.log('[Test 1] Verifying exported handles and structure...');
assert.ok(props.desk, 'props.desk must exist');
assert.ok(props.keyboard, 'props.keyboard must exist');
assert.ok(props.mouse, 'props.mouse must exist');
assert.equal(props.lamp, undefined, 'props.lamp must be removed');
assert.equal(props.lampBulbMat, undefined, 'props.lampBulbMat must be removed');
assert.ok(props.monitor, 'props.monitor must exist');
assert.ok(props.audioTable, 'props.audioTable must exist');
assert.ok(props.phone, 'props.phone must exist');
assert.ok(props.plant, 'props.plant must exist');
assert.ok(props.LAYOUT, 'props.LAYOUT must exist');
assert.ok(LAYOUT, 'LAYOUT named export must exist');

assert.ok(props.monitor.group, 'monitor.group must exist');
assert.ok(props.monitor.screen, 'monitor.screen must exist');
assert.ok(props.monitor.frame, 'monitor.frame must exist');

assert.ok(props.audioTable.group, 'audioTable.group must exist');
assert.ok(props.audioTable.speaker, 'audioTable.speaker must exist');
assert.ok(props.audioTable.musicScreen, 'audioTable.musicScreen must exist');

assert.ok(props.phone.group, 'phone.group must exist');
assert.ok(props.phone.screen, 'phone.screen must exist');
assert.equal(typeof props.phone.setFlip, 'function', 'phone.setFlip must be a function');
console.log('  ✓ All handles present');

// -----------------------------------------------------------------------------
// Test 2: Descendant relationships and named meshes
// -----------------------------------------------------------------------------
console.log('[Test 2] Verifying hierarchy and node naming...');
assert.ok(isDescendant(props.monitor.group, props.monitor.screen), 'monitor.screen must be descendant of monitor.group');
assert.ok(isDescendant(props.monitor.group, props.monitor.frame), 'monitor.frame must be descendant of monitor.group');
assert.ok(isDescendant(props.audioTable.group, props.audioTable.speaker), 'speaker must be descendant of audioTable.group');
assert.ok(isDescendant(props.audioTable.speaker, props.audioTable.musicScreen), 'musicScreen must be descendant of speaker');
assert.ok(isDescendant(props.phone.group, props.phone.screen), 'phone.screen must be descendant of phone.group');

assert.equal(props.monitor.group.name, 'MonitorGroup', 'monitor.group name must be MonitorGroup');
assert.equal(props.audioTable.speaker.name, 'HVLSmartSpeaker', 'audioTable.speaker name must be HVLSmartSpeaker');
assert.equal(props.phone.group.name, 'DeskPhone', 'phone.group name must be DeskPhone');
console.log('  ✓ Hierarchy and names verified');

// -----------------------------------------------------------------------------
// Test 3: Canvas textures exactly match the 3 baseline sizes
// -----------------------------------------------------------------------------
console.log('[Test 3] Verifying canvas texture sizes...');
assert.equal(canvasCalls.length, 3, `Expected exactly 3 makeCanvasTex calls, got ${canvasCalls.length}`);
const expectedSizes = [
  { w: 1024, h: 512 },
  { w: 640, h: 390 },
  { w: 360, h: 780 }
];
for (const exp of expectedSizes) {
  const match = canvasCalls.find(c => c.w === exp.w && c.h === exp.h);
  assert.ok(match, `Missing makeCanvasTex call for ${exp.w}x${exp.h}`);
}
console.log('  ✓ Canvas sizes match verbatim baseline requirements (1024x512, 640x390, 360x780)');

// -----------------------------------------------------------------------------
// Test 4: Desk heights and dimensions
// -----------------------------------------------------------------------------
console.log('[Test 4] Verifying desk geometry...');
props.desk.updateMatrixWorld(true);
const deskBox = getWorldBox(props.desk);
assert.ok(!Number.isNaN(deskBox.min.x), 'Desk bounding box has NaN');

// Find tabletop mesh to check surface height
let tabletopMesh = null;
props.desk.traverse(node => {
  if (node.isMesh && node.geometry && node.geometry.parameters && node.geometry.parameters.width === 3.2) {
    tabletopMesh = node;
  }
});
assert.ok(tabletopMesh, 'Tabletop mesh found');
const tabletopBox = getWorldBox(tabletopMesh);
assert.ok(
  Math.abs(tabletopBox.max.y - 1.095) <= 0.005,
  `Desk top surface y must be 1.095 +- 0.005, got ${tabletopBox.max.y}`
);
assert.ok(
  Math.abs(deskBox.min.y - 0.0) <= 0.001,
  `Desk feet must touch y=0, got ${deskBox.min.y}`
);

// Check front clearance under tabletop >= 0.95
const frontClearanceY = tabletopBox.min.y; // underside of tabletop
assert.ok(
  frontClearanceY >= 0.95,
  `Front clearance under top must be >= 0.95, got ${frontClearanceY}`
);
console.log(`  ✓ Desk top y=${tabletopBox.max.y.toFixed(4)}, feet min y=${deskBox.min.y.toFixed(4)}, clearance=${frontClearanceY.toFixed(4)}`);

// -----------------------------------------------------------------------------
// Test 5: Ultrawide monitor screen dimensions and normal
// -----------------------------------------------------------------------------
console.log('[Test 5] Verifying monitor screen...');
props.monitor.group.updateMatrixWorld(true);
const screenGeo = props.monitor.screen.geometry;
const screenParams = screenGeo.parameters;
assert.equal(screenParams.width, 1.82, `Monitor screen width must be 1.82, got ${screenParams.width}`);
assert.equal(screenParams.height, 0.88, `Monitor screen height must be 0.88, got ${screenParams.height}`);

const screenNormal = new THREE.Vector3(0, 0, 1);
props.monitor.screen.getWorldDirection(screenNormal);
assert.ok(
  Math.abs(screenNormal.z - 1.0) <= 0.01 && Math.abs(screenNormal.x) <= 0.01 && Math.abs(screenNormal.y) <= 0.01,
  `Monitor screen normal must point +z, got (${screenNormal.x}, ${screenNormal.y}, ${screenNormal.z})`
);
console.log('  ✓ Monitor screen dims 1.82x0.88 and normal +z verified');

// -----------------------------------------------------------------------------
// Test 6: Audio table and smart speaker heights
// -----------------------------------------------------------------------------
console.log('[Test 6] Verifying audio table & speaker...');
props.audioTable.group.updateMatrixWorld(true);
const audioTableBox = getWorldBox(props.audioTable.group);
assert.ok(!Number.isNaN(audioTableBox.min.x), 'AudioTable bounding box has NaN');

// Find audio table tabletop
let audioTableTopMesh = null;
props.audioTable.group.traverse(node => {
  if (node.isMesh && node.geometry && node.geometry.parameters && node.geometry.parameters.width === 1.10) {
    audioTableTopMesh = node;
  }
});
assert.ok(audioTableTopMesh, 'Audio table top mesh found');
const audioTopBox = getWorldBox(audioTableTopMesh);
assert.ok(
  Math.abs(audioTopBox.max.y - 0.62) <= 0.01,
  `Audio table top must be 0.62 +- 0.01, got ${audioTopBox.max.y}`
);

// Feet touch y=0
assert.ok(
  Math.abs(audioTableBox.min.y - 0.0) <= 0.001,
  `Audio table feet must touch y=0, got ${audioTableBox.min.y}`
);

// Speaker base on tabletop and top <= 1.12
const speakerBox = getWorldBox(props.audioTable.speaker);
assert.ok(
  Math.abs(speakerBox.min.y - 0.62) <= 0.01,
  `Speaker base must be on table top y=0.62, got ${speakerBox.min.y}`
);
assert.ok(
  speakerBox.max.y <= 1.12,
  `Top of speaker must be <= 1.12 from floor, got ${speakerBox.max.y}`
);
console.log(`  ✓ Audio table top y=${audioTopBox.max.y.toFixed(3)}, speaker base y=${speakerBox.min.y.toFixed(3)}, speaker top y=${speakerBox.max.y.toFixed(3)} <= 1.12`);

// -----------------------------------------------------------------------------
// Test 7: Phone setFlip API (face down at t=0, flipped at t=1, no desk penetration)
// -----------------------------------------------------------------------------
console.log('[Test 7] Verifying phone flip behavior...');
// Helper to get minimum y of all vertices of phone group in world space
function getMinY(root) {
  root.updateMatrixWorld(true);
  let minY = Infinity;
  const v = new THREE.Vector3();
  root.traverse(node => {
    if (node.isMesh && node.geometry) {
      const pos = node.geometry.attributes.position;
      if (pos) {
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          node.localToWorld(v);
          if (v.y < minY) minY = v.y;
        }
      }
    }
  });
  return minY;
}

// Test t = 0 (face down)
props.phone.setFlip(0);
const phoneNorm0 = new THREE.Vector3(0, 0, 1);
props.phone.screen.getWorldDirection(phoneNorm0);
assert.ok(
  phoneNorm0.y <= -0.98,
  `At t=0, phone screen normal must point -y, got (${phoneNorm0.x.toFixed(3)}, ${phoneNorm0.y.toFixed(3)}, ${phoneNorm0.z.toFixed(3)})`
);
const minY0 = getMinY(props.phone.group);
assert.ok(
  minY0 >= -0.001,
  `At t=0, every vertex of phone body must have y >= -0.001 (got ${minY0})`
);
assert.ok(
  minY0 <= 0.002,
  `At t=0, phone should rest on desk surface y~0 (got ${minY0})`
);

// Test t = 1 (flipped upright)
props.phone.setFlip(1);
const phoneNorm1 = new THREE.Vector3(0, 0, 1);
props.phone.screen.getWorldDirection(phoneNorm1);
assert.ok(
  phoneNorm1.z >= 0.90,
  `At t=1, phone screen normal must be ~+z (got z=${phoneNorm1.z.toFixed(3)})`
);
const minY1 = getMinY(props.phone.group);
assert.ok(
  minY1 >= -0.001,
  `At t=1, lowest vertex must have y >= -0.001 (no desk penetration, got ${minY1})`
);
assert.ok(
  minY1 <= 0.005,
  `At t=1, phone bottom edge should remain on desk (got ${minY1})`
);

// Test intermediate steps for penetration safety
for (let step = 0; step <= 10; step++) {
  const t = step / 10;
  props.phone.setFlip(t);
  const minVal = getMinY(props.phone.group);
  assert.ok(
    minVal >= -0.001,
    `Desk penetration at t=${t}: min y is ${minVal}`
  );
}
console.log('  ✓ Phone flip verified: t=0 points -y, t=1 points ~+z, min y >= -0.001 at all intermediate steps');

// Verify CP2 smaller phone dimensions (0.22 x 0.03 x 0.42)
let phoneBodyMesh = null;
props.phone.group.traverse(node => {
  if (node.isMesh && node.name === 'PhoneBody') {
    phoneBodyMesh = node;
  }
});
assert.ok(phoneBodyMesh, 'PhoneBody mesh found');
phoneBodyMesh.geometry.computeBoundingBox();
const phoneBBox = phoneBodyMesh.geometry.boundingBox;
const phoneSize = new THREE.Vector3();
phoneBBox.getSize(phoneSize);
assert.ok(Math.abs(phoneSize.x - 0.22) <= 0.002, `Phone width must be 0.22, got ${phoneSize.x}`);
assert.ok(Math.abs(phoneSize.y - 0.03) <= 0.002, `Phone height must be 0.03, got ${phoneSize.y}`);
assert.ok(Math.abs(phoneSize.z - 0.42) <= 0.002, `Phone length must be 0.42, got ${phoneSize.z}`);
console.log(`  ✓ Phone dimensions verified: ${phoneSize.x.toFixed(2)} x ${phoneSize.y.toFixed(2)} x ${phoneSize.z.toFixed(2)}`);

// -----------------------------------------------------------------------------
// Test 7b: Desk details raycast (coffee mug and notebook)
// -----------------------------------------------------------------------------
console.log('[Test 7b] Verifying raycast hit from above desk mug and notebook...');
props.desk.updateMatrixWorld(true);

let mugMesh = null;
props.desk.traverse(node => {
  if (node.isMesh && node.name === 'MugBody') mugMesh = node;
});
assert.ok(mugMesh, 'MugBody mesh found on desk');
const mugPos = mugMesh.getWorldPosition(new THREE.Vector3());
const rayMug = new THREE.Raycaster(
  new THREE.Vector3(mugPos.x, mugPos.y + 0.5, mugPos.z),
  new THREE.Vector3(0, -1, 0)
);
const mugHits = rayMug.intersectObjects(props.desk.children, true).filter(h => h.object.visible);
assert.ok(mugHits.length > 0 && (mugHits[0].object === mugMesh || mugHits[0].object.name.startsWith('Mug')), 'Ray from above mug must hit mug first');
console.log(`  ✓ Raycast above mug hit ${mugHits[0].object.name} at y=${mugHits[0].point.y.toFixed(4)}`);

let nbMesh = null;
props.desk.traverse(node => {
  if (node.isMesh && node.name === 'NotebookCover') nbMesh = node;
});
assert.ok(nbMesh, 'NotebookCover mesh found on desk');
const nbPos = nbMesh.getWorldPosition(new THREE.Vector3());
const rayNb = new THREE.Raycaster(
  new THREE.Vector3(nbPos.x, nbPos.y + 0.5, nbPos.z),
  new THREE.Vector3(0, -1, 0)
);
const nbHits = rayNb.intersectObjects(props.desk.children, true).filter(h => h.object.visible);
assert.ok(nbHits.length > 0 && (nbHits[0].object === nbMesh || nbHits[0].object.name.startsWith('Notebook')), 'Ray from above notebook must hit notebook first');
console.log(`  ✓ Raycast above notebook hit ${nbHits[0].object.name} at y=${nbHits[0].point.y.toFixed(4)}`);

// -----------------------------------------------------------------------------
// Test 7c: CP3 honest props - Mug inner cavity, notebook pages, cable tray flush mount
// -----------------------------------------------------------------------------
console.log('[Test 7c] Verifying CP3 physical honesty: mug cavity, notebook pages, cable tray flush mount...');
// 1) Mug cavity & coffee recessed ~10mm below rim
let coffeeMesh = null;
props.desk.traverse(node => {
  if (node.isMesh && node.name === 'MugCoffee') coffeeMesh = node;
});
assert.ok(coffeeMesh, 'MugCoffee mesh found');
const mugBox = getWorldBox(mugMesh);
const coffeeBox = getWorldBox(coffeeMesh);
const rimTopY = mugBox.max.y;
const coffeeTopY = coffeeBox.max.y;
const coffeeRecess = rimTopY - coffeeTopY;
assert.ok(
  coffeeRecess >= 0.007 && coffeeRecess <= 0.013,
  `Coffee liquid must be recessed ~10mm below rim (got ${coffeeRecess.toFixed(4)}m)`
);
// MugBody must have open inner cavity (not a solid cylinder cap)
assert.ok(
  mugMesh.geometry.type === 'LatheGeometry' || mugMesh.geometry.parameters?.openEnded,
  'MugBody must have an open cavity geometry'
);
console.log(`  ✓ Mug open cavity verified, coffee recessed ${(coffeeRecess * 1000).toFixed(1)}mm below rim`);

// 2) Notebook pages edges revealed
let nbBackMesh = null, nbPagesMesh = null;
props.desk.traverse(node => {
  if (node.isMesh && node.name === 'NotebookBackCover') nbBackMesh = node;
  if (node.isMesh && node.name === 'NotebookPages') nbPagesMesh = node;
});
assert.ok(nbBackMesh, 'NotebookBackCover mesh found');
assert.ok(nbPagesMesh, 'NotebookPages mesh found');
const nbPagesBox = getWorldBox(nbPagesMesh);
const nbCoverBox = getWorldBox(nbMesh);
assert.ok(nbPagesBox.min.y >= nbBackMesh.position.y, 'Pages sit above back cover');
assert.ok(nbCoverBox.max.y >= nbPagesBox.max.y, 'Top cover sits above pages');
console.log('  ✓ Notebook has separate back cover, pages block, and top cover revealing page edges');

// 3) Cable tray flush mount to tabletop underside (y=1.005)
let trayMesh = null;
props.desk.traverse(node => {
  if (node.isMesh && node.geometry?.parameters?.width === 1.6 && node.geometry?.parameters?.depth === 0.16) {
    trayMesh = node;
  }
});
assert.ok(trayMesh, 'Cable tray mesh found under desk');
const trayBox = getWorldBox(trayMesh);
assert.ok(
  Math.abs(trayBox.max.y - 1.005) <= 0.005,
  `Cable tray top must meet tabletop underside flush at y=1.005, got ${trayBox.max.y.toFixed(4)}`
);
console.log(`  ✓ Cable tray top meets tabletop underside flush at y=${trayBox.max.y.toFixed(4)}`);

// -----------------------------------------------------------------------------
// Test 8: Keyboard keycaps and mouse
// -----------------------------------------------------------------------------
console.log('[Test 8] Verifying keyboard and mouse...');
props.keyboard.updateMatrixWorld(true);
let totalKeyCount = 0;
props.keyboard.traverse(node => {
  if (node.isInstancedMesh) {
    totalKeyCount += node.count;
  }
});
assert.ok(
  totalKeyCount >= 70 && totalKeyCount <= 90,
  `Keyboard should have ~80 keycaps via InstancedMesh, found ${totalKeyCount}`
);
const kbBox = getWorldBox(props.keyboard);
assert.ok(!Number.isNaN(kbBox.min.x), 'Keyboard bounding box has NaN');

props.mouse.updateMatrixWorld(true);
const mouseBox = getWorldBox(props.mouse);
assert.ok(!Number.isNaN(mouseBox.min.x), 'Mouse bounding box has NaN');
console.log(`  ✓ Keyboard has ${totalKeyCount} instanced keycaps, keyboard and mouse valid`);

// -----------------------------------------------------------------------------
// Test 9: Budget & NaN checks across all components
// -----------------------------------------------------------------------------
console.log('[Test 9] Verifying budget and NaN checks...');
let meshCount = 0;
let triangleCount = 0;

const roots = [
  props.desk,
  props.keyboard,
  props.mouse,
  props.monitor.group,
  props.audioTable.group,
  props.phone.group,
  props.plant
];

for (const root of roots) {
  root.updateMatrixWorld(true);
  const box = getWorldBox(root);
  assert.ok(!Number.isNaN(box.min.x) && !Number.isNaN(box.max.y), `NaN found in bounds of ${root.name || 'unnamed'}`);

  root.traverse(node => {
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
}

console.log(`  Total mesh count: ${meshCount} (budget <= 250)`);
console.log(`  Total triangle count: ${Math.round(triangleCount)} (budget <= 80,000)`);
assert.ok(meshCount <= 250, `Mesh count exceeded budget: ${meshCount} > 250`);
assert.ok(triangleCount <= 80000, `Triangle count exceeded budget: ${triangleCount} > 80,000`);

// -----------------------------------------------------------------------------
// Test 10: Disposables registered
// -----------------------------------------------------------------------------
console.log('[Test 10] Verifying disposal tracking...');
assert.ok(trackedDisposables.length >= 25, `Expected tracking of created geometries/materials, tracked: ${trackedDisposables.length}`);
console.log(`  ✓ Registered ${trackedDisposables.length} tracked disposables`);

console.log('\n--- ALL TESTS PASSED SUCCESSFULLY! ---');
