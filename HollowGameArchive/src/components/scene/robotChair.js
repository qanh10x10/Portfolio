import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const LAYOUT = {
  position: [0.5, 0, -0.95],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  description: 'Seated robot behind desk facing +z towards keyboard and camera',
};

export function buildRobotChair(ctx = {}) {
  const T = ctx.THREE || THREE;
  const BoxGeom = ctx.RoundedBoxGeometry || RoundedBoxGeometry;
  const track = typeof ctx.track === 'function' ? ctx.track : (item => item);
  const mats = ctx.mats || {};

  // Base materials from parent palette
  const matChair = mats.chair || track(new T.MeshStandardMaterial({
    color: 0x272d3e,
    roughness: 0.7,
    metalness: 0.2,
  }));
  const matMetalDark = mats.metalDark || track(new T.MeshStandardMaterial({
    color: 0x323a4e,
    roughness: 0.4,
    metalness: 0.7,
  }));
  const matRobotBody = mats.robotBody || track(new T.MeshStandardMaterial({
    color: 0xe2e6ef,
    roughness: 0.35,
    metalness: 0.35,
  }));
  const matRobotJoint = mats.robotJoint || track(new T.MeshStandardMaterial({
    color: 0x363e52,
    roughness: 0.45,
    metalness: 0.8,
  }));
  const matWarmGold = mats.warmGold || track(new T.MeshStandardMaterial({
    color: 0xffb74d,
    roughness: 0.3,
    metalness: 0.8,
  }));

  // Extra accent materials
  const matGlowTeal = track(new T.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.2,
  }));
  const matStatusCyan = track(new T.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.1,
  }));
  const matStatusAmber = track(new T.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.75,
    roughness: 0.2,
    metalness: 0.1,
  }));
  const matPiping = track(new T.MeshStandardMaterial({
    color: 0xffb74d,
    roughness: 0.35,
    metalness: 0.7,
  }));
  const matChrome = track(new T.MeshStandardMaterial({
    color: 0xdde3ea,
    roughness: 0.2,
    metalness: 0.9,
  }));

  // Root group
  const root = new T.Group();
  root.name = 'RobotChairRoot';

  // -------------------------------------------------------------
  // 1. Office Chair
  // -------------------------------------------------------------
  const chair = new T.Group();
  chair.name = 'ChairGroup';
  root.add(chair);

  const baseY = ctx.baseY !== undefined ? ctx.baseY : 0.0155;

  // 1.0 Contact shadow under the chair base on the floor / rug
  const shadowCanvasTex = typeof ctx.makeCanvasTex === 'function'
    ? ctx.makeCanvasTex((context, w, h) => {
        const g = context.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(10, 15, 25, 0.45)');
        g.addColorStop(0.35, 'rgba(10, 15, 25, 0.30)');
        g.addColorStop(0.7, 'rgba(10, 15, 25, 0.10)');
        g.addColorStop(1, 'rgba(10, 15, 25, 0)');
        context.fillStyle = g;
        context.fillRect(0, 0, w, h);
      }, 256, 256)
    : track(new T.Texture());

  const contactShadowMat = track(new T.MeshBasicMaterial({
    map: shadowCanvasTex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }));
  const contactShadowGeom = track(new T.PlaneGeometry(1.05, 1.05));
  const contactShadow = new T.Mesh(contactShadowGeom, contactShadowMat);
  contactShadow.name = 'ChairContactShadow';
  contactShadow.position.set(0, baseY + 0.004, 0);
  contactShadow.rotation.x = -Math.PI / 2;
  chair.add(contactShadow);

  // 1A. 5-spoke star base with 5 caster wheels + hubs
  const baseHubGeom = track(new T.CylinderGeometry(0.065, 0.075, 0.05, 16));
  const baseHub = new T.Mesh(baseHubGeom, matMetalDark);
  baseHub.name = 'ChairBaseHub';
  baseHub.position.set(0, baseY + 0.075, 0);
  baseHub.castShadow = true;
  chair.add(baseHub);

  const casterWheelGeom = track(new T.CylinderGeometry(0.035, 0.035, 0.025, 16));
  const casterHubGeom = track(new T.CylinderGeometry(0.012, 0.012, 0.032, 12));
  const casterForkGeom = track(new BoxGeom(0.036, 0.045, 0.038, 2, 0.005));
  const spokeLength = 0.31;
  const spokeGeom = track(new BoxGeom(0.035, 0.022, spokeLength, 2, 0.006));

  const casterRadius = 0.33;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);
    const cx = casterRadius * sinA;
    const cz = casterRadius * cosA;

    // Spoke extending from hub to caster (outer tip reaches radius 0.330 to contact fork)
    const spokeCenterR = casterRadius - spokeLength / 2;
    const spoke = new T.Mesh(spokeGeom, matMetalDark);
    spoke.name = `ChairSpoke_${i}`;
    spoke.position.set(sinA * spokeCenterR, baseY + 0.065, cosA * spokeCenterR);
    spoke.rotation.y = angle;
    spoke.castShadow = true;
    chair.add(spoke);

    // Caster fork
    const fork = new T.Mesh(casterForkGeom, matMetalDark);
    fork.name = `ChairCasterFork_${i}`;
    fork.position.set(cx, baseY + 0.055, cz);
    fork.rotation.y = angle;
    fork.castShadow = true;
    chair.add(fork);

    // Caster wheel (bottom rests on rug at baseY)
    const wheel = new T.Mesh(casterWheelGeom, matMetalDark);
    wheel.name = `ChairCasterWheel_${i}`;
    wheel.position.set(cx, baseY + 0.035, cz);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    chair.add(wheel);

    // Caster wheel hub cap
    const wheelHub = new T.Mesh(casterHubGeom, matWarmGold);
    wheelHub.name = `ChairCasterHub_${i}`;
    wheelHub.position.set(cx, baseY + 0.035, cz);
    wheelHub.rotation.z = Math.PI / 2;
    chair.add(wheelHub);
  }

  // 1B. Gas lift column + bellows rings
  const outerPistonGeom = track(new T.CylinderGeometry(0.032, 0.036, 0.22, 16));
  const outerPiston = new T.Mesh(outerPistonGeom, matMetalDark);
  outerPiston.position.set(0, 0.22, 0);
  outerPiston.castShadow = true;
  chair.add(outerPiston);

  const innerPistonGeom = track(new T.CylinderGeometry(0.022, 0.022, 0.20, 16));
  const innerPiston = new T.Mesh(innerPistonGeom, matChrome);
  innerPiston.position.set(0, 0.42, 0);
  innerPiston.castShadow = true;
  chair.add(innerPiston);

  const bellowsRingGeom = track(new T.TorusGeometry(0.038, 0.011, 8, 20));
  for (let b = 0; b < 3; b++) {
    const bellows = new T.Mesh(bellowsRingGeom, matMetalDark);
    bellows.position.set(0, 0.23 + b * 0.045, 0);
    bellows.rotation.x = Math.PI / 2;
    bellows.castShadow = true;
    chair.add(bellows);
  }

  // 1C. Under-seat tilt mechanism box & controls
  const tiltBoxGeom = track(new BoxGeom(0.24, 0.065, 0.28, 2, 0.01));
  const tiltBox = new T.Mesh(tiltBoxGeom, matMetalDark);
  tiltBox.position.set(0, 0.545, -0.04);
  tiltBox.castShadow = true;
  chair.add(tiltBox);

  // Tension knob cylinder under front of tilt mechanism
  const tensionKnobGeom = track(new T.CylinderGeometry(0.035, 0.032, 0.06, 14));
  const tensionKnob = new T.Mesh(tensionKnobGeom, matMetalDark);
  tensionKnob.position.set(0, 0.495, 0.05);
  tensionKnob.castShadow = true;
  chair.add(tensionKnob);

  // Tilt lever rod & paddle
  const leverRodGeom = track(new T.CylinderGeometry(0.007, 0.007, 0.16, 8));
  const leverRod = new T.Mesh(leverRodGeom, matChrome);
  leverRod.position.set(0.18, 0.545, -0.04);
  leverRod.rotation.z = Math.PI / 2;
  chair.add(leverRod);

  const leverPaddleGeom = track(new BoxGeom(0.038, 0.012, 0.065, 2, 0.004));
  const leverPaddle = new T.Mesh(leverPaddleGeom, matMetalDark);
  leverPaddle.position.set(0.26, 0.545, -0.04);
  chair.add(leverPaddle);

  // 1D. Rounded Seat Cushion (0.8 x 0.10 x 0.74, seat TOP 0.68)
  const seatCushionGeom = track(new BoxGeom(0.80, 0.10, 0.74, 4, 0.03));
  const seatCushion = new T.Mesh(seatCushionGeom, matChair);
  seatCushion.name = 'ChairSeatCushion';
  seatCushion.position.set(0, 0.63, -0.05);
  seatCushion.castShadow = true;
  seatCushion.receiveShadow = true;
  chair.add(seatCushion);

  // Seat bottom plate
  const seatBasePlateGeom = track(new BoxGeom(0.72, 0.015, 0.66, 2, 0.005));
  const seatBasePlate = new T.Mesh(seatBasePlateGeom, matMetalDark);
  seatBasePlate.position.set(0, 0.575, -0.05);
  seatBasePlate.castShadow = true;
  chair.add(seatBasePlate);

  // Decorative warm gold piping trim around seat perimeter
  const seatPipingGeom = track(new BoxGeom(0.808, 0.014, 0.748, 3, 0.005));
  const seatPiping = new T.Mesh(seatPipingGeom, matPiping);
  seatPiping.position.set(0, 0.63, -0.05);
  chair.add(seatPiping);

  // 1E. Armrests (height ~0.95) with structural uprights connecting to seat frame
  const armrestPadGeom = track(new BoxGeom(0.10, 0.035, 0.30, 3, 0.012));
  const armrestStalkGeom = track(new BoxGeom(0.028, 0.34, 0.045, 2, 0.005));
  const armrestBracketGeom = track(new BoxGeom(0.09, 0.024, 0.05, 2, 0.005));
  const armrestGussetGeom = track(new BoxGeom(0.024, 0.12, 0.06, 2, 0.005));

  for (const side of [-1, 1]) {
    const xPos = side * 0.42;

    // Lower bracket clamped to seat base plate
    const bracket = new T.Mesh(armrestBracketGeom, matMetalDark);
    bracket.position.set(side * 0.38, 0.575, -0.05);
    bracket.castShadow = true;
    chair.add(bracket);

    // Vertical stalk
    const stalk = new T.Mesh(armrestStalkGeom, matMetalDark);
    stalk.position.set(xPos, 0.755, -0.05);
    stalk.castShadow = true;
    chair.add(stalk);

    // Diagonal reinforcing gusset
    const gusset = new T.Mesh(armrestGussetGeom, matMetalDark);
    gusset.position.set(side * 0.395, 0.65, -0.05);
    gusset.rotation.z = side * 0.25;
    chair.add(gusset);

    // Armrest pad (top is 0.935 + 0.0175 = 0.9525m)
    const pad = new T.Mesh(armrestPadGeom, matChair);
    pad.position.set(xPos, 0.935, -0.02);
    pad.castShadow = true;
    pad.receiveShadow = true;
    chair.add(pad);
  }

  // 1F. Ergonomic Curved Backrest: vertical spine + lower strut + 5 horizontal slats in gentle arc
  const backSpineGeom = track(new BoxGeom(0.05, 0.96, 0.045, 2, 0.008));
  const backSpine = new T.Mesh(backSpineGeom, matMetalDark);
  backSpine.position.set(0, 1.10, -0.40);
  backSpine.castShadow = true;
  chair.add(backSpine);

  // Lower support strut from tilt box to backrest spine
  const lowerStrutGeom = track(new BoxGeom(0.05, 0.045, 0.28, 2, 0.008));
  const lowerStrut = new T.Mesh(lowerStrutGeom, matMetalDark);
  lowerStrut.position.set(0, 0.58, -0.26);
  lowerStrut.castShadow = true;
  chair.add(lowerStrut);

  // 5 Slats arranged in a gentle curved arc
  const slatYPositions = [0.88, 1.01, 1.14, 1.27, 1.40];
  const slatZOffsets = [-0.34, -0.355, -0.365, -0.355, -0.34];
  const slatWidths = [0.60, 0.64, 0.66, 0.64, 0.58];

  for (let s = 0; s < 5; s++) {
    const sGeom = track(new BoxGeom(slatWidths[s], 0.095, 0.065, 3, 0.015));
    const slat = new T.Mesh(sGeom, matChair);
    slat.position.set(0, slatYPositions[s], slatZOffsets[s]);
    slat.castShadow = true;
    slat.receiveShadow = true;
    chair.add(slat);

    // Warm gold piping accent on each slat
    const pGeom = track(new BoxGeom(slatWidths[s] + 0.006, 0.01, 0.068, 2, 0.002));
    const piping = new T.Mesh(pGeom, matPiping);
    piping.position.set(0, slatYPositions[s], slatZOffsets[s]);
    chair.add(piping);
  }

  // Lumbar roll cushion bridging the lower curve
  const lumbarRollGeom = track(new T.CylinderGeometry(0.042, 0.042, 0.56, 16));
  const lumbarRoll = new T.Mesh(lumbarRollGeom, matChair);
  lumbarRoll.position.set(0, 0.96, -0.315);
  lumbarRoll.rotation.z = Math.PI / 2;
  lumbarRoll.castShadow = true;
  lumbarRoll.receiveShadow = true;
  chair.add(lumbarRoll);

  // Headrest with two chrome support posts
  const headrestPostGeom = track(new T.CylinderGeometry(0.008, 0.008, 0.22, 12));
  for (const side of [-1, 1]) {
    const post = new T.Mesh(headrestPostGeom, matChrome);
    post.position.set(side * 0.08, 1.63, -0.38);
    post.castShadow = true;
    chair.add(post);
  }

  const headrestCushionGeom = track(new BoxGeom(0.36, 0.15, 0.07, 3, 0.02));
  const headrestCushion = new T.Mesh(headrestCushionGeom, matChair);
  headrestCushion.position.set(0, 1.76, -0.34);
  headrestCushion.castShadow = true;
  headrestCushion.receiveShadow = true;
  chair.add(headrestCushion);

  const headrestPipingGeom = track(new BoxGeom(0.366, 0.012, 0.076, 2, 0.003));
  const headrestPiping = new T.Mesh(headrestPipingGeom, matPiping);
  headrestPiping.position.set(0, 1.76, -0.34);
  chair.add(headrestPiping);

  // -------------------------------------------------------------
  // 2. Articulated Robot Character
  // -------------------------------------------------------------
  const robot = new T.Group();
  robot.name = 'RobotCharacter';
  root.add(robot);

  const joints = {
    shoulders: {},
    elbows: {},
    wrists: {},
    fingers: { left: [], right: [] },
    hips: {},
    knees: {},
    ankles: {},
  };

  // 2A. Pelvis & Lower Body (seated securely on chair cushion top y=0.68)
  const pelvisGroup = new T.Group();
  pelvisGroup.name = 'RobotPelvisGroup';
  robot.add(pelvisGroup);

  // Main pelvic chassis (lowered by 0.035m to seat firmly into cushion)
  const pelvisGeom = track(new BoxGeom(0.42, 0.16, 0.32, 3, 0.02));
  const pelvis = new T.Mesh(pelvisGeom, matRobotBody);
  pelvis.name = 'Pelvis';
  pelvis.position.set(0, 0.725, -0.02);
  pelvis.castShadow = true;
  pelvis.receiveShadow = true;
  pelvisGroup.add(pelvis);

  // Hip skirt / saddle plate directly contacting the seat (flush on seat cushion, no air gap)
  const hipPlateGeom = track(new BoxGeom(0.44, 0.06, 0.36, 3, 0.015));
  const hipPlate = new T.Mesh(hipPlateGeom, matRobotJoint);
  hipPlate.name = 'HipPlate';
  hipPlate.position.set(0, 0.675, -0.02);
  hipPlate.castShadow = true;
  hipPlate.receiveShadow = true;
  pelvisGroup.add(hipPlate);

  // Pelvic waist joint ring
  const waistRingGeom = track(new T.CylinderGeometry(0.14, 0.15, 0.04, 16));
  const waistRing = new T.Mesh(waistRingGeom, matRobotJoint);
  waistRing.name = 'WaistRing';
  waistRing.position.set(0, 0.815, -0.02);
  waistRing.castShadow = true;
  pelvisGroup.add(waistRing);

  // 2B. Legs: Thighs, Knees with armor caps, Shins with calf armor, Feet with gold sole stripe
  const hipGeom = track(new T.SphereGeometry(0.06, 12, 12));
  const hipFlangeGeom = track(new BoxGeom(0.04, 0.10, 0.18, 2, 0.008));
  const thighGeom = track(new BoxGeom(0.13, 0.12, 0.38, 3, 0.02));
  const kneeGeom = track(new T.CylinderGeometry(0.055, 0.055, 0.14, 16));
  const kneeAccentRingGeom = track(new T.TorusGeometry(0.058, 0.008, 8, 16));
  const kneeCapArmorGeom = track(new BoxGeom(0.138, 0.11, 0.045, 2, 0.01));

  const shinGeom = track(new BoxGeom(0.12, 0.62, 0.12, 3, 0.02));
  const calfArmorGeom = track(new BoxGeom(0.128, 0.38, 0.035, 2, 0.01));
  const ankleGeom = track(new T.SphereGeometry(0.05, 10, 10));

  const shoeGeom = track(new BoxGeom(0.14, 0.076, 0.26, 3, 0.018));
  const toeCapGeom = track(new BoxGeom(0.13, 0.058, 0.065, 2, 0.012));
  const soleStripeGeom = track(new BoxGeom(0.144, 0.008, 0.266, 2, 0.002));
  const soleGeom = track(new BoxGeom(0.142, 0.012, 0.264, 2, 0.003));

  for (const side of [-1, 1]) {
    const key = side === -1 ? 'left' : 'right';
    const xPos = side * 0.17;

    // Lateral hip bracket connecting pelvis to thigh
    const hipFlange = new T.Mesh(hipFlangeGeom, matRobotJoint);
    hipFlange.position.set(side * 0.22, 0.725, 0.04);
    hipFlange.castShadow = true;
    pelvisGroup.add(hipFlange);

    // Hip joint sphere
    const hipGroup = new T.Group();
    hipGroup.name = `Hip_${key}`;
    hipGroup.position.set(xPos, 0.735, 0.05);
    const hipMesh = new T.Mesh(hipGeom, matRobotJoint);
    hipMesh.castShadow = true;
    hipGroup.add(hipMesh);
    pelvisGroup.add(hipGroup);
    joints.hips[key] = hipGroup;

    // Horizontal thigh (center y=0.740, height=0.12 -> bottom rests flush on seat at y=0.680)
    const thigh = new T.Mesh(thighGeom, matRobotBody);
    thigh.name = `Thigh_${key}`;
    thigh.position.set(xPos, 0.740, 0.25);
    thigh.castShadow = true;
    thigh.receiveShadow = true;
    pelvisGroup.add(thigh);

    // Knee joint at z=0.45, y=0.745 (y < 0.88)
    const kneeGroup = new T.Group();
    kneeGroup.name = `Knee_${key}`;
    kneeGroup.position.set(xPos, 0.745, 0.45);

    const kneeMesh = new T.Mesh(kneeGeom, matRobotJoint);
    kneeMesh.rotation.z = Math.PI / 2;
    kneeMesh.castShadow = true;
    kneeGroup.add(kneeMesh);

    const kneeGlow = new T.Mesh(kneeAccentRingGeom, matGlowTeal);
    kneeGlow.rotation.y = Math.PI / 2;
    kneeGroup.add(kneeGlow);

    // Knee-pad armor cap over the front of the joint
    const kneePad = new T.Mesh(kneeCapArmorGeom, matRobotBody);
    kneePad.position.set(0, 0.01, 0.065);
    kneePad.castShadow = true;
    kneeGroup.add(kneePad);

    pelvisGroup.add(kneeGroup);
    joints.knees[key] = kneeGroup;

    // Vertical shin from knee down towards ankle (center y=0.435)
    const shin = new T.Mesh(shinGeom, matRobotBody);
    shin.name = `Shin_${key}`;
    shin.position.set(xPos, 0.435, 0.45);
    shin.castShadow = true;
    shin.receiveShadow = true;
    pelvisGroup.add(shin);

    // Calf armor plate on posterior of shin
    const calfArmor = new T.Mesh(calfArmorGeom, matRobotJoint);
    calfArmor.position.set(xPos, 0.45, 0.38);
    calfArmor.castShadow = true;
    pelvisGroup.add(calfArmor);

    // Ankle joint at y=0.08, z=0.45
    const ankleGroup = new T.Group();
    ankleGroup.name = `Ankle_${key}`;
    ankleGroup.position.set(xPos, 0.08, 0.45);
    const ankleMesh = new T.Mesh(ankleGeom, matRobotJoint);
    ankleMesh.castShadow = true;
    ankleGroup.add(ankleMesh);
    pelvisGroup.add(ankleGroup);
    joints.ankles[key] = ankleGroup;

    // Shoe / Foot (center y=0.04, height=0.08 -> bottom is strictly y=0.0)
    const footGroup = new T.Group();
    footGroup.name = `Foot_${key}`;
    footGroup.position.set(xPos, 0.04, 0.49);

    const shoeMesh = new T.Mesh(shoeGeom, matRobotBody);
    shoeMesh.castShadow = true;
    shoeMesh.receiveShadow = true;
    footGroup.add(shoeMesh);

    const toeCap = new T.Mesh(toeCapGeom, matWarmGold);
    toeCap.position.set(0, -0.01, 0.11);
    toeCap.castShadow = true;
    footGroup.add(toeCap);

    // Warm gold sole stripe
    const soleStripe = new T.Mesh(soleStripeGeom, matWarmGold);
    soleStripe.position.set(0, -0.028, 0);
    soleStripe.castShadow = true;
    footGroup.add(soleStripe);

    // Dark rubber sole bottom touching y=0.0
    const sole = new T.Mesh(soleGeom, matMetalDark);
    sole.position.set(0, -0.038, 0);
    sole.receiveShadow = true;
    footGroup.add(sole);

    pelvisGroup.add(footGroup);
  }

  // -------------------------------------------------------------
  // 2C. Torso Group (origin at 0,0,0 so parent breath +-0.008 works directly)
  // -------------------------------------------------------------
  const torso = new T.Group();
  torso.name = 'RobotTorso';
  robot.add(torso);

  // Abdominal spinal column & bellows (seamless from waist at 0.815 to chest at 0.93)
  const spineRingGeom = track(new T.CylinderGeometry(0.12, 0.13, 0.035, 16));
  for (let s = 0; s < 4; s++) {
    const ring = new T.Mesh(spineRingGeom, matRobotJoint);
    ring.name = `SpineRing_${s}`;
    ring.position.set(0, 0.835 + s * 0.038, -0.01);
    ring.castShadow = true;
    torso.add(ring);
  }

  // Belly armor plate
  const bellyPlateGeom = track(new BoxGeom(0.28, 0.12, 0.03, 2, 0.008));
  const bellyPlate = new T.Mesh(bellyPlateGeom, matRobotBody);
  bellyPlate.position.set(0, 0.95, 0.12);
  bellyPlate.castShadow = true;
  torso.add(bellyPlate);

  // Main chest chassis (center y=1.15, z=0.0, height=0.44, depth=0.42, width=0.66)
  const chestGeom = track(new BoxGeom(0.66, 0.44, 0.42, 4, 0.03));
  const chest = new T.Mesh(chestGeom, matRobotBody);
  chest.position.set(0, 1.15, 0.0);
  chest.castShadow = true;
  chest.receiveShadow = true;
  torso.add(chest);

  // Chest front armor plates with recessed panel line
  const upperChestPlateGeom = track(new BoxGeom(0.58, 0.17, 0.03, 3, 0.012));
  const upperChestPlate = new T.Mesh(upperChestPlateGeom, matRobotBody);
  upperChestPlate.position.set(0, 1.235, 0.215);
  upperChestPlate.castShadow = true;
  torso.add(upperChestPlate);

  const lowerChestPlateGeom = track(new BoxGeom(0.58, 0.17, 0.03, 3, 0.012));
  const lowerChestPlate = new T.Mesh(lowerChestPlateGeom, matRobotBody);
  lowerChestPlate.position.set(0, 1.045, 0.215);
  lowerChestPlate.castShadow = true;
  torso.add(lowerChestPlate);

  // Recessed panel line spacer
  const panelLineGeom = track(new BoxGeom(0.57, 0.015, 0.02, 1, 0.002));
  const panelLine = new T.Mesh(panelLineGeom, matRobotJoint);
  panelLine.position.set(0, 1.145, 0.21);
  torso.add(panelLine);

  // Status light cluster on upper chest (cyan + amber indicators)
  const statusLightGeom = track(new T.CylinderGeometry(0.016, 0.016, 0.012, 12));
  const statusCyan = new T.Mesh(statusLightGeom, matStatusCyan);
  statusCyan.position.set(-0.18, 1.25, 0.233);
  statusCyan.rotation.x = Math.PI / 2;
  torso.add(statusCyan);

  const statusAmber = new T.Mesh(statusLightGeom, matStatusAmber);
  statusAmber.position.set(-0.22, 1.25, 0.233);
  statusAmber.rotation.x = Math.PI / 2;
  torso.add(statusAmber);

  const statusGlow = new T.Mesh(statusLightGeom, matGlowTeal);
  statusGlow.position.set(-0.14, 1.25, 0.233);
  statusGlow.rotation.x = Math.PI / 2;
  torso.add(statusGlow);

  // Chest vent grille slots on lower chest plate
  const ventSlotGeom = track(new BoxGeom(0.24, 0.014, 0.01, 1, 0.002));
  for (let v = 0; v < 3; v++) {
    const vent = new T.Mesh(ventSlotGeom, matRobotJoint);
    vent.position.set(0, 1.02 + v * 0.024, 0.232);
    torso.add(vent);
  }

  // Side vent louvers on chest lateral flanks
  const sideVentGeom = track(new BoxGeom(0.012, 0.016, 0.16, 1, 0.002));
  for (const side of [-1, 1]) {
    for (let v = 0; v < 3; v++) {
      const sVent = new T.Mesh(sideVentGeom, matRobotJoint);
      sVent.position.set(side * 0.332, 1.12 + v * 0.035, 0.0);
      torso.add(sVent);
    }
  }

  // Rear battery pack with 3 vents + two small exhaust ports
  const backPackGeom = track(new BoxGeom(0.48, 0.34, 0.10, 3, 0.02));
  const backPack = new T.Mesh(backPackGeom, matRobotJoint);
  backPack.position.set(0, 1.16, -0.23);
  backPack.castShadow = true;
  torso.add(backPack);

  // 3 vents on battery pack
  const backVentGeom = track(new BoxGeom(0.32, 0.016, 0.014, 1, 0.002));
  for (let b = 0; b < 3; b++) {
    const bVent = new T.Mesh(backVentGeom, matMetalDark);
    bVent.position.set(0, 1.10 + b * 0.045, -0.282);
    torso.add(bVent);
  }

  // 2 small exhaust ports
  const exhaustGeom = track(new T.CylinderGeometry(0.018, 0.022, 0.035, 12));
  for (const side of [-1, 1]) {
    const exhaust = new T.Mesh(exhaustGeom, matMetalDark);
    exhaust.position.set(side * 0.14, 0.985, -0.24);
    exhaust.rotation.x = Math.PI / 4;
    torso.add(exhaust);
  }

  // Rivet InstancedMesh along chest plate borders
  const rivetCount = 14;
  const rivetGeom = track(new T.CylinderGeometry(0.007, 0.007, 0.006, 8));
  const rivets = track(new T.InstancedMesh(rivetGeom, matWarmGold, rivetCount));
  rivets.name = 'ChestRivets';
  rivets.castShadow = true;
  const dummy = new T.Object3D();
  const rivetZ = 0.232;
  const rivetCoords = [
    [-0.26, 1.30, rivetZ],
    [-0.13, 1.30, rivetZ],
    [0.00, 1.30, rivetZ],
    [0.13, 1.30, rivetZ],
    [0.26, 1.30, rivetZ],
    [-0.26, 0.98, rivetZ],
    [-0.13, 0.98, rivetZ],
    [0.00, 0.98, rivetZ],
    [0.13, 0.98, rivetZ],
    [0.26, 0.98, rivetZ],
    [-0.26, 1.145, rivetZ],
    [0.26, 1.145, rivetZ],
    [-0.26, 1.25, rivetZ],
    [0.26, 1.25, rivetZ],
  ];
  for (let r = 0; r < rivetCount; r++) {
    dummy.position.set(rivetCoords[r][0], rivetCoords[r][1], rivetCoords[r][2]);
    dummy.rotation.x = Math.PI / 2;
    dummy.updateMatrix();
    rivets.setMatrixAt(r, dummy.matrix);
  }
  rivets.instanceMatrix.needsUpdate = true;
  torso.add(rivets);

  // 1. Shoulders: Shoulder yoke / collar plate across upper torso + socket rings
  const shoulderYokeGeom = track(new BoxGeom(0.80, 0.06, 0.28, 3, 0.015));
  const shoulderYoke = new T.Mesh(shoulderYokeGeom, matRobotBody);
  shoulderYoke.name = 'ShoulderYoke';
  shoulderYoke.position.set(0, 1.38, 0.0);
  shoulderYoke.castShadow = true;
  torso.add(shoulderYoke);

  // Shoulder socket rings where each shoulder ball visibly seats inside torso
  const socketRingGeom = track(new T.TorusGeometry(0.072, 0.018, 10, 20));
  for (const side of [-1, 1]) {
    const socketRing = new T.Mesh(socketRingGeom, matRobotJoint);
    socketRing.position.set(side * 0.38, 1.42, 0.0);
    socketRing.rotation.y = Math.PI / 2;
    socketRing.castShadow = true;
    torso.add(socketRing);
  }

  // -------------------------------------------------------------
  // 2D. Neck & Head (pivots at neck y=1.55, sway rotation by parent)
  // Neck cylinder height 0.15 at y=1.465 penetrates solidly into shoulder yoke (top y=1.41)
  // -------------------------------------------------------------
  const neckGeom = track(new T.CylinderGeometry(0.08, 0.09, 0.15, 16));
  const neckMesh = new T.Mesh(neckGeom, matRobotJoint);
  neckMesh.name = 'NeckMesh';
  neckMesh.position.set(0, 1.465, 0.0);
  neckMesh.castShadow = true;
  torso.add(neckMesh);

  // Neck collar ring joining head and torso
  const neckCollarGeom = track(new T.TorusGeometry(0.098, 0.016, 10, 24));
  const neckCollar = new T.Mesh(neckCollarGeom, matRobotJoint);
  neckCollar.position.set(0, 1.535, 0.0);
  neckCollar.rotation.x = Math.PI / 2;
  neckCollar.castShadow = true;
  torso.add(neckCollar);

  const head = new T.Group();
  head.name = 'RobotHead';
  head.position.set(0, 1.55, 0.0);
  torso.add(head);

  // CRT shell (0.66 x 0.54 x 0.46, center y=0.28 inside head -> world y=1.83)
  const crtShellGeom = track(new BoxGeom(0.66, 0.54, 0.46, 4, 0.025));
  const crtShell = new T.Mesh(crtShellGeom, matRobotBody);
  crtShell.name = 'RobotHeadShell';
  crtShell.position.set(0, 0.28, 0.02);
  crtShell.castShadow = true;
  crtShell.receiveShadow = true;
  head.add(crtShell);

  // Bezel inset frame around screen
  const bezelGeom = track(new BoxGeom(0.60, 0.48, 0.02, 2, 0.008));
  const bezel = new T.Mesh(bezelGeom, matRobotJoint);
  bezel.position.set(0, 0.28, 0.245);
  head.add(bezel);

  // Rear heat-sink fins on CRT shell (InstancedMesh)
  const finCount = 6;
  const finGeom = track(new BoxGeom(0.008, 0.36, 0.045, 1, 0.002));
  const fins = track(new T.InstancedMesh(finGeom, matMetalDark, finCount));
  fins.name = 'HeadHeatSinkFins';
  fins.castShadow = true;
  const finDummy = new T.Object3D();
  for (let f = 0; f < finCount; f++) {
    const fx = -0.20 + f * (0.40 / (finCount - 1));
    finDummy.position.set(fx, 0.28, -0.215);
    finDummy.updateMatrix();
    fins.setMatrixAt(f, finDummy.matrix);
  }
  fins.instanceMatrix.needsUpdate = true;
  head.add(fins);

  // Top carry handle on CRT shell (keeps total head top <= 2.14 <= 2.20)
  const handleBarGeom = track(new BoxGeom(0.24, 0.022, 0.028, 2, 0.005));
  const handleBar = new T.Mesh(handleBarGeom, matMetalDark);
  handleBar.position.set(0, 0.57, 0.02);
  handleBar.castShadow = true;
  head.add(handleBar);

  const handlePostGeom = track(new BoxGeom(0.022, 0.035, 0.028, 1, 0.004));
  for (const s of [-1, 1]) {
    const hPost = new T.Mesh(handlePostGeom, matMetalDark);
    hPost.position.set(s * 0.10, 0.552, 0.02);
    head.add(hPost);
  }

  // Side ear speakers/dials with concentric outer ring
  const earDialGeom = track(new T.CylinderGeometry(0.068, 0.068, 0.028, 16));
  const earRingGeom = track(new T.TorusGeometry(0.078, 0.009, 8, 20));
  for (const s of [-1, 1]) {
    const ear = new T.Mesh(earDialGeom, matMetalDark);
    ear.position.set(s * 0.34, 0.28, 0.02);
    ear.rotation.z = Math.PI / 2;
    head.add(ear);

    const earRing = new T.Mesh(earRingGeom, matWarmGold);
    earRing.position.set(s * 0.345, 0.28, 0.02);
    earRing.rotation.y = Math.PI / 2;
    head.add(earRing);
  }

  // Antenna stubs with glow tip (total top <= 2.15 <= 2.2m)
  const antRodGeom = track(new T.CylinderGeometry(0.006, 0.006, 0.035, 8));
  const antTipGeom = track(new T.SphereGeometry(0.010, 8, 8));
  for (const s of [-1, 1]) {
    const antRod = new T.Mesh(antRodGeom, matWarmGold);
    antRod.position.set(s * 0.18, 0.565, 0.02);
    head.add(antRod);

    const antTip = new T.Mesh(antTipGeom, matGlowTeal);
    antTip.position.set(s * 0.18, 0.585, 0.02);
    head.add(antTip);
  }

  // CRT Face texture & 2D rendering
  let eyeCanvas = null;
  let eyeCtx = null;
  let eyeTexture = null;

  function renderFaceToContext(ctx2d, eyeOpenness = 1.0) {
    if (!ctx2d) return;
    ctx2d.fillStyle = '#060a12';
    ctx2d.fillRect(0, 0, 256, 256);
    ctx2d.fillStyle = 'rgba(20, 35, 60, 0.4)';
    for (let y = 0; y < 256; y += 8) {
      ctx2d.fillRect(0, y, 256, 3);
    }
    const eyeH = Math.max(2, 52 * eyeOpenness);
    ctx2d.fillStyle = '#38bdf8';
    ctx2d.shadowColor = '#38bdf8';
    ctx2d.shadowBlur = 18;
    ctx2d.beginPath();
    if (typeof ctx2d.roundRect === 'function') {
      ctx2d.roundRect(50, 128 - eyeH / 2, 50, eyeH, [12]);
    } else {
      ctx2d.rect(50, 128 - eyeH / 2, 50, eyeH);
    }
    ctx2d.fill();
    ctx2d.beginPath();
    if (typeof ctx2d.roundRect === 'function') {
      ctx2d.roundRect(156, 128 - eyeH / 2, 50, eyeH, [12]);
    } else {
      ctx2d.rect(156, 128 - eyeH / 2, 50, eyeH);
    }
    ctx2d.fill();
    ctx2d.shadowBlur = 0;
  }

  if (typeof ctx.makeCanvasTex === 'function') {
    eyeTexture = ctx.makeCanvasTex((context, w, h) => {
      eyeCtx = context;
      renderFaceToContext(context, 1.0);
    }, 256, 256);
    if (eyeTexture && eyeTexture.image && typeof eyeTexture.image.getContext === 'function') {
      eyeCanvas = eyeTexture.image;
      eyeCtx = eyeCanvas.getContext('2d');
    }
  } else if (typeof document !== 'undefined' && document.createElement) {
    eyeCanvas = document.createElement('canvas');
    eyeCanvas.width = 256;
    eyeCanvas.height = 256;
    eyeCtx = eyeCanvas.getContext('2d');
    renderFaceToContext(eyeCtx, 1.0);
    eyeTexture = track(new T.CanvasTexture(eyeCanvas));
    eyeTexture.colorSpace = T.SRGBColorSpace;
  } else {
    eyeTexture = track(new T.Texture());
  }

  function setEyeOpenness(openness = 1.0) {
    if (eyeCtx) {
      renderFaceToContext(eyeCtx, openness);
      if (eyeTexture) eyeTexture.needsUpdate = true;
    }
  }

  const crtFaceMat = track(
    new T.MeshStandardMaterial({
      map: eyeTexture,
      roughness: 0.15,
      metalness: 0.2,
      emissive: 0xffffff,
      emissiveMap: eyeTexture,
      emissiveIntensity: 0.9,
    })
  );
  // CRT Face plane (0.56 x 0.44, normal (0,0,1) pointing forward +z)
  const crtFace = new T.Mesh(track(new T.PlaneGeometry(0.56, 0.44)), crtFaceMat);
  crtFace.name = 'CRTFace';
  crtFace.position.set(0, 0.28, 0.258);
  head.add(crtFace);

  // -------------------------------------------------------------
  // 2E. Arms & Hands over keyboard
  // Spec: shoulder (+-0.38, 1.42, 0.0), elbow (+-0.42, 1.16, 0.28),
  // wrist (+-0.19, 1.17, 0.56), palm (+-0.17, 1.17, 0.62)
  // -------------------------------------------------------------
  const hands = { left: null, right: null };

  const shoulderBallGeom = track(new T.SphereGeometry(0.065, 12, 12));
  // Shoulder cap sits securely on top of ball, reaching y=1.51 (so ray from y=1.62 hits within 0.11m <= 0.12m)
  const shoulderCapGeom = track(new BoxGeom(0.14, 0.10, 0.16, 2, 0.015));
  const elbowJointGeom = track(new T.CylinderGeometry(0.045, 0.045, 0.09, 14));
  const elbowHousingGeom = track(new BoxGeom(0.11, 0.095, 0.10, 2, 0.015));
  const elbowAccentRingGeom = track(new T.TorusGeometry(0.048, 0.007, 8, 16));
  const wristGeom = track(new T.CylinderGeometry(0.038, 0.04, 0.04, 12));
  const wristCuffGeom = track(new T.CylinderGeometry(0.046, 0.048, 0.024, 14));

  const palmGeom = track(new BoxGeom(0.088, 0.024, 0.08, 2, 0.008));
  const fingerPhalanxGeom = track(new BoxGeom(0.014, 0.012, 0.036, 2, 0.003));
  const thumbGeom = track(new BoxGeom(0.014, 0.012, 0.030, 2, 0.003));

  for (const side of [-1, 1]) {
    const key = side === -1 ? 'left' : 'right';
    const shoulderPos = new T.Vector3(side * 0.38, 1.42, 0.0);
    const elbowPos = new T.Vector3(side * 0.42, 1.16, 0.28);
    const wristPos = new T.Vector3(side * 0.19, 1.17, 0.56);
    const palmPos = new T.Vector3(side * 0.17, 1.17, 0.62);

    // Shoulder joint
    const shoulderGroup = new T.Group();
    shoulderGroup.name = `Shoulder_${key}`;
    shoulderGroup.position.copy(shoulderPos);

    const shoulderBall = new T.Mesh(shoulderBallGeom, matRobotJoint);
    shoulderBall.castShadow = true;
    shoulderGroup.add(shoulderBall);

    // Shoulder cap top reaches y = 1.42 + 0.04 + 0.05 = 1.51m
    const shoulderCap = new T.Mesh(shoulderCapGeom, matRobotBody);
    shoulderCap.position.set(0, 0.04, 0);
    shoulderCap.castShadow = true;
    shoulderGroup.add(shoulderCap);

    torso.add(shoulderGroup);
    joints.shoulders[key] = shoulderGroup;

    // Upper arm mesh oriented from shoulder to elbow (tapered bicep sections)
    const upperArmGroup = new T.Group();
    upperArmGroup.name = `UpperArm_${key}`;
    upperArmGroup.position.copy(shoulderPos);
    upperArmGroup.lookAt(elbowPos);
    const upperArmDist = shoulderPos.distanceTo(elbowPos);

    // Upper bicep section (wider proximal)
    const upperBicepGeom = track(new BoxGeom(0.104, 0.104, upperArmDist * 0.52, 2, 0.012));
    const upperBicep = new T.Mesh(upperBicepGeom, matRobotBody);
    upperBicep.position.set(0, 0, upperArmDist * 0.26);
    upperBicep.castShadow = true;
    upperBicep.receiveShadow = true;
    upperArmGroup.add(upperBicep);

    // Lower bicep section (narrower distal)
    const lowerBicepGeom = track(new BoxGeom(0.082, 0.082, upperArmDist * 0.52, 2, 0.012));
    const lowerBicep = new T.Mesh(lowerBicepGeom, matRobotBody);
    lowerBicep.position.set(0, 0, upperArmDist * 0.74);
    lowerBicep.castShadow = true;
    lowerBicep.receiveShadow = true;
    upperArmGroup.add(lowerBicep);

    torso.add(upperArmGroup);

    // Elbow joint with enclosing housing
    const elbowGroup = new T.Group();
    elbowGroup.name = `Elbow_${key}`;
    elbowGroup.position.copy(elbowPos);

    const elbowHousing = new T.Mesh(elbowHousingGeom, matRobotBody);
    elbowHousing.castShadow = true;
    elbowGroup.add(elbowHousing);

    const elbowMesh = new T.Mesh(elbowJointGeom, matRobotJoint);
    elbowMesh.rotation.z = Math.PI / 2;
    elbowMesh.castShadow = true;
    elbowGroup.add(elbowMesh);

    const elbowGlow = new T.Mesh(elbowAccentRingGeom, matGlowTeal);
    elbowGlow.rotation.y = Math.PI / 2;
    elbowGroup.add(elbowGlow);

    torso.add(elbowGroup);
    joints.elbows[key] = elbowGroup;

    // Forearm mesh oriented from elbow to wrist (tapered forearm + cable bundle)
    const forearmGroup = new T.Group();
    forearmGroup.name = `Forearm_${key}`;
    forearmGroup.position.copy(elbowPos);
    forearmGroup.lookAt(wristPos);
    const forearmDist = elbowPos.distanceTo(wristPos);

    // Forearm proximal section (wider)
    const forearmProxGeom = track(new BoxGeom(0.092, 0.092, forearmDist * 0.52, 2, 0.012));
    const forearmProx = new T.Mesh(forearmProxGeom, matRobotBody);
    forearmProx.position.set(0, 0, forearmDist * 0.26);
    forearmProx.castShadow = true;
    forearmProx.receiveShadow = true;
    forearmGroup.add(forearmProx);

    // Forearm distal section (narrower)
    const forearmDistGeom = track(new BoxGeom(0.072, 0.072, forearmDist * 0.52, 2, 0.012));
    const forearmDistal = new T.Mesh(forearmDistGeom, matRobotBody);
    forearmDistal.position.set(0, 0, forearmDist * 0.74);
    forearmDistal.castShadow = true;
    forearmDistal.receiveShadow = true;
    forearmGroup.add(forearmDistal);

    // Cable bundle running along underside/side of forearm
    const cableGeom = track(new T.CylinderGeometry(0.004, 0.004, forearmDist * 0.85, 8));
    const cable1 = new T.Mesh(cableGeom, matRobotJoint);
    cable1.position.set(0.032, -0.035, forearmDist * 0.5);
    cable1.rotation.x = Math.PI / 2;
    forearmGroup.add(cable1);

    const cable2 = new T.Mesh(cableGeom, matGlowTeal);
    cable2.position.set(-0.032, -0.035, forearmDist * 0.5);
    cable2.rotation.x = Math.PI / 2;
    forearmGroup.add(cable2);

    torso.add(forearmGroup);

    // Wrist joint with protective wrist cuff
    const wristGroup = new T.Group();
    wristGroup.name = `Wrist_${key}`;
    wristGroup.position.copy(wristPos);

    const wristMesh = new T.Mesh(wristGeom, matRobotJoint);
    wristMesh.rotation.x = Math.PI / 2;
    wristMesh.castShadow = true;
    wristGroup.add(wristMesh);

    const wristCuff = new T.Mesh(wristCuffGeom, matWarmGold);
    wristCuff.rotation.x = Math.PI / 2;
    wristCuff.castShadow = true;
    wristGroup.add(wristCuff);

    torso.add(wristGroup);
    joints.wrists[key] = wristGroup;

    // Hand Group re-parented to wrist joint group so typing animations visibly move hands
    const handGroup = new T.Group();
    handGroup.name = `RobotHand_${key}`;
    // Local to wristGroup: palmPos - wristPos = (side * -0.02, 0, 0.06)
    handGroup.position.set(side * -0.02, 0, 0.06);

    const palmMesh = new T.Mesh(palmGeom, matWarmGold);
    palmMesh.name = `Palm_${key}`;
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    handGroup.add(palmMesh);

    // 5 Fingers (Thumb + 4 fingers)
    const fingerOffsets = [
      { name: 'Thumb', x: side * -0.038, z: 0.015, y: -0.002, rotY: side * -0.4, isThumb: true },
      { name: 'Index', x: side * -0.024, z: 0.045, y: 0.002, rotY: 0, isThumb: false },
      { name: 'Middle', x: side * -0.008, z: 0.048, y: 0.002, rotY: 0, isThumb: false },
      { name: 'Ring', x: side * 0.008, z: 0.045, y: 0.002, rotY: 0, isThumb: false },
      { name: 'Pinky', x: side * 0.024, z: 0.040, y: 0.002, rotY: 0, isThumb: false },
    ];

    for (const f of fingerOffsets) {
      const fingerGroup = new T.Group();
      fingerGroup.name = `Finger_${key}_${f.name}`;
      fingerGroup.position.set(f.x, f.y, f.z);
      fingerGroup.rotation.y = f.rotY;

      const fMesh = new T.Mesh(f.isThumb ? thumbGeom : fingerPhalanxGeom, matWarmGold);
      fMesh.position.set(0, -0.003, 0.018);
      fMesh.castShadow = true;
      fingerGroup.add(fMesh);

      handGroup.add(fingerGroup);
      joints.fingers[key].push(fingerGroup);
    }

    wristGroup.add(handGroup);
    hands[key] = handGroup;
  }

  // Animation update function: idle typing moves fingers and wrists (amplitude <= 0.08 rad)
  function update(timeMs = 0, { typing = false } = {}) {
    if (typing) {
      const t = timeMs * 0.008;
      for (let i = 0; i < 5; i++) {
        const fL = joints.fingers.left[i];
        const fR = joints.fingers.right[i];
        if (fL) fL.rotation.x = Math.sin(t + i * 1.3) * 0.07;
        if (fR) fR.rotation.x = Math.cos(t + i * 1.1) * 0.07;
      }
      if (joints.wrists.left) joints.wrists.left.rotation.x = Math.sin(t * 0.6) * 0.04;
      if (joints.wrists.right) joints.wrists.right.rotation.x = Math.cos(t * 0.6) * 0.04;
    } else {
      if (joints.wrists.left) joints.wrists.left.rotation.x = 0;
      if (joints.wrists.right) joints.wrists.right.rotation.x = 0;
      for (let i = 0; i < 5; i++) {
        const fL = joints.fingers.left[i];
        const fR = joints.fingers.right[i];
        if (fL) fL.rotation.x = 0;
        if (fR) fR.rotation.x = 0;
      }
    }
  }

  return {
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
    LAYOUT,
    contactShadow,
  };
}
