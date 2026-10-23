import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const CAT_URL = '/assets/sleeping-cat/cat.json';
export const BEANBAG_URL = '/assets/sleeping-cat/beanbag.json';
export const RUG_Y = 0.0155;
const POSE = {
  "Bone001_02": [
    -0.026404034,
    -0.00290808,
    0.084265921,
    0.996089162
  ],
  "Bone002_03": [
    0.00114183,
    -0.000139823,
    0.146477877,
    0.989213279
  ],
  "Bone003_04": [
    -0.006533488,
    -0.006716615,
    0.299862129,
    0.953936535
  ],
  "Bone004_05": [
    -0.007109028,
    0.015689173,
    -0.459663782,
    0.887925968
  ],
  "Bone015_06": [
    0.047245312,
    0.096633957,
    0.802046293,
    -0.587495807
  ],
  "Bone016_07": [
    -0.166121077,
    0.074637682,
    0.254042223,
    0.949892385
  ],
  "Bone017_08": [
    -0.009061762,
    -0.124686618,
    -0.030216612,
    0.991694535
  ],
  "Bone019_010": [
    0.618102665,
    0.486786295,
    -0.556291786,
    0.267446297
  ],
  "Bone020_011": [
    0.161020306,
    0.589675456,
    -0.299603067,
    -0.732525298
  ],
  "Bone021_012": [
    0.0177504,
    -0.7834634,
    0.018352037,
    0.620913237
  ],
  "Bone005_014": [
    -0.013183882,
    -0.173608118,
    0.94907705,
    -0.262562513
  ],
  "Bone006_015": [
    -0.152453972,
    0.084091674,
    0.155294676,
    0.972404155
  ],
  "Bone007_016": [
    -0.12824757,
    0.117754745,
    0.079032837,
    0.981549946
  ],
  "Bone008_017": [
    -0.121163385,
    0.125032317,
    -0.021665579,
    0.984488243
  ],
  "Bone009_018": [
    -0.137569403,
    0.106716103,
    -0.117243144,
    0.977722021
  ],
  "Bone010_019": [
    -0.15385997,
    0.081490831,
    -0.052498746,
    0.98332611
  ],
  "Bone011_020": [
    -0.353793443,
    0.115881853,
    -0.068611889,
    0.925577639
  ],
  "Bone012_021": [
    -0.007602676,
    0.084738799,
    -0.934582262,
    0.345423673
  ],
  "Bone013_022": [
    0.033563484,
    -0.044340437,
    0.65484696,
    0.753712692
  ],
  "Bone023_024": [
    -0.141993708,
    -0.728095312,
    -0.003794569,
    -0.670597124
  ],
  "Bone024_00": [
    0.971185338,
    -0.021743525,
    -0.018072548,
    0.23664258
  ],
  "Bone025_025": [
    0.061492498,
    -0.484888231,
    0.871441328,
    -0.041136499
  ]
};

export function setupCatSkinning(cat) {
  const body = cat.getObjectByName('Object_9');
  if (!body?.isSkinnedMesh || body.skeleton.bones.length !== 34) throw new Error('Missing required cat rig');
  // Source body coordinates alone are -100x the shared skin space; retain the authored inverse binds.
  body.geometry.scale(-.01, -.01, -.01);
  const index = body.geometry.index;
  for (let i = 0; i < index.count; i += 3) {
    const first = index.getX(i);
    index.setX(i, index.getX(i + 2)); index.setX(i + 2, first);
  }
  index.needsUpdate = true;
  // ponytail: fixed sleep pose; omit detached eyeballs/whiskers, add eyelid rig only for blinking.
  cat.getObjectByName('Object_7').visible = false;
  cat.getObjectByName('Object_44').visible = false;
}

export function poseSleepingCat(cat) {
  for (const [name, rotation] of Object.entries(POSE)) {
    const bone = cat?.getObjectByName(name);
    if (!bone?.isBone) throw new Error(`Missing required cat joint ${name}`);
    bone.quaternion.fromArray(rotation);
  }
  cat.updateMatrixWorld(true);
}

export function placeOnBeanbag(cat, beanbag) {
  if (!beanbag) throw new Error('Beanbag model required');
  beanbag.scale.setScalar(.9);
  beanbag.position.set(-1.179 * .9, RUG_Y - .0018 * .9, -.249 * .9);
  cat.scale.setScalar(.00054);
  cat.position.set(-0.095742586, 0.424916992, 0.09365013);
  cat.quaternion.set(-0.492053117, 0.043231333, -0.304370549, 0.814477348);
  cat.updateMatrixWorld(true); beanbag.updateMatrixWorld(true);
  cat.traverse(o => { if (o.isSkinnedMesh) { o.skeleton.update(); o.computeBoundingSphere(); } });
}

// Measure deformed skin, not bone positions; low surface percentile tolerates individual fur tips.
export function sampleContact(cat, beanbag) {
  if (!beanbag) throw new Error('Beanbag model required');
  const mesh = cat?.getObjectByName('Object_9');
  if (!mesh?.isSkinnedMesh) throw new Error('Missing required cat rig');
  for (let node = beanbag; node; node = node.parent) if (!node.visible) return { _summary: { totalPoints: 7, allSupported: false } };
  cat.updateWorldMatrix(true, true); beanbag.updateWorldMatrix(true, true); mesh.skeleton.update();
  const groups = {
    head: ['Bone004_05'], chest: ['Bone002_03', 'Bone003_04'], pelvis: ['Bone_01', 'Bone001_02'],
    frontL: ['Bone017_08', 'Bone018_09'], frontR: ['Bone021_012', 'Bone022_013'],
    rearL: ['Bone013_022', 'Bone014_023'], rearR: ['Bone025_025', 'Bone026_026'],
  };
  const ray = new THREE.Raycaster(), point = new THREE.Vector3(), down = new THREE.Vector3(0, -1, 0);
  const originY = new THREE.Box3().setFromObject(beanbag).max.y + 1;
  const result = {};
  for (const [name, bones] of Object.entries(groups)) {
    const samples = [];
    for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
      let weight = 0;
      for (let k = 0; k < 4; k++) {
        const joint = mesh.geometry.attributes.skinIndex.getComponent(i, k);
        if (bones.includes(mesh.skeleton.bones[joint].name)) weight += mesh.geometry.attributes.skinWeight.getComponent(i, k);
      }
      if (weight <= .5) continue;
      mesh.getVertexPosition(i, point).applyMatrix4(mesh.matrixWorld);
      ray.set(new THREE.Vector3(point.x, originY, point.z), down);
      const hit = ray.intersectObject(beanbag, true)[0];
      if (hit) samples.push({ vertexIndex: i, gap: point.y - hit.point.y });
    }
    samples.sort((a, b) => a.gap - b.gap);
    const low = samples.slice(0, Math.max(1, Math.ceil(samples.length * .05)));
    const gap = low.length ? low.reduce((sum, p) => sum + p.gap, 0) / low.length : Infinity;
    const minGap = samples[0]?.gap ?? Infinity;
    result[name] = { vertexCount: samples.length, vertexIndex: samples[0]?.vertexIndex, minGap, gap, supported: minGap >= -.04 && gap <= .03 && gap >= -.04 };
  }
  result._summary = { totalPoints: 7, allSupported: Object.values(result).every(p => p.supported) };
  return result;
}

function disposeScene(group) {
  const resources = new Set();
  group.traverse(o => {
    if (o.geometry) resources.add(o.geometry);
    if (o.skeleton) resources.add(o.skeleton);
    for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m) {
      resources.add(m);
      for (const value of Object.values(m)) if (value?.isTexture) resources.add(value);
    }
  });
  resources.forEach(r => r.dispose());
}

export async function loadSleepingCat({ catUrl = CAT_URL, beanbagUrl = BEANBAG_URL } = {}) {
  const loader = new GLTFLoader();
  const results = await Promise.allSettled([loader.loadAsync(catUrl), loader.loadAsync(beanbagUrl)]);
  const group = new THREE.Group(); group.name = 'SleepingCat_Assembly';
  for (const r of results) if (r.status === 'fulfilled') group.add(r.value.scene);
  try {
    const failure = results.find(r => r.status === 'rejected');
    if (failure) throw failure.reason;
    const cat = results[0].value.scene, beanbag = results[1].value.scene;
    cat.name = 'SleepingCat_Fripouille'; beanbag.name = 'SleepingCat_BeanBag';
    setupCatSkinning(cat); poseSleepingCat(cat); placeOnBeanbag(cat, beanbag);
    group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return { group, cat, beanbag, dispose: () => disposeScene(group) };
  } catch (error) { disposeScene(group); throw error; }
}
