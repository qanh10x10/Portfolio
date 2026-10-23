import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildRobotChair, LAYOUT } from '../src/components/scene/robotChair.js';

console.log('--- Testing Scene-Craft v3: Robot + Office Chair Module (CP2 Refined) ---');

// 1. Verify exports
assert.ok(typeof buildRobotChair === 'function', 'buildRobotChair must be an exported function');
assert.ok(LAYOUT, 'LAYOUT must be exported');
assert.deepEqual(LAYOUT.position, [0.5, 0, -0.95], 'LAYOUT.position must match contract');
assert.deepEqual(LAYOUT.rotation, [0, 0, 0], 'LAYOUT.rotation must match contract');
assert.deepEqual(LAYOUT.scale, [1, 1, 1], 'LAYOUT.scale must match contract');
console.log('✓ Verified module exports and LAYOUT declaration');

// 2. Setup mock context with tracking
const trackedItems = [];
const track = (item) => {
  trackedItems.push(item);
  return item;
};

const stubMakeCanvasTex = (paint, w, h) => {
  const tex = new THREE.Texture();
  return track(tex);
};

const mats = {
  chair: new THREE.MeshStandardMaterial({ color: 0x272d3e }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x323a4e }),
  robotBody: new THREE.MeshStandardMaterial({ color: 0xe2e6ef }),
  robotJoint: new THREE.MeshStandardMaterial({ color: 0x363e52 }),
  warmGold: new THREE.MeshStandardMaterial({ color: 0xffb74d }),
};

const result = buildRobotChair({
  THREE,
  track,
  makeCanvasTex: stubMakeCanvasTex,
  mats,
  RoundedBoxGeometry,
});

// 3. Verify all required handles in returned object
const {
  root,
  chair,
  robot,
  torso,
  head,
  crtFace,
  hands,
  joints,
  setEyeOpenness,
  update,
  LAYOUT: returnedLayout,
  contactShadow,
} = result;

assert.ok(root && root.isGroup, 'root must be a THREE.Group');
assert.ok(chair && chair.isGroup, 'chair must be a THREE.Group');
assert.ok(robot && robot.isGroup, 'robot must be a THREE.Group');
assert.ok(torso && torso.isGroup, 'torso must be a THREE.Group');
assert.ok(head && head.isGroup, 'head must be a THREE.Group');
assert.ok(crtFace && crtFace.isMesh, 'crtFace must be a THREE.Mesh');
assert.ok(hands && hands.left && hands.right, 'hands must have left and right groups');
assert.ok(joints, 'joints dictionary must exist');
assert.ok(typeof setEyeOpenness === 'function', 'setEyeOpenness must be a function');
assert.ok(typeof update === 'function', 'update must be a function');
assert.equal(returnedLayout, LAYOUT, 'Returned LAYOUT must match export');
assert.ok(contactShadow && contactShadow.isMesh, 'contactShadow must be returned and be a THREE.Mesh');
console.log('✓ All required return handles present (including contactShadow)');

// 4. Verify Scene Hierarchy
assert.equal(chair.parent, root, 'chair must be a child of root');
assert.equal(robot.parent, root, 'robot must be a child of root');
assert.equal(torso.parent, robot, 'torso must be a child of robot');
assert.equal(head.parent, torso, 'head must be a child of torso');
assert.equal(crtFace.parent, head, 'crtFace must be a direct child of head');
assert.equal(contactShadow.parent, chair, 'contactShadow must be a child of chair');
assert.equal(hands.left.parent, joints.wrists.left, 'left hand must be a child of left wrist joint');
assert.equal(hands.right.parent, joints.wrists.right, 'right hand must be a child of right wrist joint');
console.log('✓ Scene graph hierarchy verified (including hand re-parenting to wrist joints)');

// 5. Update World Matrices
root.updateMatrixWorld(true);

// 6. Check for NaN in Bounding Boxes of all descendant meshes
let meshCount = 0;
let triangleCount = 0;
const allMeshes = [];

root.traverse((obj) => {
  if (obj.isMesh) {
    meshCount++;
    allMeshes.push(obj);
    const geom = obj.geometry;
    if (geom) {
      if (geom.index) {
        triangleCount += (geom.index.count / 3) * (obj.isInstancedMesh ? obj.count : 1);
      } else if (geom.attributes.position) {
        triangleCount += (geom.attributes.position.count / 3) * (obj.isInstancedMesh ? obj.count : 1);
      }
    }

    const box = new THREE.Box3().setFromObject(obj);
    assert.ok(!Number.isNaN(box.min.x), `NaN in box.min.x for ${obj.name || 'unnamed mesh'}`);
    assert.ok(!Number.isNaN(box.min.y), `NaN in box.min.y for ${obj.name || 'unnamed mesh'}`);
    assert.ok(!Number.isNaN(box.min.z), `NaN in box.min.z for ${obj.name || 'unnamed mesh'}`);
    assert.ok(!Number.isNaN(box.max.x), `NaN in box.max.x for ${obj.name || 'unnamed mesh'}`);
    assert.ok(!Number.isNaN(box.max.y), `NaN in box.max.y for ${obj.name || 'unnamed mesh'}`);
    assert.ok(!Number.isNaN(box.max.z), `NaN in box.max.z for ${obj.name || 'unnamed mesh'}`);
  }
});

console.log(`✓ Mesh count: ${meshCount} (budget <= 250)`);
console.log(`✓ Triangle count: ${Math.round(triangleCount)} (budget <= 80000)`);
assert.ok(meshCount <= 250, `Mesh count ${meshCount} exceeds budget of 250`);
assert.ok(triangleCount <= 80000, `Triangle count ${triangleCount} exceeds budget of 80000`);

// 7. Verify Key Heights and Dimensions
// Seat top height
const seatMesh = chair.getObjectByName('ChairSeatCushion');
assert.ok(seatMesh, 'ChairSeatCushion mesh must exist');
const seatBox = new THREE.Box3().setFromObject(seatMesh);
const seatTop = seatBox.max.y;
console.log(`Seat top y: ${seatTop.toFixed(4)} (spec: 0.68 +- 0.02)`);
assert.ok(Math.abs(seatTop - 0.68) <= 0.02, `Seat top ${seatTop} is outside 0.68 +- 0.02`);

// Both feet bottoms flat on floor y=0 +- 0.02
const leftFoot = robot.getObjectByName('Foot_left');
const rightFoot = robot.getObjectByName('Foot_right');
assert.ok(leftFoot, 'Foot_left group must exist');
assert.ok(rightFoot, 'Foot_right group must exist');
const leftFootBox = new THREE.Box3().setFromObject(leftFoot);
const rightFootBox = new THREE.Box3().setFromObject(rightFoot);
console.log(`Left foot bottom y: ${leftFootBox.min.y.toFixed(4)} (spec: 0.00 +- 0.02)`);
console.log(`Right foot bottom y: ${rightFootBox.min.y.toFixed(4)} (spec: 0.00 +- 0.02)`);
assert.ok(Math.abs(leftFootBox.min.y - 0.0) <= 0.02, `Left foot bottom ${leftFootBox.min.y} outside 0.0 +- 0.02`);
assert.ok(Math.abs(rightFootBox.min.y - 0.0) <= 0.02, `Right foot bottom ${rightFootBox.min.y} outside 0.0 +- 0.02`);

// Knees height y < 0.88
const leftKnee = robot.getObjectByName('Knee_left');
const rightKnee = robot.getObjectByName('Knee_right');
assert.ok(leftKnee, 'Knee_left must exist');
assert.ok(rightKnee, 'Knee_right must exist');
const leftKneeBox = new THREE.Box3().setFromObject(leftKnee);
const rightKneeBox = new THREE.Box3().setFromObject(rightKnee);
console.log(`Left knee top y: ${leftKneeBox.max.y.toFixed(4)} (spec: < 0.88)`);
console.log(`Right knee top y: ${rightKneeBox.max.y.toFixed(4)} (spec: < 0.88)`);
assert.ok(leftKneeBox.max.y < 0.88, `Left knee top ${leftKneeBox.max.y} must be < 0.88`);
assert.ok(rightKneeBox.max.y < 0.88, `Right knee top ${rightKneeBox.max.y} must be < 0.88`);

// Hand palm world positions within 0.03 of spec (+-0.17, 1.17, +0.62)
const leftPalmMesh = torso.getObjectByName('Palm_left');
const rightPalmMesh = torso.getObjectByName('Palm_right');
assert.ok(leftPalmMesh, 'Palm_left mesh must exist');
assert.ok(rightPalmMesh, 'Palm_right mesh must exist');

const leftPalmPos = new THREE.Vector3();
leftPalmMesh.getWorldPosition(leftPalmPos);
const rightPalmPos = new THREE.Vector3();
rightPalmMesh.getWorldPosition(rightPalmPos);

const specLeftPalm = new THREE.Vector3(-0.17, 1.17, 0.62);
const specRightPalm = new THREE.Vector3(0.17, 1.17, 0.62);

const leftDist = leftPalmPos.distanceTo(specLeftPalm);
const rightDist = rightPalmPos.distanceTo(specRightPalm);
console.log(`Left palm world pos: (${leftPalmPos.x.toFixed(3)}, ${leftPalmPos.y.toFixed(3)}, ${leftPalmPos.z.toFixed(3)}), diff: ${leftDist.toFixed(4)} (spec <= 0.03)`);
console.log(`Right palm world pos: (${rightPalmPos.x.toFixed(3)}, ${rightPalmPos.y.toFixed(3)}, ${rightPalmPos.z.toFixed(3)}), diff: ${rightDist.toFixed(4)} (spec <= 0.03)`);
assert.ok(leftDist <= 0.03, `Left palm position distance ${leftDist} > 0.03`);
assert.ok(rightDist <= 0.03, `Right palm position distance ${rightDist} > 0.03`);

// Head top <= 2.2
const headBox = new THREE.Box3().setFromObject(head);
console.log(`Head top y: ${headBox.max.y.toFixed(4)} (spec <= 2.2)`);
assert.ok(headBox.max.y <= 2.2, `Head top ${headBox.max.y} exceeds 2.2`);

// CRT Face normal is (0, 0, 1) and size 0.56 x 0.44
assert.equal(crtFace.geometry.parameters.width, 0.56, 'CRT face width must be 0.56');
assert.equal(crtFace.geometry.parameters.height, 0.44, 'CRT face height must be 0.44');

const crtNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(crtFace.getWorldQuaternion(new THREE.Quaternion()));
console.log(`CRT face world normal: (${crtNormal.x.toFixed(4)}, ${crtNormal.y.toFixed(4)}, ${crtNormal.z.toFixed(4)}) (spec: 0, 0, 1)`);
assert.ok(Math.abs(crtNormal.x) < 1e-4, 'CRT normal x must be 0');
assert.ok(Math.abs(crtNormal.y) < 1e-4, 'CRT normal y must be 0');
assert.ok(Math.abs(crtNormal.z - 1.0) < 1e-4, 'CRT normal z must be 1');

// Contact shadow spec: transparent, opacity <= 0.5, depthWrite false, y = baseY + 0.004 (or 0.004 without rug)
assert.ok(
  Math.abs(contactShadow.position.y - (0.0155 + 0.004)) < 1e-4 || contactShadow.position.y === 0.004,
  `contactShadow y must be grounded (got ${contactShadow.position.y})`
);
assert.ok(contactShadow.material.transparent === true, 'contactShadow material must be transparent');
assert.ok(contactShadow.material.depthWrite === false, 'contactShadow material depthWrite must be false');
assert.ok(contactShadow.material.opacity <= 0.5, `contactShadow opacity must be <= 0.5 (got ${contactShadow.material.opacity})`);
console.log('✓ Contact shadow spec verified');

// CP3 Fix 2 Verification: Eliminate neck-to-yoke air gap
const neckMesh = torso.getObjectByName('NeckMesh') || torso.getObjectByName('Neck');
const yokeMesh = torso.getObjectByName('ShoulderYoke');
assert.ok(neckMesh, 'Neck mesh must exist');
assert.ok(yokeMesh, 'ShoulderYoke mesh must exist');
const neckBox = new THREE.Box3().setFromObject(neckMesh);
const yokeBox = new THREE.Box3().setFromObject(yokeMesh);
console.log(`Neck bottom y: ${neckBox.min.y.toFixed(4)}, Yoke top y: ${yokeBox.max.y.toFixed(4)}`);
assert.ok(neckBox.min.y <= yokeBox.max.y, `Neck bottom ${neckBox.min.y} > yoke top ${yokeBox.max.y}: air gap exists!`);
console.log('✓ CP3 Fix 2: Neck base penetrates solidly into shoulder yoke (no gap)');

// CP3 Fix 3 Verification: Connect chair spokes to caster forks
for (let i = 0; i < 5; i++) {
  const spoke = chair.getObjectByName(`ChairSpoke_${i}`);
  const fork = chair.getObjectByName(`ChairCasterFork_${i}`);
  assert.ok(spoke, `ChairSpoke_${i} must exist`);
  assert.ok(fork, `ChairCasterFork_${i} must exist`);
  const spokeBox = new THREE.Box3().setFromObject(spoke);
  const forkBox = new THREE.Box3().setFromObject(fork);
  // Spoke and fork must touch or overlap (distance between boxes is 0)
  assert.ok(spokeBox.intersectsBox(forkBox), `ChairSpoke_${i} does not contact ChairCasterFork_${i}`);
}
console.log('✓ CP3 Fix 3: All 5 chair spokes connect directly to caster forks (0 gap)');

// CP3 Fix 4 Verification: Seat pelvis and thighs firmly onto cushion
const leftThigh = robot.getObjectByName('Thigh_left');
assert.ok(leftThigh, 'Thigh_left mesh must exist');
const thighBox = new THREE.Box3().setFromObject(leftThigh);
console.log(`Thigh bottom y: ${thighBox.min.y.toFixed(4)} (seat cushion top: ${seatTop.toFixed(4)})`);
assert.ok(Math.abs(thighBox.min.y - seatTop) <= 0.005, `Thigh bottom ${thighBox.min.y} not flush with seat cushion top ${seatTop}`);
console.log('✓ CP3 Fix 4: Thighs and pelvis rest flush on seat cushion at y=0.680 (not floating)');

// CP3 Fix 5 Verification: Ground chair casters for rug height
const wheelMesh = chair.getObjectByName('ChairCasterWheel_0');
assert.ok(wheelMesh, 'Chair caster wheel mesh must exist');
const wheelBox = new THREE.Box3().setFromObject(wheelMesh);
console.log(`Caster wheel bottom y: ${wheelBox.min.y.toFixed(4)} (spec: 0.0155 +- 0.002)`);
assert.ok(Math.abs(wheelBox.min.y - 0.0155) <= 0.002, `Caster wheel bottom ${wheelBox.min.y} outside rug surface 0.0155 +- 0.002`);
console.log('✓ CP3 Fix 5: Chair casters grounded on top of rug (y=0.0155)');

// 8. Verify Joints and No Empty-Joint Groups
const requiredJoints = [
  ['shoulders.left', joints.shoulders.left],
  ['shoulders.right', joints.shoulders.right],
  ['elbows.left', joints.elbows.left],
  ['elbows.right', joints.elbows.right],
  ['wrists.left', joints.wrists.left],
  ['wrists.right', joints.wrists.right],
  ['hips.left', joints.hips.left],
  ['hips.right', joints.hips.right],
  ['knees.left', joints.knees.left],
  ['knees.right', joints.knees.right],
  ['ankles.left', joints.ankles.left],
  ['ankles.right', joints.ankles.right],
];

for (const [name, group] of requiredJoints) {
  assert.ok(group && group.isGroup, `Joint ${name} must be a Group`);
  let hasMesh = false;
  group.traverse((c) => {
    if (c.isMesh) hasMesh = true;
  });
  assert.ok(hasMesh, `Joint ${name} must contain at least one Mesh (no empty-joint Groups)`);
}

assert.equal(joints.fingers.left.length, 5, 'joints.fingers.left must contain 5 finger Groups');
assert.equal(joints.fingers.right.length, 5, 'joints.fingers.right must contain 5 finger Groups');

for (let i = 0; i < 5; i++) {
  const fL = joints.fingers.left[i];
  const fR = joints.fingers.right[i];
  assert.ok(fL && fL.isGroup, `Left finger ${i} must be a Group`);
  assert.ok(fR && fR.isGroup, `Right finger ${i} must be a Group`);

  let meshL = false;
  fL.traverse((c) => { if (c.isMesh) meshL = true; });
  assert.ok(meshL, `Left finger ${i} must contain at least one Mesh`);

  let meshR = false;
  fR.traverse((c) => { if (c.isMesh) meshR = true; });
  assert.ok(meshR, `Right finger ${i} must contain at least one Mesh`);
}
console.log('✓ All joint groups verified and contain visible meshes (no empty joints)');

// -------------------------------------------------------------
// 9. CP2 Raycast and Proximity Assertions
// -------------------------------------------------------------

// (a) Ray from front hits crtFace first at 5 points
const frontQuat = (o) => o.getWorldQuaternion(new THREE.Quaternion());
const cCrt = crtFace.getWorldPosition(new THREE.Vector3());
const nCrt = new THREE.Vector3(0, 0, 1).applyQuaternion(frontQuat(crtFace));
for (const [dx, dy] of [[0, 0], [-0.2, 0.1], [0.2, -0.1], [-0.25, -0.15], [0.25, 0.15]]) {
  const origin = cCrt.clone().addScaledVector(nCrt, 1).add(new THREE.Vector3(dx, dy, 0));
  const rc = new THREE.Raycaster(origin, nCrt.clone().negate());
  const hit = rc.intersectObject(head, true).find((h) => h.object.visible);
  assert.ok(hit?.object === crtFace, `Ray at (${dx},${dy}) hit ${hit?.object.name || 'nothing'} before the CRT face`);
}
console.log('✓ (a) Raycast: CRT face is first surface hit from the front (5 points)');

// (b) Ray downward from each shoulder ball centre+0.2 hits shoulder yoke/torso mesh within 0.12m (no gap)
for (const key of ['left', 'right']) {
  const shoulderGroup = joints.shoulders[key];
  assert.ok(shoulderGroup, `Shoulder joint ${key} must exist`);
  const shoulderPos = shoulderGroup.getWorldPosition(new THREE.Vector3());
  const rayOrigin = shoulderPos.clone().add(new THREE.Vector3(0, 0.2, 0));
  const rayDir = new THREE.Vector3(0, -1, 0);
  const rc = new THREE.Raycaster(rayOrigin, rayDir);
  const hits = rc.intersectObject(torso, true).filter((h) => h.object.visible);
  assert.ok(hits.length > 0, `Ray downward from shoulder ${key} did not hit any torso mesh`);
  const hitDist = hits[0].distance;
  console.log(`Shoulder ${key} downward ray hit ${hits[0].object.name || 'torso-part'} at distance ${hitDist.toFixed(4)}m (spec <= 0.12m)`);
  assert.ok(hitDist <= 0.12, `Shoulder ${key} downward ray hit distance ${hitDist} > 0.12m`);
}
console.log('✓ (b) Raycast: Shoulder balls visibly seat in shoulder yoke/torso mesh within 0.12m (no gap)');

// (c) Ray from above the seat centre downward first hits pelvis/hip plate or seat within 0.02 of y=0.68..0.86
{
  const seatPos = seatMesh.getWorldPosition(new THREE.Vector3());
  const rayOrigin = new THREE.Vector3(seatPos.x, 0.88, seatPos.z);
  const rayDir = new THREE.Vector3(0, -1, 0);
  const rc = new THREE.Raycaster(rayOrigin, rayDir);
  const hits = rc.intersectObject(root, true).filter((h) => h.object.visible);
  assert.ok(hits.length > 0, 'Ray downward from above seat centre must hit something');
  const hitY = hits[0].point.y;
  console.log(`Seat center downward ray hit ${hits[0].object.name || 'mesh'} at y=${hitY.toFixed(4)} (spec within 0.02 of 0.68..0.86)`);
  assert.ok(hitY >= 0.68 - 0.02 && hitY <= 0.86 + 0.02, `Hit y=${hitY} outside [0.66, 0.88]`);
}
console.log('✓ (c) Raycast: Downward ray from above seat centre hits pelvis/hip plate/seat within 0.02 of y=0.68..0.86');

// (d) Every mesh is within 0.6m of another mesh (no floating islands, compute via bounding boxes)
{
  assert.ok(allMeshes.length > 10, 'Must have sufficient meshes to check connectivity');
  let maxMinDistance = 0;
  for (let i = 0; i < allMeshes.length; i++) {
    const m1 = allMeshes[i];
    const b1 = new THREE.Box3().setFromObject(m1);
    let minDist = Infinity;
    for (let j = 0; j < allMeshes.length; j++) {
      if (i === j) continue;
      const m2 = allMeshes[j];
      const b2 = new THREE.Box3().setFromObject(m2);

      const dx = Math.max(0, Math.max(b1.min.x - b2.max.x, b2.min.x - b1.max.x));
      const dy = Math.max(0, Math.max(b1.min.y - b2.max.y, b2.min.y - b1.max.y));
      const dz = Math.max(0, Math.max(b1.min.z - b2.max.z, b2.min.z - b1.max.z));
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < minDist) minDist = dist;
    }
    if (minDist > maxMinDistance) maxMinDistance = minDist;
    assert.ok(minDist <= 0.6, `Mesh ${m1.name || 'unnamed'} is floating! Min distance to nearest mesh is ${minDist.toFixed(4)}m > 0.6m`);
  }
  console.log(`✓ (d) Proximity: Every mesh is within 0.6m of another mesh (max nearest-mesh gap: ${maxMinDistance.toFixed(4)}m <= 0.6m)`);
}

// 10. Functional tests: setEyeOpenness and update
setEyeOpenness(0.5);
setEyeOpenness(0.0);
setEyeOpenness(1.0);
console.log('✓ setEyeOpenness functional check passed');

update(0);
update(100, { typing: true });
// Check typing animation limits (amplitude <= 0.08 rad)
for (let i = 0; i < 5; i++) {
  const rotL = Math.abs(joints.fingers.left[i].rotation.x);
  const rotR = Math.abs(joints.fingers.right[i].rotation.x);
  assert.ok(rotL <= 0.081, `Left finger rotation ${rotL} exceeds 0.08 rad`);
  assert.ok(rotR <= 0.081, `Right finger rotation ${rotR} exceeds 0.08 rad`);
}
const wristLRotDiff = Math.abs(joints.wrists.left.rotation.x);
const wristRRotDiff = Math.abs(joints.wrists.right.rotation.x);
assert.ok(wristLRotDiff <= 0.081, `Left wrist rotation diff ${wristLRotDiff} exceeds 0.08 rad`);
assert.ok(wristRRotDiff <= 0.081, `Right wrist rotation diff ${wristRRotDiff} exceeds 0.08 rad`);

update(200, { typing: false });
assert.equal(joints.fingers.left[0].rotation.x, 0, 'Left finger rotation reset to 0');
assert.equal(joints.wrists.left.rotation.x, 0, 'Left wrist rotation reset to baseline (0 rad)');
console.log('✓ update functional check passed (typing finger & wrist amplitudes <= 0.08 rad)');

console.log('\nALL TESTS PASSED SUCCESSFULLY! ✓');
