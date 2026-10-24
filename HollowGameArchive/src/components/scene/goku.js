import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const GOKU_URL = '/assets/dragonball/son_goku.json';
export const SCALE = 0.84;
export const HIP_REST_Y = 1.726; // Rest hips height in model units
export const GOKU_SEAT = { hipY: 1.055, z: -0.01 };

export const POSE = {
  thighDrop: {
    L: 0.31,
    R: 0.29,
  },
  kneeBend: {
    L: 0.28,
    R: 0.28,
  },
  ankleFlex: {
    L: 0.015,
    R: -0.005,
  },
  arm: {
    L: [0.57, 0.25, 0.70],
    R: [0.60, -0.30, -0.69],
  },
  forearm: {
    L: [0.15, 0.05, 1.20],
    R: [0.15, -0.05, -1.45],
  },
  hand: {
    L: [0.08, 0.40, 0.74],
    R: [-0.10, -1.20, 1.05],
  },
  fingerCurl: {
    proximal: 0.25,
    distal: 0.35,
  },
  spineLean: 0.15,
  neckTilt: -0.10,
};

export function poseSeated(figure) {
  const n = (name) => figure.getObjectByName(name);

  // Legs: thighs horizontal over seat cushion, knees down, ankles flexed for grounded soles
  const lUpLeg = n('mixamorigLeftUpLeg_056');
  const rUpLeg = n('mixamorigRightUpLeg_060');
  const lLeg = n('mixamorigLeftLeg_00');
  const rLeg = n('mixamorigRightLeg_061');
  const lFoot = n('mixamorigLeftFoot_057');
  const rFoot = n('mixamorigRightFoot_062');

  if (lUpLeg) {
    lUpLeg.rotation.set(-0.00968, 0, -2.94376);
    lUpLeg.rotateX(Math.PI / 2 - POSE.thighDrop.L);
  }
  if (rUpLeg) {
    rUpLeg.rotation.set(0.00777, 0, 2.94376);
    rUpLeg.rotateX(Math.PI / 2 - POSE.thighDrop.R);
  }
  if (lLeg) {
    lLeg.rotation.set(-0.0206, 0, 0.0036);
    lLeg.rotateX(-(Math.PI / 2 - POSE.kneeBend.L));
  }
  if (rLeg) {
    rLeg.rotation.set(-0.003, 0, -0.0036);
    rLeg.rotateX(-(Math.PI / 2 - POSE.kneeBend.R));
  }
  if (lFoot) {
    lFoot.rotation.set(0.966, 0.015, -0.021);
    lFoot.rotateX(POSE.ankleFlex.L);
  }
  if (rFoot) {
    rFoot.rotation.set(0.975, -0.012, 0.018);
    rFoot.rotateX(POSE.ankleFlex.R);
  }

  // Arms: forward over desk and hovering above keyboard
  const lArm = n('mixamorigLeftArm_09');
  const rArm = n('mixamorigRightArm_033');
  const lForeArm = n('mixamorigLeftForeArm_010');
  const rForeArm = n('mixamorigRightForeArm_034');
  const lHand = n('mixamorigLeftHand_011');
  const rHand = n('mixamorigRightHand_035');

  if (lArm) lArm.rotation.set(...POSE.arm.L);
  if (rArm) rArm.rotation.set(...POSE.arm.R);
  if (lForeArm) lForeArm.rotation.set(...POSE.forearm.L);
  if (rForeArm) rForeArm.rotation.set(...POSE.forearm.R);
  if (lHand) lHand.rotation.set(...POSE.hand.L);
  if (rHand) rHand.rotation.set(...POSE.hand.R);

  // Relaxed typing fingers: subtle curl of proximal and distal joints
  const fingerBones = [
    ['mixamorigLeftHandIndex1_016', 'mixamorigLeftHandIndex2_017', 'mixamorigLeftHandIndex3_018'],
    ['mixamorigLeftHandMiddle1_020', 'mixamorigLeftHandMiddle2_021', 'mixamorigLeftHandMiddle3_022'],
    ['mixamorigLeftHandRing1_024', 'mixamorigLeftHandRing2_025', 'mixamorigLeftHandRing3_026'],
    ['mixamorigLeftHandPinky1_028', 'mixamorigLeftHandPinky2_029', 'mixamorigLeftHandPinky3_030'],
    ['mixamorigLeftHandThumb1_012', 'mixamorigLeftHandThumb2_013', 'mixamorigLeftHandThumb3_014'],
    ['mixamorigRightHandIndex1_040', 'mixamorigRightHandIndex2_041', 'mixamorigRightHandIndex3_042'],
    ['mixamorigRightHandMiddle1_044', 'mixamorigRightHandMiddle2_045', 'mixamorigRightHandMiddle3_046'],
    ['mixamorigRightHandRing1_048', 'mixamorigRightHandRing2_049', 'mixamorigRightHandRing3_050'],
    ['mixamorigRightHandPinky1_052', 'mixamorigRightHandPinky2_053', 'mixamorigRightHandPinky3_054'],
    ['mixamorigRightHandThumb1_036', 'mixamorigRightHandThumb2_037', 'mixamorigRightHandThumb3_038'],
  ];

  const curlProx = POSE.fingerCurl?.proximal ?? 0.25;
  const curlDist = POSE.fingerCurl?.distal ?? 0.35;
  for (const [prox, inter, dist] of fingerBones) {
    const b1 = n(prox);
    const b2 = n(inter);
    const b3 = n(dist);
    if (b1) b1.rotation.x = curlProx;
    if (b2) b2.rotation.x = curlDist;
    if (b3) b3.rotation.x = curlDist;
  }

  // Spine & Head: slight forward lean towards desk, head glancing at monitor
  const spine = n('mixamorigSpine_02');
  const neck = n('mixamorigNeck_05');
  if (spine) spine.rotation.x = POSE.spineLean;
  if (neck) neck.rotation.x = POSE.neckTilt;

  figure.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton) {
      o.skeleton.update();
    }
  });
}

export function seat(figure, { hipY = GOKU_SEAT.hipY, z = GOKU_SEAT.z } = {}) {
  figure.scale.setScalar(SCALE);
  figure.position.set(0, hipY - HIP_REST_Y * SCALE, z);
}

export async function loadGoku({ renderer, url = GOKU_URL } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const figure = gltf.scene;
  figure.name = 'GokuFigure';

  poseSeated(figure);

  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const skeletons = new Set();

  figure.traverse((o) => {
    if (o.isSkinnedMesh && o.skeleton) {
      skeletons.add(o.skeleton);
    }
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (o.geometry) geometries.add(o.geometry);
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        materials.add(m);
        for (const prop of Object.values(m)) {
          if (prop && prop.isTexture) textures.add(prop);
        }
      });
    }
  });

  const spine = figure.getObjectByName('mixamorigSpine_02');
  const neck = figure.getObjectByName('mixamorigNeck_05');
  const lHand = figure.getObjectByName('mixamorigLeftHand_011');
  const rHand = figure.getObjectByName('mixamorigRightHand_035');
  const baseSpineX = POSE.spineLean;
  const baseLHandX = POSE.hand.L[0];
  const baseRHandX = POSE.hand.R[0];

  function update(ms) {
    const t = ms * 0.001;
    if (spine) spine.rotation.x = baseSpineX + Math.sin(t * 1.8) * 0.006;
    if (neck) {
      neck.rotation.y = Math.sin(t * 0.8) * 0.05;
      neck.rotation.z = Math.cos(t * 1.2) * 0.02;
    }
    if (lHand) lHand.rotation.x = baseLHandX + Math.sin(t * 8) * 0.005;
    if (rHand) rHand.rotation.x = baseRHandX + Math.sin(t * 8 + 1.7) * 0.005;
  }

  return {
    figure,
    update,
    POSE,
    poseSeated,
    dispose: () => {
      figure.removeFromParent();
      geometries.forEach((g) => g?.dispose?.());
      materials.forEach((m) => m?.dispose?.());
      textures.forEach((t) => t?.dispose?.());
      skeletons.forEach((s) => s?.dispose?.());
    },
  };
}
