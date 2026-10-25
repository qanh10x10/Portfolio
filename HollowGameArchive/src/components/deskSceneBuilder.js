import * as THREE from 'three';
import { isVietnamDaytime } from '../utils/vnTime.js';
import { JOBS } from '../data/jobs.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildDeskProps, LAYOUT as DESK_LAYOUT } from './scene/deskProps.js';
import { buildRobotChair } from './scene/robotChair.js';
import { loadGoku, seat as seatGoku, POSE as GOKU_POSE, poseSeated as poseGokuSeated } from './scene/goku.js';
import { loadHoverCarTraffic } from './scene/traffic.js';
import { buildChatPanel, PANEL as CHAT_PANEL } from './scene/chatPanel.js';
import { buildRoomDressing } from './scene/roomDressing.js';
import { loadGamingChair, loadGamingDesktop, loadBulletinBoard } from './scene/gamingSetup.js';
import { loadSleepingCat } from './scene/sleepingCat.js';

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
    onModelStatus,
    reducedMotion = false,
    isDay: initialIsDay,
  } = options;

  let width = container.clientWidth || 800;
  let height = container.clientHeight || 600;

  // 1. WebGL Renderer
  const renderer = options.renderer || new THREE.WebGLRenderer({
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
  // ponytail: frame the workstation on portrait; side props remain reachable through room navigation.
  const portraitFov = () => Math.max(62, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(37)) * height * 320 / (width * 844))));
  const defaultFov = isMobilePortrait ? portraitFov() : isMobile ? 52 : isTablet ? 44 : 38;
  const camera = new THREE.PerspectiveCamera(defaultFov, width / height, 0.1, 60);

  const defaultCamPos = isMobilePortrait
    ? new THREE.Vector3(4.4, 3.1, 5.2)
    : isMobile
    ? new THREE.Vector3(5.6, 4.4, 6.8)
    : isTablet
    ? new THREE.Vector3(5.2, 4.0, 6.4)
    : new THREE.Vector3(4.8, 3.8, 5.8);
  const targetLookAt = isMobilePortrait
    ? new THREE.Vector3(-0.35, 1.25, -0.2)
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
  const untrack = (item) => {
    const idx = disposables.indexOf(item);
    if (idx !== -1) disposables.splice(idx, 1);
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



  const underDeskGlow = new THREE.PointLight(0xffb74d, currentIsDay ? 0.4 : 0, 3.0, 2.0);
  underDeskGlow.position.set(0, 0.45, 0.0);
  scene.add(underDeskGlow);

  const monitorGlow = new THREE.PointLight(0x38bdf8, currentIsDay ? 1.0 : 0, 3.5, 1.6);
  monitorGlow.position.set(-0.8, 1.7, 0.2);
  scene.add(monitorGlow);

  const streetLight1 = new THREE.PointLight(0xffe082, currentIsDay ? 0 : 1.8, 12, 1.5);
  streetLight1.position.set(-2.5, 2.8, -4.2);
  scene.add(streetLight1);

  const streetLight2 = new THREE.PointLight(0xffe082, currentIsDay ? 0 : 1.8, 12, 1.5);
  streetLight2.position.set(2.5, 2.8, -4.2);
  scene.add(streetLight2);

  // 4b. Ceiling Fixture & Warm-Yellow Workstation Light
  const ceilingBulbMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xfff4db,
      roughness: 0.25,
      emissive: currentIsDay ? 0x000000 : 0xffd580,
      emissiveIntensity: currentIsDay ? 0 : 2.0,
    })
  );

  const ceilingLampGroup = new THREE.Group();
  ceilingLampGroup.name = 'CeilingLamp';
  ceilingLampGroup.position.set(0, 0, 0.2);
  scene.add(ceilingLampGroup);

  const ceilingCanopy = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16)),
    matMetalDark
  );
  ceilingCanopy.name = 'CeilingCanopy';
  ceilingCanopy.position.set(0, 5.99, 0);
  ceilingLampGroup.add(ceilingCanopy);

  const ceilingCord = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.005, 0.005, 2.43, 8)),
    matMetalDark
  );
  ceilingCord.name = 'CeilingCord';
  ceilingCord.position.set(0, 4.765, 0);
  ceilingLampGroup.add(ceilingCord);

  const ceilingShade = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.05, 0.22, 0.16, 16, 1, true)),
    matMetalDark
  );
  ceilingShade.name = 'CeilingShade';
  ceilingShade.position.set(0, 3.47, 0);
  ceilingLampGroup.add(ceilingShade);

  const ceilingBulbMesh = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.065, 16, 12)),
    ceilingBulbMat
  );
  ceilingBulbMesh.name = 'CeilingBulb';
  ceilingBulbMesh.position.set(0, 3.39, 0);
  ceilingLampGroup.add(ceilingBulbMesh);

  const ceilingLight = new THREE.SpotLight(
    0xffd09c,
    currentIsDay ? 0 : 24.0,
    8.0,
    Math.PI / 4,
    0.5,
    1.8
  );
  ceilingLight.name = 'CeilingLight';
  ceilingLight.position.set(0, 3.35, 0);
  ceilingLight.castShadow = false;
  ceilingLampGroup.add(ceilingLight);

  ceilingLight.target.name = 'CeilingLightTarget';
  ceilingLight.target.position.set(0.1, 1.05, 0.25);
  scene.add(ceilingLight.target);
  track({
    dispose: () => ceilingLight.target.removeFromParent(),
  });

  // 5. Room Geometry
  const roomGroup = new THREE.Group();
  roomGroup.name = 'RoomGroup';
  scene.add(roomGroup);

  const floorGeo = track(new THREE.BoxGeometry(13, 0.2, 10));
  const floor = new THREE.Mesh(floorGeo, matFloor);
  floor.position.set(1.5, -0.1, 1.4);
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

  // Room enclosure: inward-facing ceiling, front wall, and right wall
  const roomCeiling = new THREE.Mesh(track(new THREE.PlaneGeometry(13, 10)), matWall);
  roomCeiling.name = 'RoomCeiling';
  roomCeiling.rotation.x = Math.PI / 2;
  roomCeiling.position.set(1.5, 6, 1.4);
  roomCeiling.receiveShadow = true;
  roomGroup.add(roomCeiling);

  const roomFrontWall = new THREE.Mesh(track(new THREE.PlaneGeometry(13, 6)), matWall);
  roomFrontWall.name = 'RoomFrontWall';
  roomFrontWall.rotation.y = Math.PI;
  roomFrontWall.position.set(1.5, 3, 6.4);
  roomFrontWall.receiveShadow = true;
  roomGroup.add(roomFrontWall);

  const roomRightWall = new THREE.Mesh(track(new THREE.PlaneGeometry(10, 6)), matWall);
  roomRightWall.name = 'RoomRightWall';
  roomRightWall.rotation.y = -Math.PI / 2;
  roomRightWall.position.set(8, 3, 1.4);
  roomRightWall.receiveShadow = true;
  roomGroup.add(roomRightWall);

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

  // Batch static opaque sibling meshes in OutsideCity by material identity & render state
  const cityBuckets = new Map();
  for (const child of [...outsideGroup.children]) {
    if (!child.isMesh || child === sunMesh || child === moonMesh) continue;
    const mat = child.material;
    if (!mat || Array.isArray(mat) || mat.transparent || (mat.opacity !== undefined && mat.opacity < 1)) continue;
    const key = `${mat.id}_${child.castShadow ? 1 : 0}_${child.receiveShadow ? 1 : 0}_${child.renderOrder}_${child.layers.mask}`;
    let bucket = cityBuckets.get(key);
    if (!bucket) {
      bucket = {
        material: mat,
        castShadow: child.castShadow,
        receiveShadow: child.receiveShadow,
        renderOrder: child.renderOrder,
        layersMask: child.layers.mask,
        meshes: [],
      };
      cityBuckets.set(key, bucket);
    }
    bucket.meshes.push(child);
  }

  for (const bucket of cityBuckets.values()) {
    if (bucket.meshes.length <= 1) continue;
    const geos = bucket.meshes.map(mesh => {
      mesh.updateMatrix();
      return mesh.geometry.clone().applyMatrix4(mesh.matrix);
    });
    const mergedGeo = mergeGeometries(geos, false);
    geos.forEach(g => g.dispose());
    if (!mergedGeo) continue; // Keep original meshes if their attributes cannot be merged.
    for (const mesh of bucket.meshes) {
      outsideGroup.remove(mesh);
      untrack(mesh.geometry);
      mesh.geometry.dispose();
    }
    track(mergedGeo);
    const mergedMesh = new THREE.Mesh(mergedGeo, bucket.material);
    mergedMesh.castShadow = bucket.castShadow;
    mergedMesh.receiveShadow = bucket.receiveShadow;
    mergedMesh.renderOrder = bucket.renderOrder;
    mergedMesh.layers.mask = bucket.layersMask;
    outsideGroup.add(mergedMesh);
  }

  // Dim only interior radiance before ACES; global exposure keeps the city unchanged.
  const roomRadiance = { value: currentIsDay ? 1 : 0.28 };
  const exteriorMaterials = new Set();
  outsideGroup.traverse((o) => {
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m) exteriorMaterials.add(m);
  });
  const interiorCopies = new Map();
  const dimmedMaterials = new Set();
  function dimInterior(root) {
    root.traverse((o) => {
      if (!o.material || o === winGlass) return;
      const prepare = (original) => {
        let material = original;
        if (exteriorMaterials.has(original)) {
          if (!interiorCopies.has(original)) interiorCopies.set(original, track(original.clone()));
          material = interiorCopies.get(original);
        }
        if (!dimmedMaterials.has(material)) {
          material.onBeforeCompile = (shader) => {
            shader.uniforms.roomRadianceScale = roomRadiance;
            shader.fragmentShader = 'uniform float roomRadianceScale;\n' + shader.fragmentShader.replace(
              '#include <tonemapping_fragment>',
              'gl_FragColor.rgb *= roomRadianceScale;\n#include <tonemapping_fragment>'
            );
          };
          material.customProgramCacheKey = () => 'room-radiance-v1';
          material.needsUpdate = true;
          dimmedMaterials.add(material);
        }
        return material;
      };
      o.material = Array.isArray(o.material) ? o.material.map(prepare) : prepare(o.material);
    });
  }


  let traffic = null;
  const carBeamMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xfff3a0,
      transparent: true,
      opacity: currentIsDay ? 0 : 0.25,
      depthWrite: false,
    })
  );

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
  const ROBOT_POS = new THREE.Vector3(0.70, 0, -0.85);
  const ROBOT_YAW = -0.25;
  const IRONMAN_SEAT = { hipY: 0.907, z: 0.01 }; // pelvis height above floor / offset along the chair's forward axis
  const CHAT_PANEL_POS = { x: -0.75, z: -0.1, yaw: 0.62 };
  const robotFwd = new THREE.Vector3(Math.sin(ROBOT_YAW), 0, Math.cos(ROBOT_YAW));
  const robotRight = new THREE.Vector3(-Math.cos(ROBOT_YAW), 0, Math.sin(ROBOT_YAW));

  // Keyboard directly in front of robot
  const kbWorld = ROBOT_POS.clone().addScaledVector(robotFwd, 0.58);
  placeOnDesk(props.keyboard, { x: kbWorld.x, z: kbWorld.z - 0.2, yaw: ROBOT_YAW + Math.PI });
  placeOnDesk(props.mouse, { x: kbWorld.x + 0.38, z: kbWorld.z - 0.2 + 0.04 });
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
  audioTableGroup.position.set(DESK_LAYOUT.audioTable.x, 0, DESK_LAYOUT.audioTable.z);
  audioTableGroup.rotation.y = DESK_LAYOUT.audioTable.yaw;
  scene.add(audioTableGroup);
  const speakerGroup = props.audioTable.speaker;
  const musicScreen = props.audioTable.musicScreen;

  const dressing = buildRoomDressing(sceneCtx);
  scene.add(dressing.group);
  const dressingShadowMats = dressing.contactShadows.map((m) => m.material);
  dressing.contactShadows.find((m) => m.name === 'ContactShadow_AudioTable')?.position.set(DESK_LAYOUT.audioTable.x, 0.0025, DESK_LAYOUT.audioTable.z);

  const rig = buildRobotChair(sceneCtx);
  rig.root.position.copy(ROBOT_POS);
  rig.root.rotation.y = ROBOT_YAW;
  scene.add(rig.root);
  // The chair stays; the original robot is swapped for the Goku model once it has loaded (kept as fallback).
  rig.robot.removeFromParent();
  let goku = null;
  let sleepingCat = null;
  let gokuSettled = false;
  let disposed = false;
  const importedModels = { cat: null, chair: null, desktop: null, board: null, goku: null, traffic: null };
  const importedResources = [];
  const importedErrors = {};
  function publishModelStatus() {
    if (disposed) return;
    const status = {
      loaded: Object.values(importedModels).filter(Boolean).length,
      total: Object.keys(importedModels).length,
      errors: { ...importedErrors },
    };
    onModelStatus?.(status);
    if (typeof window !== 'undefined' && window.updateLoadingScreen) {
      window.updateLoadingScreen(status);
    }
  }

  const prevDefaultOnError = THREE.DefaultLoadingManager.onError;
  const installedDefaultOnError = (url) => {
    if (!disposed) {
      const cleanUrl = (url || '').split('?')[0];
      const filename = cleanUrl.split('/').pop() || 'resource';
      importedErrors[cleanUrl || 'asset'] = `Failed to load asset: ${filename}`;
      publishModelStatus();
    }
    if (typeof prevDefaultOnError === 'function') {
      try { prevDefaultOnError(url); } catch {}
    }
  };
  THREE.DefaultLoadingManager.onError = installedDefaultOnError;

  publishModelStatus();

  loadSleepingCat().then((model) => {
    if (disposed) return model.dispose();
    sleepingCat = model;
    placeOnDesk(model.group, { x: -1.24, z: 0.32 });
    dimInterior(model.group);
    const shadow = dressing.contactShadows.find(m => m.name === 'ContactShadow_Cat');
    if (shadow) {
      deskGroup.add(shadow);
      shadow.scale.set(0.65, 0.65, 1);
      shadow.position.set(-1.24, DESK_TOP_Y + 0.001, 0.32);
    }
    importedModels.cat = model.cat;
    importedResources.push(model);
    renderer.render(scene, camera);
  }).catch(() => {
    if (disposed) return;
    importedErrors.cat = 'Sleeping cat could not be loaded';
  }).finally(() => {
    if (disposed) return;
    publishModelStatus();
  });
  loadGamingChair().then((model) => {
    if (disposed) return model.dispose();
    rig.chair.removeFromParent();
    rig.root.add(model.group);
    dimInterior(model.group);
    importedModels.chair = model.group;
    importedResources.push(model);
    renderer.render(scene, camera);
  }).catch(() => {
    if (disposed) return;
    importedErrors.chair = 'Gaming chair could not be loaded';
  }).finally(() => {
    if (disposed) return;
    publishModelStatus();
  });
  loadGoku({ renderer })
    .then((m) => {
      if (disposed) return m.dispose();
      let hasMissingTex = false;
      m.figure.traverse((o) => {
        if (o.isMesh && o.material && !o.material.map) hasMissingTex = true;
      });
      if (hasMissingTex) {
        m.dispose();
        importedErrors.goku = 'Son Goku texture could not be loaded';
        if (!disposed) {
          rig.root.add(rig.robot);
        }
        return;
      }
      seatGoku(m.figure);
      rig.root.add(m.figure);
      dimInterior(m.figure);
      goku = m;
      importedModels.goku = m.figure;
    })
    .catch(() => {
      if (disposed) return;
      importedErrors.goku = 'Son Goku could not be loaded';
      rig.root.add(rig.robot);
    })
    .finally(() => {
      if (disposed) return;
      gokuSettled = true;
      publishModelStatus();
      renderer.render(scene, camera);
    });

  loadHoverCarTraffic({ outsideGroup, currentIsDay, carBeamMat })
    .then((t) => {
      if (disposed) return t.dispose();
      traffic = t;
      importedModels.traffic = t.group;
    })
    .catch(() => {
      if (disposed) return;
      importedErrors.traffic = 'Hover car traffic could not be loaded';
    })
    .finally(() => {
      if (disposed) return;
      publishModelStatus();
      renderer.render(scene, camera);
    });

  // Sci-fi chat terminal standing on the desk, left of the monitor, angled towards the default camera.
  const chatPanel = buildChatPanel(sceneCtx);
  placeOnDesk(chatPanel.group, { x: CHAT_PANEL_POS.x, z: CHAT_PANEL_POS.z, yaw: CHAT_PANEL_POS.yaw });
  const chatScreen = chatPanel.screen;

  // Phone lies face down; flipPhone animates it upright before the contact zoom.
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
  const haloChat = createHalo(chatPanel.group, new THREE.Vector3(0, chatPanel.centerY, 0.03), [1.15, 0.85]);

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
      object: chatPanel.group,
      point: () => chatScreen.getWorldPosition(new THREE.Vector3()),
      normal: new THREE.Vector3(Math.sin(CHAT_PANEL_POS.yaw), 0, Math.cos(CHAT_PANEL_POS.yaw)),
      distance: 0.9,
      halo: haloChat,
      haloSize: [1.15, 0.85],
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
      mesh: chatScreen,
      object: chatPanel.group,
      width: CHAT_PANEL.w,
      height: CHAT_PANEL.h,
      frameWidth: chatPanel.frameWidth,
      frameHeight: chatPanel.frameHeight,
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
  const clickableObjects = [monitorGroup, boardGroup, phoneGroup, chatPanel.group, speakerGroup];
  let gamingDesktop = null;
  let bulletinBoard = null;
  loadGamingDesktop().then((model) => {
    if (disposed) return model.dispose();
    // Keep the authored keyboard beneath Iron Man's gloves; the rest of the setup follows its own layout.
    model.group.scale.setScalar(2);
    const keyboardCenter = new THREE.Vector3(-0.102681, 0, 0.147948).multiplyScalar(2);
    keyboardCenter.applyAxisAngle(new THREE.Vector3(0, 1, 0), monYaw);
    placeOnDesk(model.group, { x: kbWorld.x - keyboardCenter.x, z: kbWorld.z - 0.2 - keyboardCenter.z, yaw: monYaw });
    model.screen.material = track(new THREE.MeshBasicMaterial({ map: monitorScreen.material.map }));
    dimInterior(model.group);
    monitorGroup.removeFromParent();
    props.keyboard.removeFromParent();
    props.mouse.removeFromParent();
    gamingDesktop = model;
    importedModels.desktop = model.group;
    importedResources.push(model);
    if (model.surface) {
      const surface = model.surface;
      Object.assign(physicalSurfaces.monitor, { mesh: surface.mesh, object: model.group, width: surface.width, height: surface.height, frameWidth: surface.frameWidth, frameHeight: surface.frameHeight, homeScale: new THREE.Vector3(2, 2, 2), allowPortrait: false });
      targets.monitor.object = model.group;
      targets.monitor.point = () => surface.mesh.getWorldPosition(new THREE.Vector3());
    }
    scene.updateMatrixWorld(true);
    if (currentFocus) focus(currentFocus, true);
    else renderer.render(scene, camera);
  }).catch(() => {
    if (disposed) return;
    importedErrors.desktop = 'Gaming desktop could not be loaded';
  }).finally(() => {
    if (disposed) return;
    publishModelStatus();
  });
  loadBulletinBoard().then((model) => {
    if (disposed) return model.dispose();
    const frameMesh = model.frameMesh;
    if (frameMesh?.material && !frameMesh.material.map) {
      model.dispose();
      importedErrors.board = 'Bulletin board texture could not be loaded';
      return;
    }
    model.group.position.set(boardGroup.position.x, 2.6, -2.1);
    model.group.rotation.copy(boardGroup.rotation);
    model.group.scale.setScalar(2.2);
    boardGroup.removeFromParent();
    roomGroup.add(model.group);
    dimInterior(model.group);
    bulletinBoard = model;
    importedModels.board = model.group;
    importedResources.push(model);
    if (model.surface) {
      const surface = model.surface;
      Object.assign(physicalSurfaces.resume, { mesh: surface.mesh, object: model.group, width: surface.width, height: surface.height, frameWidth: model.dimensions.x, frameHeight: model.dimensions.y, homeScale: new THREE.Vector3(2.2, 2.2, 2.2), allowPortrait: false });
      targets.resume.object = model.group;
      targets.resume.point = () => surface.mesh.getWorldPosition(new THREE.Vector3());
    }
    scene.updateMatrixWorld(true);
    if (currentFocus) focus(currentFocus, true);
    else renderer.render(scene, camera);
  }).catch(() => {
    if (disposed) return;
    importedErrors.board = 'Bulletin board could not be loaded';
  }).finally(() => {
    if (disposed) return;
    publishModelStatus();
  });

  function getHitTargetId(hitObject) {
    let o = hitObject;
    while (o) {
      if (o === targets.monitor.object) return 'monitor';
      if (o === targets.resume.object) return 'resume';
      if (o === gamingDesktop?.group) return 'monitor';
      if (o === bulletinBoard?.group) return 'resume';
      if (o === phoneGroup) return 'contact';
      if (o === chatPanel.group) return 'chat';
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
      if (!obj) continue;
      let ancestor = obj;
      while (ancestor && ancestor.visible) ancestor = ancestor.parent;
      if (ancestor) continue; // Raycaster visits children even when a parent is hidden.
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

  for (const root of scene.children) if (root !== outsideGroup) dimInterior(root);

  // Day / Night Switcher
  function applyDayNight(isDay) {
    currentIsDay = Boolean(isDay);
    const skyHex = currentIsDay ? 0x80c5f6 : 0x121726;
    scene.background.setHex(skyHex);
    skyMat.color.setHex(currentIsDay ? 0x80c5f6 : 0x0c101d);

    renderer.toneMappingExposure = currentIsDay ? 1.0 : 1.15;
    roomRadiance.value = currentIsDay ? 1 : 0.28;
    // Retain reflective room albedo at night; light colour, not blue-black paint, sets the mood.
    matWall.color.setHex(currentIsDay ? 0xd4dce5 : 0x9c9389);
    matFloor.color.setHex(currentIsDay ? 0xd0beaa : 0xa28e79);
    matRug.color.setHex(currentIsDay ? 0x9cb0c6 : 0x7c8999);
    matRugBorder.color.setHex(currentIsDay ? 0xf59e0b : 0xffdb70);
    matMetalDark.color.setHex(currentIsDay ? 0x707d91 : 0x323a4e);
    matDeskTop.color.setHex(0x6b5747);
    matDeskLegs.color.setHex(currentIsDay ? 0x707d91 : 0x30374a);
    matSidewalk.color.setHex(currentIsDay ? 0xaab8c8 : 0x333948);
    matRoad.color.setHex(currentIsDay ? 0x3e4a5d : 0x181c26);

    if (ceilingLight) {
      ceilingLight.intensity = currentIsDay ? 0 : 24.0;
    }
    if (ceilingBulbMat) {
      ceilingBulbMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffd580);
      ceilingBulbMat.emissiveIntensity = currentIsDay ? 0 : 2.0;
    }

    sunMesh.visible = currentIsDay;
    sunLight.intensity = currentIsDay ? 2.2 : 0;
    sunLight.castShadow = currentIsDay;
    moonMesh.visible = !currentIsDay;
    moonLight.intensity = currentIsDay ? 0 : 0.75;

    hemiLight.color.setHex(currentIsDay ? 0xf8fafc : 0xe9e3db);
    hemiLight.groundColor.setHex(currentIsDay ? 0xd6c4b2 : 0x65594e);
    hemiLight.intensity = currentIsDay ? 1.35 : 0.5;

    underDeskGlow.intensity = currentIsDay ? 0.3 : 0;
    monitorGlow.intensity = currentIsDay ? 0.9 : 0;

    streetLight1.intensity = currentIsDay ? 0 : 1.8;
    streetLight2.intensity = currentIsDay ? 0 : 1.8;
    lampGlassMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffe082);
    lampGlassMat.emissiveIntensity = currentIsDay ? 0 : 1.8;

    buildingMaterials.forEach((b) => {
      b.mat.color.setHex(currentIsDay ? b.dayCol : b.nightCol);
    });

    windowLitMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffdb70);
    windowLitMat.emissiveIntensity = currentIsDay ? 0 : 1.2;
    windowLitMat2.emissive.setHex(currentIsDay ? 0x000000 : 0x80d8ff);
    windowLitMat2.emissiveIntensity = currentIsDay ? 0 : 1.2;

    carBeamMat.opacity = currentIsDay ? 0 : 0.25;
    headlightMat.emissive.setHex(currentIsDay ? 0x000000 : 0xffffe0);
    headlightMat.emissiveIntensity = currentIsDay ? 0 : 3.5;
    taillightMat.emissive.setHex(currentIsDay ? 0x000000 : 0xff1744);
    taillightMat.emissiveIntensity = currentIsDay ? 0 : 3.5;
    for (const [original, copy] of interiorCopies) copy.color.copy(original.color);
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
    // When focusing on the monitor, hide the robot so it doesn't occlude the screen.
    rig.root.visible = id !== 'monitor';
    if (chatPanel?.screen) chatPanel.screen.visible = id !== 'chat';
    if (gamingDesktop) gamingDesktop.screen.visible = id !== 'monitor';
    restoreShape();
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
      if (width < 650 && s.allowPortrait !== false) {
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

    if (!reqId) {
      lastFrameTime = performance.now();
      reqId = requestAnimationFrame(animate);
    }
  }

  function reset(instant = false) {
    currentFocus = null;
    // Back returns to the default view; discard the old orbit so idle cannot snap back to it.
    rotAzimuth = targetAzimuth = rotElevation = targetElevation = 0;
    isDragging = false;
    restoreShape();
    rig.root.visible = true;
    if (chatPanel?.screen) chatPanel.screen.visible = true;
    if (gamingDesktop) gamingDesktop.screen.visible = true;
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

    if (!reqId) {
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
  let isTabHidden = false;
  let frameCount = 0;
  const startTime = performance.now();
  let lastFrameTime = startTime;
  let lastRenderTime = 0;

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

    const activeAnimation = !isTabHidden && !reducedMotion;
    if (!isTabHidden) {
      traffic?.update(delta);
    }

    goku?.update(elapsed, activeAnimation);
    sleepingCat?.update(elapsed, activeAnimation);

    if (now - lastRenderTime >= 16) {
      renderer.render(scene, camera);
      const allModelsReady = Object.values(importedModels).every(Boolean);
      const hasErrors = Object.keys(importedErrors).length > 0;
      if (!hasErrors && allModelsReady && goku && gokuSettled && frameCount >= 2) {
        if (typeof window !== 'undefined' && window.dismissLoadingScreen) {
          window.dismissLoadingScreen();
        }
      }
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

    reqId = requestAnimationFrame(animate);
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
      camera.fov = portraitFov();
      defaultCamPos.set(4.4, 3.1, 5.2);
      targetLookAt.set(-0.35, 1.25, -0.2);
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
    if (!document.hidden && !disposed && !reqId) {
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
    roomLighting: { radiance: roomRadiance },
    ceilingLamp: {
      group: ceilingLampGroup,
      light: ceilingLight,
      bulb: ceilingBulbMesh,
    },
    get goku() {
      return goku && { ...goku, POSE: GOKU_POSE, poseSeated: poseGokuSeated };
    },
    get sleepingCat() {
      return sleepingCat && {
        group: sleepingCat.group,
        cat: sleepingCat.cat,
        mesh: sleepingCat.mesh,
        update: sleepingCat.update,
      };
    },
    get traffic() {
      return traffic;
    },
    chatPanel,
    importedModels,
    importedErrors,
    get importedModelsReady() {
      return Object.values(importedModels).every(Boolean) && Object.keys(importedErrors).length === 0;
    },
    get importedModelsSettled() { return Object.keys(importedModels).every((name) => importedModels[name] || importedErrors[name]); },
    get gamingDesktop() { return gamingDesktop; },
    get bulletinBoard() { return bulletinBoard; },
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
    carPositions: () => traffic?.carPositions() || [],
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
    resetCamera: () => reset(true),
    renderSingleFrame: () => {
      renderer.render(scene, camera);
    },
    setDaytime: (isDay) => {
      applyDayNight(isDay);
      renderer.render(scene, camera);
    },
    dispose: () => {
      disposed = true;
      if (THREE.DefaultLoadingManager.onError === installedDefaultOnError) {
        THREE.DefaultLoadingManager.onError = prevDefaultOnError;
      }
      goku?.dispose();
      traffic?.dispose();
      importedResources.forEach((model) => { model.group.removeFromParent(); model.dispose(); });
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
