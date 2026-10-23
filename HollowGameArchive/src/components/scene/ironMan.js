import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Static Sketchfab "Iron Man" (CC-BY-NC, Grant Riley) split into rigid parts on a joint hierarchy (no skinning).
// Model units are mm of a 2.3 m standing figure, +z front, y up. See assets/ironman/pivots.json for the pivots.
export const IRONMAN_URL = '/assets/ironman/ironman.json';
export const SCALE = 0.001;
const HIP_Y = 1190; // Pelvis pivot height in model units

// Seated pose (radians, Euler XYZ: z tilt first, then x swing). Thigh slopes down so the long shins reach the floor.
export const POSE = {
  thighDrop: 0.3,
  kneeExtra: -0.2, // knee opens a little so the shins clear the seat edge and the soles reach the floor
  torsoLean: 0.3,
  // [shoulderX, shoulderZ, elbowX, elbowZ, wristX, wristZ] per arm, fitted so the gloves hover just above the keyboard keys
  arm: { L: [-0.57, 0.74, -1.19, 0.06, 0.94, 0.3], R: [-0.57, 0.74, -1.19, 0.06, 0.94, 0.3] }, // mirrored: the model is x-symmetric
};

export function poseSeated(figure) {
  const n = (name) => figure.getObjectByName(name);
  for (const s of ['L', 'R']) {
    const g = s === 'L' ? 1 : -1; // +z rotation turns a -x limb inward
    const [sx, sz, ex, ez, wx, wz] = POSE.arm[s];
    n(`Hip${s}`).rotation.x = -(Math.PI / 2 - POSE.thighDrop);
    n(`Knee${s}`).rotation.x = Math.PI / 2 - POSE.thighDrop + POSE.kneeExtra;
    n(`Shoulder${s}`).rotation.set(sx, 0, g * sz);
    n(`Elbow${s}`).rotation.set(ex, 0, g * ez);
    n(`Wrist${s}`).rotation.set(wx, 0, g * wz);
  }
  n('Torso').rotation.x = POSE.torsoLean;
}

// Places the figure so the pelvis pivot sits `hipY` above the floor, `z` along the chair's forward axis.
export function seat(figure, { hipY, z = 0 }) {
  figure.scale.setScalar(SCALE);
  figure.position.set(0, hipY - HIP_Y * SCALE, z - 0.03);
}

export async function loadIronMan({ renderer, url = IRONMAN_URL } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const figure = gltf.scene.getObjectByName('IronMan');
  poseSeated(figure);
  const disposables = [];
  let envTex = null;
  if (renderer) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // only this material gets reflections; the room stays unchanged
    pmrem.dispose();
    disposables.push(envTex);
  }
  figure.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (envTex) { o.material.envMap = envTex; o.material.envMapIntensity = 0.75; }
    disposables.push(o.geometry, o.material, o.material.map, o.material.emissiveMap, o.material.metalnessMap);
  });

  const neck = figure.getObjectByName('Neck');
  const torso = figure.getObjectByName('Torso');
  const wrists = ['WristL', 'WristR'].map((k) => figure.getObjectByName(k));
  const wristBase = wrists.map((w) => w.rotation.x);
  const base = { neckX: -POSE.torsoLean * 0.85 }; // head stays level while the torso leans to the keyboard
  // Idle: slow breathing, head glancing at the monitor, tiny wrist rock while "typing".
  function update(ms) {
    const t = ms * 0.001;
    torso.position.y = Math.sin(t * 1.8) * 0.004 / SCALE * 0.5;
    neck.rotation.x = base.neckX;
    neck.rotation.y = Math.sin(t * 0.8) * 0.06;
    neck.rotation.z = Math.cos(t * 1.2) * 0.02;
    wrists.forEach((w, i) => { w.rotation.x = wristBase[i] + Math.sin(t * 8 + i * 1.7) * 0.04; });
  }
  return { figure, update, dispose: () => disposables.forEach((d) => d?.dispose?.()) };
}
