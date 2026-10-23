import * as THREE from 'three';
import { RoundedBoxGeometry as FallbackRoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const LAYOUT = {
  bookshelf: { x: 3.9, y: 0.0, z: -3.0 },
  floorPlant: { x: -3.9, y: 0.0, z: -2.7 },
  floorLamp: { x: 3.3, y: 0.0, z: 0.2 },
  cat: { x: -1.9, y: 0.0, z: 1.5 },
  wallFrames: [
    { x: 1.30, y: 2.80, z: -3.09 },
    { x: 2.10, y: 2.85, z: -3.09 },
    { x: 2.85, y: 2.75, z: -3.09 }
  ],
  cableBundles: { x: 0.0, y: 0.0, z: -0.55 },
  baseboards: { y: 0.0 }
};

export function buildRoomDressing(ctx) {
  const { track, makeCanvasTex, mats } = ctx;
  const RoundedBoxGeometry = ctx.RoundedBoxGeometry || FallbackRoundedBoxGeometry;

  const matMetalDark = mats.metalDark;
  const matDeskLegs = mats.deskLegs;
  const matWarmGold = mats.warmGold;
  const matRug = mats.rug;

  const dressingGroup = new THREE.Group();
  dressingGroup.name = 'RoomDressing';

  const contactShadows = [];

  // ===========================================================================
  // 1. WOOD FLOOR PLANKS (InstancedMesh continuing beneath the raised rug)
  // ===========================================================================

  const plankW = 1.20;
  const plankD = 0.18;
  const plankH = 0.002;
  const gapX = 0.012;
  const gapZ = 0.008;

  const plankGeo = track(new THREE.BoxGeometry(plankW, plankH, plankD));
  const plankMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xb49a7f,
      roughness: 0.68,
      metalness: 0.08
    })
  );

  const plankMatrices = [];
  const plankColors = [
    new THREE.Color(0xbba085),
    new THREE.Color(0xb2977d),
    new THREE.Color(0xc2a78d),
    new THREE.Color(0xaa8f75),
    new THREE.Color(0xb79c81),
    new THREE.Color(0xa58b71)
  ];
  const plankColorIndices = [];

  const dummy = new THREE.Object3D();
  let rowIdx = 0;
  for (let z = -3.5; z <= 6.3; z += plankD + gapZ) {
    // Stagger alternate plank rows along x
    const xOffset = (rowIdx % 2) * (plankW * 0.45);
    for (let x = -4.4 + xOffset; x <= 4.4; x += plankW + gapX) {
      // ponytail: let the opaque rug occlude boards rather than excluding whole crossing boards.
      dummy.position.set(x, plankH / 2, z);
      dummy.updateMatrix();
      plankMatrices.push(dummy.matrix.clone());
      plankColorIndices.push((plankMatrices.length + rowIdx * 3) % plankColors.length);
    }
    rowIdx++;
  }

  const plankInstMesh = track(new THREE.InstancedMesh(plankGeo, plankMat, plankMatrices.length));
  plankInstMesh.name = 'WoodFloorPlanks';
  plankMatrices.forEach((mat, idx) => {
    plankInstMesh.setMatrixAt(idx, mat);
    plankInstMesh.setColorAt(idx, plankColors[plankColorIndices[idx]]);
  });
  plankInstMesh.instanceMatrix.needsUpdate = true;
  if (plankInstMesh.instanceColor) plankInstMesh.instanceColor.needsUpdate = true;
  plankInstMesh.receiveShadow = true;
  dressingGroup.add(plankInstMesh);

  // ===========================================================================
  // 2. BASEBOARD STRIPS (along window wall z = -3.2 and left wall x = -4.5)
  // Height 0.08, bevelled RoundedBox - sitting on room-facing surface of walls
  // ===========================================================================
  const baseboardGroup = new THREE.Group();
  baseboardGroup.name = 'Baseboards';
  const baseboardMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x242a38,
      roughness: 0.5,
      metalness: 0.2
    })
  );

  // Window wall baseboard (sits on room-facing surface of back wall at z = -3.10)
  // Thickness 0.016, half-thickness 0.008 -> center z = -3.092
  const bbWinLen = 9.40;
  const bbWinGeo = track(new RoundedBoxGeometry(bbWinLen, 0.08, 0.016, 2, 0.003));
  const bbWin = new THREE.Mesh(bbWinGeo, baseboardMat);
  bbWin.position.set(-4.40 + bbWinLen / 2, 0.04, -3.092);
  baseboardGroup.add(bbWin);

  // Left wall baseboard (sits on room-facing surface of left wall at x = -4.40)
  // Thickness 0.016, half-thickness 0.008 -> center x = -4.392
  const bbLeftLen = 9.40;
  const bbLeftGeo = track(new RoundedBoxGeometry(0.016, 0.08, bbLeftLen, 2, 0.003));
  const bbLeft = new THREE.Mesh(bbLeftGeo, baseboardMat);
  bbLeft.position.set(-4.392, 0.04, -3.10 + bbLeftLen / 2);
  baseboardGroup.add(bbLeft);

  dressingGroup.add(baseboardGroup);

  // ===========================================================================
  // 3. BOOKSHELF with ~40 InstancedMesh books + 2 decor pieces
  // Position: x = 3.9, z = -3.0, 1.2 wide x 1.9 high x 0.32 deep
  // ===========================================================================
  const bookshelfGroup = new THREE.Group();
  bookshelfGroup.name = 'Bookshelf';
  bookshelfGroup.position.set(LAYOUT.bookshelf.x, LAYOUT.bookshelf.y, LAYOUT.bookshelf.z);

  const shelfMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x302821,
      roughness: 0.65,
      metalness: 0.15
    })
  );

  const shelfW = 1.20;
  const shelfH = 1.90;
  const shelfD = 0.32;
  const panelT = 0.03;

  // Left & right upright side panels
  const sideGeo = track(new RoundedBoxGeometry(panelT, shelfH, shelfD, 2, 0.006));
  const sideL = new THREE.Mesh(sideGeo, shelfMat);
  sideL.position.set(-shelfW / 2 + panelT / 2, shelfH / 2, 0);
  sideL.castShadow = true;
  bookshelfGroup.add(sideL);

  const sideR = new THREE.Mesh(sideGeo, shelfMat);
  sideR.position.set(shelfW / 2 - panelT / 2, shelfH / 2, 0);
  sideR.castShadow = true;
  bookshelfGroup.add(sideR);

  // Top and bottom boards
  const topBottomGeo = track(new RoundedBoxGeometry(shelfW, panelT, shelfD, 2, 0.006));
  const bottomBoard = new THREE.Mesh(topBottomGeo, shelfMat);
  bottomBoard.position.set(0, panelT / 2, 0);
  bottomBoard.castShadow = true;
  bookshelfGroup.add(bottomBoard);

  const topBoard = new THREE.Mesh(topBottomGeo, shelfMat);
  topBoard.position.set(0, shelfH - panelT / 2, 0);
  topBoard.castShadow = true;
  bookshelfGroup.add(topBoard);

  // Back panel
  const backGeo = track(new THREE.BoxGeometry(shelfW - panelT * 2, shelfH - panelT * 2, 0.015));
  const backPanel = new THREE.Mesh(backGeo, shelfMat);
  backPanel.position.set(0, shelfH / 2, -shelfD / 2 + 0.008);
  bookshelfGroup.add(backPanel);

  // 4 Shelves inside
  const shelfYPositions = [0.40, 0.78, 1.16, 1.54];
  const innerShelfGeo = track(new RoundedBoxGeometry(shelfW - panelT * 2, 0.02, shelfD - 0.02, 2, 0.004));

  shelfYPositions.forEach(sy => {
    const shelfMesh = new THREE.Mesh(innerShelfGeo, shelfMat);
    shelfMesh.position.set(0, sy - 0.01, 0.005);
    shelfMesh.castShadow = true;
    shelfMesh.receiveShadow = true;
    bookshelfGroup.add(shelfMesh);
  });

  // ~40 Books via InstancedMesh (no text)
  // Colors: pale sage, teal, warm-gold, slate
  const bookPalette = [
    new THREE.Color(0x7ea894),
    new THREE.Color(0x38c4ba),
    new THREE.Color(0xffb74d),
    new THREE.Color(0x4a5568),
    new THREE.Color(0x94a3b8),
    new THREE.Color(0x5c7f71),
    new THREE.Color(0xcca050)
  ];

  const bookGeo = track(new RoundedBoxGeometry(0.038, 0.24, 0.20, 2, 0.004));
  const bookMat = track(new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 }));

  const bookMatrices = [];
  const bookColors = [];

  // Shelf 1 (y = 0.40): 11 books
  for (let b = 0; b < 11; b++) {
    const bx = -0.48 + b * 0.042;
    dummy.position.set(bx, 0.40 + 0.12, 0.01);
    dummy.rotation.set(0, 0, b === 10 ? 0.18 : 0);
    dummy.updateMatrix();
    bookMatrices.push(dummy.matrix.clone());
    bookColors.push(bookPalette[b % bookPalette.length]);
  }

  // Shelf 2 (y = 0.78): 12 books
  for (let b = 0; b < 12; b++) {
    const bx = -0.05 + b * 0.044;
    dummy.position.set(bx, 0.78 + 0.12, 0.01);
    dummy.rotation.set(0, 0, b === 0 ? -0.15 : 0);
    dummy.updateMatrix();
    bookMatrices.push(dummy.matrix.clone());
    bookColors.push(bookPalette[(b + 2) % bookPalette.length]);
  }

  // Shelf 3 (y = 1.16): 9 books
  for (let b = 0; b < 9; b++) {
    const bx = -0.15 + b * 0.044;
    dummy.position.set(bx, 1.16 + 0.12, 0.01);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    bookMatrices.push(dummy.matrix.clone());
    bookColors.push(bookPalette[(b + 4) % bookPalette.length]);
  }

  // Shelf 4 (y = 1.54): 8 books
  for (let b = 0; b < 8; b++) {
    const bx = -0.46 + b * 0.043;
    dummy.position.set(bx, 1.54 + 0.12, 0.01);
    dummy.rotation.set(0, 0, b === 7 ? 0.22 : 0);
    dummy.updateMatrix();
    bookMatrices.push(dummy.matrix.clone());
    bookColors.push(bookPalette[(b + 1) % bookPalette.length]);
  }

  const bookInstMesh = track(new THREE.InstancedMesh(bookGeo, bookMat, bookMatrices.length));
  bookInstMesh.name = 'BookshelfBooks';
  bookMatrices.forEach((bm, i) => {
    bookInstMesh.setMatrixAt(i, bm);
    bookInstMesh.setColorAt(i, bookColors[i]);
  });
  bookInstMesh.instanceMatrix.needsUpdate = true;
  if (bookInstMesh.instanceColor) bookInstMesh.instanceColor.needsUpdate = true;
  bookInstMesh.castShadow = true;
  bookshelfGroup.add(bookInstMesh);

  // Decor 1: Small plant pot on Shelf 3 (y = 1.16)
  const decorPot = new THREE.Group();
  decorPot.name = 'ShelfPlantPot';
  decorPot.position.set(-0.35, 1.16, 0.02);
  const potGeo = track(new THREE.CylinderGeometry(0.042, 0.030, 0.075, 16));
  const potMat = track(new THREE.MeshStandardMaterial({ color: 0x9e583c, roughness: 0.7 }));
  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.position.set(0, 0.075 / 2, 0);
  decorPot.add(potMesh);

  const plantLeafMat = track(new THREE.MeshStandardMaterial({ color: 0x488365, roughness: 0.5 }));
  const leafGeo = track(new THREE.ConeGeometry(0.018, 0.05, 4));
  for (let li = 0; li < 5; li++) {
    const ang = (li / 5) * Math.PI * 2;
    const lf = new THREE.Mesh(leafGeo, plantLeafMat);
    lf.position.set(Math.cos(ang) * 0.025, 0.08, Math.sin(ang) * 0.025);
    lf.rotation.set(Math.sin(ang) * 0.4, -ang, Math.cos(ang) * 0.4);
    decorPot.add(lf);
  }
  bookshelfGroup.add(decorPot);

  // Decor 2: Small robot-head figurine on Shelf 4 (y = 1.54)
  const figurine = new THREE.Group();
  figurine.name = 'ShelfRobotFigurine';
  figurine.position.set(0.35, 1.54, 0.02);
  const headGeo = track(new RoundedBoxGeometry(0.085, 0.075, 0.070, 2, 0.008));
  const headMat = track(new THREE.MeshStandardMaterial({ color: 0xdde2eb, roughness: 0.35, metalness: 0.2 }));
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.position.set(0, 0.075 / 2, 0);
  headMesh.castShadow = true;
  figurine.add(headMesh);

  const antennaGeo = track(new THREE.CylinderGeometry(0.003, 0.003, 0.035, 8));
  const antennaMesh = new THREE.Mesh(antennaGeo, matWarmGold);
  antennaMesh.position.set(0, 0.075 + 0.035 / 2, 0);
  figurine.add(antennaMesh);
  bookshelfGroup.add(figurine);

  dressingGroup.add(bookshelfGroup);

  // ===========================================================================
  // 4. TALL FLOOR PLANT (left-back corner x = -3.9, z = -2.7)
  // Pot + 6 leaves bunches
  // ===========================================================================
  const floorPlantGroup = new THREE.Group();
  floorPlantGroup.name = 'FloorPlant';
  floorPlantGroup.position.set(LAYOUT.floorPlant.x, LAYOUT.floorPlant.y, LAYOUT.floorPlant.z);

  const floorPotH = 0.50;
  const floorPotGeo = track(new THREE.CylinderGeometry(0.24, 0.17, floorPotH, 20));
  const floorPotMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.45,
      metalness: 0.1
    })
  );
  const floorPot = new THREE.Mesh(floorPotGeo, floorPotMat);
  floorPot.position.set(0, floorPotH / 2, 0);
  floorPot.castShadow = true;
  floorPlantGroup.add(floorPot);

  // Soil inside pot
  const floorSoilGeo = track(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16));
  const floorSoilMat = track(new THREE.MeshStandardMaterial({ color: 0x1f1915, roughness: 0.9 }));
  const floorSoil = new THREE.Mesh(floorSoilGeo, floorSoilMat);
  floorSoil.position.set(0, floorPotH - 0.01, 0);
  floorPlantGroup.add(floorSoil);

  // 6 Leaf bunches arching out
  const stemMat = track(new THREE.MeshStandardMaterial({ color: 0x2e5c43, roughness: 0.5 }));
  const bigLeafMat = track(new THREE.MeshStandardMaterial({ color: 0x3d7a58, roughness: 0.45, side: THREE.DoubleSide }));

  for (let fi = 0; fi < 6; fi++) {
    const angle = (fi / 6) * Math.PI * 2 + 0.2;
    const leafBunch = new THREE.Group();
    leafBunch.position.set(0, floorPotH - 0.02, 0);
    leafBunch.rotation.y = angle;

    // Arching stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.06, 0.35, 0.0),
      new THREE.Vector3(0.16, 0.75, 0.0),
      new THREE.Vector3(0.25, 1.05, 0.0)
    ]);
    const stemGeo = track(new THREE.TubeGeometry(stemCurve, 12, 0.008, 6, false));
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.castShadow = true;
    leafBunch.add(stemMesh);

    // Broad tropical leaf blade
    const bladeGeo = track(new THREE.ConeGeometry(0.12, 0.38, 5));
    bladeGeo.scale(1.0, 1.0, 0.12);
    const blade = new THREE.Mesh(bladeGeo, bigLeafMat);
    blade.position.set(0.30, 1.15, 0.0);
    blade.rotation.set(0, 0, -0.9);
    blade.castShadow = true;
    leafBunch.add(blade);

    floorPlantGroup.add(leafBunch);
  }

  dressingGroup.add(floorPlantGroup);

  // ===========================================================================
  // 5. FLOOR LAMP (x = 3.3, z = 0.2)
  // Round base, thin pole, drum shade, emissive bulb inside (emissiveIntensity <= 0.6)
  // ===========================================================================
  const floorLampGroup = new THREE.Group();
  floorLampGroup.name = 'FloorLamp';
  floorLampGroup.position.set(LAYOUT.floorLamp.x, LAYOUT.floorLamp.y, LAYOUT.floorLamp.z);

  // Base on floor
  const flBaseGeo = track(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 24));
  const flBase = new THREE.Mesh(flBaseGeo, matMetalDark);
  flBase.position.set(0, 0.0125, 0);
  flBase.castShadow = true;
  floorLampGroup.add(flBase);

  // Thin vertical pole
  const flPoleH = 1.55;
  const flPoleGeo = track(new THREE.CylinderGeometry(0.012, 0.012, flPoleH, 16));
  const flPole = new THREE.Mesh(flPoleGeo, matWarmGold);
  flPole.position.set(0, 0.025 + flPoleH / 2, 0);
  flPole.castShadow = true;
  floorLampGroup.add(flPole);

  // Drum shade
  const shadeH = 0.32;
  const shadeGeo = track(new THREE.CylinderGeometry(0.20, 0.22, shadeH, 24, 1, true));
  const shadeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf6f1e7,
      roughness: 0.85,
      side: THREE.DoubleSide
    })
  );
  const flShade = new THREE.Mesh(shadeGeo, shadeMat);
  flShade.position.set(0, 1.55, 0);
  flShade.castShadow = true;
  floorLampGroup.add(flShade);

  // Emissive bulb INSIDE shade (emissiveIntensity <= 0.6)
  const bulbMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffe29a,
      emissiveIntensity: 0.52,
      roughness: 0.2
    })
  );
  const bulbGeo = track(new THREE.SphereGeometry(0.045, 16, 16));
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(0, 1.55, 0);
  floorLampGroup.add(bulb);

  dressingGroup.add(floorLampGroup);

  // ===========================================================================
  // 6. LOW CAT SLEEPING ON THE RUG (x = -1.9, z = 1.5)
  // Small (0.5 long), warm grey, rounded boxes + spheres
  // ===========================================================================
  const catGroup = new THREE.Group();
  catGroup.name = 'SleepingCat';
  catGroup.position.set(LAYOUT.cat.x, LAYOUT.cat.y, LAYOUT.cat.z);

  const catMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x8e8781,
      roughness: 0.82,
      metalness: 0.05
    })
  );

  // Curled sleeping body
  const catBodyGeo = track(new RoundedBoxGeometry(0.28, 0.13, 0.19, 3, 0.04));
  const catBody = new THREE.Mesh(catBodyGeo, catMat);
  catBody.position.set(0, 0.065, 0);
  catBody.rotation.y = 0.25;
  catBody.castShadow = true;
  catGroup.add(catBody);

  // Sleeping head tucked near front-left
  const catHeadGeo = track(new THREE.SphereGeometry(0.072, 16, 16));
  const catHead = new THREE.Mesh(catHeadGeo, catMat);
  catHead.position.set(-0.13, 0.070, 0.08);
  catHead.scale.set(1.0, 0.9, 0.95);
  catGroup.add(catHead);

  // Two tiny ears
  const earGeo = track(new THREE.ConeGeometry(0.022, 0.032, 4));
  const earL = new THREE.Mesh(earGeo, catMat);
  earL.position.set(-0.16, 0.135, 0.05);
  earL.rotation.set(-0.2, 0, 0.4);
  catGroup.add(earL);

  const earR = new THREE.Mesh(earGeo, catMat);
  earR.position.set(-0.11, 0.135, 0.12);
  earR.rotation.set(0.3, 0, 0.2);
  catGroup.add(earR);

  // Tail curled along side
  const tailGeo = track(new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI * 0.95));
  const tail = new THREE.Mesh(tailGeo, catMat);
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0.06, 0.025, -0.06);
  catGroup.add(tail);

  dressingGroup.add(catGroup);

  // ===========================================================================
  // 7. ABSTRACT WALL FRAMES (3 colour-block rectangles, NO TEXT)
  // Window wall at z = -3.2, frames on wall right of window: x 0.9..3.2, y 2.2..3.4
  // ===========================================================================
  const wallFramesGroup = new THREE.Group();
  wallFramesGroup.name = 'AbstractWallFrames';

  const frameMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.5,
      metalness: 0.3
    })
  );

  // Canvas 1 (Abstract Geometric Blocks in Sage / Gold / Off-white / Slate)
  const artTex1 = makeCanvasTex((c, w, h) => {
    c.fillStyle = '#eae6dd';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#658d7c';
    c.fillRect(40, 50, w * 0.55, h * 0.42);
    c.fillStyle = '#dfad5c';
    c.fillRect(w * 0.45, h * 0.32, w * 0.45, h * 0.52);
    c.fillStyle = '#2d3848';
    c.beginPath();
    c.arc(w * 0.38, h * 0.70, w * 0.22, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#b7cfc4';
    c.fillRect(60, h * 0.76, w * 0.35, h * 0.16);
  }, 512, 700);

  // Canvas 2 (Minimalist Color Field in Teal / Terracotta / Cream / Charcoal)
  const artTex2 = makeCanvasTex((c, w, h) => {
    c.fillStyle = '#e8e2d4';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#317980';
    c.fillRect(50, 60, w - 100, h * 0.35);
    c.fillStyle = '#1c242e';
    c.fillRect(50, h * 0.45, w * 0.48, h * 0.46);
    c.fillStyle = '#b85e43';
    c.beginPath();
    c.arc(w * 0.72, h * 0.65, w * 0.20, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#d2b57b';
    c.fillRect(w * 0.45, h * 0.78, w * 0.45, h * 0.14);
  }, 600, 800);

  // Canvas 3 (Warm Ochre / Pale Sage / Deep Blue block composition)
  const artTex3 = makeCanvasTex((c, w, h) => {
    c.fillStyle = '#e9e6df';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#caa156';
    c.fillRect(40, 45, w * 0.42, h * 0.60);
    c.fillStyle = '#263b4d';
    c.fillRect(w * 0.40, h * 0.22, w * 0.50, h * 0.42);
    c.fillStyle = '#7a9f8f';
    c.fillRect(w * 0.25, h * 0.62, w * 0.62, h * 0.28);
  }, 500, 700);

  const frameConfigs = [
    { pos: LAYOUT.wallFrames[0], w: 0.52, h: 0.72, tex: artTex1 },
    { pos: LAYOUT.wallFrames[1], w: 0.64, h: 0.82, tex: artTex2 },
    { pos: LAYOUT.wallFrames[2], w: 0.48, h: 0.68, tex: artTex3 }
  ];

  frameConfigs.forEach((cfg, idx) => {
    const fGroup = new THREE.Group();
    fGroup.name = `WallFrame_${idx + 1}`;
    fGroup.position.set(cfg.pos.x, cfg.pos.y, cfg.pos.z);

    // Frame outer border
    const borderGeo = track(new RoundedBoxGeometry(cfg.w + 0.04, cfg.h + 0.04, 0.02, 2, 0.004));
    const borderMesh = new THREE.Mesh(borderGeo, frameMat);
    fGroup.add(borderMesh);

    // Art canvas plane
    const artMat = track(new THREE.MeshBasicMaterial({ map: cfg.tex }));
    const artMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(cfg.w, cfg.h)), artMat);
    artMesh.position.set(0, 0, 0.011);
    fGroup.add(artMesh);

    wallFramesGroup.add(fGroup);
  });

  dressingGroup.add(wallFramesGroup);

  // ===========================================================================
  // 8. CABLE BUNDLES from desk back to floor (TubeGeometry)
  // Desk back is at z = -0.55, cable tray at y = 0.93 -> gracefully to floor
  // ===========================================================================
  const cableBundlesGroup = new THREE.Group();
  cableBundlesGroup.name = 'CableBundles';
  const cableMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.7,
      metalness: 0.2
    })
  );

  const cable1Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 0.98, -0.27), // Tray meets tabletop underside flush at y=1.005, center y=0.98
    new THREE.Vector3(-0.45, 0.60, -0.46),
    new THREE.Vector3(-0.52, 0.25, -0.58),
    new THREE.Vector3(-0.55, 0.005, -0.55)
  ]);
  const cable1Geo = track(new THREE.TubeGeometry(cable1Curve, 20, 0.010, 8, false));
  const cable1 = new THREE.Mesh(cable1Geo, cableMat);
  cableBundlesGroup.add(cable1);

  const cable2Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.20, 0.98, -0.27),
    new THREE.Vector3(0.32, 0.55, -0.46),
    new THREE.Vector3(0.38, 0.20, -0.58),
    new THREE.Vector3(0.42, 0.005, -0.55)
  ]);
  const cable2Geo = track(new THREE.TubeGeometry(cable2Curve, 20, 0.008, 8, false));
  const cable2 = new THREE.Mesh(cable2Geo, cableMat);
  cableBundlesGroup.add(cable2);

  dressingGroup.add(cableBundlesGroup);

  // ===========================================================================
  // 9. CONTACT SHADOWS (tracked radial-gradient planes at floor y=0.006 or rug y=0.0165)
  // Placed under: desk (3.4x1.7), audio table, bookshelf, plant, cat, floor lamp
  // ===========================================================================
  const shadowTex = makeCanvasTex((c, w, h) => {
    const rx = w / 2;
    const ry = h / 2;
    const grad = c.createRadialGradient(rx, ry, Math.min(rx, ry) * 0.15, rx, ry, Math.max(rx, ry));
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.22)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    c.fillStyle = grad;
    c.fillRect(0, 0, w, h);
  }, 256, 256);

  const deskShadowTex = makeCanvasTex((c, w, h) => {
    const rx = w / 2;
    const ry = h / 2;
    const grad = c.createRadialGradient(rx, ry, Math.min(rx, ry) * 0.25, rx, ry, Math.max(rx, ry));
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    c.fillStyle = grad;
    c.fillRect(0, 0, w, h);
  }, 512, 256);

  function createContactShadow(name, x, z, width, depth, customTex = null, y = 0.006) {
    const sMat = track(
      new THREE.MeshBasicMaterial({
        map: customTex || shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.42
      })
    );
    const sGeo = track(new THREE.PlaneGeometry(width, depth));
    const sMesh = new THREE.Mesh(sGeo, sMat);
    sMesh.name = name;
    sMesh.rotation.x = -Math.PI / 2;
    sMesh.position.set(x, y, z);
    dressingGroup.add(sMesh);
    contactShadows.push(sMesh);
    return sMesh;
  }

  // 1) Desk shadow (rect 3.4 x 1.7 soft) - sits over rug at y=0.0155 -> y=0.0165
  createContactShadow('ContactShadow_Desk', 0.0, 0.20, 3.4, 1.7, deskShadowTex, 0.0165);

  // 2) Audio table shadow
  createContactShadow('ContactShadow_AudioTable', 2.45, -2.70, 1.30, 0.65, deskShadowTex, 0.006);

  // 3) Bookshelf shadow
  createContactShadow('ContactShadow_Bookshelf', LAYOUT.bookshelf.x, LAYOUT.bookshelf.z, 1.40, 0.50, deskShadowTex, 0.006);

  // 4) Floor plant shadow
  createContactShadow('ContactShadow_Plant', LAYOUT.floorPlant.x, LAYOUT.floorPlant.z, 0.75, 0.75, null, 0.006);

  // 5) Cat shadow - sits over rug at y=0.0155 -> y=0.0165
  createContactShadow('ContactShadow_Cat', LAYOUT.cat.x, LAYOUT.cat.z, 0.55, 0.40, null, 0.0165);

  // 6) Floor lamp shadow
  createContactShadow('ContactShadow_FloorLamp', LAYOUT.floorLamp.x, LAYOUT.floorLamp.z, 0.50, 0.50, null, 0.006);

  return {
    group: dressingGroup,
    contactShadows,
    LAYOUT,
    planks: plankInstMesh,
    bookshelf: bookshelfGroup,
    floorPlant: floorPlantGroup,
    floorLamp: floorLampGroup,
    cat: catGroup,
    wallFrames: wallFramesGroup,
    cableBundles: cableBundlesGroup,
    baseboards: baseboardGroup
  };
}
