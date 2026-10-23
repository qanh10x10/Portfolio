import * as THREE from 'three';
import { isVietnamDaytime } from '../utils/vnTime.js';
import { JOBS } from '../data/jobs.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildDeskProps, LAYOUT as DESK_LAYOUT } from './scene/deskProps.js';
import { buildRobotChair } from './scene/robotChair.js';
import { buildRoomDressing } from './scene/roomDressing.js';

/**
 * Procedural Three.js portfolio room diorama with day/night cycle, animated city window,
 * and front-on physical object focus transitions for computer, resume board, phone, robot and speaker.
 */
export function initDeskScene(canvas, container, options = {}) {
  const {
    onSelectHotspot,
    onSurfaceBounds,
    onUpdateAnchors,
    onTransitionEnd,
    reducedMotion = false,
    isDay: initialIsDay,
  } = options;

  let width = container.clientWidth || 800;
  let height = container.clientHeight || 600;

  // 1. WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  // 2. Scene
  const scene = new THREE.Scene();
  let currentIsDay = initialIsDay !== undefined ? Boolean(initialIsDay) : isVietnamDaytime();
  scene.background = new THREE.Color(currentIsDay ? 0x6ba4e8 : 0x121726);

  // 3. Camera
  const isMobilePortrait = width < 700 && height >= width;
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1000;
  const defaultFov = isMobilePortrait ? 84 : isMobile ? 52 : isTablet ? 44 : 38;
  const camera = new THREE.PerspectiveCamera(defaultFov, width / height, 0.1, 60);

  const defaultCamPos = isMobilePortrait
    ? new THREE.Vector3(6.2, 4.8, 8.0)
    : isMobile
    ? new THREE.Vector3(5.6, 4.4, 6.8)
    : isTablet
    ? new THREE.Vector3(5.2, 4.0, 6.4)
    : new THREE.Vector3(4.8, 3.8, 5.8);
  const targetLookAt = isMobilePortrait
    ? new THREE.Vector3(-1.4, 1.8, -0.6)
    : isMobile
    ? new THREE.Vector3(-0.2, 1.8, -0.6)
    : isTablet
    ? new THREE.Vector3(0.0, 1.4, -0.3)
    : new THREE.Vector3(0.0, 1.25, 0.0);

  camera.position.copy(defaultCamPos);
  camera.lookAt(targetLookAt);

  // Disposal tracking
  const disposables = [];
  const track = (item) => {
    disposables.push(item);
    return item;
  };

  const makeCanvasTex = (paint, w = 512, h = 512) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    paint(c.getContext('2d'), w, h);
    const t = track(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  // Materials Palette
  const matWall = track(
    new THREE.MeshStandardMaterial({
      color: 0x242a3a,
      roughness: 0.85,
      metalness: 0.1,
    })
  );
  const matFloor = track(
    new THREE.MeshStandardMaterial({
      color: 0x1d2230,
      roughness: 0.8,
      metalness: 0.2,
    })
  );
  const matRug = track(
    new THREE.MeshStandardMaterial({
      color: 0x262f42,
      roughness: 0.9,
      metalness: 0.05,
    })
  );
  const matRugBorder = track(
    new THREE.MeshStandardMaterial({
      color: 0xffdb70,
      roughness: 0.4,
      metalness: 0.6,
    })
  );
  const matDeskTop = track(
    new THREE.MeshStandardMaterial({
      color: 0x342a22,
      roughness: 0.35,
      metalness: 0.15,
    })
  );
  const matDeskLegs = track(
    new THREE.MeshStandardMaterial({
      color: 0x30374a,
      roughness: 0.5,
      metalness: 0.8,
    })
  );
  const matMetalDark = track(
    new THREE.MeshStandardMaterial({
      color: 0x323a4e,
      roughness: 0.4,
      metalness: 0.7,
    })
  );
  const matRobotBody = track(
    new THREE.MeshStandardMaterial({
      color: 0xe2e6ef,
      roughness: 0.35,
      metalness: 0.35,
    })
  );
  const matRobotJoint = track(
    new THREE.MeshStandardMaterial({
      color: 0x363e52,
      roughness: 0.45,
      metalness: 0.8,
    })
  );
  const matWarmGold = track(
    new THREE.MeshStandardMaterial({
      color: 0xffb74d,
      roughness: 0.3,
      metalness: 0.8,
    })
  );
  const matChair = track(
    new THREE.MeshStandardMaterial({
      color: 0x272d3e,
      roughness: 0.7,
      metalness: 0.2,
    })
  );

  // Dynamic Day/Night Materials
  const lampGlassMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      emissive: currentIsDay ? 0x000000 : 0xffe082,
      emissiveIntensity: currentIsDay ? 0 : 1.8,
    })
  );

  const windowLitMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffe699,
      roughness: 0.4,
      emissive: currentIsDay ? 0x000000 : 0xffdb70,
      emissiveIntensity: currentIsDay ? 0 : 1.2,
    })
  );

  const windowLitMat2 = track(
    new THREE.MeshStandardMaterial({
      color: 0x90caf9,
      roughness: 0.4,
      emissive: currentIsDay ? 0x000000 : 0x80d8ff,
      emissiveIntensity: currentIsDay ? 0 : 1.2,
    })
  );

  const headlightMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      emissive: currentIsDay ? 0x000000 : 0xffffe0,
      emissiveIntensity: currentIsDay ? 0 : 2.0,
    })
  );

  const taillightMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      roughness: 0.2,
      emissive: currentIsDay ? 0x000000 : 0xff1744,
      emissiveIntensity: currentIsDay ? 0 : 2.0,
    })
  );

  // 4. Lighting Setup
  const hemiLight = new THREE.HemisphereLight(
    currentIsDay ? 0xdbeafe : 0x1e273a,
    currentIsDay ? 0x94a3b8 : 0x0f1422,
    currentIsDay ? 1.2 : 0.5
  );
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, currentIsDay ? 3.4 : 0);
  sunLight.position.set(-5, 9, -12);
  sunLight.castShadow = false;
  scene.add(sunLight);

  const moonLight = new THREE.DirectionalLight(0x8ab2f8, currentIsDay ? 0 : 1.3);
  moonLight.position.set(-4, 7, -6);
  moonLight.castShadow = false;
  scene.add(moonLight);

  const deskSpot = new THREE.SpotLight(0xffbe6b, currentIsDay ? 0.9 : 2.8, 6, Math.PI / 3.2, 0.35, 1.2);
  deskSpot.position.set(-1.0, 2.4, 0.4);
  deskSpot.target.position.set(0.0, 1.1, 0.0);
  deskSpot.castShadow = true;
  deskSpot.shadow.mapSize.width = 512;
  deskSpot.shadow.mapSize.height = 512;
  deskSpot.shadow.bias = -0.0005;
  scene.add(deskSpot);
  scene.add(deskSpot.target);

  const underDeskGlow = new THREE.PointLight(0xffb74d, currentIsDay ? 0.4 : 1.2, 3.0, 2.0);
  underDeskGlow.position.set(0, 0.45, 0.0);
  scene.add(underDeskGlow);

  const monitorGlow = new THREE.PointLight(0x38bdf8, currentIsDay ? 1.0 : 1.5, 3.5, 1.6);
  monitorGlow.position.set(-0.8, 1.7, 0.2);
  scene.add(monitorGlow);

  const streetLight1 = new THREE.PointLight(0xffe082, currentIsDay ? 0 : 1.8, 12, 1.5);
  streetLight1.position.set(-2.5, 2.8, -4.2);
  scene.add(streetLight1);

  const streetLight2 = new THREE.PointLight(0xffe082, currentIsDay ? 0 : 1.8, 12, 1.5);
  streetLight2.position.set(2.5, 2.8, -4.2);
  scene.add(streetLight2);

  // 5. Room Geometry
  const roomGroup = new THREE.Group();
  roomGroup.name = 'RoomGroup';
  scene.add(roomGroup);

  const floorGeo = track(new THREE.BoxGeometry(10, 0.2, 10));
  const floor = new THREE.Mesh(floorGeo, matFloor);
  floor.position.set(0, -0.1, 1.4);
  floor.receiveShadow = true;
  roomGroup.add(floor);

  const rugGeo = track(new THREE.BoxGeometry(4.2, 0.015, 3.6));
  const rug = new THREE.Mesh(rugGeo, matRug);
  rug.position.set(0.1, 0.008, 0.4);
  rug.receiveShadow = true;
  roomGroup.add(rug);

  const rugBorderGeo = track(new THREE.BoxGeometry(4.35, 0.01, 3.75));
  const rugBorder = new THREE.Mesh(rugBorderGeo, matRugBorder);
  rugBorder.position.set(0.1, 0.005, 0.4);
  rugBorder.receiveShadow = true;
  roomGroup.add(rugBorder);

  // Left wall
  const leftWallGeo = track(new THREE.BoxGeometry(0.2, 6, 10));
  const leftWall = new THREE.Mesh(leftWallGeo, matWall);
  leftWall.position.set(-4.5, 3, 1.4);
  leftWall.receiveShadow = true;
  roomGroup.add(leftWall);

  // Back Wall with ONE ARCHITECTURAL WINDOW OPENING
  const wallBottom = new THREE.Mesh(track(new THREE.BoxGeometry(10, 0.12, 0.2)), matWall);
  wallBottom.position.set(0, 0.06, -3.2);
  wallBottom.receiveShadow = true;
  roomGroup.add(wallBottom);

  const wallTop = new THREE.Mesh(track(new THREE.BoxGeometry(10, 1.48, 0.2)), matWall);
  wallTop.position.set(0, 5.26, -3.2);
  wallTop.receiveShadow = true;
  roomGroup.add(wallTop);

  const wallLeftOfWin = new THREE.Mesh(track(new THREE.BoxGeometry(0.9, 4.40, 0.2)), matWall);
  wallLeftOfWin.position.set(-4.55, 2.32, -3.2);
  wallLeftOfWin.receiveShadow = true;
  roomGroup.add(wallLeftOfWin);

  const wallRightOfWin = new THREE.Mesh(track(new THREE.BoxGeometry(4.75, 4.40, 0.2)), matWall);
  wallRightOfWin.position.set(2.625, 2.32, -3.2);
  wallRightOfWin.receiveShadow = true;
  roomGroup.add(wallRightOfWin);

  // Architectural closure closing right edge gap
  const closure = new THREE.Mesh(track(new THREE.BoxGeometry(24, 6, 0.2)), matWall);
  closure.position.set(17, 3, -3.2);
  roomGroup.add(closure);

  // Large Single Architectural Window Frame around opening
  const windowFrameGroup = new THREE.Group();
  windowFrameGroup.name = 'SingleWindow';
  windowFrameGroup.position.set(-1.925, 2.32, -3.2);
  roomGroup.add(windowFrameGroup);

  const winSill = new THREE.Mesh(track(new THREE.BoxGeometry(4.45, 0.06, 0.24)), matMetalDark);
  winSill.position.set(0, -2.20, 0);
  windowFrameGroup.add(winSill);

  const winLintel = new THREE.Mesh(track(new THREE.BoxGeometry(4.45, 0.06, 0.24)), matMetalDark);
  winLintel.position.set(0, 2.20, 0);
  windowFrameGroup.add(winLintel);

  const winJambL = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 4.40, 0.24)), matMetalDark);
  winJambL.position.set(-2.175, 0, 0);
  windowFrameGroup.add(winJambL);

  const winJambR = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 4.40, 0.24)), matMetalDark);
  winJambR.position.set(2.175, 0, 0);
  windowFrameGroup.add(winJambR);

  // Transparent single glass pane
  const glassMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
      metalness: 0.1,
      depthWrite: false,
    })
  );
  const winGlass = new THREE.Mesh(track(new THREE.PlaneGeometry(4.35, 4.40)), glassMat);
  winGlass.position.set(0, 0, 0.02);
  windowFrameGroup.add(winGlass);

  // 6. Outside 3D City Environment
  const outsideGroup = new THREE.Group();
  outsideGroup.name = 'OutsideCity';
  scene.add(outsideGroup);

  const matSidewalk = track(new THREE.MeshStandardMaterial({ color: 0x333948, roughness: 0.85 }));
  const sidewalk1 = new THREE.Mesh(track(new THREE.BoxGeometry(36, 0.14, 1.0)), matSidewalk);
  sidewalk1.position.set(0, 0.07, -3.7);
  sidewalk1.receiveShadow = true;
  outsideGroup.add(sidewalk1);

  const matRoad = track(new THREE.MeshStandardMaterial({ color: 0x181c26, roughness: 0.8 }));
  const road = new THREE.Mesh(track(new THREE.BoxGeometry(36, 0.08, 4.4)), matRoad);
  road.position.set(0, 0.06, -6.4);
  road.receiveShadow = true;
  outsideGroup.add(road);

  const matDash = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  for (let dx = -20.0; dx <= 20.0; dx += 2.0) {
    const dash = new THREE.Mesh(track(new THREE.BoxGeometry(1.2, 0.02, 0.44)), matDash);
    dash.position.set(dx, 0.105, -6.4);
    outsideGroup.add(dash);
  }

  const sidewalk2 = new THREE.Mesh(track(new THREE.BoxGeometry(36, 0.14, 1.4)), matSidewalk);
  sidewalk2.position.set(0, 0.07, -9.3);
  sidewalk2.receiveShadow = true;
  outsideGroup.add(sidewalk2);

  const lampPositions = [-4.5, -0.5, 3.5];
  lampPositions.forEach((lx) => {
    const lampPost = new THREE.Mesh(track(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 10)), matMetalDark);
    lampPost.position.set(lx, 1.6, -3.7);
    outsideGroup.add(lampPost);

    const lampArm = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.04, 0.6)), matMetalDark);
    lampArm.position.set(lx, 3.18, -3.98);
    outsideGroup.add(lampArm);

    const lampHead = new THREE.Mesh(track(new THREE.BoxGeometry(0.2, 0.08, 0.2)), matMetalDark);
    lampHead.position.set(lx, 3.14, -4.25);
    outsideGroup.add(lampHead);

    const lampBulb = new THREE.Mesh(track(new THREE.BoxGeometry(0.16, 0.04, 0.16)), lampGlassMat);
    lampBulb.position.set(lx, 3.09, -4.25);
    outsideGroup.add(lampBulb);
  });

  const buildingMaterials = [];
  const buildingData = [
    { x: -12.0, z: -12.5, w: 3.5, h: 3.6, d: 3.5, dayCol: 0xb4c6dc, nightCol: 0x1c2333 },
    { x: -7.5, z: -11.6, w: 3.0, h: 2.2, d: 3.0, dayCol: 0xc2d4e8, nightCol: 0x1f2738 },
    { x: -3.8, z: -11.2, w: 3.0, h: 3.4, d: 2.8, dayCol: 0xaec0d4, nightCol: 0x181e2b },
    { x: -0.2, z: -12.0, w: 3.2, h: 2.4, d: 3.0, dayCol: 0xb9cbdf, nightCol: 0x222a3a },
    { x: 3.6, z: -11.5, w: 3.0, h: 3.5, d: 2.8, dayCol: 0xb1c3d8, nightCol: 0x1d2435 },
    { x: 7.5, z: -11.0, w: 3.2, h: 2.8, d: 3.0, dayCol: 0xbdcfe4, nightCol: 0x202838 },
  ];

  buildingData.forEach((b) => {
    const bMat = track(
      new THREE.MeshStandardMaterial({
        color: currentIsDay ? b.dayCol : b.nightCol,
        roughness: 0.8,
      })
    );
    buildingMaterials.push({ mat: bMat, dayCol: b.dayCol, nightCol: b.nightCol });
    const bMesh = new THREE.Mesh(track(new THREE.BoxGeometry(b.w, b.h, b.d)), bMat);
    bMesh.position.set(b.x, b.h / 2, b.z);
    outsideGroup.add(bMesh);

    const startY = 0.8;
    const endY = b.h - 0.5;
    for (let wy = startY; wy < endY; wy += 0.85) {
      for (let wx = -b.w / 2 + 0.45; wx < b.w / 2 - 0.4; wx += 0.65) {
        const useCyan = Math.sin(b.x * 3 + wy * 5 + wx) > 0.4;
        const winMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.35, 0.45, 0.05)), useCyan ? windowLitMat2 : windowLitMat);
        winMesh.position.set(b.x + wx, wy, b.z + b.d / 2 + 0.03);
        outsideGroup.add(winMesh);
      }
    }
  });

  const skyMat = track(new THREE.MeshBasicMaterial({ color: currentIsDay ? 0x80c5f6 : 0x0c101d, side: THREE.DoubleSide }));
  const skyPlane = new THREE.Mesh(track(new THREE.PlaneGeometry(160, 90)), skyMat);
  skyPlane.position.set(0, 20, -18);
  outsideGroup.add(skyPlane);

  const sunMat = track(new THREE.MeshBasicMaterial({ color: 0xfffa80 }));
  const sunMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.7, 16, 16)), sunMat);
  sunMesh.position.set(-7.5, 3.6, -13);
  sunMesh.visible = currentIsDay;
  outsideGroup.add(sunMesh);

  const moonMat = track(new THREE.MeshBasicMaterial({ color: 0xedf2f7 }));
  const moonMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.5, 16, 16)), moonMat);
  moonMesh.position.set(-7.5, 3.6, -13);
  moonMesh.visible = !currentIsDay;
  outsideGroup.add(moonMesh);

  const cars = [];
  const carBodyMaterials = [];
  const carBeamMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xfff3a0,
      transparent: true,
      opacity: currentIsDay ? 0 : 0.25,
      depthWrite: false,
    })
  );
  const carConfigs = [
    { color: 0xef4444, laneZ: -5.3, dir: 1, speed: 2.3, startX: -8.5 },
    { color: 0xf59e0b, laneZ: -5.3, dir: 1, speed: 1.7, startX: -0.5 },
    { color: 0x3b82f6, laneZ: -5.3, dir: 1, speed: 2.7, startX: 7.5 },
    { color: 0x10b981, laneZ: -7.5, dir: -1, speed: 2.0, startX: -4.5 },
    { color: 0xe2e8f0, laneZ: -7.5, dir: -1, speed: 1.5, startX: 3.5 },
    { color: 0x8b5cf6, laneZ: -7.5, dir: -1, speed: 2.5, startX: 11.5 },
  ];

  const wheelGeo = track(new THREE.CylinderGeometry(0.20, 0.20, 0.14, 12));
  const wheelMat = track(new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }));
  const cabinWinMat = track(new THREE.MeshStandardMaterial({ color: 0x223045, roughness: 0.2 }));

  carConfigs.forEach((cfg) => {
    const carGroup = new THREE.Group();
    carGroup.position.set(cfg.startX, 0.22, cfg.laneZ);
    if (cfg.dir === -1) carGroup.rotation.y = Math.PI;

    const carBodyMat = track(
      new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.35,
        metalness: 0.2,
        emissive: currentIsDay ? 0x000000 : cfg.color,
        emissiveIntensity: currentIsDay ? 0 : 0.15,
      })
    );
    carBodyMaterials.push({ mat: carBodyMat, color: cfg.color });

    const carBody = new THREE.Mesh(track(new THREE.BoxGeometry(1.7, 0.42, 0.82)), carBodyMat);
    carBody.position.set(0, 0.22, 0);
    carBody.castShadow = true;
    carGroup.add(carBody);

    const carCabin = new THREE.Mesh(track(new THREE.BoxGeometry(0.96, 0.36, 0.70)), carBodyMat);
    carCabin.position.set(-0.08, 0.60, 0);
    carCabin.castShadow = true;
    carGroup.add(carCabin);

    const frontGlass = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.30, 0.66)), cabinWinMat);
    frontGlass.position.set(0.40, 0.60, 0);
    carGroup.add(frontGlass);

    const rearGlass = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.30, 0.66)), cabinWinMat);
    rearGlass.position.set(-0.56, 0.60, 0);
    carGroup.add(rearGlass);

    const wheelPositions = [
      [0.50, 0.09, 0.41],
      [-0.50, 0.09, 0.41],
      [0.50, 0.09, -0.41],
      [-0.50, 0.09, -0.41],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      wheel.rotation.x = Math.PI / 2;
      carGroup.add(wheel);
    });

    for (const hz of [-0.26, 0.26]) {
      const headlight = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.14, 0.18)), headlightMat);
      headlight.position.set(0.86, 0.24, hz);
      carGroup.add(headlight);
    }

    for (const tz of [-0.26, 0.26]) {
      const taillight = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.12, 0.18)), taillightMat);
      taillight.position.set(-0.86, 0.26, tz);
      carGroup.add(taillight);
    }

    const headBeam = new THREE.Mesh(track(new THREE.PlaneGeometry(2.2, 0.9)), carBeamMat);
    headBeam.rotation.x = -Math.PI / 2;
    headBeam.position.set(1.9, -0.11, 0);
    carGroup.add(headBeam);

    outsideGroup.add(carGroup);
    cars.push({ mesh: carGroup, dir: cfg.dir, speed: cfg.speed });
  });

  // 7. Wall Shelf (hidden in new design)
  const shelfGroup = new THREE.Group();
  shelfGroup.position.set(1.1, 3.25, -3.05);
  shelfGroup.visible = false;
  roomGroup.add(shelfGroup);

  // 8. Left Wall Board (Resume Board)
  const boardGroup = new THREE.Group();
  boardGroup.name = 'ResumeBoard';
  boardGroup.position.set(-4.39, 2.7, -0.6);
  boardGroup.rotation.y = Math.PI / 2;
  boardGroup.scale.set(2.6, 1, 1);
  roomGroup.add(boardGroup);

  const boardFrame = new THREE.Mesh(track(new THREE.BoxGeometry(1.0, 1.35, 0.04)), matWarmGold);
  boardFrame.castShadow = true;
  boardGroup.add(boardFrame);

  const boardTex = makeCanvasTex((x, w, h) => {
    x.fillStyle = '#192633';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#4c5a65';
    for (let y = 12; y < h; y += 18) {
      for (let a = 12; a < w; a += 18) {
        x.beginPath();
        x.arc(a, y, 1.5, 0, Math.PI * 2);
        x.fill();
      }
    }
    JOBS.forEach((job, i) => {
      const a = 68 + i * 236;
      x.fillStyle = '#8bc6be';
      x.fillRect(a + 62, 40, 12, 110);
      x.fillRect(a + 94, 40, 12, 110);
      x.fillStyle = '#e4e5dc';
      x.fillRect(a, 142, 190, 300);
      x.fillStyle = '#467b7b';
      x.fillRect(a, 142, 190, 62);
      x.fillStyle = '#f0f5ed';
      x.font = '500 20px Poppins, sans-serif';
      x.fillText(job.company.length > 18 ? 'Gamota - Gabros' : job.company, a + 9, 181);
      x.fillStyle = '#253f50';
      x.fillRect(a + 59, 220, 70, 75);
      x.fillStyle = '#b9e0d9';
      x.font = '30px Poppins, sans-serif';
      x.fillText('QA', a + 69, 270);
      x.fillStyle = '#243f4d';
      x.font = '18px Poppins, sans-serif';
      x.fillText('Unity Developer', a + 17, 336);
      x.font = '13px Poppins, sans-serif';
      x.fillText(job.dates, a + 8, 373);
    });
  }, 1080, 540);

  const boardMat = track(new THREE.MeshBasicMaterial({ map: boardTex }));
  const boardFace = new THREE.Mesh(track(new THREE.PlaneGeometry(0.92, 1.25)), boardMat);
  boardFace.position.set(0, 0, 0.025);
  boardGroup.add(boardFace);

  // 9-11. Desk, props, chair and robot come from the scene-craft v3 modules
  const sceneCtx = {
    THREE,
    track,
    makeCanvasTex,
    RoundedBoxGeometry,
    mats: {
      metalDark: matMetalDark,
      deskTop: matDeskTop,
      deskLegs: matDeskLegs,
      warmGold: matWarmGold,
      chair: matChair,
      robotBody: matRobotBody,
      robotJoint: matRobotJoint,
      rug: matRug,
    },
  };
  const props = buildDeskProps(sceneCtx);
  const DESK_TOP_Y = 1.095;

  const deskGroup = new THREE.Group();
  deskGroup.name = 'DeskGroup';
  deskGroup.position.set(0, 0, 0.2);
  scene.add(deskGroup);
  deskGroup.add(props.desk);

  const placeOnDesk = (obj, { x, z, yaw = 0 }) => {
    obj.position.set(x, DESK_TOP_Y, z);
    obj.rotation.y = yaw;
    deskGroup.add(obj);
  };
  // Robot sits behind the desk's right half, body turned toward the camera (face readable); the monitor is
  // in front of it and to its right, so the head turns to look at the screen while idle. Keyboard 0.62m ahead of the robot.
  // Robot seated at desk with keyboard and monitor directly in front, screen facing the robot's face
  const ROBOT_POS = new THREE.Vector3(0.70, 0, -0.75);
  const ROBOT_YAW = -0.25;
  const robotFwd = new THREE.Vector3(Math.sin(ROBOT_YAW), 0, Math.cos(ROBOT_YAW));
  const robotRight = new THREE.Vector3(-Math.cos(ROBOT_YAW), 0, Math.sin(ROBOT_YAW));

  // Keyboard directly in front of robot
  const kbWorld = ROBOT_POS.clone().addScaledVector(robotFwd, 0.58);
  placeOnDesk(props.keyboard, { x: kbWorld.x, z: kbWorld.z - 0.2, yaw: ROBOT_YAW + Math.PI });
  placeOnDesk(props.mouse, { x: kbWorld.x + 0.38, z: kbWorld.z - 0.2 + 0.04 });
  placeOnDesk(props.lamp, { x: -1.35, z: 0.25 });
  placeOnDesk(props.plant, { x: -1.4, z: -0.45 });

  // Monitor directly in front of keyboard, screen normal turned directly toward robot's face
  const monitorGroup = props.monitor.group;
  const monWorld = ROBOT_POS.clone().addScaledVector(robotFwd, 1.05);
  const monYaw = ROBOT_YAW + Math.PI; // screen faces robot's face directly
  placeOnDesk(monitorGroup, { x: monWorld.x, z: monWorld.z - 0.2, yaw: monYaw });
  monitorGroup.scale.setScalar(0.86);
  const monitorScreen = props.monitor.screen;

  const phoneGroup = props.phone.group;
  placeOnDesk(phoneGroup, { x: 1.30, z: 0.35, yaw: -0.3 });
  const phoneScreen = props.phone.screen;

  const audioTableGroup = props.audioTable.group;
  audioTableGroup.position.set(2.45, 0, -2.7);
  audioTableGroup.rotation.y = DESK_LAYOUT.audioTable.yaw;
  scene.add(audioTableGroup);
  const speakerGroup = props.audioTable.speaker;
  const musicScreen = props.audioTable.musicScreen;

  const dressing = buildRoomDressing(sceneCtx);
  scene.add(dressing.group);
  const dressingShadowMats = dressing.contactShadows.map((m) => m.material);

  const rig = buildRobotChair(sceneCtx);
  rig.root.position.copy(ROBOT_POS);
  rig.root.rotation.y = ROBOT_YAW;
  scene.add(rig.root);
  const robotRoot = rig.robot;
  const torsoGroup = rig.torso;
  const headGroup = rig.head;
  const crtFace = rig.crtFace;
  const renderRobotFace = rig.setEyeOpenness;

  // Phone lies face down; flipPhone animates it upright before the contact zoom.
  const HEAD_LOOK_AT_MONITOR = 0.0; // head looks straight ahead into the monitor directly in front
  const PHONE_FLIP_MS = 420;
  let phoneFlipT = 0;
  let phoneFlipTarget = 0;
  const setPhoneFlipNow = (t) => {
    phoneFlipT = phoneFlipTarget = t;
    props.phone.setFlip(t);
  };

  // 12. Glow Halos on interactive objects
  const glowTex = makeCanvasTex((x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(95,225,235,0.3)');
    g.addColorStop(0.4, 'rgba(95,225,235,0.12)');
    g.addColorStop(1, 'rgba(95,225,235,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  }, 128, 128);

  function createHalo(parent, pos, size) {
    const s = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: glowTex,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      )
    );
    s.position.copy(pos);
    s.scale.set(size[0], size[1], 1);
    parent.add(s);
    return s;
  }

  const haloMonitor = createHalo(monitorGroup, new THREE.Vector3(0, 0.58, -0.02), [2.25, 1.45]);
  const haloBoard = createHalo(boardGroup, new THREE.Vector3(0, 0, 0.012), [1.5, 1.9]);
  const haloPhone = createHalo(phoneGroup, new THREE.Vector3(0, 0.12, 0), [0.7, 0.85]);
  const haloSpeaker = createHalo(speakerGroup, new THREE.Vector3(0, 0.24, 0), [0.68, 0.78]);
  const haloRobot = createHalo(headGroup, new THREE.Vector3(0, 0, 0), [1.05, 0.85]);

  // Targets and Surfaces
  const targets = {
    monitor: {
      object: monitorGroup,
      point: () => monitorScreen.getWorldPosition(new THREE.Vector3()),
      normal: new THREE.Vector3(0, 0.03, 1),
      distance: 2.55,
      halo: haloMonitor,
      haloSize: [2.25, 1.45],
    },
    resume: {
      object: boardGroup,
      point: () => boardFace.getWorldPosition(new THREE.Vector3()),
      normal: new THREE.Vector3(1, 0, 0),
      distance: 2.1,
      halo: haloBoard,
      haloSize: [1.5, 1.9],
    },
    contact: {
      object: phoneGroup,
      point: () => phoneScreen.getWorldPosition(new THREE.Vector3()),
      normal: new THREE.Vector3(0, 0.1, 1),
      distance: 1.25,
      halo: haloPhone,
      haloSize: [0.7, 0.85],
    },
    chat: {
      object: robotRoot,
      point: () => crtFace.getWorldPosition(new THREE.Vector3()),
      normal: new THREE.Vector3(-0.25, 0.04, 0.97),
      distance: 0.72,
      halo: haloRobot,
      haloSize: [1.05, 0.85],
    },
    music: {
      object: speakerGroup,
      point: () => speakerGroup.localToWorld(new THREE.Vector3(0, 0.24, 0.15)),
      normal: new THREE.Vector3(0, 0.1, 1),
      distance: 1.35,
      halo: haloSpeaker,
      haloSize: [0.68, 0.78],
    },
  };

  let activeHoverTarget = null;
  function updateHaloGlows() {
    for (const [id, t] of Object.entries(targets)) {
      if (t.halo) {
        const isHovered = activeHoverTarget === id;
        t.halo.material.opacity = isHovered ? 1.0 : 0.4;
        const baseScale = t.haloSize || [1, 1];
        const mult = isHovered ? 1.25 : 1.0;
        t.halo.scale.set(baseScale[0] * mult, baseScale[1] * mult, 1);
      }
    }
  }

  const physicalSurfaces = {
    monitor: {
      mesh: monitorScreen,
      object: monitorGroup,
      width: 1.82,
      height: 0.88,
      frameWidth: 1.9,
      frameHeight: 0.95,
      homeScale: new THREE.Vector3(0.86, 0.86, 0.86),
    },
    resume: {
      mesh: boardFace,
      object: boardGroup,
      width: 0.92,
      height: 1.25,
      frameWidth: 1.0,
      frameHeight: 1.35,
      homeScale: new THREE.Vector3(2.6, 1, 1),
    },
    contact: {
      mesh: phoneScreen,
      object: phoneGroup,
      width: 0.255,
      height: 0.475,
      frameWidth: 0.29,
      frameHeight: 0.54,
      homeScale: new THREE.Vector3(1, 1, 1),
    },
    chat: {
      mesh: crtFace,
      object: headGroup,
      width: 0.56,
      height: 0.44,
      frameWidth: 0.66,
      frameHeight: 0.54,
      homeScale: new THREE.Vector3(1, 1, 1),
    },
    music: {
      mesh: musicScreen,
      object: speakerGroup,
      width: 0.46,
      height: 0.34,
      frameWidth: 0.54,
      frameHeight: 0.47,
      homeScale: new THREE.Vector3(1, 1, 1),
    },
  };

  // Clickable 3D raycast target objects
  const clickableObjects = [monitorGroup, boardGroup, phoneGroup, robotRoot, speakerGroup];

  function getHitTargetId(hitObject) {
    let o = hitObject;
    while (o) {
      if (o === monitorGroup) return 'monitor';
      if (o === boardGroup) return 'resume';
      if (o === phoneGroup) return 'contact';
      if (o === robotRoot) return 'chat';
      if (o === speakerGroup) return 'music';
      o = o.parent;
    }
    return null;
  }

  // Pointer interactions
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let rotAzimuth = 0;
  let rotElevation = 0;
  let targetAzimuth = 0;
  let targetElevation = 0;
  let dragDistance = 0;

  const maxAzimuth = Math.PI / 6;
  const minElevation = -Math.PI / 18;
  const maxElevation = Math.PI / 9;

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  const onPointerDown = (e) => {
    if (e.button !== 0 || currentFocus) return;
    isDragging = true;
    dragDistance = 0;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (currentFocus) return;
    if (!isDragging) {
      checkRaycast(e.clientX, e.clientY);
      return;
    }
    const deltaX = e.clientX - startPointerX;
    const deltaY = e.clientY - startPointerY;
    dragDistance += Math.abs(deltaX) + Math.abs(deltaY);
    startPointerX = e.clientX;
    startPointerY = e.clientY;

    targetAzimuth = THREE.MathUtils.clamp(targetAzimuth - deltaX * 0.005, -maxAzimuth, maxAzimuth);
    targetElevation = THREE.MathUtils.clamp(targetElevation - deltaY * 0.003, minElevation, maxElevation);
  };

  const onPointerUp = (e) => {
    if (isDragging) {
      isDragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
    }
  };

  function getNearestValidHit() {
    const hits = raycaster.intersectObjects(scene.children, true);
    for (const h of hits) {
      const obj = h.object;
      if (!obj || obj.visible === false) continue;
      if (obj.isSprite) continue;
      const mat = obj.material;
      if (mat && mat.transparent && mat.opacity < 0.1) continue;
      return h;
    }
    return null;
  }

  function checkRaycast(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);

    const hit = getNearestValidHit();
    const targetId = hit ? getHitTargetId(hit.object) : null;
    if (targetId) {
      canvas.style.cursor = 'pointer';
      if (activeHoverTarget !== targetId) {
        activeHoverTarget = targetId;
        updateHaloGlows();
      }
    } else {
      canvas.style.cursor = 'grab';
      if (activeHoverTarget !== null) {
        activeHoverTarget = null;
        updateHaloGlows();
      }
    }
  }

  const onClick = (e) => {
    if (dragDistance > 6 || currentFocus) return;
    const rect = canvas.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);

    const hit = getNearestValidHit();
    if (hit) {
      const targetId = getHitTargetId(hit.object);
      if (targetId && onSelectHotspot) {
        onSelectHotspot(targetId);
      }
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('click', onClick);

  // Day / Night Switcher
  function applyDayNight(isDay) {
    currentIsDay = Boolean(isDay);
    const skyHex = currentIsDay ? 0x80c5f6 : 0x121726;
    scene.background.setHex(skyHex);
    skyMat.color.setHex(currentIsDay ? 0x80c5f6 : 0x0c101d);

    renderer.toneMappingExposure = currentIsDay ? 1.15 : 1.15;
    matWall.color.setHex(currentIsDay ? 0xd4dce5 : 0x242a3a);
    matFloor.color.setHex(currentIsDay ? 0xd0beaa : 0x1d2230);
    matRug.color.setHex(currentIsDay ? 0x9cb0c6 : 0x262f42);
    matRugBorder.color.setHex(currentIsDay ? 0xf59e0b : 0xffdb70);
    matMetalDark.color.setHex(currentIsDay ? 0x707d91 : 0x323a4e);
    matDeskTop.color.setHex(currentIsDay ? 0x6b5747 : 0x342a22);
    matDeskLegs.color.setHex(currentIsDay ? 0x707d91 : 0x30374a);
    matSidewalk.color.setHex(currentIsDay ? 0xaab8c8 : 0x333948);
    matRoad.color.setHex(currentIsDay ? 0x3e4a5d : 0x181c26);

    sunMesh.visible = currentIsDay;
    sunLight.intensity = currentIsDay ? 2.2 : 0;
    sunLight.castShadow = currentIsDay;
    moonMesh.visible = !currentIsDay;
    moonLight.intensity = currentIsDay ? 0 : 1.3;

    hemiLight.color.setHex(currentIsDay ? 0xf8fafc : 0x1e273a);
    hemiLight.groundColor.setHex(currentIsDay ? 0xd6c4b2 : 0x0f1422);
    hemiLight.intensity = currentIsDay ? 1.35 : 0.5;

    deskSpot.intensity = currentIsDay ? 0.8 : 2.8;
    underDeskGlow.intensity = currentIsDay ? 0.3 : 1.2;
    monitorGlow.intensity = currentIsDay ? 0.9 : 1.5;

    streetLight1.intensity = currentIsDay ? 0 : 1.8;
    streetLight2.intensity = currentIsDay ? 0 : 1.8;
    lampGlassMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffe082);
    lampGlassMat.emissiveIntensity = currentIsDay ? 0 : 1.8;
    props.lampBulbMat.emissiveIntensity = currentIsDay ? 0.15 : 1.8;

    buildingMaterials.forEach((b) => {
      b.mat.color.setHex(currentIsDay ? b.dayCol : b.nightCol);
    });

    windowLitMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffdb70);
    windowLitMat.emissiveIntensity = currentIsDay ? 0 : 1.2;
    windowLitMat2.emissive.setHex(currentIsDay ? 0x000000 : 0x80d8ff);
    windowLitMat2.emissiveIntensity = currentIsDay ? 0 : 1.2;

    carBodyMaterials.forEach(({ mat, color }) => {
      mat.emissive.setHex(currentIsDay ? 0x000000 : color);
      mat.emissiveIntensity = currentIsDay ? 0 : 0.15;
    });
    carBeamMat.opacity = currentIsDay ? 0 : 0.25;
    headlightMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffffe0);
    headlightMat.emissiveIntensity = currentIsDay ? 0 : 3.5;
    taillightMat.emissive.setHex(currentIsDay ? 0x000000 : 0xff1744);
    taillightMat.emissiveIntensity = currentIsDay ? 0 : 3.5;
  }
  applyDayNight(currentIsDay);

  // 13. Camera Focus & Transitions
  let currentFocus = null;
  let transition = null;
  const focusQuaternion = new THREE.Quaternion();

  function restoreShape() {
    for (const s of Object.values(physicalSurfaces)) {
      s.object.scale.copy(s.homeScale);
    }
  }

  function focus(id, instant = false) {
    if (!targets[id]) return;
    currentFocus = id;
    // When focusing on monitor, hide robot so it doesn't occlude screen.
    // When focusing on chat (robot face), hide monitor so it doesn't block face.
    rig.root.visible = id !== 'monitor';
    props.monitor.group.visible = id !== 'chat';
    restoreShape();
    if (id === 'chat') {
      torsoGroup.position.y = 0;
      headGroup.rotation.set(0, 0, 0);
    }
    // The phone lies face down; flip it up before the camera moves in.
    const flipDelay = id === 'contact' && !instant && !reducedMotion && phoneFlipT < 1 ? PHONE_FLIP_MS : 0;
    phoneFlipTarget = id === 'contact' ? 1 : 0;
    if (instant || reducedMotion) setPhoneFlipNow(phoneFlipTarget);
    if (id === 'contact') props.phone.setFlip(1); // pose is computed for the flipped-up phone
    scene.updateMatrixWorld(true);
    const t = targets[id];
    const s = physicalSurfaces[id];
    let look = t.point();
    let normal = t.normal.clone();

    if (s) {
      if (width < 650) {
        const desiredAspect = (camera.aspect * 0.87) / 0.68;
        s.object.scale.y = (s.frameWidth * s.object.scale.x) / (s.frameHeight * desiredAspect);
      }
      scene.updateMatrixWorld(true);
      look = s.mesh.getWorldPosition(new THREE.Vector3());
      s.mesh.getWorldQuaternion(focusQuaternion);
      normal.set(0, 0, 1).applyQuaternion(focusQuaternion);

      const scale = s.mesh.getWorldScale(new THREE.Vector3());
      const halfH = (s.frameHeight * scale.y) / 2;
      const halfW = (s.frameWidth * scale.x) / 2;
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      t.distance = Math.max(halfH / (tan * 0.72), halfW / (tan * camera.aspect * 0.86));
    }

    const pos = look.clone().addScaledVector(normal.normalize(), t.distance * (s ? 1 : width < 650 ? 1.42 : 1));
    if (!s) {
      const tempCam = camera.clone();
      tempCam.position.copy(pos);
      tempCam.lookAt(look);
      focusQuaternion.copy(tempCam.quaternion);
    }
    if (id === 'contact') props.phone.setFlip(phoneFlipT); // visual state resumes; animate() flips it up

    if (instant || reducedMotion) {
      transition = null;
      camera.position.copy(pos);
      camera.quaternion.copy(focusQuaternion);
      camera.updateMatrixWorld(true);
      const bounds = computeSurfaceBounds(id);
      if (bounds) onSurfaceBounds?.(id, bounds);
      onTransitionEnd?.(id);
      renderer.render(scene, camera);
      return;
    }

    transition = {
      start: performance.now() + flipDelay,
      fromPos: camera.position.clone(),
      toPos: pos,
      fromQuat: camera.quaternion.clone(),
      toQuat: focusQuaternion.clone(),
      duration: 650,
    };

    if (isPaused && !reqId) {
      lastFrameTime = performance.now();
      reqId = requestAnimationFrame(animate);
    }
  }

  function reset(instant = false) {
    currentFocus = null;
    restoreShape();
    rig.root.visible = true;
    props.monitor.group.visible = true;
    phoneFlipTarget = 0;
    if (instant || reducedMotion) setPhoneFlipNow(0);

    const tempCam = camera.clone();
    tempCam.position.copy(defaultCamPos);
    tempCam.lookAt(targetLookAt);
    const targetQuat = tempCam.quaternion.clone();

    if (instant || reducedMotion) {
      transition = null;
      camera.position.copy(defaultCamPos);
      camera.quaternion.copy(targetQuat);
      camera.updateMatrixWorld(true);
      onTransitionEnd?.(null);
      renderer.render(scene, camera);
      return;
    }

    transition = {
      start: performance.now(),
      fromPos: camera.position.clone(),
      toPos: defaultCamPos.clone(),
      fromQuat: camera.quaternion.clone(),
      toQuat: targetQuat,
      duration: 500,
    };

    if (isPaused && !reqId) {
      lastFrameTime = performance.now();
      reqId = requestAnimationFrame(animate);
    }
  }

  function computeSurfaceBounds(id) {
    const s = physicalSurfaces[id];
    if (!s || !s.mesh) return null;
    if (!s.mesh.geometry.boundingBox) {
      s.mesh.geometry.computeBoundingBox();
    }
    const b = s.mesh.geometry.boundingBox;
    const points = [];
    const tmp = new THREE.Vector3();
    for (const x of [b.min.x, b.max.x]) {
      for (const y of [b.min.y, b.max.y]) {
        tmp.set(x, y, 0);
        const p = s.mesh.localToWorld(tmp.clone()).project(camera);
        points.push({
          x: ((p.x + 1) * width) / 2,
          y: ((1 - p.y) * height) / 2,
        });
      }
    }
    const left = Math.min(...points.map((p) => p.x));
    const right = Math.max(...points.map((p) => p.x));
    const top = Math.min(...points.map((p) => p.y));
    const bottom = Math.max(...points.map((p) => p.y));

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(right - left),
      height: Math.round(bottom - top),
    };
  }

  // 14. Animation Loop
  let reqId = null;
  let isPaused = reducedMotion;
  let isTabHidden = false;
  let frameCount = 0;
  const startTime = performance.now();
  let lastFrameTime = startTime;
  let lastRenderTime = 0;
  let lastBlinkTime = startTime;
  let isBlinking = false;

  function animate(now) {
    frameCount++;
    const delta = Math.min((now - lastFrameTime) * 0.001, 0.1);
    lastFrameTime = now;
    const elapsed = now - startTime;

    if (transition) {
      const t = transition.duration ? Math.max(0, Math.min(1, (now - transition.start) / transition.duration)) : 1;
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(transition.fromPos, transition.toPos, ease);
      camera.quaternion.slerpQuaternions(transition.fromQuat, transition.toQuat, ease);
      camera.updateMatrixWorld();

      if (t === 1) {
        if (currentFocus) {
          camera.quaternion.copy(transition.toQuat);
          camera.updateMatrixWorld();
        }
        transition = null;
        onTransitionEnd?.(currentFocus);
      }
    } else if (!currentFocus) {
      rotAzimuth += (targetAzimuth - rotAzimuth) * 0.08;
      rotElevation += (targetElevation - rotElevation) * 0.08;

      const baseCam = defaultCamPos.clone();
      baseCam.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotAzimuth);
      baseCam.y += rotElevation * 2.5;
      camera.position.copy(baseCam);
      camera.lookAt(targetLookAt);
    }

    if (phoneFlipT !== phoneFlipTarget) {
      const step = (delta * 1000) / PHONE_FLIP_MS;
      phoneFlipT = phoneFlipT < phoneFlipTarget ? Math.min(phoneFlipTarget, phoneFlipT + step) : Math.max(phoneFlipTarget, phoneFlipT - step);
      props.phone.setFlip(phoneFlipT);
    }

    if (!isPaused && !isTabHidden) {
      cars.forEach((car) => {
        car.mesh.position.x += car.dir * car.speed * delta;
        if (car.dir > 0 && car.mesh.position.x > 16) {
          car.mesh.position.x = -16;
        } else if (car.dir < 0 && car.mesh.position.x < -16) {
          car.mesh.position.x = 16;
        }
      });
    }

    if (now - lastBlinkTime > 3400) {
      isBlinking = true;
      lastBlinkTime = now;
    }
    if (isBlinking) {
      const blinkProgress = (now - lastBlinkTime) / 140;
      if (blinkProgress >= 1.0) {
        isBlinking = false;
        renderRobotFace(1.0);
      } else {
        const openness = Math.sin(blinkProgress * Math.PI);
        renderRobotFace(1.0 - openness * 0.95);
      }
    }

    if (!isPaused) {
      rig.update(now, { typing: currentFocus !== 'chat' });
      const breath = Math.sin(elapsed * 0.0018) * 0.008;
      torsoGroup.position.y = currentFocus === 'chat' ? 0 : breath;
      if (currentFocus === 'chat') {
        headGroup.rotation.y = 0;
        headGroup.rotation.z = 0;
      } else {
        headGroup.rotation.y = HEAD_LOOK_AT_MONITOR + Math.sin(elapsed * 0.0008) * 0.06;
        headGroup.rotation.z = Math.cos(elapsed * 0.0012) * 0.02;
      }
    }

    if (now - lastRenderTime >= 16) {
      renderer.render(scene, camera);
      lastRenderTime = now;

      if (currentFocus) {
        const bounds = computeSurfaceBounds(currentFocus);
        if (bounds) onSurfaceBounds?.(currentFocus, bounds);
      }

      if (onUpdateAnchors) {
        const anchors = {};
        for (const [id, t] of Object.entries(targets)) {
          const p = t.point().project(camera);
          anchors[id] = {
            x: ((p.x + 1) * width) / 2,
            y: ((1 - p.y) * height) / 2,
          };
        }
        onUpdateAnchors(anchors);
      }
    }

    if (!isPaused || transition || phoneFlipT !== phoneFlipTarget) {
      reqId = requestAnimationFrame(animate);
    } else {
      reqId = null;
    }
  }

  reqId = requestAnimationFrame(animate);

  const handleResize = () => {
    if (!container) return;
    width = container.clientWidth || 800;
    height = container.clientHeight || 600;

    const isMobilePortrait = width < 700 && height >= width;
    const m = width < 700;
    const t = width >= 700 && width < 1000;

    if (isMobilePortrait) {
      camera.fov = 84;
      defaultCamPos.set(6.2, 4.8, 8.0);
      targetLookAt.set(-1.4, 1.8, -0.6);
    } else {
      camera.fov = m ? 52 : t ? 44 : 38;
      defaultCamPos.copy(
        m ? new THREE.Vector3(5.6, 4.4, 6.8) : t ? new THREE.Vector3(5.2, 4.0, 6.4) : new THREE.Vector3(4.8, 3.8, 5.8)
      );
      targetLookAt.copy(
        m ? new THREE.Vector3(-0.2, 1.8, -0.6) : t ? new THREE.Vector3(0.0, 1.4, -0.3) : new THREE.Vector3(0.0, 1.25, 0.0)
      );
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    if (currentFocus) {
      focus(currentFocus, true);
    } else {
      renderer.render(scene, camera);
    }
  };

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  const onVisibilityChange = () => {
    isTabHidden = document.hidden;
    if (!document.hidden && !isPaused && !reqId) {
      lastFrameTime = performance.now();
      reqId = requestAnimationFrame(animate);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Debug Handle
  const debugHandle = {
    renderer,
    scene,
    camera,
    robot: { root: robotRoot, head: headGroup, crtFace },
    rig,
    props,
    targets,
    physicalSurfaces,
    focus: (id, instant) => focus(id, instant),
    reset: (instant) => reset(instant),
    get currentFocus() {
      return currentFocus;
    },
    get isTransitioning() {
      return Boolean(transition);
    },
    getProjectionBounds: (id) => computeSurfaceBounds(id || currentFocus),
    getFrameCount: () => frameCount,
    resetCamera: () => reset(true),
    get timeOfDay() {
      return currentIsDay ? 'day' : 'night';
    },
    carPositions: () => cars.map((c) => c.mesh.position.x),
  };

  if (typeof window !== 'undefined') {
    window.__THREE_ROOM_DEBUG__ = debugHandle;
    window.__PREVIEW__ = debugHandle;
  }

  return {
    focus,
    reset,
    setHoveredTarget: (id) => {
      activeHoverTarget = id;
      updateHaloGlows();
    },
    getProjectionBounds: computeSurfaceBounds,
    pause: () => {
      isPaused = true;
      if (reqId && !transition) {
        cancelAnimationFrame(reqId);
        reqId = null;
      }
    },
    resume: () => {
      if (isPaused) {
        isPaused = false;
        lastFrameTime = performance.now();
        if (!reqId) reqId = requestAnimationFrame(animate);
      }
    },
    resetCamera: () => reset(true),
    renderSingleFrame: () => {
      renderer.render(scene, camera);
    },
    setDaytime: (isDay) => {
      applyDayNight(isDay);
      renderer.render(scene, camera);
    },
    dispose: () => {
      if (reqId) cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('click', onClick);

      if (window.__THREE_ROOM_DEBUG__ === debugHandle) {
        delete window.__THREE_ROOM_DEBUG__;
      }
      if (window.__PREVIEW__ === debugHandle) {
        delete window.__PREVIEW__;
      }

      disposables.forEach((item) => {
        if (item.dispose) item.dispose();
      });
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
