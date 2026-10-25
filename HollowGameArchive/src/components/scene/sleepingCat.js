import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const CAT_URL = '/assets/sleeping-cat/cat.json';
export const RUG_Y = 0.0155;
export const BLANKET_OFFSET_Y = 0.04544356; // Offsets source minY (-0.04544) so blanket base rests flush at y=0

// Invariant transform from mesh coordinates to untouched source-model space
// Source scene bounds: min [-0.279, -0.0454, -0.250], max [0.258, 0.0874, 0.249]
const MESH_TO_SOURCE = new THREE.Matrix4().fromArray([
  -0.008323846162445745, 0, -0.9999653561924353, 0,
  0, 1, 0, 0,
  0.9999653561924353, 0, -0.008323846162445745, 0,
  -0.010923244059085846, 0, -0.017285160720348358, 1
]);

export function setupCatBreathing(mesh) {
  const pos = mesh.geometry.attributes.position;
  const norm = mesh.geometry.attributes.normal;
  const p = new THREE.Vector3();
  const rawMasks = new Float32Array(pos.count);
  let maxRawMask = 0;

  // Compute spatial mask in untouched source space (invariant to parent placement / offsets)
  // Anatomical belly center: x=-0.026, y=0.080, z=-0.100.
  // Head is at x > 0.08, rear at x < -0.14, blanket at y < 0.02, paws at z > -0.02.
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(MESH_TO_SOURCE);
    if (p.y > 0.03 && p.x < 0.06 && p.x > -0.12 && p.z < -0.04 && p.z > -0.16) {
      const dx = (p.x - (-0.026)) / 0.08;
      const dy = (p.y - 0.080) / 0.04;
      const dz = (p.z - (-0.100)) / 0.06;
      const r2 = dx * dx + dy * dy + dz * dz;
      if (r2 < 1.0) {
        const m = Math.cos(Math.sqrt(r2) * Math.PI * 0.5);
        rawMasks[i] = m * m;
        if (rawMasks[i] > maxRawMask) maxRawMask = rawMasks[i];
      }
    }
  }

  const morphPositions = new Float32Array(pos.count * 3);
  const mask = new Float32Array(pos.count);
  const maxDisp = 0.0025; // 2.5 mm world amplitude (<= 2-3mm spec)

  for (let i = 0; i < pos.count; i++) {
    if (maxRawMask > 0 && rawMasks[i] > 0) {
      const normMask = rawMasks[i] / maxRawMask;
      mask[i] = normMask;
      // Normal is in local mesh coordinates; magnitude equals normMask * maxDisp
      morphPositions[i * 3 + 0] = norm.getX(i) * normMask * maxDisp;
      morphPositions[i * 3 + 1] = norm.getY(i) * normMask * maxDisp;
      morphPositions[i * 3 + 2] = norm.getZ(i) * normMask * maxDisp;
    }
  }

  const attr = new THREE.BufferAttribute(morphPositions, 3);
  attr.name = 'bellyBreathing';
  mesh.geometry.morphAttributes.position = [attr];
  mesh.geometry.morphTargetsRelative = true;
  mesh.morphTargetInfluences = [0];
  mesh.morphTargetDictionary = { bellyBreathing: 0 };
  mesh.updateMorphTargets();

  // Ensure morph target bounds include max extension before rendering (compute once after setup)
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
  const pMorph = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    if (mask[i] > 0) {
      pMorph.fromBufferAttribute(pos, i);
      pMorph.x += morphPositions[i * 3 + 0];
      pMorph.y += morphPositions[i * 3 + 1];
      pMorph.z += morphPositions[i * 3 + 2];
      mesh.geometry.boundingBox.expandByPoint(pMorph);
      mesh.geometry.boundingSphere.expandByPoint(pMorph);
    }
  }

  return { mask, maxDisp };
}

function disposeScene(group) {
  const resources = new Set();
  group.traverse((o) => {
    if (o.geometry) resources.add(o.geometry);
    if (o.skeleton) resources.add(o.skeleton);
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m) {
        resources.add(m);
        for (const value of Object.values(m)) {
          if (value?.isTexture) resources.add(value);
        }
      }
    }
  });
  resources.forEach((r) => r.dispose());
}

export async function loadSleepingCat({ catUrl = CAT_URL } = {}) {
  const loader = new GLTFLoader();
  const group = new THREE.Group();
  group.name = 'SleepingCat_Assembly';

  try {
    const gltf = await loader.loadAsync(catUrl);
    const cat = gltf.scene;
    cat.name = 'SleepingCat_Source';
    cat.position.set(0, BLANKET_OFFSET_Y, 0);
    // Attach scene immediately so any subsequent error cleans up loaded resources
    group.add(cat);

    let mesh = null;
    cat.traverse((o) => {
      if (o.isMesh && !mesh) mesh = o;
    });
    if (!mesh) throw new Error('Missing cat mesh');

    // Reject missing diffuse map: GLTFLoader can resolve scene after image error,
    // so verify map is attached and not in an error/unloaded state
    const mat = mesh.material;
    if (!mat?.map) {
      throw new Error('Missing required cat diffuse map');
    }
    if (mat.map.image && (mat.map.image.naturalWidth === 0 || mat.map.image.error)) {
      throw new Error('Failed to load cat diffuse texture');
    }

    const { mask, maxDisp } = setupCatBreathing(mesh);

    group.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    // Slow breathing cycle: period = 4.0s (within 3-5sec spec)
    function update(ms, enabled = true) {
      if (!enabled) {
        mesh.morphTargetInfluences[0] = 0;
        return;
      }
      const t = ms * 0.001;
      const phase = (t / 4.0) * Math.PI * 2;
      mesh.morphTargetInfluences[0] = (1 - Math.cos(phase)) * 0.5;
    }

    return {
      group,
      cat,
      mesh,
      update,
      mask,
      maxDisp,
      dispose: () => {
        group.removeFromParent();
        disposeScene(group);
      },
    };
  } catch (error) {
    group.removeFromParent();
    disposeScene(group);
    throw error;
  }
}
