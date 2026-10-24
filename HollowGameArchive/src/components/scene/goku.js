import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const GOKU_URL = '/assets/dragonball/son_goku.gltf';
export const SCALE = 0.70;
export const HIP_REST_Y = 1.726; // Rest hips height in model units
export const GOKU_SEAT = { hipY: 0.907, z: -0.01 };

export const POSE = {
  thighDrop: 0.32,
  kneeBend: 0.22,
  ankleFlex: 0.50,
  arm: {
    L: [0.75, 0.20, 0.80],
    R: [0.75, -0.20, -0.80],
  },
  forearm: {
    L: [0.30, 0.10, 1.20],
    R: [0.30, -0.10, -1.20],
  },
  hand: {
    L: [0.10, 0.00, 0.25],
    R: [0.10, 0.00, -0.25],
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
    lUpLeg.rotateX(Math.PI / 2 - POSE.thighDrop);
  }
  if (rUpLeg) {
    rUpLeg.rotation.set(0.00777, 0, 2.94376);
    rUpLeg.rotateX(Math.PI / 2 - POSE.thighDrop);
  }
  if (lLeg) {
    lLeg.rotation.set(-0.0206, 0, 0.0036);
    lLeg.rotateX(-(Math.PI / 2 - POSE.kneeBend));
  }
  if (rLeg) {
    rLeg.rotation.set(-0.003, 0, -0.0036);
    rLeg.rotateX(-(Math.PI / 2 - POSE.kneeBend));
  }
  if (lFoot) {
    lFoot.rotation.set(0.966, 0.015, -0.021);
    lFoot.rotateX(POSE.ankleFlex);
  }
  if (rFoot) {
    rFoot.rotation.set(0.975, -0.012, 0.018);
    rFoot.rotateX(POSE.ankleFlex);
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

  const disposables = [];
  figure.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (o.geometry) disposables.push(o.geometry);
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        disposables.push(m);
        if (m.map) disposables.push(m.map);
        if (m.normalMap) disposables.push(m.normalMap);
        if (m.roughnessMap) disposables.push(m.roughnessMap);
        if (m.metalnessMap) disposables.push(m.metalnessMap);
        if (m.emissiveMap) disposables.push(m.emissiveMap);
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
    if (spine) spine.rotation.x = baseSpineX + Math.sin(t * 1.8) * 0.015;
    if (neck) {
      neck.rotation.y = Math.sin(t * 0.8) * 0.05;
      neck.rotation.z = Math.cos(t * 1.2) * 0.02;
    }
    if (lHand) lHand.rotation.x = baseLHandX + Math.sin(t * 8) * 0.035;
    if (rHand) rHand.rotation.x = baseRHandX + Math.sin(t * 8 + 1.7) * 0.035;
  }

  return {
    figure,
    update,
    POSE,
    poseSeated,
    dispose: () => {
      figure.removeFromParent();
      disposables.forEach((d) => d?.dispose?.());
    },
  };
}
