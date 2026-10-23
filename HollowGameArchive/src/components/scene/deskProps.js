import * as THREE from 'three';
import { RoundedBoxGeometry as FallbackRoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const LAYOUT = {
  monitor: { x: -0.85, z: 0.05, yaw: 2.2 },
  keyboard: { x: 0.45, z: -0.38, rotY: Math.PI },
  mouse: { x: 1.0, z: -0.35 },
  lamp: { x: -1.35, z: -0.5 },
  phone: { x: 1.15, z: 0.35, yaw: -0.35 },
  plant: { x: 1.3, z: -0.5 },
  audioTable: { x: 2.4, z: -2.6, yaw: -0.45 }
};

export function buildDeskProps(ctx) {
  const { track, makeCanvasTex, mats } = ctx;
  const RoundedBoxGeometry = ctx.RoundedBoxGeometry || FallbackRoundedBoxGeometry;

  // Shared utility materials
  const matMetalDark = mats.metalDark;
  const matDeskTop = mats.deskTop;
  const matDeskLegs = mats.deskLegs;
  const matWarmGold = mats.warmGold;
  const matRug = mats.rug;

  // ---------------------------------------------------------------------------
  // 1. DESK (Group origin = floor centre, +z toward camera)
  // ---------------------------------------------------------------------------
  const desk = new THREE.Group();
  desk.name = 'Desk';

  // Tabletop: 3.2 x 0.09 x 1.5, top surface at y = 1.095
  const tabletopThickness = 0.09;
  const tabletopTopY = 1.095;
  const tabletopCenterY = tabletopTopY - tabletopThickness / 2; // 1.050

  const tabletopGeo = track(new RoundedBoxGeometry(3.2, tabletopThickness, 1.5, 3, 0.018));
  const tabletop = new THREE.Mesh(tabletopGeo, matDeskTop);
  tabletop.position.set(0, tabletopCenterY, 0);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  desk.add(tabletop);

  // Warm-gold under-lip LED strip (emissive <= 0.5) along front + sides underneath tabletop
  const ledStripMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffd580,
      emissive: 0xffb74d,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.2
    })
  );

  const ledY = tabletopCenterY - tabletopThickness / 2 - 0.003; // ~1.002
  const frontLed = new THREE.Mesh(track(new THREE.BoxGeometry(3.14, 0.006, 0.02)), ledStripMat);
  frontLed.position.set(0, ledY, 0.71);
  desk.add(frontLed);

  const leftLed = new THREE.Mesh(track(new THREE.BoxGeometry(0.02, 0.006, 1.42)), ledStripMat);
  leftLed.position.set(-1.56, ledY, 0);
  desk.add(leftLed);

  const rightLed = new THREE.Mesh(track(new THREE.BoxGeometry(0.02, 0.006, 1.42)), ledStripMat);
  rightLed.position.set(1.56, ledY, 0);
  desk.add(rightLed);

  // Desk mat: 1.9 x 0.01 x 0.8 centered x=0, z=-0.05, top y = 1.10
  const deskMatGeo = track(new RoundedBoxGeometry(1.9, 0.01, 0.8, 3, 0.01));
  const deskMat = new THREE.Mesh(deskMatGeo, matRug);
  deskMat.position.set(0.0, tabletopTopY + 0.005, -0.05); // top reaches 1.100
  deskMat.receiveShadow = true;
  desk.add(deskMat);

  // Stitched border along desk-mat perimeter
  const stitchMat = track(new THREE.MeshStandardMaterial({ color: 0xdfc99f, roughness: 0.55 }));
  const stitchThick = 0.004;
  const stitchH = 0.002;
  const stitchY = tabletopTopY + 0.0102;
  const smX = 1.9 / 2 - 0.014;
  const smZ = 0.8 / 2 - 0.014;
  const stitchHGeo = track(new THREE.BoxGeometry(1.84, stitchH, stitchThick));
  const stitchFront = new THREE.Mesh(stitchHGeo, stitchMat);
  stitchFront.position.set(0.0, stitchY, -0.05 + smZ);
  desk.add(stitchFront);
  const stitchRear = new THREE.Mesh(stitchHGeo, stitchMat);
  stitchRear.position.set(0.0, stitchY, -0.05 - smZ);
  desk.add(stitchRear);
  const stitchVGeo = track(new THREE.BoxGeometry(stitchThick, stitchH, 0.76));
  const stitchLeft = new THREE.Mesh(stitchVGeo, stitchMat);
  stitchLeft.position.set(-smX, stitchY, -0.05);
  desk.add(stitchLeft);
  const stitchRight = new THREE.Mesh(stitchVGeo, stitchMat);
  stitchRight.position.set(smX, stitchY, -0.05);
  desk.add(stitchRight);

  // 4 Square tube legs (0.05 x 0.05), side rails, cross brace, adjustable feet
  const legBottomY = 0.0;
  const legTopY = tabletopCenterY - tabletopThickness / 2; // 1.005
  const legHeight = legTopY - legBottomY; // 1.005
  const legGeo = track(new THREE.BoxGeometry(0.05, legHeight, 0.05));
  const footGeo = track(new THREE.CylinderGeometry(0.032, 0.036, 0.02, 16));
  const footMat = track(new THREE.MeshStandardMaterial({ color: 0x1d222b, roughness: 0.5, metalness: 0.85 }));

  const legPositions = [
    [-1.45, -0.60],
    [1.45, -0.60],
    [-1.45, 0.60],
    [1.45, 0.60]
  ];

  legPositions.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, matDeskLegs);
    leg.position.set(lx, legHeight / 2, lz);
    leg.castShadow = true;
    desk.add(leg);

    const foot = new THREE.Mesh(footGeo, footMat);
    foot.position.set(lx, 0.01, lz);
    desk.add(foot);
  });

  // Side rails connecting front and rear legs (under-top frame)
  const sideRailGeo = track(new THREE.BoxGeometry(0.04, 0.04, 1.15));
  const leftRail = new THREE.Mesh(sideRailGeo, matDeskLegs);
  leftRail.position.set(-1.45, 0.98, 0);
  desk.add(leftRail);

  const rightRail = new THREE.Mesh(sideRailGeo, matDeskLegs);
  rightRail.position.set(1.45, 0.98, 0);
  desk.add(rightRail);

  // Rear cross brace (keeps front clearance under top >= 0.95)
  const rearBraceGeo = track(new THREE.BoxGeometry(2.85, 0.04, 0.04));
  const rearBrace = new THREE.Mesh(rearBraceGeo, matDeskLegs);
  rearBrace.position.set(0, 0.98, -0.60);
  desk.add(rearBrace);

  // Cable tray under desk rear (y = 0.98, top flush with tabletop underside at y = 1.005)
  const cableTrayGeo = track(new RoundedBoxGeometry(1.6, 0.05, 0.16, 2, 0.008));
  const cableTray = new THREE.Mesh(cableTrayGeo, matMetalDark);
  cableTray.position.set(0, 0.98, -0.45);
  desk.add(cableTray);

  // Desktop cable grommet at rear left (recessed ring)
  const grommetGeo = track(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 24));
  const grommet = new THREE.Mesh(grommetGeo, matMetalDark);
  grommet.position.set(-0.65, tabletopTopY + 0.001, -0.55);
  desk.add(grommet);

  // Desk cable tray cables running to monitor stand (tube geometry, visible from camera side)
  const trayCableCurve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.40, 0.98, -0.45),
    new THREE.Vector3(-0.55, 1.02, -0.52),
    new THREE.Vector3(-0.65, tabletopTopY + 0.006, -0.55),
    new THREE.Vector3(-0.72, tabletopTopY + 0.05, -0.30),
    new THREE.Vector3(-0.82, tabletopTopY + 0.12, -0.05)
  ]);
  const trayCableGeo1 = track(new THREE.TubeGeometry(trayCableCurve1, 24, 0.007, 8, false));
  const trayCable1 = new THREE.Mesh(trayCableGeo1, matMetalDark);
  trayCable1.castShadow = true;
  desk.add(trayCable1);

  const trayCableCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, 0.98, -0.45),
    new THREE.Vector3(-0.50, 1.01, -0.52),
    new THREE.Vector3(-0.63, tabletopTopY + 0.006, -0.53),
    new THREE.Vector3(-0.70, tabletopTopY + 0.04, -0.28),
    new THREE.Vector3(-0.80, tabletopTopY + 0.10, -0.03)
  ]);
  const trayCableGeo2 = track(new THREE.TubeGeometry(trayCableCurve2, 24, 0.005, 8, false));
  const trayCableMat2 = track(new THREE.MeshStandardMaterial({ color: 0x1f2733, roughness: 0.8 }));
  const trayCable2 = new THREE.Mesh(trayCableGeo2, trayCableMat2);
  trayCable2.castShadow = true;
  desk.add(trayCable2);

  // Coffee mug (open cup with inner cavity rim, coffee liquid recessed ~10mm below rim)
  const mugGroup = new THREE.Group();
  mugGroup.name = 'MugGroup';
  mugGroup.position.set(1.25, tabletopTopY, -0.15);

  const mugPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.038, 0),
    new THREE.Vector2(0.042, 0.085),
    new THREE.Vector2(0.036, 0.085),
    new THREE.Vector2(0.033, 0.008),
    new THREE.Vector2(0, 0.008)
  ];
  const mugBodyGeo = track(new THREE.LatheGeometry(mugPts, 24));
  const mugMat = track(new THREE.MeshStandardMaterial({ color: 0x88b5a0, roughness: 0.25, metalness: 0.1 }));
  const mugBody = new THREE.Mesh(mugBodyGeo, mugMat);
  mugBody.name = 'MugBody';
  mugBody.position.set(0, 0, 0);
  mugBody.castShadow = true;
  mugGroup.add(mugBody);

  const coffeeGeo = track(new THREE.CylinderGeometry(0.035, 0.034, 0.004, 16));
  const coffeeMat = track(new THREE.MeshStandardMaterial({ color: 0x26160e, roughness: 0.2 }));
  const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
  coffee.name = 'MugCoffee';
  coffee.position.set(0, 0.075, 0); // recessed ~10mm below rim (0.085 - 0.010 = 0.075)
  mugGroup.add(coffee);

  const mugHandleGeo = track(new THREE.TorusGeometry(0.024, 0.006, 8, 20, Math.PI * 1.1));
  const mugHandle = new THREE.Mesh(mugHandleGeo, mugMat);
  mugHandle.name = 'MugHandle';
  mugHandle.rotation.z = -Math.PI / 2;
  mugHandle.position.set(0.044, 0.048, 0);
  mugHandle.castShadow = true;
  mugGroup.add(mugHandle);

  desk.add(mugGroup);

  // Small notebook + pen at local x ~ 0.95, z ~ 0.10 (page block edges revealed)
  const notebookGroup = new THREE.Group();
  notebookGroup.name = 'NotebookGroup';
  notebookGroup.position.set(0.95, tabletopTopY, 0.10);
  notebookGroup.rotation.y = 0.15;

  const nbCoverMat = track(new THREE.MeshStandardMaterial({ color: 0x364356, roughness: 0.6, metalness: 0.1 }));
  const nbPagesMat = track(new THREE.MeshStandardMaterial({ color: 0xf3eee3, roughness: 0.9 }));

  // Back cover
  const nbBackGeo = track(new RoundedBoxGeometry(0.14, 0.0018, 0.20, 2, 0.002));
  const nbBack = new THREE.Mesh(nbBackGeo, nbCoverMat);
  nbBack.name = 'NotebookBackCover';
  nbBack.position.set(0, 0.0009, 0);
  nbBack.castShadow = true;
  notebookGroup.add(nbBack);

  // Page block with visible paper edges
  const nbPagesGeo = track(new THREE.BoxGeometry(0.136, 0.0084, 0.194));
  const nbPages = new THREE.Mesh(nbPagesGeo, nbPagesMat);
  nbPages.name = 'NotebookPages';
  nbPages.position.set(0.001, 0.0018 + 0.0084 / 2, 0);
  notebookGroup.add(nbPages);

  // Top cover slightly open/tilted to reveal page block edges
  const nbCoverGeo = track(new RoundedBoxGeometry(0.14, 0.0018, 0.20, 2, 0.002));
  const nbCover = new THREE.Mesh(nbCoverGeo, nbCoverMat);
  nbCover.name = 'NotebookCover';
  nbCover.position.set(0, 0.0018 + 0.0084 + 0.0014, 0);
  nbCover.rotation.z = -0.035;
  nbCover.castShadow = true;
  notebookGroup.add(nbCover);

  // Spine along binding edge
  const nbSpineGeo = track(new THREE.BoxGeometry(0.002, 0.011, 0.20));
  const nbSpine = new THREE.Mesh(nbSpineGeo, nbCoverMat);
  nbSpine.name = 'NotebookSpine';
  nbSpine.position.set(-0.069, 0.006, 0);
  notebookGroup.add(nbSpine);

  const penGeo = track(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 12));
  penGeo.rotateX(Math.PI / 2);
  const penMat = track(new THREE.MeshStandardMaterial({ color: 0xd4a359, roughness: 0.35, metalness: 0.8 }));
  const pen = new THREE.Mesh(penGeo, penMat);
  pen.name = 'NotebookPen';
  pen.position.set(0.082, 0.006, 0);
  pen.castShadow = true;
  notebookGroup.add(pen);

  desk.add(notebookGroup);

  // ---------------------------------------------------------------------------
  // 2. MECHANICAL KEYBOARD (Origin on desk surface y = 0, spacebar side = local +z)
  // ---------------------------------------------------------------------------
  const keyboard = new THREE.Group();
  keyboard.name = 'MechanicalKeyboard';

  // Body: 0.72 x 0.026 x 0.25 case
  const kbCaseGeo = track(new RoundedBoxGeometry(0.72, 0.024, 0.25, 3, 0.008));
  const kbCase = new THREE.Mesh(kbCaseGeo, matMetalDark);
  kbCase.position.set(0, 0.012, 0);
  kbCase.castShadow = true;
  keyboard.add(kbCase);

  // Recessed top switch plate
  const kbPlateGeo = track(new RoundedBoxGeometry(0.68, 0.004, 0.21, 2, 0.004));
  const kbPlateMat = track(new THREE.MeshStandardMaterial({ color: 0x1a212d, roughness: 0.4, metalness: 0.8 }));
  const kbPlate = new THREE.Mesh(kbPlateGeo, kbPlateMat);
  kbPlate.position.set(0, 0.024, 0);
  keyboard.add(kbPlate);

  // Small tilt feet underneath at rear
  const kbFootGeo = track(new THREE.BoxGeometry(0.04, 0.006, 0.02));
  const kbFootL = new THREE.Mesh(kbFootGeo, footMat);
  kbFootL.position.set(-0.28, 0.003, -0.10);
  keyboard.add(kbFootL);
  const kbFootR = new THREE.Mesh(kbFootGeo, footMat);
  kbFootR.position.set(0.28, 0.003, -0.10);
  keyboard.add(kbFootR);

  // Keycaps: ~80 individual keycaps via InstancedMesh
  // Tops of keycaps reach y = +0.030 (keycap height 0.008, center y = 0.026)
  const keyCapGeo = track(new RoundedBoxGeometry(0.034, 0.008, 0.028, 2, 0.003));
  const keyCapMat = track(new THREE.MeshStandardMaterial({ color: 0xe6e7ea, roughness: 0.35, metalness: 0.15 }));
  const tealAccentMat = track(new THREE.MeshStandardMaterial({ color: 0x38c4ba, roughness: 0.3, metalness: 0.2 }));

  // Collect keycap transforms for InstancedMesh
  const keyMatrices = [];
  const dummy = new THREE.Object3D();

  // 6 rows of keycaps
  // Row 0: Function row (z = -0.082)
  for (let c = 0; c < 15; c++) {
    const kx = -0.308 + c * 0.044;
    dummy.position.set(kx, 0.026, -0.082);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    keyMatrices.push({ matrix: dummy.matrix.clone(), isAccent: c === 0 }); // c === 0 is Esc
  }

  // Row 1: Number row (z = -0.050)
  for (let c = 0; c < 15; c++) {
    const kx = -0.308 + c * 0.044;
    const isBackspace = c === 14;
    dummy.position.set(isBackspace ? kx + 0.01 : kx, 0.026, -0.050);
    dummy.scale.set(isBackspace ? 1.6 : 1, 1, 1);
    dummy.updateMatrix();
    keyMatrices.push({ matrix: dummy.matrix.clone(), isAccent: false });
  }

  // Row 2: QWERTY row (z = -0.018)
  for (let c = 0; c < 15; c++) {
    const kx = -0.308 + c * 0.044;
    const isTab = c === 0;
    dummy.position.set(isTab ? kx - 0.005 : kx, 0.026, -0.018);
    dummy.scale.set(isTab ? 1.4 : 1, 1, 1);
    dummy.updateMatrix();
    keyMatrices.push({ matrix: dummy.matrix.clone(), isAccent: false });
  }

  // Row 3: ASDF row (z = +0.014)
  for (let c = 0; c < 14; c++) {
    const kx = -0.304 + c * 0.045;
    const isEnter = c === 13;
    dummy.position.set(isEnter ? kx + 0.012 : kx, 0.026, 0.014);
    dummy.scale.set(isEnter ? 1.7 : (c === 0 ? 1.5 : 1), 1, 1);
    dummy.updateMatrix();
    keyMatrices.push({ matrix: dummy.matrix.clone(), isAccent: isEnter }); // Enter is accent
  }

  // Row 4: ZXCV row (z = +0.046)
  for (let c = 0; c < 13; c++) {
    const kx = -0.300 + c * 0.047;
    const isLShift = c === 0;
    const isRShift = c === 12;
    dummy.position.set(kx, 0.026, 0.046);
    dummy.scale.set(isLShift ? 1.8 : (isRShift ? 2.0 : 1), 1, 1);
    dummy.updateMatrix();
    keyMatrices.push({ matrix: dummy.matrix.clone(), isAccent: false });
  }

  // Row 5: Spacebar row (z = +0.078)
  const bottomRowLayout = [
    { x: -0.300, w: 1.25 },
    { x: -0.245, w: 1.25 },
    { x: -0.190, w: 1.25 },
    { x: 0.010, w: 6.2 }, // Spacebar
    { x: 0.210, w: 1.25 },
    { x: 0.260, w: 1.25 },
    { x: 0.310, w: 1.25 }
  ];
  bottomRowLayout.forEach(item => {
    dummy.position.set(item.x, 0.026, 0.078);
    dummy.scale.set(item.w, 1, 1);
    dummy.updateMatrix();
    keyMatrices.push({ matrix: dummy.matrix.clone(), isAccent: false });
  });

  // Separate regular keycaps and accent keycaps
  const regularKeyMatrices = keyMatrices.filter(k => !k.isAccent);
  const accentKeyMatrices = keyMatrices.filter(k => k.isAccent);

  const keyInstMesh = track(new THREE.InstancedMesh(keyCapGeo, keyCapMat, regularKeyMatrices.length));
  regularKeyMatrices.forEach((item, idx) => {
    keyInstMesh.setMatrixAt(idx, item.matrix);
  });
  keyInstMesh.instanceMatrix.needsUpdate = true;
  keyboard.add(keyInstMesh);

  // Teal accent keys (Esc & Enter)
  const accentInstMesh = track(new THREE.InstancedMesh(keyCapGeo, tealAccentMat, accentKeyMatrices.length));
  accentKeyMatrices.forEach((item, idx) => {
    accentInstMesh.setMatrixAt(idx, item.matrix);
  });
  accentInstMesh.instanceMatrix.needsUpdate = true;
  keyboard.add(accentInstMesh);

  // Ergonomic keyboard wrist rest (0.72 x 0.016 x 0.075) in front along +z
  const wristRestGeo = track(new RoundedBoxGeometry(0.72, 0.016, 0.075, 2, 0.006));
  const wristRestMat = track(new THREE.MeshStandardMaterial({ color: 0x242a38, roughness: 0.7, metalness: 0.15 }));
  const wristRest = new THREE.Mesh(wristRestGeo, wristRestMat);
  wristRest.name = 'KeyboardWristRest';
  wristRest.position.set(0, 0.008, 0.165);
  wristRest.castShadow = true;
  keyboard.add(wristRest);

  // ---------------------------------------------------------------------------
  // 3. MOUSE & GAME CONTROLLER (Origin on desk surface y = 0)
  // ---------------------------------------------------------------------------
  const mouse = new THREE.Group();
  mouse.name = 'Mouse';

  // Ergonomic mouse: 0.1 x 0.035 x 0.16 rounded
  const mouseBodyGeo = track(new RoundedBoxGeometry(0.10, 0.032, 0.16, 4, 0.018));
  const mouseBody = new THREE.Mesh(mouseBodyGeo, matMetalDark);
  mouseBody.position.set(0, 0.016, 0);
  mouseBody.castShadow = true;
  mouse.add(mouseBody);

  // Split seam & scroll wheel
  const wheelGeo = track(new THREE.CylinderGeometry(0.007, 0.007, 0.016, 16));
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = track(new THREE.MeshStandardMaterial({ color: 0x4dd0e1, roughness: 0.25, metalness: 0.8 }));
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.position.set(0, 0.030, 0.040);
  mouse.add(wheel);

  // Optional game controller (0.24 x 0.04 x 0.15) attached
  const controller = new THREE.Group();
  controller.name = 'GameController';
  const ctrlBodyGeo = track(new RoundedBoxGeometry(0.24, 0.038, 0.15, 3, 0.02));
  const ctrlBody = new THREE.Mesh(ctrlBodyGeo, matMetalDark);
  ctrlBody.position.set(0, 0.019, 0);
  ctrlBody.castShadow = true;
  controller.add(ctrlBody);

  // Controller thumbsticks
  const stickGeo = track(new THREE.CylinderGeometry(0.014, 0.010, 0.015, 16));
  const stickMat = track(new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.6 }));
  const stickL = new THREE.Mesh(stickGeo, stickMat);
  stickL.position.set(-0.055, 0.040, 0.015);
  controller.add(stickL);
  const stickR = new THREE.Mesh(stickGeo, stickMat);
  stickR.position.set(0.035, 0.040, -0.015);
  controller.add(stickR);
  mouse.controller = controller;

  // ---------------------------------------------------------------------------
  // 4. ARTICULATED DESK LAMP (Origin on desk surface y = 0)
  // ---------------------------------------------------------------------------
  const lamp = new THREE.Group();
  lamp.name = 'DeskLamp';

  // Base: weighted round base
  const lampBaseGeo = track(new THREE.CylinderGeometry(0.12, 0.14, 0.025, 24));
  const lampBase = new THREE.Mesh(lampBaseGeo, matMetalDark);
  lampBase.position.set(0, 0.0125, 0);
  lampBase.castShadow = true;
  lamp.add(lampBase);

  // Base switch
  const switchGeo = track(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 12));
  const switchMesh = new THREE.Mesh(switchGeo, matWarmGold);
  switchMesh.position.set(0.06, 0.030, 0.04);
  lamp.add(switchMesh);

  // Lamp base power cable curving out toward desk rear
  const lampCableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.006, -0.13),
    new THREE.Vector3(-0.04, 0.006, -0.22),
    new THREE.Vector3(-0.07, 0.006, -0.32),
    new THREE.Vector3(-0.06, 0.005, -0.42)
  ]);
  const lampCableGeo = track(new THREE.TubeGeometry(lampCableCurve, 16, 0.004, 8, false));
  const lampCable = new THREE.Mesh(lampCableGeo, matMetalDark);
  lamp.add(lampCable);

  // Lower arm knuckle joint
  const knuckleGeo = track(new THREE.SphereGeometry(0.022, 16, 16));
  const knuckle0 = new THREE.Mesh(knuckleGeo, matWarmGold);
  knuckle0.position.set(0, 0.035, 0);
  lamp.add(knuckle0);

  // Lower arm (slender twin tubes)
  const armTubeGeo = track(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 12));
  const lowerArm = new THREE.Group();
  lowerArm.position.set(0, 0.035, 0);
  lowerArm.rotation.z = -0.35;
  lowerArm.rotation.y = 0.25;

  const tube1 = new THREE.Mesh(armTubeGeo, matWarmGold);
  tube1.position.set(0.015, 0.225, 0);
  lowerArm.add(tube1);
  const tube2 = new THREE.Mesh(armTubeGeo, matWarmGold);
  tube2.position.set(-0.015, 0.225, 0);
  lowerArm.add(tube2);
  lamp.add(lowerArm);

  // Elbow joint
  const elbowPos = new THREE.Vector3(0, 0.45, 0).applyEuler(lowerArm.rotation).add(lowerArm.position);
  const knuckle1 = new THREE.Mesh(knuckleGeo, matWarmGold);
  knuckle1.position.copy(elbowPos);
  lamp.add(knuckle1);

  // Upper arm
  const upperArm = new THREE.Group();
  upperArm.position.copy(elbowPos);
  upperArm.rotation.z = 0.65;
  upperArm.rotation.y = 0.20;

  const tube3 = new THREE.Mesh(armTubeGeo, matWarmGold);
  tube3.position.set(0, 0.225, 0);
  upperArm.add(tube3);
  lamp.add(upperArm);

  // Lamp shade knuckle
  const headPos = new THREE.Vector3(0, 0.45, 0).applyEuler(upperArm.rotation).add(upperArm.position);
  const knuckle2 = new THREE.Mesh(knuckleGeo, matWarmGold);
  knuckle2.position.copy(headPos);
  lamp.add(knuckle2);

  // Conical shade
  const shadeGroup = new THREE.Group();
  shadeGroup.position.copy(headPos);
  shadeGroup.rotation.z = 1.35;
  shadeGroup.rotation.x = -0.30;

  const shadeGeo = track(new THREE.ConeGeometry(0.13, 0.22, 24, 1, true));
  const lampShade = new THREE.Mesh(shadeGeo, matWarmGold);
  lampShade.position.set(0, 0.11, 0);
  lampShade.castShadow = true;
  shadeGroup.add(lampShade);

  // Emissive inner bulb (reference exported for parent day/night recolor)
  const lampBulbMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffe082,
      emissiveIntensity: 1.6,
      roughness: 0.2
    })
  );
  const bulbGeo = track(new THREE.SphereGeometry(0.038, 16, 16));
  const bulb = new THREE.Mesh(bulbGeo, lampBulbMat);
  bulb.position.set(0, 0.08, 0);
  shadeGroup.add(bulb);
  lamp.add(shadeGroup);
  lamp.lampBulbMat = lampBulbMat;

  // ---------------------------------------------------------------------------
  // 5. ULTRAWIDE MONITOR (Origin = stand base on desk surface y = 0, +z = screen normal)
  // ---------------------------------------------------------------------------
  const monitorGroup = new THREE.Group();
  monitorGroup.name = 'MonitorGroup';

  // Stand base on desk surface
  const standBaseGeo = track(new RoundedBoxGeometry(0.42, 0.02, 0.26, 3, 0.008));
  const standBase = new THREE.Mesh(standBaseGeo, matDeskLegs);
  standBase.position.set(0, 0.01, 0);
  standBase.castShadow = true;
  monitorGroup.add(standBase);

  // Stand vertical neck
  const standPillarGeo = track(new RoundedBoxGeometry(0.08, 0.56, 0.08, 3, 0.008));
  const standPillar = new THREE.Mesh(standPillarGeo, matDeskLegs);
  standPillar.position.set(0, 0.29, -0.05);
  standPillar.castShadow = true;
  monitorGroup.add(standPillar);

  // Stand neck cable passthrough hole at y = 0.18
  const standHoleGeo = track(new THREE.CylinderGeometry(0.022, 0.022, 0.088, 16));
  standHoleGeo.rotateZ(Math.PI / 2);
  const standHoleMat = track(new THREE.MeshStandardMaterial({ color: 0x11161f, roughness: 0.9 }));
  const standHole = new THREE.Mesh(standHoleGeo, standHoleMat);
  standHole.position.set(0, 0.18, -0.05);
  monitorGroup.add(standHole);

  // Stand neck adjustment sleeve / collar at y = 0.40
  const standSleeveGeo = track(new RoundedBoxGeometry(0.096, 0.042, 0.096, 2, 0.004));
  const standSleeveMat = track(new THREE.MeshStandardMaterial({ color: 0x202736, roughness: 0.4, metalness: 0.5 }));
  const standSleeve = new THREE.Mesh(standSleeveGeo, standSleeveMat);
  standSleeve.position.set(0, 0.40, -0.05);
  monitorGroup.add(standSleeve);

  // Bevelled ultrawide frame: 1.9 x 0.95 x 0.05 at frame centre y = 0.58
  const frameGeo = track(new RoundedBoxGeometry(1.9, 0.95, 0.05, 3, 0.015));
  const monitorFrame = new THREE.Mesh(frameGeo, matMetalDark);
  monitorFrame.position.set(0, 0.58, 0);
  monitorFrame.castShadow = true;
  monitorGroup.add(monitorFrame);

  // Verbatim monitor canvas texture (1024 x 512)
  const monitorTex = makeCanvasTex((x, w, h) => {
    x.fillStyle = '#0e1b2b';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#1a3045';
    x.fillRect(0, 0, w, 36);
    x.fillStyle = '#82d9dc';
    for (let i = 0; i < 3; i++) {
      x.beginPath();
      x.arc(20 + i * 16, 18, 4, 0, Math.PI * 2);
      x.fill();
    }
    x.font = '500 28px Poppins, sans-serif';
    x.fillStyle = '#eff6ff';
    x.fillText('Chu Quang Anh', 44, 100);
    x.font = '20px Poppins, sans-serif';
    x.fillStyle = '#adbecf';
    x.fillText('Unity developer · Ha Noi', 44, 138);
    x.strokeStyle = '#34596d';
    x.strokeRect(32, 170, 465, 300);
    x.strokeRect(526, 170, 465, 300);
    x.font = '500 27px Poppins, sans-serif';
    x.fillStyle = '#8de4df';
    x.fillText('About', 58, 218);
    x.fillText('Projects', 552, 218);
    x.font = '21px Poppins, sans-serif';
    x.fillStyle = '#c2cfdd';
    x.fillText('2D / 3D / MMO / Apps', 58, 272);
    x.fillText('Unity · C# · C++', 58, 311);
    x.fillText('17 games & applications', 552, 272);
    x.fillText('5 browser-playable titles', 552, 311);
    x.fillStyle = '#173a4c';
    x.fillRect(553, 340, 410, 96);
    x.fillStyle = '#c1a56f';
    x.fillRect(573, 364, 52, 58);
    x.fillStyle = '#314f70';
    x.fillRect(640, 356, 73, 66);
    x.fillStyle = '#4f717c';
    x.fillRect(729, 376, 67, 46);
  }, 1024, 512);

  // Monitor screen plane: exactly 1.82 x 0.88 at position (0, 0.58, 0.026)
  const monitorMat = track(new THREE.MeshBasicMaterial({ map: monitorTex }));
  const monitorScreen = new THREE.Mesh(track(new THREE.PlaneGeometry(1.82, 0.88)), monitorMat);
  monitorScreen.position.set(0, 0.58, 0.026);
  monitorGroup.add(monitorScreen);

  // Beautiful BACK SHELL details (for the prominent camera perspective)
  const rearHumpGeo = track(new RoundedBoxGeometry(0.85, 0.58, 0.045, 3, 0.015));
  const rearHump = new THREE.Mesh(rearHumpGeo, matMetalDark);
  rearHump.position.set(0, 0.58, -0.045);
  rearHump.castShadow = true;
  monitorGroup.add(rearHump);

  // Rear cooling vent slats (using InstancedMesh)
  const ventBarGeo = track(new THREE.BoxGeometry(0.65, 0.008, 0.006));
  const ventBarMat = track(new THREE.MeshStandardMaterial({ color: 0x131a24, roughness: 0.8 }));
  const ventInstMesh = track(new THREE.InstancedMesh(ventBarGeo, ventBarMat, 10));
  const ventDummy = new THREE.Object3D();
  for (let vi = 0; vi < 10; vi++) {
    ventDummy.position.set(0, 0.76 - vi * 0.018, -0.068);
    ventDummy.updateMatrix();
    ventInstMesh.setMatrixAt(vi, ventDummy.matrix);
  }
  ventInstMesh.instanceMatrix.needsUpdate = true;
  monitorGroup.add(ventInstMesh);

  // Rear recessed port cluster
  const portBayGeo = track(new RoundedBoxGeometry(0.24, 0.08, 0.015, 2, 0.004));
  const portBayMat = track(new THREE.MeshStandardMaterial({ color: 0x0f141c, roughness: 0.9 }));
  const portBay = new THREE.Mesh(portBayGeo, portBayMat);
  portBay.position.set(0, 0.44, -0.065);
  monitorGroup.add(portBay);

  // Port plugs (HDMI/DP/USB) inside the bay
  const portGeo = track(new THREE.BoxGeometry(0.025, 0.012, 0.008));
  const portGoldMat = track(new THREE.MeshStandardMaterial({ color: 0xcca050, metalness: 0.9, roughness: 0.2 }));
  for (let pi = 0; pi < 3; pi++) {
    const port = new THREE.Mesh(portGeo, portGoldMat);
    port.position.set(-0.06 + pi * 0.06, 0.44, -0.071);
    monitorGroup.add(port);
  }

  // Soft teal emissive rim strip along the bottom/back edge (<= 0.3 emissive)
  const rearGlowMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1a4548,
      emissive: 0x227778,
      emissiveIntensity: 0.28,
      roughness: 0.4
    })
  );
  const rearGlowGeo = track(new RoundedBoxGeometry(0.86, 0.012, 0.015, 2, 0.004));
  const rearGlow = new THREE.Mesh(rearGlowGeo, rearGlowMat);
  rearGlow.position.set(0, 0.30, -0.060);
  monitorGroup.add(rearGlow);

  // Tiny front power LED on bezel
  const pwrLedGeo = track(new THREE.SphereGeometry(0.004, 12, 12));
  const pwrLedMat = track(new THREE.MeshBasicMaterial({ color: 0x38e2d4 }));
  const pwrLed = new THREE.Mesh(pwrLedGeo, pwrLedMat);
  pwrLed.position.set(0.90, 0.12, 0.026);
  monitorGroup.add(pwrLed);

  const monitor = {
    group: monitorGroup,
    screen: monitorScreen,
    frame: monitorFrame
  };

  // ---------------------------------------------------------------------------
  // 6. AUDIO TABLE & SMART SPEAKER (Origin = floor y = 0, front +z)
  // ---------------------------------------------------------------------------
  const audioTableGroup = new THREE.Group();
  audioTableGroup.name = 'AudioTable';

  // LOW side table / credenza: 1.1 wide x 0.45 deep x 0.62 high
  const tableTopY = 0.62;
  const tableTopThickness = 0.03;
  const tableTopGeo = track(new RoundedBoxGeometry(1.10, tableTopThickness, 0.45, 3, 0.012));
  const tableTopMat = track(new THREE.MeshStandardMaterial({ color: 0x544032, roughness: 0.4, metalness: 0.15 }));
  const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
  tableTop.position.set(0, tableTopY - tableTopThickness / 2, 0); // top surface is at 0.620
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  audioTableGroup.add(tableTop);

  // Dark carcass cabinet under tabletop (from y = 0.22 to 0.59)
  const carcassGeo = track(new RoundedBoxGeometry(1.02, 0.37, 0.41, 3, 0.012));
  const carcass = new THREE.Mesh(carcassGeo, matMetalDark);
  carcass.position.set(0, 0.405, 0);
  carcass.castShadow = true;
  audioTableGroup.add(carcass);

  // Brass vertical handles on credenza doors
  const handleGeo = track(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 12));
  const handleL = new THREE.Mesh(handleGeo, matWarmGold);
  handleL.position.set(-0.06, 0.405, 0.21);
  audioTableGroup.add(handleL);
  const handleR = new THREE.Mesh(handleGeo, matWarmGold);
  handleR.position.set(0.06, 0.405, 0.21);
  audioTableGroup.add(handleR);

  // 4 tapered legs touching floor y = 0
  const tableLegGeo = track(new THREE.CylinderGeometry(0.024, 0.015, 0.22, 16));
  const legX = 0.45, legZ = 0.16;
  [[-legX, -legZ], [legX, -legZ], [-legX, legZ], [legX, legZ]].forEach(([tx, tz]) => {
    const leg = new THREE.Mesh(tableLegGeo, matDeskLegs);
    leg.position.set(tx, 0.11, tz);
    leg.castShadow = true;
    audioTableGroup.add(leg);

    const ferrule = new THREE.Mesh(track(new THREE.CylinderGeometry(0.016, 0.015, 0.03, 16)), matWarmGold);
    ferrule.position.set(tx, 0.015, tz);
    audioTableGroup.add(ferrule);
  });

  // Smart Speaker (origin = base on tabletop y = 0.62)
  const speakerGroup = new THREE.Group();
  speakerGroup.name = 'HVLSmartSpeaker';
  speakerGroup.position.set(-0.22, tableTopY, 0.0); // stands ON the audio table

  // Cabinet: 0.54 x 0.47 x 0.28 with bevel. Top of speaker = 0.62 + 0.47 = 1.09 <= 1.12
  const spkWidth = 0.54, spkHeight = 0.47, spkDepth = 0.28;
  const spkGeo = track(new RoundedBoxGeometry(spkWidth, spkHeight, spkDepth, 3, 0.018));
  const spkMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x243545,
      emissive: 0x12222e,
      emissiveIntensity: 0.2,
      roughness: 0.65,
      metalness: 0.25
    })
  );
  const speakerCabinet = new THREE.Mesh(spkGeo, spkMat);
  speakerCabinet.position.set(0, spkHeight / 2, 0);
  speakerCabinet.castShadow = true;
  speakerGroup.add(speakerCabinet);

  // Visible audio drivers on front (+z): Woofer & Tweeter
  const driverRimMat = track(new THREE.MeshStandardMaterial({ color: 0xcca865, metalness: 0.85, roughness: 0.25 }));
  const coneMat = track(new THREE.MeshStandardMaterial({ color: 0x111922, roughness: 0.7 }));

  // Woofer (lower driver)
  const wooferRim = new THREE.Mesh(track(new THREE.TorusGeometry(0.075, 0.007, 12, 32)), driverRimMat);
  wooferRim.position.set(0, 0.14, spkDepth / 2 + 0.002);
  speakerGroup.add(wooferRim);
  const wooferCone = new THREE.Mesh(track(new THREE.CylinderGeometry(0.072, 0.02, 0.018, 24)), coneMat);
  wooferCone.rotation.x = Math.PI / 2;
  wooferCone.position.set(0, 0.14, spkDepth / 2);
  speakerGroup.add(wooferCone);

  // 3 rotary dials/knobs
  const knobGeo = track(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 16));
  knobGeo.rotateX(Math.PI / 2);
  for (let ki = 0; ki < 3; ki++) {
    const knob = new THREE.Mesh(knobGeo, matWarmGold);
    knob.position.set(-0.06 + ki * 0.06, 0.445, spkDepth / 2 + 0.006);
    speakerGroup.add(knob);
  }

  // Isolation feet under speaker
  const spkFootGeo = track(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 16));
  [[-0.22, -0.10], [0.22, -0.10], [-0.22, 0.10], [0.22, 0.10]].forEach(([fx, fz]) => {
    const foot = new THREE.Mesh(spkFootGeo, footMat);
    foot.position.set(fx, 0.004, fz);
    speakerGroup.add(foot);
  });

  // Verbatim music screen canvas texture (640 x 390)
  const musicScreenTex = makeCanvasTex((x, w, h) => {
    x.fillStyle = '#102330';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#1a3749';
    x.fillRect(28, 58, 230, 130);
    x.font = '500 44px Poppins, sans-serif';
    x.fillStyle = '#b1e6df';
    x.fillText('LOCAL AUDIO', 292, 104);
    x.font = '23px Poppins, sans-serif';
    x.fillStyle = '#dbe6ee';
    x.fillText('Playlist Player', 292, 146);
    x.font = '19px Poppins, sans-serif';
    x.fillStyle = '#aac7cc';
    x.fillText('Ready', 292, 185);
  }, 640, 390);

  // Music screen plane: 0.46 x 0.34 at local (0, 0.275, 0.143)
  const musicScreen = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.46, 0.34)),
    track(new THREE.MeshBasicMaterial({ map: musicScreenTex }))
  );
  musicScreen.position.set(0, 0.275, 0.143);
  speakerGroup.add(musicScreen);
  audioTableGroup.add(speakerGroup);

  const audioTable = {
    group: audioTableGroup,
    speaker: speakerGroup,
    musicScreen
  };

  // ---------------------------------------------------------------------------
  // 7. PHONE WITH FLIP API (Origin = centre of footprint on desk surface y = 0)
  // ---------------------------------------------------------------------------
  const phoneGroup = new THREE.Group();
  phoneGroup.name = 'DeskPhone';

  const phoneW = 0.22;
  const phoneL = 0.42;
  const phoneT = 0.03;

  // Pivot along the bottom edge (z = -phoneL / 2)
  const phonePivot = new THREE.Group();
  phonePivot.position.set(0, 0, -phoneL / 2);
  phoneGroup.add(phonePivot);

  // Body inside pivot: center at y = phoneT / 2, z = phoneL / 2
  const phoneBodyGeo = track(new RoundedBoxGeometry(phoneW, phoneT, phoneL, 3, 0.015));

  const phoneBodyMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1f303c,
      metalness: 0.7,
      roughness: 0.2
    })
  );
  const phoneBody = new THREE.Mesh(phoneBodyGeo, phoneBodyMat);
  phoneBody.name = 'PhoneBody';
  phoneBody.position.set(0, phoneT / 2, phoneL / 2);
  phoneBody.castShadow = true;
  phonePivot.add(phoneBody);

  // Camera island on back shell (+y face when face down)
  const camBumpGeo = track(new RoundedBoxGeometry(0.075, 0.004, 0.09, 2, 0.006));
  const camBump = new THREE.Mesh(camBumpGeo, matMetalDark);
  camBump.position.set(0.05, phoneT + 0.002, phoneL / 2 + 0.14);
  phonePivot.add(camBump);

  // 3 camera lens rings
  const lensGeo = track(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 16));
  const lensMat = track(new THREE.MeshStandardMaterial({ color: 0x05070a, metalness: 0.9, roughness: 0.1 }));
  const lensRimMat = track(new THREE.MeshStandardMaterial({ color: 0x82d9dc, metalness: 0.8, roughness: 0.3 }));
  for (let li = 0; li < 3; li++) {
    const lx = 0.05;
    const lz = phoneL / 2 + 0.11 + li * 0.028;
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(lx, phoneT + 0.005, lz);
    phonePivot.add(lens);
    const rim = new THREE.Mesh(track(new THREE.TorusGeometry(0.012, 0.002, 8, 20)), lensRimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(lx, phoneT + 0.006, lz);
    phonePivot.add(rim);
  }

  // Side buttons
  const pwrBtnGeo = track(new THREE.BoxGeometry(0.004, 0.006, 0.05));
  const pwrBtn = new THREE.Mesh(pwrBtnGeo, matMetalDark);
  pwrBtn.position.set(-phoneW / 2 - 0.002, phoneT / 2, phoneL / 2);
  phonePivot.add(pwrBtn);

  // Verbatim phone canvas texture (360 x 780)
  const phoneTex = makeCanvasTex((x, w, h) => {
    x.fillStyle = '#102a39';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#a0e3dc';
    x.font = '500 32px Poppins, sans-serif';
    x.fillText('Contact', 30, 68);
    x.fillStyle = '#d5e0eb';
    x.font = '22px Poppins, sans-serif';
    x.fillText('Chu Quang Anh', 30, 121);
    ['Name', 'Email', 'Message'].forEach((s, i) => {
      x.fillStyle = '#9cb8c7';
      x.fillText(s, 30, 210 + i * 130);
      x.strokeStyle = '#456472';
      x.strokeRect(28, 230 + i * 130, w - 56, i === 2 ? 115 : 65);
    });
    x.fillStyle = '#71c7c9';
    x.fillRect(28, h - 94, w - 56, 52);
    x.fillStyle = '#122736';
    x.fillText('Send message', 40, h - 60);
  }, 360, 780);

  // Screen plane: 0.19 x 0.37 on underside facing -y at rest
  const phoneScreenGeo = track(new THREE.PlaneGeometry(0.19, 0.37));
  const phoneScreenMat = track(new THREE.MeshBasicMaterial({ map: phoneTex }));
  const phoneScreen = new THREE.Mesh(phoneScreenGeo, phoneScreenMat);
  phoneScreen.rotation.x = Math.PI / 2; // Normal faces (0, -1, 0)
  phoneScreen.position.set(0, -0.0008, phoneL / 2); // PO fix: was +0.0005 = inside the body, hidden by its underside when flipped up
  phonePivot.add(phoneScreen);

  // Flip API:
  // t=0 => resting face down (screen normal -y, min y >= -0.001)
  // t=1 => tilted upright facing +z, screen normal ~+z, bottom edge touches y=0
  const maxFlipAngle = Math.PI / 2 + 0.18; // ~100 degrees
  function setFlip(t) {
    const clampedT = Math.max(0, Math.min(1, t));
    const angle = clampedT * maxFlipAngle;
    const lift = Math.max(0, -phoneT * Math.cos(angle));
    phonePivot.position.set(0, lift, -phoneL / 2);
    phonePivot.rotation.x = -angle;
    phoneGroup.updateMatrixWorld(true);
  }
  setFlip(0); // Start face down

  const phone = {
    group: phoneGroup,
    screen: phoneScreen,
    setFlip
  };

  // ---------------------------------------------------------------------------
  // 8. POTTED SUCCULENT PLANT (Origin on desk surface y = 0)
  // ---------------------------------------------------------------------------
  const plant = new THREE.Group();
  plant.name = 'SucculentPlant';

  // Terracotta pot (tapered cylinder)
  const potGeo = track(new THREE.CylinderGeometry(0.055, 0.038, 0.085, 20));
  const potMat = track(new THREE.MeshStandardMaterial({ color: 0x935c44, roughness: 0.75, metalness: 0.05 }));
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.set(0, 0.0425, 0);
  pot.castShadow = true;
  plant.add(pot);

  // Pot rim lip
  const potRimGeo = track(new THREE.CylinderGeometry(0.060, 0.057, 0.016, 20));
  const potRim = new THREE.Mesh(potRimGeo, potMat);
  potRim.position.set(0, 0.077, 0);
  plant.add(potRim);

  // Dark potting soil
  const soilGeo = track(new THREE.CylinderGeometry(0.053, 0.053, 0.01, 16));
  const soilMat = track(new THREE.MeshStandardMaterial({ color: 0x221812, roughness: 0.9 }));
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.set(0, 0.078, 0);
  plant.add(soil);

  // Low-poly succulent leaves rosette
  const leafGeo = track(new THREE.ConeGeometry(0.018, 0.055, 4));
  leafGeo.scale(0.8, 1.0, 0.35); // Flatten into leaf prism
  const leafMat = track(new THREE.MeshStandardMaterial({ color: 0x5fa887, roughness: 0.55, metalness: 0.1 }));
  const leafTipMat = track(new THREE.MeshStandardMaterial({ color: 0x82cbb0, roughness: 0.5, metalness: 0.1 }));

  // Two tiers of spiraling fleshy leaves
  for (let ring = 0; ring < 2; ring++) {
    const leafCount = ring === 0 ? 8 : 6;
    const radius = ring === 0 ? 0.032 : 0.018;
    const yOffset = ring === 0 ? 0.088 : 0.098;
    const tilt = ring === 0 ? 0.65 : 0.35;
    const scale = ring === 0 ? 1.0 : 0.75;
    for (let li = 0; li < leafCount; li++) {
      const theta = (li / leafCount) * Math.PI * 2 + (ring * 0.4);
      const leaf = new THREE.Mesh(leafGeo, ring === 0 ? leafMat : leafTipMat);
      leaf.position.set(Math.cos(theta) * radius, yOffset, Math.sin(theta) * radius);
      leaf.rotation.y = -theta;
      leaf.rotation.z = -tilt;
      leaf.scale.setScalar(scale);
      leaf.castShadow = true;
      plant.add(leaf);
    }
  }

  // Center sprout leaf
  const centerLeaf = new THREE.Mesh(leafGeo, leafTipMat);
  centerLeaf.position.set(0, 0.115, 0);
  centerLeaf.scale.setScalar(0.6);
  plant.add(centerLeaf);

  // ---------------------------------------------------------------------------
  // RETURN INTERFACE
  // ---------------------------------------------------------------------------
  return {
    desk,
    keyboard,
    mouse,
    lamp,
    lampBulbMat,
    monitor,
    audioTable,
    phone,
    plant,
    mug: mugGroup,
    notebook: notebookGroup,
    LAYOUT
  };
}
