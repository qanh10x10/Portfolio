import * as THREE from 'three';

/**
 * Procedural Three.js portfolio room diorama.
 * Features:
 * - 3D diorama corner room: floor with geometric rug, back and left walls, window with night city skyline
 * - Front-and-center articulated robot seated behind executive desk:
 *   shoulder > upper arm > elbow > forearm > wrist > hand hierarchy
 *   finite greeting wave on entry (forearm rotates at elbow) + blinking digital CRT eyes + breathing idle
 * - Executive desk with beveled top, metal legs, under-desk LED glow
 * - Ultrawide monitor angled, mechanical keyboard, mouse, gamepad, succulent plant, desk lamp
 * - 3 interactive glowing hotspots (Work, Resume, Contact) with pulsing rings and raycast detection
 * - Bounded drag orbit (azimuth ±30°, elevation -10° to +20°) without intercepting vertical page scroll
 * - Accessible 44px controls (Play/Pause, Reset, Work, Skills, Contact)
 * - Lifecycle cleanup and memory disposal
 */
export function initDeskScene(canvas, container, options = {}) {
  const { onSelectHotspot, reducedMotion = false } = options;

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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  // 2. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x161a24);

  // 3. Camera (Framed at a clear 3/4 elevated isometric view)
  const isMobile = width < 768;
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 44 : 38,
    width / height,
    0.1,
    50
  );

  const defaultCamPos = isMobile
    ? new THREE.Vector3(5.6, 4.6, 6.8)
    : new THREE.Vector3(4.8, 3.8, 5.8);
  const targetLookAt = new THREE.Vector3(0.0, 1.25, 0.0);

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

  // 4. Lighting Setup (Low-key dusk mood + warm desk key + window cool fill)
  const ambientLight = new THREE.AmbientLight(0x2d3952, 1.4);
  scene.add(ambientLight);

  // Cool window moonlight fill
  const windowLight = new THREE.DirectionalLight(0x8ab2f8, 2.0);
  windowLight.position.set(-6, 6, -3);
  windowLight.castShadow = true;
  windowLight.shadow.mapSize.width = 1024;
  windowLight.shadow.mapSize.height = 1024;
  windowLight.shadow.bias = -0.0004;
  scene.add(windowLight);

  // Warm key spotlight from desk lamp
  const deskSpot = new THREE.SpotLight(0xffbe6b, 2.8, 6, Math.PI / 3.2, 0.35, 1.2);
  deskSpot.position.set(-1.0, 2.4, 0.4);
  deskSpot.target.position.set(0.0, 1.1, 0.0);
  deskSpot.castShadow = true;
  deskSpot.shadow.mapSize.width = 512;
  deskSpot.shadow.mapSize.height = 512;
  deskSpot.shadow.bias = -0.0005;
  scene.add(deskSpot);
  scene.add(deskSpot.target);

  // Under-desk warm ambient light
  const underDeskGlow = new THREE.PointLight(0xffb74d, 1.1, 3.0, 2.0);
  underDeskGlow.position.set(0, 0.45, 0.0);
  scene.add(underDeskGlow);

  // Monitor cyan screen bounce
  const monitorGlow = new THREE.PointLight(0x38bdf8, 1.4, 3.5, 1.6);
  monitorGlow.position.set(-0.8, 1.7, 0.2);
  scene.add(monitorGlow);

  // 5. Room Geometry (Diorama walls & floor)
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

  // Back wall
  const backWallGeo = track(new THREE.BoxGeometry(10, 6, 0.2));
  const backWall = new THREE.Mesh(backWallGeo, matWall);
  backWall.position.set(0, 3, -3.2);
  backWall.receiveShadow = true;
  roomGroup.add(backWall);

  // Left wall
  const leftWallGeo = track(new THREE.BoxGeometry(0.2, 6, 10));
  const leftWall = new THREE.Mesh(leftWallGeo, matWall);
  leftWall.position.set(-4.5, 3, 1.4);
  leftWall.receiveShadow = true;
  roomGroup.add(leftWall);

  // Window with glowing city night skyline on back wall
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-2.8, 3.3, -3.08);
  roomGroup.add(windowGroup);

  const winFrameGeo = track(new THREE.BoxGeometry(2.4, 2.2, 0.08));
  const winFrame = new THREE.Mesh(winFrameGeo, matMetalDark);
  windowGroup.add(winFrame);

  // City night canvas
  const citySkyCanvas = document.createElement('canvas');
  citySkyCanvas.width = 512;
  citySkyCanvas.height = 512;
  const ctx = citySkyCanvas.getContext('2d');
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#090d18');
  skyGrad.addColorStop(0.65, '#152238');
  skyGrad.addColorStop(1, '#2c3e5a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#0d131f';
  const buildings = [
    [10, 260, 60, 252],
    [80, 200, 75, 312],
    [165, 280, 55, 232],
    [230, 170, 80, 342],
    [320, 230, 65, 282],
    [395, 190, 70, 322],
    [475, 250, 50, 262],
  ];
  buildings.forEach(([x, y, w, h]) => {
    ctx.fillRect(x, y, w, h);
    for (let wy = y + 15; wy < y + h - 20; wy += 22) {
      for (let wx = x + 8; wx < x + w - 8; wx += 16) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = Math.random() > 0.3 ? '#ffdb70' : '#80d8ff';
          ctx.fillRect(wx, wy, 5, 8);
        }
      }
    }
    ctx.fillStyle = '#0d131f';
  });

  const cityTexture = track(new THREE.CanvasTexture(citySkyCanvas));
  cityTexture.colorSpace = THREE.SRGBColorSpace;
  const cityMat = track(new THREE.MeshBasicMaterial({ map: cityTexture }));
  const cityMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(2.2, 2.0)), cityMat);
  cityMesh.position.set(0, 0, 0.02);
  windowGroup.add(cityMesh);

  // Window mullions
  const mullionH = new THREE.Mesh(track(new THREE.BoxGeometry(2.2, 0.04, 0.04)), matMetalDark);
  mullionH.position.set(0, 0, 0.04);
  windowGroup.add(mullionH);
  const mullionV = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 2.0, 0.04)), matMetalDark);
  mullionV.position.set(0, 0, 0.04);
  windowGroup.add(mullionV);

  // Wall Shelf with books & audio speaker
  const shelfGroup = new THREE.Group();
  shelfGroup.position.set(1.5, 3.3, -3.05);
  roomGroup.add(shelfGroup);

  const shelfMesh = new THREE.Mesh(track(new THREE.BoxGeometry(2.2, 0.06, 0.4)), matDeskTop);
  shelfMesh.castShadow = true;
  shelfMesh.receiveShadow = true;
  shelfGroup.add(shelfMesh);

  const bookColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
  bookColors.forEach((color, i) => {
    const bMat = track(new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
    const bMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.07, 0.32, 0.24)), bMat);
    bMesh.position.set(-0.7 + i * 0.09, 0.18, 0.0);
    bMesh.castShadow = true;
    shelfGroup.add(bMesh);
  });

  const speakerMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.24, 0.34, 0.24)), matMetalDark);
  speakerMesh.position.set(0.65, 0.19, 0.0);
  speakerMesh.castShadow = true;
  shelfGroup.add(speakerMesh);

  // 6. Executive Desk Setup (Positioned in front of the robot)
  const deskGroup = new THREE.Group();
  deskGroup.name = 'DeskGroup';
  deskGroup.position.set(0, 0, 0.2);
  scene.add(deskGroup);

  // Tabletop (beveled, rounded aesthetics)
  const tabletopGeo = track(new THREE.BoxGeometry(3.2, 0.09, 1.5));
  const tabletop = new THREE.Mesh(tabletopGeo, matDeskTop);
  tabletop.position.set(0, 1.05, 0);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  deskGroup.add(tabletop);

  // Under-desk rim trim
  const rimGeo = track(new THREE.BoxGeometry(3.1, 0.03, 1.4));
  const rim = new THREE.Mesh(rimGeo, matWarmGold);
  rim.position.set(0, 0.99, 0);
  deskGroup.add(rim);

  // Desk metal legs
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

  // Desk Mat
  const deskMatGeo = track(new THREE.BoxGeometry(1.9, 0.01, 0.8));
  const deskMatMesh = new THREE.Mesh(deskMatGeo, matRug);
  deskMatMesh.position.set(0.0, 1.10, -0.05);
  deskMatMesh.receiveShadow = true;
  deskGroup.add(deskMatMesh);

  // Mechanical Keyboard (placed on desk right in front of the robot)
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

  // Game Controller (placed on desk corner)
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

  // Desk Lamp (on left of desk)
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

  // Potted Succulent Plant on desk right corner
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

  // Smartphone on desk
  const phoneMesh = new THREE.Mesh(track(new THREE.BoxGeometry(0.12, 0.015, 0.22)), matMetalDark);
  phoneMesh.position.set(0.85, 1.105, 0.3);
  phoneMesh.rotation.y = 0.2;
  phoneMesh.castShadow = true;
  deskGroup.add(phoneMesh);

  // Ultrawide Monitor (positioned on left side of desk, angled towards robot & camera)
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

  // 7. Ergonomic Office Chair (Positioned behind desk)
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

  // 8. The Articulated CRT Robot Character (Front and center behind the desk)
  // FULL correct articulated hierarchy:
  // shoulder > upper arm > elbow > forearm > wrist > hand
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

  // Chest plate & cyan status light
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

  // Neck joint
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

  // Antenna
  const antennaStem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 12)), matWarmGold);
  antennaStem.position.set(0, 0.36, 0);
  headGroup.add(antennaStem);

  const antennaTip = new THREE.Mesh(track(new THREE.SphereGeometry(0.045, 12, 12)), matWarmGold);
  antennaTip.position.set(0, 0.47, 0);
  headGroup.add(antennaTip);

  // Ear Dials
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
  crtFace.position.set(0, 0, 0.252); // Facing outwards towards camera!
  headGroup.add(crtFace);

  // ---- ARMS HIERARCHY (Articulated Shoulder -> Upper Arm -> Elbow -> Forearm -> Wrist -> Hand) ----

  // Left Arm: reaches naturally forward onto desk keyboard
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

  // Position Left Arm forward onto desk keyboard
  leftShoulder.rotation.x = -0.45;
  leftShoulder.rotation.z = -0.15;
  leftElbow.rotation.x = -0.65;
  leftElbow.rotation.y = 0.25;

  // Right Arm (Articulated Shoulder -> Upper Arm -> Elbow -> Forearm -> Wrist -> Hand)
  // Has finite greeting wave animation on entry, rotating forearm at elbow!
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

  // 9. Interactive Hotspots (3D floating pins for Work, Resume, Contact)
  const hotspots = [];
  const hotspotGroup = new THREE.Group();
  hotspotGroup.name = 'Hotspots';
  scene.add(hotspotGroup);

  const hotspotConfigs = [
    {
      id: 'work',
      title: 'Work / Projects',
      position: new THREE.Vector3(-0.8, 2.25, -0.2),
      color: 0xffdb70,
    },
    {
      id: 'resume',
      title: 'Resume & Skills',
      position: new THREE.Vector3(1.5, 3.8, -2.9),
      color: 0x38bdf8,
    },
    {
      id: 'contact',
      title: 'Contact',
      position: new THREE.Vector3(0.85, 1.45, 0.45),
      color: 0x4ade80,
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

  // 10. Pointer Drag & Camera Orbit Controls (Bounded, non-scroll stealing)
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let rotAzimuth = 0;
  let rotElevation = 0;
  let targetAzimuth = 0;
  let targetElevation = 0;
  let dragDistance = 0;

  const maxAzimuth = Math.PI / 6; // ±30 degrees
  const minElevation = -Math.PI / 16;
  const maxElevation = Math.PI / 12;

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

    const hitObjects = [crtFace, ...hotspots.map((h) => h.diamond)];
    const intersects = raycaster.intersectObjects(hitObjects, false);
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

    const hitObjects = [crtFace, ...hotspots.map((h) => h.diamond)];
    const intersects = raycaster.intersectObjects(hitObjects, false);
    if (intersects.length > 0) {
      const hitDiamond = intersects[0].object;
      if (hitDiamond === crtFace) { onSelectHotspot?.('chat'); return; }
      const targetHotspot = hotspots.find((h) => h.diamond === hitDiamond);
      if (targetHotspot && onSelectHotspot) {
        onSelectHotspot(targetHotspot.cfg.id);
      }
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('click', onClick);

  // 11. Animation Loop & Articulation
  let reqId = null;
  let isPaused = reducedMotion;
  let frameCount = 0;
  let startTime = performance.now();
  let lastBlinkTime = startTime;
  let isBlinking = false;

  const GREETING_DURATION = 2800;

  function animate(now) {
    frameCount++;
    const elapsed = now - startTime;

    rotAzimuth += (targetAzimuth - rotAzimuth) * 0.08;
    rotElevation += (targetElevation - rotElevation) * 0.08;

    const baseCam = defaultCamPos.clone();
    baseCam.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotAzimuth);
    baseCam.y += rotElevation * 2.5;
    camera.position.copy(baseCam);
    camera.lookAt(targetLookAt);

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
      // Wave greeting: rotate FOREARM AT ELBOW!
      const waveT = elapsed / GREETING_DURATION;
      const easeWave = Math.sin(waveT * Math.PI);

      rightShoulder.rotation.x = -0.5 * easeWave;
      rightShoulder.rotation.z = -0.55 * easeWave;
      rightUpperArm.rotation.y = 0.3 * easeWave;

      rightElbow.rotation.z = Math.sin(elapsed * 0.009) * 0.5 * easeWave;
      rightElbow.rotation.x = -0.4 * easeWave;
      rightWrist.rotation.z = Math.sin(elapsed * 0.009) * 0.25 * easeWave;
    } else {
      // Settle smoothly into natural desk mouse/typing posture
      rightShoulder.rotation.x = -0.45;
      rightShoulder.rotation.z = 0.15;
      rightUpperArm.rotation.y = 0;
      rightElbow.rotation.x = -0.65;
      rightElbow.rotation.z = -0.15 + Math.sin(elapsed * 0.002) * 0.02;
      rightWrist.rotation.z = 0;
    }

    renderer.render(scene, camera);

    if (!isPaused) {
      reqId = requestAnimationFrame(animate);
    }
  }

  renderer.render(scene, camera);
  if (!isPaused) {
    reqId = requestAnimationFrame(animate);
  }

  // 12. Resize Observer
  const resizeObserver = new ResizeObserver(() => {
    const newW = container.clientWidth || 800;
    const newH = container.clientHeight || 600;
    camera.aspect = newW / newH;
    camera.fov = newW < 768 ? 44 : 38;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
    renderer.render(scene, camera);
  });
  resizeObserver.observe(container);

  // 13. Visibility / Intersection Observer
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && !isPaused) {
      if (reqId) cancelAnimationFrame(reqId);
      reqId = null;
    } else if (entry.isIntersecting && !isPaused && !reqId && !reducedMotion) {
      reqId = requestAnimationFrame(animate);
    }
  }, { threshold: 0.1 });
  intersectionObserver.observe(container);

  const onVisibilityChange = () => {
    if (document.hidden && reqId) {
      cancelAnimationFrame(reqId);
      reqId = null;
    } else if (!document.hidden && !isPaused && !reqId && !reducedMotion) {
      reqId = requestAnimationFrame(animate);
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // 14. QA Debug Handle
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
        if (!reqId) reqId = requestAnimationFrame(animate);
      }
    },
    resetCamera: () => {
      targetAzimuth = 0;
      targetElevation = 0;
      camera.position.copy(defaultCamPos);
      camera.lookAt(targetLookAt);
      renderer.render(scene, camera);
    },
    renderSingleFrame: () => {
      renderer.render(scene, camera);
    },
    dispose: () => {
      if (reqId) cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
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
