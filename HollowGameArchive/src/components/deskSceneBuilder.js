import * as THREE from 'three';
import { isVietnamDaytime } from '../utils/vnTime.js';

/**
 * Procedural Three.js portfolio room diorama with day/night cycle and animated city window background.
 *
 * Features:
 * - 3D diorama corner room with real window opening in the back wall behind the robot/desk
 * - Outside 3D world: two-lane road with cars continuously driving and looping in opposite directions,
 *   sidewalks, street lamps, low-poly city skyline buildings with lit windows, sun/moon celestial objects
 * - Day / Night system tied to Vietnam local time (hour in [6, 18)):
 *   Day: bright daylight sky, warm sun light, lamps off, car lights off, building window glow off
 *   Night: dark night sky, moon light, glowing street lamps, lit building windows, car headlights & taillights
 * - Front-and-center articulated robot with CRT face (blinking eyes, greeting wave, idle breathing)
 * - Executive desk with monitor, keyboard, mouse, gamepad, succulent plant, desk lamp, smartphone
 * - Interactive hotspots & clickable 3D objects for:
 *   Projects (monitor), Resume (shelf), Contact (phone), About (wall poster), Ask AI (robot CRT face)
 * - Projection of 3D object anchor positions to 2D screen coordinates every frame for DOM labels
 * - Bounded drag orbit (azimuth ±30°, elevation -10° to +20°)
 * - QA Debug Handle on window.__THREE_ROOM_DEBUG__
 * - Complete memory cleanup & disposal
 */
export function initDeskScene(canvas, container, options = {}) {
  const { onSelectHotspot, reducedMotion = false, isDay: initialIsDay } = options;

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

  // 3. Camera (Framed elevated isometric view)
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1000;
  const defaultFov = isMobile ? 52 : (isTablet ? 44 : 38);
  const camera = new THREE.PerspectiveCamera(defaultFov, width / height, 0.1, 60);

  const defaultCamPos = isMobile
    ? new THREE.Vector3(5.6, 4.4, 6.8)
    : (isTablet ? new THREE.Vector3(5.2, 4.0, 6.4) : new THREE.Vector3(4.8, 3.8, 5.8));
  const targetLookAt = isMobile
    ? new THREE.Vector3(-0.2, 1.8, -0.6)
    : (isTablet ? new THREE.Vector3(0.0, 1.4, -0.3) : new THREE.Vector3(0.0, 1.25, 0.0));

  camera.position.copy(defaultCamPos);
  camera.lookAt(targetLookAt);

  // Disposal tracking
  const disposables = [];
  const track = (item) => {
    disposables.push(item);
    return item;
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

  // Sun Light (Day) - outside sun fill entering room without aliased floor shadow
  const sunLight = new THREE.DirectionalLight(0xfffaed, currentIsDay ? 3.4 : 0);
  sunLight.position.set(-5, 9, -12);
  sunLight.castShadow = false;
  scene.add(sunLight);

  // Moon Light (Night)
  const moonLight = new THREE.DirectionalLight(0x8ab2f8, currentIsDay ? 0 : 1.3);
  moonLight.position.set(-4, 7, -6);
  moonLight.castShadow = false;
  scene.add(moonLight);

  // Warm key spotlight from desk lamp
  const deskSpot = new THREE.SpotLight(0xffbe6b, currentIsDay ? 0.9 : 2.8, 6, Math.PI / 3.2, 0.35, 1.2);
  deskSpot.position.set(-1.0, 2.4, 0.4);
  deskSpot.target.position.set(0.0, 1.1, 0.0);
  deskSpot.castShadow = true;
  deskSpot.shadow.mapSize.width = 512;
  deskSpot.shadow.mapSize.height = 512;
  deskSpot.shadow.bias = -0.0005;
  scene.add(deskSpot);
  scene.add(deskSpot.target);

  // Under-desk warm ambient light
  const underDeskGlow = new THREE.PointLight(0xffb74d, currentIsDay ? 0.4 : 1.2, 3.0, 2.0);
  underDeskGlow.position.set(0, 0.45, 0.0);
  scene.add(underDeskGlow);

  // Monitor cyan screen bounce
  const monitorGlow = new THREE.PointLight(0x38bdf8, currentIsDay ? 1.0 : 1.5, 3.5, 1.6);
  monitorGlow.position.set(-0.8, 1.7, 0.2);
  scene.add(monitorGlow);

  // Outside street lights
  const streetLight1 = new THREE.PointLight(0xffe082, currentIsDay ? 0 : 1.8, 12, 1.5);
  streetLight1.position.set(-2.5, 2.8, -4.2);
  scene.add(streetLight1);

  const streetLight2 = new THREE.PointLight(0xffe082, currentIsDay ? 0 : 1.8, 12, 1.5);
  streetLight2.position.set(2.5, 2.8, -4.2);
  scene.add(streetLight2);

  // 5. Room Geometry (Floor, rug, walls with real window opening)
  const roomGroup = new THREE.Group();
  roomGroup.name = 'RoomGroup';
  scene.add(roomGroup);

  // Floor
  const floorGeo = track(new THREE.PlaneGeometry(12, 12));
  const floor = new THREE.Mesh(floorGeo, matFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Area Rug under desk
  const rugGeo = track(new THREE.BoxGeometry(4.4, 0.02, 4.0));
  const rug = new THREE.Mesh(rugGeo, matRug);
  rug.position.set(0.1, 0.01, -0.1);
  rug.receiveShadow = true;
  roomGroup.add(rug);

  // Rug accent border
  const rugBorderGeo = track(new THREE.BoxGeometry(4.5, 0.018, 4.1));
  const rugBorder = new THREE.Mesh(rugBorderGeo, matRugBorder);
  rugBorder.position.set(0.1, 0.008, -0.1);
  roomGroup.add(rugBorder);

  // Left wall
  const leftWallGeo = track(new THREE.BoxGeometry(0.2, 6, 10));
  const leftWall = new THREE.Mesh(leftWallGeo, matWall);
  leftWall.position.set(-4.5, 3, 1.4);
  leftWall.receiveShadow = true;
  roomGroup.add(leftWall);

  // Back Wall with REAL WINDOW OPENING directly behind the robot/desk
  // Floor-to-ceiling opening with low sill:
  // Opening: x in [-4.1, 0.25] (width 4.35), y in [0.12, 4.52] (height 4.40), at z = -3.2
  // Bottom wall piece (below sill): y: 0 to 0.12
  const wallBottom = new THREE.Mesh(track(new THREE.BoxGeometry(10, 0.12, 0.2)), matWall);
  wallBottom.position.set(0, 0.06, -3.2);
  wallBottom.receiveShadow = true;
  roomGroup.add(wallBottom);

  // Top wall piece (above lintel): y: 4.52 to 6.0 (height 1.48)
  const wallTop = new THREE.Mesh(track(new THREE.BoxGeometry(10, 1.48, 0.2)), matWall);
  wallTop.position.set(0, 5.26, -3.2);
  wallTop.receiveShadow = true;
  roomGroup.add(wallTop);

  // Left wall piece (left of window): x: -5 to -4.1 (width 0.9)
  const wallLeftOfWin = new THREE.Mesh(track(new THREE.BoxGeometry(0.9, 4.40, 0.2)), matWall);
  wallLeftOfWin.position.set(-4.55, 2.32, -3.2);
  wallLeftOfWin.receiveShadow = true;
  roomGroup.add(wallLeftOfWin);

  // Right wall piece (right of window): x: 0.25 to 5.0 (width 4.75)
  const wallRightOfWin = new THREE.Mesh(track(new THREE.BoxGeometry(4.75, 4.40, 0.2)), matWall);
  wallRightOfWin.position.set(2.625, 2.32, -3.2);
  wallRightOfWin.receiveShadow = true;
  roomGroup.add(wallRightOfWin);

  // Large Window Frame around opening
  const windowFrameGroup = new THREE.Group();
  windowFrameGroup.position.set(-1.925, 2.32, -3.2);
  roomGroup.add(windowFrameGroup);

  // Sill & Lintel
  const winSill = new THREE.Mesh(track(new THREE.BoxGeometry(4.45, 0.06, 0.24)), matMetalDark);
  winSill.position.set(0, -2.20, 0);
  windowFrameGroup.add(winSill);

  const winLintel = new THREE.Mesh(track(new THREE.BoxGeometry(4.45, 0.06, 0.24)), matMetalDark);
  winLintel.position.set(0, 2.20, 0);
  windowFrameGroup.add(winLintel);

  // Jambs
  const winJambL = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 4.40, 0.24)), matMetalDark);
  winJambL.position.set(-2.175, 0, 0);
  windowFrameGroup.add(winJambL);

  const winJambR = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 4.40, 0.24)), matMetalDark);
  winJambR.position.set(2.175, 0, 0);
  windowFrameGroup.add(winJambR);

  // Window Mullions (1 horizontal, 2 vertical)
  const winMullionH = new THREE.Mesh(track(new THREE.BoxGeometry(4.35, 0.04, 0.06)), matMetalDark);
  winMullionH.position.set(0, 0.2, 0);
  windowFrameGroup.add(winMullionH);

  const winMullionV1 = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 4.40, 0.06)), matMetalDark);
  winMullionV1.position.set(-0.75, 0, 0);
  windowFrameGroup.add(winMullionV1);

  const winMullionV2 = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 4.40, 0.06)), matMetalDark);
  winMullionV2.position.set(0.75, 0, 0);
  windowFrameGroup.add(winMullionV2);

  // Transparent glass pane
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

  // 6. Outside 3D City Environment (Visible through the big window opening)
  const outsideGroup = new THREE.Group();
  outsideGroup.name = 'OutsideCity';
  scene.add(outsideGroup);

  // Near Sidewalk (just outside room wall)
  const matSidewalk = track(new THREE.MeshStandardMaterial({ color: 0x333948, roughness: 0.85 }));
  const sidewalk1 = new THREE.Mesh(track(new THREE.BoxGeometry(36, 0.14, 1.0)), matSidewalk);
  sidewalk1.position.set(0, 0.07, -3.7);
  sidewalk1.receiveShadow = true;
  outsideGroup.add(sidewalk1);

  // Two-lane Road (z: -4.2 to -8.6, center at -6.4)
  const matRoad = track(new THREE.MeshStandardMaterial({ color: 0x181c26, roughness: 0.8 }));
  const road = new THREE.Mesh(track(new THREE.BoxGeometry(36, 0.08, 4.4)), matRoad);
  road.position.set(0, 0.06, -6.4);
  road.receiveShadow = true;
  outsideGroup.add(road);

  // Road Lane Divider Dashes (white dashed stripes down center line between both lanes)
  const matDash = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  for (let dx = -20.0; dx <= 20.0; dx += 2.0) {
    const dash = new THREE.Mesh(track(new THREE.BoxGeometry(1.2, 0.02, 0.44)), matDash);
    dash.position.set(dx, 0.105, -6.4);
    outsideGroup.add(dash);
  }

  // Far Sidewalk
  const sidewalk2 = new THREE.Mesh(track(new THREE.BoxGeometry(36, 0.14, 1.4)), matSidewalk);
  sidewalk2.position.set(0, 0.07, -9.3);
  sidewalk2.receiveShadow = true;
  outsideGroup.add(sidewalk2);

  // Street Lamps on sidewalk
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

  // Low-poly City Buildings across the road
  const buildingMaterials = [];
  const buildingData = [
    { x: -12.0, z: -12.5, w: 3.5, h: 3.6, d: 3.5, dayCol: 0xb4c6dc, nightCol: 0x1c2333 },
    { x: -7.5,  z: -11.6, w: 3.0, h: 2.2, d: 3.0, dayCol: 0xc2d4e8, nightCol: 0x1f2738 },
    { x: -3.8,  z: -11.2, w: 3.0, h: 3.4, d: 2.8, dayCol: 0xaec0d4, nightCol: 0x181e2b },
    { x: -0.2,  z: -12.0, w: 3.2, h: 2.4, d: 3.0, dayCol: 0xb9cbdf, nightCol: 0x222a3a },
    { x: 3.6,   z: -11.5, w: 3.0, h: 3.5, d: 2.8, dayCol: 0xb1c3d8, nightCol: 0x1d2435 },
    { x: 7.5,   z: -11.0, w: 3.2, h: 2.8, d: 3.0, dayCol: 0xbdcfe4, nightCol: 0x202838 },
  ];

  buildingData.forEach((b) => {
    const bMat = track(new THREE.MeshStandardMaterial({
      color: currentIsDay ? b.dayCol : b.nightCol,
      roughness: 0.8
    }));
    buildingMaterials.push({ mat: bMat, dayCol: b.dayCol, nightCol: b.nightCol });
    const bMesh = new THREE.Mesh(track(new THREE.BoxGeometry(b.w, b.h, b.d)), bMat);
    bMesh.position.set(b.x, b.h / 2, b.z);
    outsideGroup.add(bMesh);

    // Facade Window Grid
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

  // Celestial Sky Objects: Sky plane backdrop, Sun (day) & Moon (night)
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

  // 6 Low-Poly Cars driving continuously in opposite lanes
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
    // Lane 1: z = -5.3 (near lane, driving in +x direction)
    { color: 0xef4444, laneZ: -5.3, dir: 1, speed: 2.3, startX: -8.5 },
    { color: 0xf59e0b, laneZ: -5.3, dir: 1, speed: 1.7, startX: -0.5 },
    { color: 0x3b82f6, laneZ: -5.3, dir: 1, speed: 2.7, startX: 7.5 },
    // Lane 2: z = -7.5 (far lane, driving in -x direction)
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
    if (cfg.dir === -1) {
      carGroup.rotation.y = Math.PI; // Face -x direction
    }

    // Car Body
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

    // Car Cabin
    const carCabin = new THREE.Mesh(track(new THREE.BoxGeometry(0.96, 0.36, 0.70)), carBodyMat);
    carCabin.position.set(-0.08, 0.60, 0);
    carCabin.castShadow = true;
    carGroup.add(carCabin);

    // Windshield & Rear glass
    const frontGlass = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.30, 0.66)), cabinWinMat);
    frontGlass.position.set(0.40, 0.60, 0);
    carGroup.add(frontGlass);

    const rearGlass = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.30, 0.66)), cabinWinMat);
    rearGlass.position.set(-0.56, 0.60, 0);
    carGroup.add(rearGlass);

    // 4 Wheels
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

    // Headlights (front: +x)
    for (const hz of [-0.26, 0.26]) {
      const headlight = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.14, 0.18)), headlightMat);
      headlight.position.set(0.86, 0.24, hz);
      carGroup.add(headlight);
    }

    // Taillights (rear: -x)
    for (const tz of [-0.26, 0.26]) {
      const taillight = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.12, 0.18)), taillightMat);
      taillight.position.set(-0.86, 0.26, tz);
      carGroup.add(taillight);
    }

    // Forward headlight beam glow on road
    const headBeam = new THREE.Mesh(track(new THREE.PlaneGeometry(2.2, 0.9)), carBeamMat);
    headBeam.rotation.x = -Math.PI / 2;
    headBeam.position.set(1.9, -0.11, 0);
    carGroup.add(headBeam);

    outsideGroup.add(carGroup);
    cars.push({
      mesh: carGroup,
      dir: cfg.dir,
      speed: cfg.speed,
    });
  });

  // 7. Wall Shelf with books & audio speaker (Resume anchor)
  const shelfGroup = new THREE.Group();
  shelfGroup.position.set(1.1, 3.25, -3.05);
  roomGroup.add(shelfGroup);

  const shelfMesh = new THREE.Mesh(track(new THREE.BoxGeometry(2.0, 0.06, 0.4)), matDeskTop);
  shelfMesh.castShadow = true;
  shelfMesh.receiveShadow = true;
  shelfGroup.add(shelfMesh);

  const bookColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
  bookColors.forEach((color, i) => {
    const bMat = track(new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
    const bMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.07, 0.32, 0.24)), bMat);
    bMesh.position.set(-0.6 + i * 0.09, 0.18, 0.0);
    bMesh.castShadow = true;
    shelfGroup.add(bMesh);
  });

  const speakerMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.24, 0.34, 0.24)), matMetalDark);
  speakerMesh.position.set(0.55, 0.19, 0.0);
  speakerMesh.castShadow = true;
  shelfGroup.add(speakerMesh);

  // 8. Wall Poster / Certificate on the Left Wall (About anchor)
  const posterGroup = new THREE.Group();
  posterGroup.position.set(-4.39, 2.7, -0.6);
  posterGroup.rotation.y = Math.PI / 2;
  roomGroup.add(posterGroup);

  const posterFrame = new THREE.Mesh(track(new THREE.BoxGeometry(1.0, 1.35, 0.04)), matWarmGold);
  posterFrame.castShadow = true;
  posterGroup.add(posterFrame);

  // Poster art canvas
  const posterCanvas = document.createElement('canvas');
  posterCanvas.width = 256;
  posterCanvas.height = 340;
  const pCtx = posterCanvas.getContext('2d');
  pCtx.fillStyle = '#0f172a';
  pCtx.fillRect(0, 0, 256, 340);
  pCtx.fillStyle = '#1e293b';
  pCtx.fillRect(12, 12, 232, 316);
  pCtx.strokeStyle = '#ffdb70';
  pCtx.lineWidth = 3;
  pCtx.strokeRect(18, 18, 220, 304);
  pCtx.fillStyle = '#ffdb70';
  pCtx.font = 'bold 22px "Courier New", monospace';
  pCtx.fillText('ABOUT // BIO', 42, 60);
  pCtx.fillStyle = '#38bdf8';
  pCtx.font = '15px "Courier New", monospace';
  pCtx.fillText('CHU QUANG ANH', 48, 100);
  pCtx.fillStyle = '#94a3b8';
  pCtx.font = '13px "Courier New", monospace';
  pCtx.fillText('Unity 3D Engineer', 48, 130);
  pCtx.fillText('5 Years In Games', 48, 155);
  pCtx.fillText('Ha Noi, Vietnam', 48, 180);
  pCtx.fillStyle = '#4ade80';
  pCtx.fillRect(48, 210, 160, 2);
  pCtx.fillStyle = '#fbbf24';
  pCtx.fillText('2D / 3D / MMO / Apps', 36, 250);

  const posterTex = track(new THREE.CanvasTexture(posterCanvas));
  posterTex.colorSpace = THREE.SRGBColorSpace;
  const posterMat = track(new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.35 }));
  const posterMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(0.92, 1.25)), posterMat);
  posterMesh.position.set(0, 0, 0.025);
  posterGroup.add(posterMesh);

  // 9. Executive Desk Setup (Positioned in front of the robot)
  const deskGroup = new THREE.Group();
  deskGroup.name = 'DeskGroup';
  deskGroup.position.set(0, 0, 0.2);
  scene.add(deskGroup);

  const tabletop = new THREE.Mesh(track(new THREE.BoxGeometry(3.2, 0.09, 1.5)), matDeskTop);
  tabletop.position.set(0, 1.05, 0);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  deskGroup.add(tabletop);

  const rim = new THREE.Mesh(track(new THREE.BoxGeometry(3.1, 0.03, 1.4)), matWarmGold);
  rim.position.set(0, 0.99, 0);
  deskGroup.add(rim);

  const legGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 1.02, 16));
  const legPositions = [
    [-1.42, 0.51, -0.6],
    [1.42, 0.51, -0.6],
    [-1.42, 0.51, 0.6],
    [1.42, 0.51, 0.6],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, matDeskLegs);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    deskGroup.add(leg);
  });

  const deskMatMesh = new THREE.Mesh(track(new THREE.BoxGeometry(1.9, 0.01, 0.8)), matRug);
  deskMatMesh.position.set(0.0, 1.10, -0.05);
  deskMatMesh.receiveShadow = true;
  deskGroup.add(deskMatMesh);

  // Mechanical Keyboard
  const kbGroup = new THREE.Group();
  kbGroup.position.set(0.0, 1.11, -0.08);
  deskGroup.add(kbGroup);

  const kbBase = new THREE.Mesh(track(new THREE.BoxGeometry(0.72, 0.025, 0.25)), matMetalDark);
  kbBase.castShadow = true;
  kbGroup.add(kbBase);

  const keysBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.68, 0.02, 0.21)),
    track(new THREE.MeshStandardMaterial({ color: 0xefefef, roughness: 0.3 }))
  );
  keysBase.position.set(0, 0.015, 0);
  kbGroup.add(keysBase);

  const wasdKey = new THREE.Mesh(track(new THREE.BoxGeometry(0.12, 0.025, 0.08)), matWarmGold);
  wasdKey.position.set(-0.2, 0.02, 0.02);
  kbGroup.add(wasdKey);

  // Gaming Mouse
  const mouseGroup = new THREE.Group();
  mouseGroup.position.set(0.55, 1.11, -0.08);
  deskGroup.add(mouseGroup);

  const mouseMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.1, 0.035, 0.16)), matMetalDark);
  mouseMesh.castShadow = true;
  mouseGroup.add(mouseMesh);

  // Game Controller
  const controllerGroup = new THREE.Group();
  controllerGroup.position.set(1.15, 1.11, 0.1);
  controllerGroup.rotation.y = -Math.PI / 6;
  deskGroup.add(controllerGroup);

  const ctrlBody = new THREE.Mesh(track(new THREE.BoxGeometry(0.24, 0.04, 0.15)), matMetalDark);
  ctrlBody.castShadow = true;
  controllerGroup.add(ctrlBody);

  const dpad = new THREE.Mesh(track(new THREE.BoxGeometry(0.05, 0.02, 0.05)), matWarmGold);
  dpad.position.set(-0.06, 0.025, 0.01);
  controllerGroup.add(dpad);

  // Desk Lamp
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-1.25, 1.1, 0.15);
  deskGroup.add(lampGroup);

  const lampBase = new THREE.Mesh(track(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16)), matMetalDark);
  lampBase.castShadow = true;
  lampGroup.add(lampBase);

  const lampStem1 = new THREE.Mesh(track(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 12)), matWarmGold);
  lampStem1.position.set(0.08, 0.3, -0.05);
  lampStem1.rotation.z = -0.3;
  lampStem1.castShadow = true;
  lampGroup.add(lampStem1);

  const lampShade = new THREE.Mesh(track(new THREE.ConeGeometry(0.14, 0.2, 16, 1, true)), matWarmGold);
  lampShade.position.set(0.38, 0.65, -0.15);
  lampShade.rotation.z = 0.9;
  lampShade.rotation.x = -0.3;
  lampShade.castShadow = true;
  lampGroup.add(lampShade);

  const lampBulb = new THREE.Mesh(track(new THREE.SphereGeometry(0.05, 12, 12)), track(new THREE.MeshBasicMaterial({ color: 0xfff0b3 })));
  lampBulb.position.copy(lampShade.position);
  lampGroup.add(lampBulb);

  // Succulent Plant
  const plantGroup = new THREE.Group();
  plantGroup.position.set(1.25, 1.1, -0.45);
  deskGroup.add(plantGroup);

  const pot = new THREE.Mesh(track(new THREE.CylinderGeometry(0.1, 0.08, 0.18, 16)), track(new THREE.MeshStandardMaterial({ color: 0xe0d6c8, roughness: 0.7 })));
  pot.position.set(0, 0.09, 0);
  pot.castShadow = true;
  plantGroup.add(pot);

  const plantLeafMat = track(new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.6 }));
  for (let p = 0; p < 7; p++) {
    const leaf = new THREE.Mesh(track(new THREE.ConeGeometry(0.05, 0.15, 6)), plantLeafMat);
    const angle = (p / 7) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.05, 0.22, Math.sin(angle) * 0.05);
    leaf.rotation.z = Math.cos(angle) * 0.35;
    leaf.rotation.x = Math.sin(angle) * 0.35;
    leaf.castShadow = true;
    plantGroup.add(leaf);
  }

  // Smartphone on desk (Contact anchor)
  const phoneMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.12, 0.015, 0.22)), matMetalDark);
  phoneMesh.position.set(0.85, 1.105, 0.35);
  phoneMesh.rotation.y = 0.2;
  phoneMesh.castShadow = true;
  deskGroup.add(phoneMesh);

  // Ultrawide Monitor (Projects anchor)
  const monitorGroup = new THREE.Group();
  monitorGroup.name = 'MonitorGroup';
  monitorGroup.position.set(-0.82, 1.1, -0.25);
  monitorGroup.rotation.y = Math.PI / 7;
  deskGroup.add(monitorGroup);

  const standBase = new THREE.Mesh(track(new THREE.BoxGeometry(0.4, 0.02, 0.25)), matDeskLegs);
  standBase.position.set(0, 0.01, 0);
  standBase.castShadow = true;
  monitorGroup.add(standBase);

  const standPillar = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.55, 0.08)), matDeskLegs);
  standPillar.position.set(0, 0.28, -0.05);
  standPillar.castShadow = true;
  monitorGroup.add(standPillar);

  // Screen UI Canvas
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 512;
  const sCtx = screenCanvas.getContext('2d');
  sCtx.fillStyle = '#0a0d14';
  sCtx.fillRect(0, 0, 1024, 512);

  sCtx.fillStyle = '#141a29';
  sCtx.fillRect(0, 0, 1024, 48);
  sCtx.fillStyle = '#ffb74d';
  sCtx.font = 'bold 20px "Courier New", monospace';
  sCtx.fillText('CHU QUANG ANH // UNITY 3D & GAME DEV WORKSPACE', 30, 32);

  sCtx.fillStyle = '#0f1422';
  sCtx.fillRect(24, 68, 540, 420);
  sCtx.fillStyle = '#38bdf8';
  sCtx.font = '16px "Courier New", monospace';
  const codeLines = [
    'using UnityEngine;',
    'using ADNX.Gameplay;',
    '',
    'public class HeroController : MonoBehaviour {',
    '    [SerializeField] private float moveSpeed = 8.5f;',
    '    [SerializeField] private WeaponSystem weapons;',
    '',
    '    void Update() {',
    '        Vector3 dir = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));',
    '        transform.Translate(dir * moveSpeed * Time.deltaTime);',
    '        if (Input.GetButtonDown("Fire1")) weapons.CastSpell();',
    '    }',
    '}',
    '// 17+ commercial & web game titles shipped.',
  ];
  codeLines.forEach((line, idx) => {
    if (line.startsWith('//')) sCtx.fillStyle = '#64748b';
    else if (line.includes('class') || line.includes('using')) sCtx.fillStyle = '#f472b6';
    else if (line.includes('SerializeField') || line.includes('public')) sCtx.fillStyle = '#fbbf24';
    else sCtx.fillStyle = '#38bdf8';
    sCtx.fillText(line, 44, 104 + idx * 24);
  });

  sCtx.fillStyle = '#1e293b';
  sCtx.fillRect(588, 68, 412, 420);
  sCtx.strokeStyle = '#334155';
  sCtx.lineWidth = 1;
  for (let gy = 68; gy < 488; gy += 30) {
    sCtx.beginPath();
    sCtx.moveTo(588, gy);
    sCtx.lineTo(1000, gy);
    sCtx.stroke();
  }
  for (let gx = 588; gx < 1000; gx += 30) {
    sCtx.beginPath();
    sCtx.moveTo(gx, 68);
    sCtx.lineTo(gx, 488);
    sCtx.stroke();
  }
  sCtx.fillStyle = '#ffdb70';
  sCtx.font = 'bold 22px "Courier New", monospace';
  sCtx.fillText('GAME PREVIEW: ACTIVE', 612, 110);
  sCtx.fillStyle = '#4ade80';
  sCtx.font = '16px "Courier New", monospace';
  sCtx.fillText('FPS: 60 | DRAW CALLS: 42', 612, 140);
  sCtx.fillText('PROJECTS: 17 LOADED', 612, 166);

  sCtx.fillStyle = '#38bdf8';
  sCtx.beginPath();
  sCtx.arc(794, 300, 50, 0, Math.PI * 2);
  sCtx.fill();
  sCtx.fillStyle = '#0f172a';
  sCtx.beginPath();
  sCtx.arc(780, 290, 8, 0, Math.PI * 2);
  sCtx.arc(808, 290, 8, 0, Math.PI * 2);
  sCtx.fill();

  const screenTex = track(new THREE.CanvasTexture(screenCanvas));
  screenTex.colorSpace = THREE.SRGBColorSpace;
  const screenMat = track(
    new THREE.MeshStandardMaterial({
      map: screenTex,
      roughness: 0.2,
      emissive: 0xffffff,
      emissiveMap: screenTex,
      emissiveIntensity: 0.7,
    })
  );

  const monitorFrame = new THREE.Mesh(track(new THREE.BoxGeometry(1.9, 0.95, 0.08)), matMetalDark);
  monitorFrame.position.set(0, 0.58, 0);
  monitorFrame.castShadow = true;
  monitorGroup.add(monitorFrame);

  const monitorScreen = new THREE.Mesh(track(new THREE.PlaneGeometry(1.82, 0.88)), screenMat);
  monitorScreen.position.set(0, 0.58, 0.045);
  monitorGroup.add(monitorScreen);

  // 10. Ergonomic Office Chair
  const chairGroup = new THREE.Group();
  chairGroup.name = 'ChairGroup';
  chairGroup.position.set(0, 0, -0.55);
  scene.add(chairGroup);

  for (let c = 0; c < 5; c++) {
    const angle = (c / 5) * Math.PI * 2;
    const legSpoke = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.04, 0.45)), matDeskLegs);
    legSpoke.position.set(Math.sin(angle) * 0.22, 0.08, Math.cos(angle) * 0.22);
    legSpoke.rotation.y = angle;
    chairGroup.add(legSpoke);

    const wheel = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8)), matMetalDark);
    wheel.position.set(Math.sin(angle) * 0.42, 0.04, Math.cos(angle) * 0.42);
    wheel.rotation.z = Math.PI / 2;
    chairGroup.add(wheel);
  }

  const cylinder = new THREE.Mesh(track(new THREE.CylinderGeometry(0.045, 0.045, 0.4, 16)), matMetalDark);
  cylinder.position.set(0, 0.28, 0);
  chairGroup.add(cylinder);

  const seat = new THREE.Mesh(track(new THREE.BoxGeometry(0.72, 0.1, 0.68)), matChair);
  seat.position.set(0, 0.52, 0);
  seat.castShadow = true;
  chairGroup.add(seat);

  const backrestSupport = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.7, 0.06)), matDeskLegs);
  backrestSupport.position.set(0, 0.88, -0.32);
  chairGroup.add(backrestSupport);

  const backrest = new THREE.Mesh(track(new THREE.BoxGeometry(0.64, 0.65, 0.08)), matChair);
  backrest.position.set(0, 0.95, -0.3);
  backrest.rotation.x = 0.1;
  backrest.castShadow = true;
  chairGroup.add(backrest);

  for (const ax of [-0.36, 0.36]) {
    const armPost = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.3, 0.04)), matDeskLegs);
    armPost.position.set(ax, 0.68, -0.05);
    chairGroup.add(armPost);

    const armPad = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.04, 0.32)), matChair);
    armPad.position.set(ax, 0.83, -0.05);
    chairGroup.add(armPad);
  }

  // 11. Articulated Robot Character Seated Behind Desk
  const robotRoot = new THREE.Group();
  robotRoot.name = 'RobotCharacter';
  robotRoot.position.set(0, 0.58, -0.55);
  scene.add(robotRoot);

  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'RobotTorso';
  robotRoot.add(torsoGroup);

  const torsoGeo = track(new THREE.BoxGeometry(0.62, 0.64, 0.42));
  const torso = new THREE.Mesh(torsoGeo, matRobotBody);
  torso.position.set(0, 0.42, 0);
  torso.castShadow = true;
  torsoGroup.add(torso);

  const chestPlate = new THREE.Mesh(track(new THREE.BoxGeometry(0.42, 0.24, 0.03)), matMetalDark);
  chestPlate.position.set(0, 0.46, 0.215);
  torsoGroup.add(chestPlate);

  const chestLight = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16)),
    track(new THREE.MeshBasicMaterial({ color: 0x38bdf8 }))
  );
  chestLight.position.set(0, 0.46, 0.23);
  chestLight.rotation.x = Math.PI / 2;
  torsoGroup.add(chestLight);

  const neck = new THREE.Mesh(track(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16)), matRobotJoint);
  neck.position.set(0, 0.78, 0);
  torsoGroup.add(neck);

  // Head Group (CRT Monitor Head)
  const headGroup = new THREE.Group();
  headGroup.name = 'RobotHead';
  headGroup.position.set(0, 1.08, 0);
  torsoGroup.add(headGroup);

  const headGeo = track(new THREE.BoxGeometry(0.66, 0.54, 0.5));
  const headMesh = new THREE.Mesh(headGeo, matRobotBody);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const antennaStem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 12)), matWarmGold);
  antennaStem.position.set(0, 0.36, 0);
  headGroup.add(antennaStem);

  const antennaTip = new THREE.Mesh(track(new THREE.SphereGeometry(0.045, 12, 12)), matWarmGold);
  antennaTip.position.set(0, 0.47, 0);
  headGroup.add(antennaTip);

  for (const ex of [-0.35, 0.35]) {
    const ear = new THREE.Mesh(track(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16)), matRobotJoint);
    ear.position.set(ex, 0, 0);
    ear.rotation.z = Math.PI / 2;
    headGroup.add(ear);
  }

  // CRT Screen with animated expressive digital eyes that blink
  const eyeCanvas = document.createElement('canvas');
  eyeCanvas.width = 256;
  eyeCanvas.height = 256;
  const eyeCtx = eyeCanvas.getContext('2d');

  function renderRobotFace(eyeOpenness = 1.0) {
    eyeCtx.fillStyle = '#060a12';
    eyeCtx.fillRect(0, 0, 256, 256);

    eyeCtx.fillStyle = 'rgba(20, 35, 60, 0.4)';
    for (let y = 0; y < 256; y += 8) {
      eyeCtx.fillRect(0, y, 256, 3);
    }

    const eyeH = Math.max(2, 52 * eyeOpenness);
    eyeCtx.fillStyle = '#38bdf8';
    eyeCtx.shadowColor = '#38bdf8';
    eyeCtx.shadowBlur = 18;

    eyeCtx.beginPath();
    eyeCtx.roundRect(50, 128 - eyeH / 2, 50, eyeH, [12]);
    eyeCtx.fill();

    eyeCtx.beginPath();
    eyeCtx.roundRect(156, 128 - eyeH / 2, 50, eyeH, [12]);
    eyeCtx.fill();

    eyeCtx.shadowBlur = 0;
  }

  renderRobotFace(1.0);

  const eyeTexture = track(new THREE.CanvasTexture(eyeCanvas));
  eyeTexture.colorSpace = THREE.SRGBColorSpace;

  const crtFaceMat = track(
    new THREE.MeshStandardMaterial({
      map: eyeTexture,
      roughness: 0.15,
      metalness: 0.2,
      emissive: 0xffffff,
      emissiveMap: eyeTexture,
      emissiveIntensity: 0.9,
    })
  );
  const crtFace = new THREE.Mesh(track(new THREE.PlaneGeometry(0.56, 0.44)), crtFaceMat);
  crtFace.position.set(0, 0, 0.252);
  headGroup.add(crtFace);

  // Left Arm
  const leftShoulder = new THREE.Group();
  leftShoulder.name = 'LeftShoulder';
  leftShoulder.position.set(-0.38, 0.62, 0.0);
  torsoGroup.add(leftShoulder);

  const leftShoulderMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.07, 16, 16)), matRobotJoint);
  leftShoulder.add(leftShoulderMesh);

  const leftUpperArm = new THREE.Group();
  leftUpperArm.name = 'LeftUpperArm';
  leftUpperArm.position.set(0, -0.04, 0);
  leftShoulder.add(leftUpperArm);

  const leftUpperArmBone = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 14)), matRobotBody);
  leftUpperArmBone.position.set(0, -0.16, 0);
  leftUpperArmBone.castShadow = true;
  leftUpperArm.add(leftUpperArmBone);

  const leftElbow = new THREE.Group();
  leftElbow.name = 'LeftElbow';
  leftElbow.position.set(0, -0.32, 0);
  leftUpperArm.add(leftElbow);

  const leftElbowMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.06, 14, 14)), matRobotJoint);
  leftElbow.add(leftElbowMesh);

  const leftForearm = new THREE.Group();
  leftForearm.name = 'LeftForearm';
  leftElbow.add(leftForearm);

  const leftForearmBone = new THREE.Mesh(track(new THREE.CylinderGeometry(0.045, 0.04, 0.32, 14)), matRobotBody);
  leftForearmBone.position.set(0, 0, 0.16);
  leftForearmBone.rotation.x = Math.PI / 2;
  leftForearmBone.castShadow = true;
  leftForearm.add(leftForearmBone);

  const leftWrist = new THREE.Group();
  leftWrist.name = 'LeftWrist';
  leftWrist.position.set(0, 0, 0.32);
  leftForearm.add(leftWrist);

  const leftHand = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.04, 0.09)), matWarmGold);
  leftHand.position.set(0, 0, 0.04);
  leftWrist.add(leftHand);

  leftShoulder.rotation.x = -0.45;
  leftShoulder.rotation.z = -0.15;
  leftElbow.rotation.x = -0.65;
  leftElbow.rotation.y = 0.25;

  // Right Arm (Waving greeting wave on entry, rotating forearm at elbow)
  const rightShoulder = new THREE.Group();
  rightShoulder.name = 'RightShoulder';
  rightShoulder.position.set(0.38, 0.62, 0.0);
  torsoGroup.add(rightShoulder);

  const rightShoulderMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.07, 16, 16)), matRobotJoint);
  rightShoulder.add(rightShoulderMesh);

  const rightUpperArm = new THREE.Group();
  rightUpperArm.name = 'RightUpperArm';
  rightUpperArm.position.set(0, -0.04, 0);
  rightShoulder.add(rightUpperArm);

  const rightUpperArmBone = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 14)), matRobotBody);
  rightUpperArmBone.position.set(0, -0.16, 0);
  rightUpperArmBone.castShadow = true;
  rightUpperArm.add(rightUpperArmBone);

  const rightElbow = new THREE.Group();
  rightElbow.name = 'RightElbow';
  rightElbow.position.set(0, -0.32, 0);
  rightUpperArm.add(rightElbow);

  const rightElbowMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.06, 14, 14)), matRobotJoint);
  rightElbow.add(rightElbowMesh);

  const rightForearm = new THREE.Group();
  rightForearm.name = 'RightForearm';
  rightElbow.add(rightForearm);

  const rightForearmBone = new THREE.Mesh(track(new THREE.CylinderGeometry(0.045, 0.04, 0.32, 14)), matRobotBody);
  rightForearmBone.position.set(0, 0, 0.16);
  rightForearmBone.rotation.x = Math.PI / 2;
  rightForearmBone.castShadow = true;
  rightForearm.add(rightForearmBone);

  const rightWrist = new THREE.Group();
  rightWrist.name = 'RightWrist';
  rightWrist.position.set(0, 0, 0.32);
  rightForearm.add(rightWrist);

  const rightHand = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 0.04, 0.09)), matWarmGold);
  rightHand.position.set(0, 0, 0.04);
  rightWrist.add(rightHand);

  // 12. Interactive Hotspots (5 glowing diamond hotspots)
  const hotspots = [];
  const hotspotGroup = new THREE.Group();
  hotspotGroup.name = 'Hotspots';
  scene.add(hotspotGroup);

  const hotspotConfigs = [
    {
      id: 'portfolio',
      title: 'Projects',
      position: new THREE.Vector3(-0.82, 2.15, -0.25),
      labelAnchor: new THREE.Vector3(-0.95, 2.45, -0.25),
      color: 0xffdb70,
    },
    {
      id: 'resume',
      title: 'Resume',
      position: new THREE.Vector3(1.1, 3.35, -2.9),
      labelAnchor: new THREE.Vector3(1.1, 3.25, -2.9),
      color: 0x38bdf8,
    },
    {
      id: 'contact',
      title: 'Contact',
      position: new THREE.Vector3(0.85, 1.25, 0.35),
      labelAnchor: new THREE.Vector3(1.18, 1.18, 0.40),
      color: 0x4ade80,
    },
    {
      id: 'about',
      title: 'About',
      position: new THREE.Vector3(-3.95, 2.7, -0.6),
      labelAnchor: new THREE.Vector3(-3.85, 2.65, -0.6),
      color: 0xf59e0b,
    },
    {
      id: 'chat',
      title: 'Ask AI',
      position: new THREE.Vector3(0.0, 2.35, -0.55),
      labelAnchor: new THREE.Vector3(0.16, 2.45, -0.55),
      color: 0xa855f7,
    },
  ];

  hotspotConfigs.forEach((cfg) => {
    const pinGroup = new THREE.Group();
    pinGroup.position.copy(cfg.position);
    pinGroup.userData = { id: cfg.id, title: cfg.title };

    const diamondMat = track(
      new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      })
    );
    const diamond = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.09, 0)), diamondMat);
    diamond.name = `HotspotDiamond_${cfg.id}`;
    pinGroup.add(diamond);

    const ringMat = track(
      new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
    );
    const ring = new THREE.Mesh(track(new THREE.RingGeometry(0.12, 0.15, 24)), ringMat);
    ring.rotation.x = Math.PI / 2;
    pinGroup.add(ring);

    hotspotGroup.add(pinGroup);
    hotspots.push({ group: pinGroup, diamond, ring, cfg });
  });

  // Map clickable 3D objects directly to actions
  const clickableMap = new Map();
  clickableMap.set(crtFace, 'chat');
  clickableMap.set(headMesh, 'chat');
  clickableMap.set(monitorScreen, 'portfolio');
  clickableMap.set(monitorFrame, 'portfolio');
  clickableMap.set(phoneMesh, 'contact');
  clickableMap.set(shelfMesh, 'resume');
  clickableMap.set(posterMesh, 'about');
  clickableMap.set(posterFrame, 'about');
  hotspots.forEach((h) => {
    clickableMap.set(h.diamond, h.cfg.id);
  });
  const allClickableObjects = Array.from(clickableMap.keys());

  // 13. Pointer Drag & Camera Orbit Controls
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let rotAzimuth = 0;
  let rotElevation = 0;
  let targetAzimuth = 0;
  let targetElevation = 0;
  let dragDistance = 0;

  const maxAzimuth = Math.PI / 6; // ±30 degrees
  const minElevation = -Math.PI / 18; // -10 degrees
  const maxElevation = Math.PI / 9;  // +20 degrees

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragDistance = 0;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
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

  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  function checkRaycast(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);

    const intersects = raycaster.intersectObjects(allClickableObjects, false);
    if (intersects.length > 0) {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'grab';
    }
  }

  const onClick = (e) => {
    if (dragDistance > 6) return;
    const rect = canvas.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);

    const intersects = raycaster.intersectObjects(allClickableObjects, false);
    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const targetId = clickableMap.get(hitObj);
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

  // Day / Night Switcher Function
  function applyDayNight(isDay) {
    currentIsDay = Boolean(isDay);

    // Background & Sky
    const skyHex = currentIsDay ? 0x80c5f6 : 0x121726;
    scene.background.setHex(skyHex);
    skyMat.color.setHex(currentIsDay ? 0x80c5f6 : 0x0c101d);

    // Renderer Exposure
    renderer.toneMappingExposure = currentIsDay ? 1.48 : 1.15;

    // Materials Day/Night Palette
    matWall.color.setHex(currentIsDay ? 0xd4dce5 : 0x242a3a);
    matWall.roughness = currentIsDay ? 0.65 : 0.85;

    matFloor.color.setHex(currentIsDay ? 0xd0beaa : 0x1d2230);
    matFloor.roughness = currentIsDay ? 0.65 : 0.8;

    matRug.color.setHex(currentIsDay ? 0x9cb0c6 : 0x262f42);
    matRugBorder.color.setHex(currentIsDay ? 0xf59e0b : 0xffdb70);

    matMetalDark.color.setHex(currentIsDay ? 0x707d91 : 0x323a4e);
    matDeskTop.color.setHex(currentIsDay ? 0x6b5747 : 0x342a22);
    matDeskLegs.color.setHex(currentIsDay ? 0x707d91 : 0x30374a);
    matSidewalk.color.setHex(currentIsDay ? 0xaab8c8 : 0x333948);
    matRoad.color.setHex(currentIsDay ? 0x3e4a5d : 0x181c26);

    // Sun & Moon
    sunMesh.visible = currentIsDay;
    sunLight.intensity = currentIsDay ? 3.6 : 0;
    moonMesh.visible = !currentIsDay;
    moonLight.intensity = currentIsDay ? 0 : 1.3;

    // Ambient / Hemi
    hemiLight.color.setHex(currentIsDay ? 0xf8fafc : 0x1e273a);
    hemiLight.groundColor.setHex(currentIsDay ? 0xd6c4b2 : 0x0f1422);
    hemiLight.intensity = currentIsDay ? 2.8 : 0.5;

    // Desk Lighting
    deskSpot.intensity = currentIsDay ? 0.8 : 2.8;
    underDeskGlow.intensity = currentIsDay ? 0.3 : 1.2;
    monitorGlow.intensity = currentIsDay ? 0.9 : 1.5;

    // Street Lamps
    streetLight1.intensity = currentIsDay ? 0 : 1.8;
    streetLight2.intensity = currentIsDay ? 0 : 1.8;
    lampGlassMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffe082);
    lampGlassMat.emissiveIntensity = currentIsDay ? 0 : 1.8;

    // Building Facades
    buildingMaterials.forEach((b) => {
      b.mat.color.setHex(currentIsDay ? b.dayCol : b.nightCol);
    });

    // Lit Building Windows
    windowLitMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffdb70);
    windowLitMat.emissiveIntensity = currentIsDay ? 0 : 1.2;
    windowLitMat2.emissive.setHex(currentIsDay ? 0x000000 : 0x80d8ff);
    windowLitMat2.emissiveIntensity = currentIsDay ? 0 : 1.2;

    // Car Headlights, Taillights & Body Emissive
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

  // Initial application of day/night setting
  applyDayNight(currentIsDay);

  // 14. Animation Loop & Articulation
  let reqId = null;
  let isPaused = reducedMotion;
  let isTabHidden = false;
  let frameCount = 0;
  let startTime = performance.now();
  let lastFrameTime = startTime;
  let lastRenderTime = 0;
  let lastBlinkTime = startTime;
  let isBlinking = false;

  const GREETING_DURATION = 2800;
  const tempProjectVec = new THREE.Vector3();

  // Find DOM labels to project onto with 2D deconfliction and focal avoidance
  function updateDomLabels() {
    const labelElements = container.querySelectorAll('.room-label[data-hotspot-id]');
    if (!labelElements || labelElements.length === 0) return;

    const boxes = [];
    for (let i = 0; i < labelElements.length; i++) {
      const el = labelElements[i];
      const id = el.dataset.hotspotId;
      const h = hotspots.find((item) => item.cfg.id === id);
      if (!h) continue;

      tempProjectVec.copy(h.cfg.labelAnchor || h.cfg.position).project(camera);

      // Convert NDC to screen pixels
      const rawX = ((tempProjectVec.x + 1) / 2) * width;
      const rawY = ((-tempProjectVec.y + 1) / 2) * height;

      const labelW = el.offsetWidth || 84;
      const labelH = el.offsetHeight || 44;

      boxes.push({
        el,
        id,
        w: labelW,
        h: labelH,
        x: rawX - labelW / 2,
        y: rawY - labelH / 2,
      });
    }

    // Viewport bounds: leave room for clock and pause button at top
    const minX = 16;
    const maxX = width - 16;
    const minY = 68; // Clock and pause button occupy top 20..64px
    const maxY = height - 20;

    // Initial clamp
    for (const b of boxes) {
      b.x = Math.max(minX, Math.min(maxX - b.w, b.x));
      b.y = Math.max(minY, Math.min(maxY - b.h, b.y));
    }

    // Focal bounding boxes (robot CRT face and monitor screen)
    const focalBoxes = [];
    const getMeshScreenBounds = (m) => {
      if (!m || !m.geometry) return null;
      m.geometry.computeBoundingBox();
      const bb = m.geometry.boundingBox;
      const xs = [];
      const ys = [];
      const v = new THREE.Vector3();
      for (const x of [bb.min.x, bb.max.x]) {
        for (const y of [bb.min.y, bb.max.y]) {
          v.set(x, y, 0);
          m.localToWorld(v).project(camera);
          xs.push(((v.x + 1) / 2) * width);
          ys.push(((-v.y + 1) / 2) * height);
        }
      }
      return {
        l: Math.min(...xs),
        r: Math.max(...xs),
        t: Math.min(...ys),
        b: Math.max(...ys),
      };
    };

    if (crtFace) {
      const f = getMeshScreenBounds(crtFace);
      if (f) focalBoxes.push(f);
    }
    if (monitorScreen) {
      const f = getMeshScreenBounds(monitorScreen);
      if (f) focalBoxes.push(f);
    }

    // Iterative deconfliction passes
    const padding = 6;
    for (let iter = 0; iter < 30; iter++) {
      let moved = false;

      // 1. Avoid focal boxes (robot face & monitor screen)
      for (const b of boxes) {
        for (const f of focalBoxes) {
          const ovX = Math.min(b.x + b.w, f.r) - Math.max(b.x, f.l);
          const ovY = Math.min(b.y + b.h, f.b) - Math.max(b.y, f.t);
          if (ovX > 0 && ovY > 0 && (ovX * ovY) > 0.08 * b.w * b.h) {
            moved = true;
            const pushUp = (b.y + b.h) - f.t;
            const pushDown = f.b - b.y;
            const pushLeft = (b.x + b.w) - f.l;
            const pushRight = f.r - b.x;
            const minPush = Math.min(pushUp, pushDown, pushLeft, pushRight);

            if (minPush === pushUp && b.y - pushUp >= minY) {
              b.y -= pushUp + 4;
            } else if (minPush === pushRight && b.x + pushRight <= maxX - b.w) {
              b.x += pushRight + 4;
            } else if (minPush === pushLeft && b.x - pushLeft >= minX) {
              b.x -= pushLeft + 4;
            } else if (b.y + pushDown <= maxY - b.h) {
              b.y += pushDown + 4;
            } else {
              b.y -= pushUp + 4;
            }
            b.x = Math.max(minX, Math.min(maxX - b.w, b.x));
            b.y = Math.max(minY, Math.min(maxY - b.h, b.y));
          }
        }
      }

      // 2. Avoid label-label collisions
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];

          const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);

          if (overlapX > -padding && overlapY > -padding) {
            moved = true;
            if (overlapY < overlapX) {
              const shift = (overlapY + padding) / 2;
              if (a.y <= b.y) {
                a.y -= shift;
                b.y += shift;
              } else {
                a.y += shift;
                b.y -= shift;
              }
            } else {
              const shift = (overlapX + padding) / 2;
              if (a.x <= b.x) {
                a.x -= shift;
                b.x += shift;
              } else {
                a.x += shift;
                b.x -= shift;
              }
            }

            // Re-clamp inside viewport bounds
            a.x = Math.max(minX, Math.min(maxX - a.w, a.x));
            a.y = Math.max(minY, Math.min(maxY - a.h, a.y));
            b.x = Math.max(minX, Math.min(maxX - b.w, b.x));
            b.y = Math.max(minY, Math.min(maxY - b.h, b.y));
          }
        }
      }

      if (!moved) break;
    }

    for (const b of boxes) {
      b.el.style.transform = `translate3d(${Math.round(b.x)}px, ${Math.round(b.y)}px, 0)`;
    }
  }

  function animate(now) {
    frameCount++;
    const delta = Math.min((now - lastFrameTime) * 0.001, 0.1);
    lastFrameTime = now;
    const elapsed = now - startTime;

    // Smooth bounded orbit interpolation
    rotAzimuth += (targetAzimuth - rotAzimuth) * 0.08;
    rotElevation += (targetElevation - rotElevation) * 0.08;

    const baseCam = defaultCamPos.clone();
    baseCam.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotAzimuth);
    baseCam.y += rotElevation * 2.5;
    camera.position.copy(baseCam);
    camera.lookAt(targetLookAt);

    // Continuous Car Motion & Looping (stops when paused, reduced-motion, or tab hidden)
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

    // Pulse Hotspot Rings & Diamonds
    hotspots.forEach((h, idx) => {
      const t = elapsed * 0.002 + idx * 1.5;
      h.diamond.rotation.y = t * 1.2;
      h.diamond.position.y = Math.sin(t) * 0.04;
      const ringScale = 1.0 + Math.sin(t * 1.5) * 0.2;
      h.ring.scale.set(ringScale, ringScale, ringScale);
    });

    // Eye blinking logic (every ~3.5s, blink for 140ms)
    if (now - lastBlinkTime > 3400) {
      isBlinking = true;
      lastBlinkTime = now;
    }
    if (isBlinking) {
      const blinkProgress = (now - lastBlinkTime) / 140;
      if (blinkProgress >= 1.0) {
        isBlinking = false;
        renderRobotFace(1.0);
        eyeTexture.needsUpdate = true;
      } else {
        const openness = Math.sin(blinkProgress * Math.PI);
        renderRobotFace(1.0 - openness * 0.95);
        eyeTexture.needsUpdate = true;
      }
    }

    // Torso breathing & subtle head tilt
    const breath = Math.sin(elapsed * 0.0018) * 0.008;
    torsoGroup.position.y = breath;
    headGroup.rotation.y = Math.sin(elapsed * 0.0008) * 0.06;
    headGroup.rotation.z = Math.cos(elapsed * 0.0012) * 0.02;

    // Right Arm finite greeting wave vs relaxed idle
    if (elapsed < GREETING_DURATION) {
      const waveT = elapsed / GREETING_DURATION;
      const easeWave = Math.sin(waveT * Math.PI);

      rightShoulder.rotation.x = -0.5 * easeWave;
      rightShoulder.rotation.z = -0.55 * easeWave;
      rightUpperArm.rotation.y = 0.3 * easeWave;

      rightElbow.rotation.z = Math.sin(elapsed * 0.009) * 0.5 * easeWave;
      rightElbow.rotation.x = -0.4 * easeWave;
      rightWrist.rotation.z = Math.sin(elapsed * 0.009) * 0.25 * easeWave;
    } else {
      rightShoulder.rotation.x = -0.45;
      rightShoulder.rotation.z = 0.15;
      rightUpperArm.rotation.y = 0;
      rightElbow.rotation.x = -0.65;
      rightElbow.rotation.z = -0.15 + Math.sin(elapsed * 0.002) * 0.02;
      rightWrist.rotation.z = 0;
    }

    if (now - lastRenderTime >= 30) {
      renderer.render(scene, camera);
      updateDomLabels();
      lastRenderTime = now;
    }

    if (!isPaused) {
      reqId = requestAnimationFrame(animate);
    }
  }

  reqId = requestAnimationFrame(animate);

  // Resize Handling
  const handleResize = () => {
    if (!container) return;
    width = container.clientWidth || 800;
    height = container.clientHeight || 600;

    const m = width < 700;
    const t = width >= 700 && width < 1000;
    camera.fov = m ? 52 : (t ? 44 : 38);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    defaultCamPos.copy(
      m ? new THREE.Vector3(5.6, 4.4, 6.8) : (t ? new THREE.Vector3(5.2, 4.0, 6.4) : new THREE.Vector3(4.8, 3.8, 5.8))
    );
    targetLookAt.copy(
      m ? new THREE.Vector3(-0.2, 1.8, -0.6) : (t ? new THREE.Vector3(0.0, 1.4, -0.3) : new THREE.Vector3(0.0, 1.25, 0.0))
    );

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    updateDomLabels();
  };

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  // Tab visibility changes
  const onVisibilityChange = () => {
    isTabHidden = document.hidden;
    if (!document.hidden && !isPaused && !reqId) {
      lastFrameTime = performance.now();
      reqId = requestAnimationFrame(animate);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // 15. QA Debug Handle
  const isDebug =
    typeof window !== 'undefined' &&
    (window.location.search.includes('sceneDebug=1') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isDebug) {
    window.__THREE_ROOM_DEBUG__ = {
      renderer,
      scene,
      camera,
      robot: {
        root: robotRoot,
        torso: torsoGroup,
        head: headGroup,
        crtFace,
        rightShoulder,
        rightUpperArm,
        rightElbow,
        rightForearm,
        rightWrist,
        rightHand,
        leftShoulder,
        leftUpperArm,
        leftElbow,
        leftForearm,
        leftWrist,
        leftHand,
      },
      hotspots: hotspotConfigs,
      getFrameCount: () => frameCount,
      resetCamera: () => {
        targetAzimuth = 0;
        targetElevation = 0;
      },
      get timeOfDay() {
        return currentIsDay ? 'day' : 'night';
      },
      carPositions: () => cars.map((c) => c.mesh.position.x),
    };
  }

  return {
    pause: () => {
      isPaused = true;
      if (reqId) {
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
    resetCamera: () => {
      targetAzimuth = 0;
      targetElevation = 0;
      camera.position.copy(defaultCamPos);
      camera.lookAt(targetLookAt);
      renderer.render(scene, camera);
      updateDomLabels();
    },
    renderSingleFrame: () => {
      renderer.render(scene, camera);
      updateDomLabels();
    },
    setDaytime: (isDay) => {
      applyDayNight(isDay);
      renderer.render(scene, camera);
    },
    updateLabels: () => {
      updateDomLabels();
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

      if (window.__THREE_ROOM_DEBUG__) {
        delete window.__THREE_ROOM_DEBUG__;
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
