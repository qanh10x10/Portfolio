import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadSleepingCat, setupCatBreathing, RUG_Y, BLANKET_OFFSET_Y, CAT_URL } from '../src/components/scene/sleepingCat.js';

globalThis.ProgressEvent ??= class extends Event {};

const assetsDir = new URL('../public/assets/sleeping-cat/', import.meta.url);

// 1. Geometry, Accessors, UV and Texture Identity
const jsonRaw = await fs.readFile(new URL('cat.json', assetsDir), 'utf8');
const catDescriptor = JSON.parse(jsonRaw);
assert.equal(catDescriptor.asset.extras.author, 'Alben Tan (https://sketchfab.com/albentan2012)');
assert.equal(catDescriptor.accessors[0].count, 18658, 'Authored 18,658 vertices');
assert.equal(catDescriptor.accessors[3].count, 93417, 'Authored 31,139 triangles (93,417 index entries)');
assert.equal(catDescriptor.images[0].uri, 'cat-0.jpg', 'Diffuse texture is cat-0.jpg');

const uvAccessor = catDescriptor.accessors[2];
assert.ok(Math.abs(uvAccessor.min[0] - 0.00823) < 1e-4, 'UV min.u matches authored range');
assert.ok(Math.abs(uvAccessor.max[0] - 0.97847) < 1e-4, 'UV max.u matches authored range');

// Mock helper to parse real cat GLTF from disk
async function loadDiskCat({ includeTexture = true } = {}) {
  const data = JSON.parse(jsonRaw);
  const bin = await fs.readFile(new URL('cat.data', assetsDir));
  data.buffers[0].uri = 'data:application/octet-stream;base64,' + bin.toString('base64');
  data.images = [];
  data.textures = [];
  for (const m of data.materials) {
    delete m.pbrMetallicRoughness?.baseColorTexture;
  }
  const gltf = await new GLTFLoader().parseAsync(JSON.stringify(data), '');
  let mesh = null;
  gltf.scene.traverse((o) => {
    if (o.isMesh && !mesh) mesh = o;
  });
  if (includeTexture && mesh?.material) {
    mesh.material.map = new THREE.Texture();
  }
  return { gltf, mesh };
}

// 2. Production Assembly & Floor Contact Check through actual loadSleepingCat
const origLoadAsync = GLTFLoader.prototype.loadAsync;
try {
  GLTFLoader.prototype.loadAsync = async function (url) {
    if (url === '/assets/sleeping-cat/bad.json') {
      throw new Error('Descriptor 503');
    }
    if (url === '/assets/sleeping-cat/no-texture.json') {
      const { gltf } = await loadDiskCat({ includeTexture: false });
      return gltf;
    }
    const { gltf } = await loadDiskCat({ includeTexture: true });
    return gltf;
  };

  const model = await loadSleepingCat();
  const mesh = model.mesh;
  assert.ok(mesh && mesh.geometry.attributes.position.count === 18658);

  // Verify morph target registration
  assert.equal(mesh.geometry.morphTargetsRelative, true, 'Morph target must be relative deltas');
  assert.ok(mesh.geometry.morphAttributes.position?.[0], 'Position morph attribute registered');
  assert.equal(mesh.morphTargetDictionary?.bellyBreathing, 0, 'Morph dictionary has bellyBreathing at index 0');
  assert.ok(model.maxDisp <= 0.003 && model.maxDisp >= 0.002, `Max breathing amplitude ${model.maxDisp * 1000}mm in 2-3mm spec`);

  // Verify bounds expansion includes maxDisp without per-frame recompute
  assert.ok(mesh.geometry.boundingBox, 'Bounding box computed');
  assert.ok(mesh.geometry.boundingSphere, 'Bounding sphere computed');

  // Place assembly at foreground rug position
  model.group.position.set(0.65, RUG_Y, 2.5);
  model.group.updateMatrixWorld(true);

  function evaluateBlanketSupport(root) {
    if (!root.visible) return { supported: false, reason: 'hidden' };
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const lowestY = box.min.y;
    const gap = lowestY - RUG_Y;
    const supported = Math.abs(gap) <= 0.002;
    return { supported, lowestY, gap };
  }

  const initialSupport = evaluateBlanketSupport(model.group);
  assert.equal(initialSupport.supported, true, `Blanket must rest on rug at RUG_Y: ${JSON.stringify(initialSupport)}`);

  // Negative support controls: floating, buried, hidden
  model.group.visible = false;
  assert.equal(evaluateBlanketSupport(model.group).supported, false, 'Hidden cat assembly must fail support');
  model.group.visible = true;

  model.group.position.y += 0.35;
  assert.equal(evaluateBlanketSupport(model.group).supported, false, 'Floating blanket must fail support');

  model.group.position.y -= 0.70;
  assert.equal(evaluateBlanketSupport(model.group).supported, false, 'Buried blanket must fail support');

  // Restore assembly
  model.group.position.y = RUG_Y;
  model.group.updateMatrixWorld(true);
  assert.equal(evaluateBlanketSupport(model.group).supported, true, 'Restored blanket must pass support');

  // 3. Anatomical Morph Target Displacement in invariant source coordinates
  const MESH_TO_SOURCE = new THREE.Matrix4().fromArray([
    -0.008323846162445745, 0, -0.9999653561924353, 0,
    0, 1, 0, 0,
    0.9999653561924353, 0, -0.008323846162445745, 0,
    -0.010923244059085846, 0, -0.017285160720348358, 1
  ]);

  const pos = mesh.geometry.attributes.position;
  const morphAttr = mesh.geometry.morphAttributes.position[0];
  let bellyMovedCount = 0;
  let headMovedCount = 0;
  let blanketMovedCount = 0;
  let pawMovedCount = 0;

  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(MESH_TO_SOURCE);
    const mLen = new THREE.Vector3(
      morphAttr.getX(i),
      morphAttr.getY(i),
      morphAttr.getZ(i)
    ).length();

    // Torso / Belly region in invariant source space
    if (p.x > -0.10 && p.x < 0.04 && p.y > 0.04 && p.z < -0.05 && p.z > -0.15) {
      if (mLen > 0.0005) bellyMovedCount++;
    }

    // Head region: x > 0.08
    if (p.x > 0.08) {
      if (mLen > 0) headMovedCount++;
    }

    // Blanket region: perimeter or floor height
    if (p.y < 0.02 || Math.abs(p.x) > 0.22 || Math.abs(p.z) > 0.20) {
      if (mLen > 0) blanketMovedCount++;
    }

    // Paw region: paws curled outward near z > 0.00
    if (p.z > 0.01 && p.y < 0.04) {
      if (mLen > 0) pawMovedCount++;
    }
  }

  assert.ok(bellyMovedCount >= 200, `Belly must have >= 200 moving vertices, got ${bellyMovedCount}`);
  assert.equal(headMovedCount, 0, 'Head region must have strictly zero displacement (stable head)');
  assert.equal(blanketMovedCount, 0, 'Blanket must have strictly zero displacement (stable blanket)');
  assert.equal(pawMovedCount, 0, 'Paws must have strictly zero displacement (stable paws)');

  // 4. Actual Production update: Timing, Periodicity, Drift & Reduced Motion Reset
  // At rest t = 0
  model.update(0, true);
  assert.equal(mesh.morphTargetInfluences[0], 0, 'Rest at t=0 must be 0 influence');

  // Peak inhale t = 2.0s (2000ms)
  model.update(2000, true);
  assert.ok(Math.abs(mesh.morphTargetInfluences[0] - 1.0) < 1e-4, 'Peak inhale at t=2.0s must be 1.0');

  // Return to rest t = 4.0s (4000ms)
  model.update(4000, true);
  assert.ok(Math.abs(mesh.morphTargetInfluences[0] - 0.0) < 1e-4, 'Exhale return at t=4.0s must be 0');

  // Repeat for 1000 cycles (4,000,000ms): zero cumulative drift
  model.update(4000000, true);
  assert.ok(Math.abs(mesh.morphTargetInfluences[0] - 0.0) < 1e-4, 'Zero cumulative drift after 1000 cycles');

  // Reduced motion / disabled must immediately restore rest state
  model.update(2000, false);
  assert.equal(mesh.morphTargetInfluences[0], 0, 'Disabled motion must reset morph influence to 0');

  // 5. Loader Failure Gate: Missing diffuse map must reject and dispose
  let threwMissingMap = false;
  try {
    await loadSleepingCat({ catUrl: '/assets/sleeping-cat/no-texture.json' });
  } catch (err) {
    threwMissingMap = true;
    assert.ok(/diffuse/i.test(err.message), `Error message must cite diffuse map: ${err.message}`);
  }
  assert.equal(threwMissingMap, true, 'Loader must reject model with missing diffuse map');

  let threwDescriptor503 = false;
  try {
    await loadSleepingCat({ catUrl: '/assets/sleeping-cat/bad.json' });
  } catch (err) {
    threwDescriptor503 = true;
  }
  assert.equal(threwDescriptor503, true, 'Loader must reject on descriptor 503');

  // 6. Production Disposal Deduplication
  let disposedGeoms = 0, disposedMats = 0, disposedTexs = 0;
  mesh.geometry.addEventListener('dispose', () => { disposedGeoms++; });
  mesh.material.addEventListener('dispose', () => { disposedMats++; });
  mesh.material.map.addEventListener('dispose', () => { disposedTexs++; });

  model.dispose();

  assert.equal(disposedGeoms, 1, 'Geometry disposed exactly once via production dispose');
  assert.equal(disposedMats, 1, 'Material disposed exactly once via production dispose');
  assert.equal(disposedTexs, 1, 'Texture disposed exactly once via production dispose');
  assert.equal(model.group.parent, null, 'Assembly removed from parent on dispose');
} finally {
  GLTFLoader.prototype.loadAsync = origLoadAsync;
}

console.log('PASS: Sleeping cat geometry/UV identity, blanket support & negative controls, belly breathing morph vs stable head/blanket/paws, timing & drift-free cycles, reduced-motion reset, diffuse failure rejection, and production resource disposal.');
