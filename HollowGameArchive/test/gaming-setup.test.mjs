// Tests for gamingSetup.js: gaming chair, desktop PC, and bulletin board.
// Runs production modules directly in Node: node test/gaming-setup.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  normalizeGamingChair,
  mergeChairMeshes,
  normalizeGamingDesktop,
  mergeDesktopMeshes,
  normalizeBulletinBoard,
  createDisposer,
  CHAIR_FLOOR_Y,
  CHAIR_SEAT_Y,
} from '../src/components/scene/gamingSetup.js';
import { poseSeated, seat } from '../src/components/scene/ironMan.js';

globalThis.ProgressEvent ??= class ProgressEvent extends Event {};

const assetsDir = new URL('../public/assets/gaming-setup/', import.meta.url).pathname;
const ironmanDir = new URL('../public/assets/ironman/', import.meta.url).pathname;

// Helper to parse shipped glTF json + data in Node
async function parseAsset(jsonName, dataName) {
  const jsonStr = fs.readFileSync(assetsDir + jsonName, 'utf8');
  const bin = fs.readFileSync(assetsDir + dataName);
  const gltf = JSON.parse(jsonStr);
  gltf.images = [];
  gltf.textures = [];
  gltf.materials?.forEach((m) => {
    if (m.pbrMetallicRoughness) {
      delete m.pbrMetallicRoughness.baseColorTexture;
      delete m.pbrMetallicRoughness.metallicRoughnessTexture;
    }
    delete m.normalTexture;
    delete m.emissiveTexture;
    delete m.occlusionTexture;
  });
  gltf.buffers[0].uri = `data:application/octet-stream;base64,${bin.toString('base64')}`;
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(JSON.stringify(gltf), '', resolve, reject);
  });
}

console.log('--- 1. Asset Storage & CSP Compliance ---');
const files = fs.readdirSync(assetsDir);
assert.ok(files.includes('gaming-chair.json') && files.includes('gaming-chair.data'), 'chair assets exist');
assert.ok(files.includes('gaming-desktop.json') && files.includes('gaming-desktop.data'), 'desktop assets exist');
assert.ok(files.includes('bulletin-board.json') && files.includes('bulletin-board.data'), 'board assets exist');
assert.ok(files.includes('PROVENANCE.md'), 'PROVENANCE.md exists');

// Verify JSON points to separate image files and not data/blob
for (const jsonFile of ['gaming-chair.json', 'gaming-desktop.json', 'bulletin-board.json']) {
  const parsedJson = JSON.parse(fs.readFileSync(assetsDir + jsonFile, 'utf8'));
  for (const img of parsedJson.images || []) {
    assert.ok(!/^data:|^blob:/.test(img.uri), `${jsonFile} image ${img.uri} must be a separate static file`);
  }
}
const shippedBoard = JSON.parse(fs.readFileSync(assetsDir + 'bulletin-board.json', 'utf8'));
for (const m of shippedBoard.materials) {
  assert.equal(m.normalTexture, undefined, 'retired board notices must not remain embossed in the normal map');
  assert.equal(m.occlusionTexture, undefined, 'retired board notices must not remain as baked AO');
  assert.equal(m.pbrMetallicRoughness.metallicRoughnessTexture, undefined, 'retired board notices must not remain in surface response');
  assert.equal(m.pbrMetallicRoughness.metallicFactor, 0, 'cork and wood are nonmetallic');
}
assert.deepEqual(shippedBoard.images.map(i => i.uri), ['board-resume.webp']);
assert.equal(shippedBoard.textures.length, 1, 'only current resume artwork is loaded');
console.log('✓ All 3 models stored as CSP-compliant .json, .data, and separate static texture files; board has no legacy relief maps');

console.log('--- 2. Material-Identity Merge & Lifecycle Leak Prevention ---');
// Verify mergeDesktopMeshes separates distinct materials with identical names
const testScene = new THREE.Scene();
const matA1 = new THREE.MeshBasicMaterial({ name: 'SharedName', color: 0xff0000 });
const matA2 = new THREE.MeshBasicMaterial({ name: 'SharedName', color: 0x00ff00 }); // same name, different identity
assert.notEqual(matA1.uuid, matA2.uuid);

const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), matA1);
mesh1.name = 'TestMesh1';
const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), matA2);
mesh2.name = 'TestMesh2';
const mesh3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), matA1);
mesh3.name = 'TestMesh3';

testScene.add(mesh1, mesh2, mesh3);
const mergedTest = mergeDesktopMeshes(testScene);
let mergedCount = 0;
mergedTest.traverse((o) => { if (o.isMesh) mergedCount++; });
assert.equal(mergedCount, 2, 'Distinct materials with identical names must NOT be merged together');

// Verify array materials throw explicit error
const multiMatScene = new THREE.Scene();
const multiMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [matA1, matA2]);
multiMesh.name = 'MultiMesh';
multiMatScene.add(multiMesh);
assert.throws(() => mergeDesktopMeshes(multiMatScene), /Multi-materials unsupported/, 'Rejects multi-materials');

// Verify createDisposer tracks original raw + merged geoms, materials, and texture channels via isTexture
const fakeTex1 = new THREE.Texture();
const fakeTex2 = new THREE.Texture();
matA1.map = fakeTex1;
matA2.roughnessMap = fakeTex2;
let disposedCount = 0;
fakeTex1.dispose = () => { disposedCount++; };
fakeTex2.dispose = () => { disposedCount++; };
mesh1.geometry.dispose = () => { disposedCount++; };

const disposer = createDisposer(testScene, mergedTest);
assert.ok(disposer.geometries.has(mesh1.geometry), 'Tracks original raw geometry');
assert.ok(disposer.materials.has(matA1) && disposer.materials.has(matA2), 'Tracks materials');
assert.ok(disposer.textures.has(fakeTex1) && disposer.textures.has(fakeTex2), 'Tracks all texture channels');
disposer.dispose();
assert.ok(disposedCount >= 3, 'Disposer disposes tracked resources');
console.log('✓ Material identity merge and deduplicated lifecycle disposer verified');

console.log('--- 3. Gaming Chair Normalization, Draw Call Merge & IronMan Seating Fit ---');
const parsedChair = await parseAsset('gaming-chair.json', 'gaming-chair.data');
const chairNorm = normalizeGamingChair(parsedChair.scene, { optimize: true });

// Check draw calls: merged from 39 to 12
let chairMeshCount = 0;
let chairTriCount = 0;
chairNorm.activeScene.traverse((o) => {
  if (o.isMesh) {
    chairMeshCount++;
    chairTriCount += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
  }
});
assert.ok(chairMeshCount <= 12, `Chair draw calls reduced 39 -> ${chairMeshCount} (<= 12)`);
assert.equal(chairTriCount, 122530, `Chair triangles 100% preserved (122,530 tris)`);
assert.ok(chairNorm.seatMesh, 'Seat cushion Object_49 independently accessible');

// Actual transformed wheel min vertex Y in chair group
let minWheelY = Infinity;
chairNorm.group.traverse((o) => {
  if (o.isMesh) {
    const pos = o.geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      if (v.y < minWheelY) minWheelY = v.y;
    }
  }
});
assert.ok(Math.abs(minWheelY - CHAIR_FLOOR_Y) < 1e-4, `Actual wheel vertex min Y ${minWheelY.toFixed(4)}m equals floor y=${CHAIR_FLOOR_Y}`);

// Actual seat cushion height under thighs
const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);
raycaster.set(new THREE.Vector3(0.06092, 0.95, 0.00389), down);
const chairHits = raycaster.intersectObject(chairNorm.group, true);
assert.ok(chairHits.length > 0, 'Ray from thigh must hit seat cushion');
const cushionThighY = chairHits[0].point.y;
assert.ok(cushionThighY >= 0.708 && cushionThighY <= 0.715, `Cushion under thighs is at ${cushionThighY.toFixed(4)}m (target 0.710..0.715m)`);

// Verify IronMan fit on chair using actual transformed geometry vertices
const ironmanJson = JSON.parse(fs.readFileSync(ironmanDir + 'ironman.json', 'utf8'));
const ironmanBin = fs.readFileSync(ironmanDir + 'ironman.data');
ironmanJson.images = []; ironmanJson.textures = []; ironmanJson.materials?.forEach((m) => { delete m.pbrMetallicRoughness?.baseColorTexture; delete m.pbrMetallicRoughness?.metallicRoughnessTexture; delete m.emissiveTexture; });
ironmanJson.buffers[0].uri = `data:application/octet-stream;base64,${ironmanBin.toString('base64')}`;
const parsedIM = await new Promise((res, rej) => new GLTFLoader().parse(JSON.stringify(ironmanJson), '', res, rej));
const fig = parsedIM.scene.getObjectByName('IronMan');
poseSeated(fig);
seat(fig, { hipY: 0.907, z: 0.01 });

const rig = new THREE.Group();
rig.add(chairNorm.group);
rig.add(fig);
rig.updateMatrixWorld(true);

const verts = (o) => {
  const p = o.geometry.attributes.position, v = new THREE.Vector3(), a = [];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    a.push(o.localToWorld(v.clone()));
  }
  return a;
};
const named = (n) => fig.getObjectByName(n);

// Soles rest on floor
const soles = Math.min(...['KneeL', 'KneeR'].flatMap((k) => verts(named(k)).map((v) => v.y)));
assert.ok(soles >= CHAIR_FLOOR_Y - 0.005 && soles < 0.035, `IronMan soles at ${soles.toFixed(3)}m rest on the floor (~0.0155m)`);

// IronMan thigh underside vertices in contact region
const hipLVerts = verts(named('HipL')).filter((v) => v.z > -0.3 && v.z < 0.02 && Math.abs(v.x) < 0.25);
const hipRVerts = verts(named('HipR')).filter((v) => v.z > -0.3 && v.z < 0.02 && Math.abs(v.x) < 0.25);
const thighMinY = Math.min(...hipLVerts.concat(hipRVerts).map((v) => v.y));
assert.ok(Math.abs(thighMinY - 0.71084) < 0.002, `IronMan thigh underside lowest vertex is at ${thighMinY.toFixed(4)}m`);

const thighGap = thighMinY - cushionThighY;
assert.ok(thighGap >= 0 && thighGap <= 0.02, `Thigh underside gap is ${thighGap.toFixed(4)}m (<= 0.02m) with no sinking`);
console.log(`✓ Chair normalized: floor ${minWheelY.toFixed(4)}m, cushionThighY ${cushionThighY.toFixed(4)}m, IronMan thigh ${thighMinY.toFixed(4)}m (gap ${(thighGap * 100).toFixed(2)}cm), draw calls 39 -> ${chairMeshCount}`);

console.log('--- 4. Gaming Desktop PC Normalization & Additive Surface ---');
const parsedPC = await parseAsset('gaming-desktop.json', 'gaming-desktop.data');
const pcOpt = normalizeGamingDesktop(parsedPC.scene, { optimize: true, includeDesk: false });

let optMeshCount = 0;
let optTriCount = 0;
pcOpt.activeScene.traverse((o) => {
  if (o.isMesh) {
    optMeshCount++;
    if (o.visible) optTriCount += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
  }
});
assert.ok(optMeshCount <= 87, `merged mesh count ${optMeshCount} must be <= 87`);
let peripheralTriangles = 0;
pcOpt.rawScene.traverse((o) => {
  if (o.isMesh && o.visible) peripheralTriangles += o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3;
});
assert.ok(peripheralTriangles > 0 && peripheralTriangles < 86272, 'tower triangles removed');
assert.equal(optTriCount, peripheralTriangles, 'every retained peripheral triangle survives merging');
assert.equal(pcOpt.rawScene.getObjectByName('Cube011_Material010_0').visible, false, 'tower case excluded');
assert.equal(pcOpt.activeScene.getObjectByName('Merged_Material010'), undefined, 'tower not merged into the rendered setup');
for (const name of ['Cube001_Material055_0', 'Cube007_Material037_0', 'Cube064_Material074_0', 'Object_8_Tastatur_Seite_0']) {
  assert.equal(pcOpt.rawScene.getObjectByName(name).visible, true, `${name}: authored peripheral retained`);
}
assert.equal(pcOpt.hasMouse, true, 'actual mouse, not tower side logo, identified');
assert.ok(pcOpt.screen, 'authored screen mesh MY_SCREEN_MY_SCREEN_0 preserved for material/hiding');

// Additive surface contract
assert.ok(pcOpt.surface, 'surface descriptor exposed on desktop');
assert.ok(pcOpt.surface.mesh, 'surface.mesh PlaneGeometry exposed');
assert.ok(Math.abs(pcOpt.surface.width - 0.632) < 0.005, `surface width ${pcOpt.surface.width.toFixed(4)}m matches ~28in screen`);
assert.ok(Math.abs(pcOpt.surface.height - 0.348) < 0.005, `surface height ${pcOpt.surface.height.toFixed(4)}m matches 16:9 monitor`);
assert.ok(pcOpt.surface.normal.z > 0.99, 'surface normal faces +z');
assert.ok(Math.abs(pcOpt.surface.tiltAngleRad - (-0.0698)) < 0.005, `tilt angle ${pcOpt.surface.tiltAngleRad.toFixed(4)} rad matches authored ~4 deg tilt`);

// Verify surface.mesh local bounds are in XY plane (z=0)
const sGeo = pcOpt.surface.mesh.geometry;
assert.ok(sGeo.boundingBox, 'surface.mesh has boundingBox');
assert.equal(sGeo.boundingBox.min.z, 0);
assert.equal(sGeo.boundingBox.max.z, 0);

// Verify surface.mesh corners map exactly to authored screen face vertices
const tmpVec = new THREE.Vector3();
const meshCorners = [];
for (const x of [sGeo.boundingBox.min.x, sGeo.boundingBox.max.x]) {
  for (const y of [sGeo.boundingBox.min.y, sGeo.boundingBox.max.y]) {
    tmpVec.set(x, y, 0);
    meshCorners.push(pcOpt.surface.mesh.localToWorld(tmpVec.clone()));
  }
}
const screenAttr = pcOpt.screen.geometry.attributes.position;
const screenCorners = [];
for (let i = 0; i < screenAttr.count; i++) {
  screenCorners.push(pcOpt.screen.localToWorld(new THREE.Vector3().fromBufferAttribute(screenAttr, i)));
}
for (const sc of screenCorners) {
  const closest = Math.min(...meshCorners.map((mc) => mc.distanceTo(sc)));
  assert.ok(closest < 1e-4, `surface.mesh aligns with authored screen vertex within 0.1mm (got ${closest.toFixed(6)}m)`);
}
console.log(`✓ Desktop PC: draw calls 685 -> ${optMeshCount}, screen width ${pcOpt.surface.width.toFixed(3)}m, height ${pcOpt.surface.height.toFixed(3)}m, surface.mesh 100% aligned`);

console.log('--- 5. Japanese Bulletin Board Normalization & Additive Surface ---');
const parsedBoard = await parseAsset('bulletin-board.json', 'bulletin-board.data');
const boardNorm = normalizeBulletinBoard(parsedBoard.scene);

assert.ok(boardNorm.frameMesh, 'frame mesh present');
assert.ok(boardNorm.surface, 'surface descriptor exposed on board');
assert.ok(boardNorm.surface.mesh, 'surface.mesh PlaneGeometry exposed');
assert.equal(boardNorm.surface.width, 0.864, 'inner cork width is 0.864m');
assert.equal(boardNorm.surface.height, 0.564, 'inner cork height is 0.564m');
assert.equal(boardNorm.surface.frontZ, 0.0197, 'cork surface at z=0.0197m');
assert.equal(boardNorm.surface.normal.z, 1, 'content plane normal points +z');
assert.ok(boardNorm.dimensions.x >= 0.89 && boardNorm.dimensions.x <= 0.91, 'outer width ~0.90m');
assert.ok(boardNorm.dimensions.y >= 0.60 && boardNorm.dimensions.y <= 0.63, 'outer height ~0.61m');

// Verify board surface.mesh local bounds are in XY plane (z=0)
const bGeo = boardNorm.surface.mesh.geometry;
assert.ok(bGeo.boundingBox, 'board surface.mesh has boundingBox');
assert.equal(bGeo.boundingBox.min.z, 0);
assert.equal(bGeo.boundingBox.max.z, 0);

// Verify board corners map to measured cork vertices
const bCorners = [];
for (const x of [bGeo.boundingBox.min.x, bGeo.boundingBox.max.x]) {
  for (const y of [bGeo.boundingBox.min.y, bGeo.boundingBox.max.y]) {
    tmpVec.set(x, y, 0);
    bCorners.push(boardNorm.surface.mesh.localToWorld(tmpVec.clone()));
  }
}
assert.ok(Math.abs(Math.min(...bCorners.map((p) => p.x)) - (-0.432)) < 1e-4);
assert.ok(Math.abs(Math.max(...bCorners.map((p) => p.x)) - 0.432) < 1e-4);
assert.ok(Math.abs(Math.min(...bCorners.map((p) => p.y)) - (-0.2888)) < 1e-4);
assert.ok(Math.abs(Math.max(...bCorners.map((p) => p.y)) - 0.2752) < 1e-4);
console.log(`✓ Bulletin Board: inner cork ${boardNorm.surface.width}m x ${boardNorm.surface.height}m, frame ${boardNorm.dimensions.x.toFixed(2)}m x ${boardNorm.dimensions.y.toFixed(2)}m, surface.mesh verified`);

console.log('--- 6. Negative Control & Robustness Checks ---');
// Missing chair seat mesh
assert.throws(() => {
  const dummy = new THREE.Group();
  normalizeGamingChair(dummy);
}, /missing seat mesh Object_49/, 'throws on missing chair seat mesh');

// Missing desktop screen
assert.throws(() => {
  const dummy = new THREE.Group();
  normalizeGamingDesktop(dummy);
}, /missing screen mesh MY_SCREEN_MY_SCREEN_0/, 'throws on missing desktop screen mesh');

console.log('✓ Negative controls passed: missing meshes immediately caught with explicit error messages');

console.log('\nALL GAMING SETUP TESTS PASSED!');
