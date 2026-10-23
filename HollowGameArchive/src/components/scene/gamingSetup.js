import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export const GAMING_CHAIR_URL = '/assets/gaming-setup/gaming-chair.json';
export const GAMING_DESKTOP_URL = '/assets/gaming-setup/gaming-desktop.json';
export const BULLETIN_BOARD_URL = '/assets/gaming-setup/bulletin-board.json';

// Chair reference constants
export const CHAIR_FLOOR_Y = 0.0155; // rug top
export const CHAIR_SEAT_Y = 0.7250;  // normalized seat reference scaling cushion under thighs to 0.7101m (supporting IronMan hipY 0.907 / thighs 0.7108m)
export const CHAIR_RAW_YAW = -0.8219064; // authored orientation offset in raw GLB (-47.09 deg)

// Desktop PC reference constants
export const DESKTOP_SCALE = 0.1; // source authored in decimeters (10dm = 1m)

// ---------------------------------------------------------------------------
// Resource Lifecycle & Disposer Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a deduplicated disposer tracking all BufferGeometries, Materials,
 * and Textures across raw scenes and merged/cloned normalized groups.
 */
export function createDisposer(rawScene, normalizedGroup) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  function trackScene(root) {
    if (!root) return;
    root.traverse((o) => {
      if (!o.isMesh) return;
      if (o.geometry) geometries.add(o.geometry);
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m) continue;
        materials.add(m);
        for (const prop of Object.values(m)) {
          if (prop && prop.isTexture) {
            textures.add(prop);
          }
        }
      }
    });
  }

  trackScene(rawScene);
  trackScene(normalizedGroup);

  return {
    geometries,
    materials,
    textures,
    dispose: () => {
      geometries.forEach((g) => g?.dispose?.());
      materials.forEach((m) => m?.dispose?.());
      textures.forEach((t) => t?.dispose?.());
    },
  };
}

// ---------------------------------------------------------------------------
// Normalization functions
// ---------------------------------------------------------------------------

/**
 * Optimizes the gaming chair by merging static meshes sharing identical material object identity.
 * Preserves seat cushion mesh ('Object_49') as a dedicated named mesh.
 */
export function mergeChairMeshes(scene) {
  scene.updateMatrixWorld(true);

  const seat = scene.getObjectByName('Object_49');
  const special = new Set([seat]);

  const groups = new Map();
  scene.traverse((o) => {
    if (o.isMesh && !special.has(o)) {
      if (Array.isArray(o.material)) {
        throw new Error(`Multi-materials unsupported for mesh: ${o.name}`);
      }
      const mat = o.material;
      if (!mat) return;
      const list = groups.get(mat) || { material: mat, meshes: [] };
      list.meshes.push(o);
      groups.set(mat, list);
    }
  });

  const mergedGroup = new THREE.Group();
  mergedGroup.name = 'GamingChairMerged';
  const invScene = scene.matrixWorld.clone().invert();

  function prepareGeom(o) {
    const g = o.geometry.clone();
    const localMat = o.matrixWorld.clone().premultiply(invScene);
    g.applyMatrix4(localMat);
    for (const key of Object.keys(g.attributes)) {
      if (key !== 'position' && key !== 'normal' && key !== 'uv') {
        g.deleteAttribute(key);
      }
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    return g;
  }

  if (seat) {
    const g = prepareGeom(seat);
    const m = new THREE.Mesh(g, seat.material);
    m.name = seat.name;
    mergedGroup.add(m);
  }

  for (const [material, { meshes }] of groups.entries()) {
    if (meshes.length === 1) {
      const g = prepareGeom(meshes[0]);
      const m = new THREE.Mesh(g, material);
      m.name = meshes[0].name;
      mergedGroup.add(m);
    } else {
      const geoms = meshes.map(prepareGeom);
      const merged = BufferGeometryUtils.mergeGeometries(geoms, false);
      geoms.forEach((g) => g.dispose());
      if (merged) {
        const m = new THREE.Mesh(merged, material);
        m.name = 'Merged_' + (material.name || material.uuid);
        mergedGroup.add(m);
      } else {
        for (const o of meshes) {
          const g = prepareGeom(o);
          mergedGroup.add(new THREE.Mesh(g, material));
        }
      }
    }
  }

  return mergedGroup;
}

/**
 * Normalizes the raw gaming chair:
 * - Rotates raw chair by +0.8219064 rad so forward faces +z
 * - Centers usable seat cushion at x=0, z=0
 * - Uniformly scales chair so casters rest on floor (y=0.0155) and seat contact supports IronMan
 * - Supports safe static merge by material ID (optimize: true, default true)
 */
export function normalizeGamingChair(rawScene, { optimize = true, seatTargetY = CHAIR_SEAT_Y } = {}) {
  const root = new THREE.Group();
  root.name = 'GamingChair';

  const inner = new THREE.Group();
  inner.name = 'GamingChairInner';
  inner.add(rawScene);
  root.add(inner);

  // 1. Orient forward to +z
  rawScene.rotation.y = -CHAIR_RAW_YAW;
  rawScene.updateMatrixWorld(true);

  // 2. Center seat cushion at x=0, z=0
  const rawSeatMesh = rawScene.getObjectByName('Object_49'); // main Leather cushion
  if (!rawSeatMesh) throw new Error('GamingChair missing seat mesh Object_49');

  const bSeat = new THREE.Box3().setFromObject(rawSeatMesh);
  const cSeat = bSeat.getCenter(new THREE.Vector3());
  rawScene.position.x = -cSeat.x;
  rawScene.position.z = -cSeat.z;
  rawScene.updateMatrixWorld(true);

  // 3. Measure usable seat surface contact (center cluster) vs floor wheels
  const bFull = new THREE.Box3().setFromObject(inner);
  const floorRaw = bFull.min.y;

  const pos = rawSeatMesh.geometry.attributes.position;
  const v = new THREE.Vector3();
  const centerPts = [];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    rawSeatMesh.localToWorld(v);
    if (Math.hypot(v.x, v.z) < 0.15) {
      centerPts.push(v.y);
    }
  }
  if (centerPts.length === 0) throw new Error('Unable to sample seat contact vertices');
  centerPts.sort((a, b) => a - b);
  const seatContactRaw = centerPts[centerPts.length - 1]; // top contact point of central cushion

  // Uniform scale to bring floor to CHAIR_FLOOR_Y and seat to seatTargetY
  const scale = (seatTargetY - CHAIR_FLOOR_Y) / (seatContactRaw - floorRaw);
  inner.scale.setScalar(scale);
  inner.position.y = CHAIR_FLOOR_Y - floorRaw * scale;
  root.updateMatrixWorld(true);

  // 4. Merge static meshes by material identity if requested
  let activeScene = rawScene;
  if (optimize) {
    const merged = mergeChairMeshes(rawScene);
    merged.position.copy(rawScene.position);
    merged.rotation.copy(rawScene.rotation);
    merged.scale.copy(rawScene.scale);
    inner.remove(rawScene);
    inner.add(merged);
    activeScene = merged;
    inner.updateMatrixWorld(true);
  }

  const activeSeatMesh = activeScene.getObjectByName('Object_49');
  const finalBox = new THREE.Box3().setFromObject(root);

  // Measure actual cushion height under IronMan thighs (x = ±0.0609, z = 0.00389)
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  raycaster.set(new THREE.Vector3(0.06092, 0.95, 0.00389), down);
  const hits = raycaster.intersectObject(root, true);
  const thighCushionY = hits.length > 0 ? hits[0].point.y : 0.7101;

  return {
    group: root,
    rawScene,
    activeScene,
    seatMesh: activeSeatMesh,
    scale,
    floorY: CHAIR_FLOOR_Y,
    seatContactY: seatTargetY,
    thighCushionY,
    bounds: finalBox,
    dimensions: finalBox.getSize(new THREE.Vector3()),
    optimized: optimize,
  };
}

/**
 * Optimizes the desktop scene by merging static meshes sharing identical material object identity.
 * Preserves screen mesh ('MY_SCREEN_MY_SCREEN_0') and desk slab ('Cube_Material_0') as separate meshes.
 */
export function mergeDesktopMeshes(scene) {
  scene.updateMatrixWorld(true);

  const screen = scene.getObjectByName('MY_SCREEN_MY_SCREEN_0');
  const desk = scene.getObjectByName('Cube_Material_0');
  const special = new Set([screen, desk]);

  const groups = new Map();
  scene.traverse((o) => {
    if (o.isMesh && !special.has(o)) {
      if (Array.isArray(o.material)) {
        throw new Error(`Multi-materials unsupported for mesh: ${o.name}`);
      }
      const mat = o.material;
      if (!mat) return;
      // Group strictly by material instance identity
      const list = groups.get(mat) || { material: mat, meshes: [] };
      list.meshes.push(o);
      groups.set(mat, list);
    }
  });

  const mergedGroup = new THREE.Group();
  mergedGroup.name = 'GamingDesktopMerged';

  const invScene = scene.matrixWorld.clone().invert();

  function prepareGeom(o) {
    const g = o.geometry.clone();
    const localMat = o.matrixWorld.clone().premultiply(invScene);
    g.applyMatrix4(localMat);
    for (const key of Object.keys(g.attributes)) {
      if (key !== 'position' && key !== 'normal' && key !== 'uv') {
        g.deleteAttribute(key);
      }
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    return g;
  }

  if (screen) {
    const g = prepareGeom(screen);
    const m = new THREE.Mesh(g, screen.material);
    m.name = screen.name;
    mergedGroup.add(m);
  }
  if (desk) {
    const g = prepareGeom(desk);
    const m = new THREE.Mesh(g, desk.material);
    m.name = desk.name;
    mergedGroup.add(m);
  }

  for (const [material, { meshes }] of groups.entries()) {
    if (meshes.length === 1) {
      const g = prepareGeom(meshes[0]);
      const m = new THREE.Mesh(g, material);
      m.name = meshes[0].name;
      mergedGroup.add(m);
    } else {
      const geoms = meshes.map(prepareGeom);
      const merged = BufferGeometryUtils.mergeGeometries(geoms, false);
      geoms.forEach((g) => g.dispose()); // dispose temporary cloned geoms
      if (merged) {
        const m = new THREE.Mesh(merged, material);
        m.name = 'Merged_' + (material.name || material.uuid);
        mergedGroup.add(m);
      } else {
        for (const o of meshes) {
          const g = prepareGeom(o);
          mergedGroup.add(new THREE.Mesh(g, material));
        }
      }
    }
  }

  return mergedGroup;
}

/**
 * Normalizes the raw gaming desktop PC:
 * - Rotates raw setup by -PI/2 around Y so screen normal faces +z, keyboard in front at +z
 * - Scales from decimeters to meters (x0.1)
 * - Identifies screen, keyboard, mouse, tower, and desk slab
 * - Supports merging draw calls by material ID (optimize: true)
 * - Supports hiding desk slab if placed on existing room desk (includeDesk: false)
 * - Exposes additive `surface`: actual imported authored screen located/normal in group coords,
 *   usable width/height, and a THREE.PlaneGeometry mesh aligned to that face for physical projection.
 */
export function normalizeGamingDesktop(rawScene, { optimize = true, includeDesk = false } = {}) {
  const root = new THREE.Group();
  root.name = 'GamingDesktop';

  const inner = new THREE.Group();
  inner.name = 'GamingDesktopInner';
  inner.add(rawScene);
  root.add(inner);

  // 1. Orient screen normal to +z
  rawScene.rotation.y = -Math.PI / 2;
  rawScene.updateMatrixWorld(true);

  // 2. Identify key components
  const screen = rawScene.getObjectByName('MY_SCREEN_MY_SCREEN_0');
  if (!screen) throw new Error('GamingDesktop missing screen mesh MY_SCREEN_MY_SCREEN_0');

  const deskSlab = rawScene.getObjectByName('Cube_Material_0');
  const mouse = rawScene.getObjectByName('test-aorus-m2-souris-aorus-rgb2_test-aorus-m2-souris-aorus-rgb_0') ||
                rawScene.getObjectByName('test-aorus-m2-souris-aorus-rgb2');

  const keyboardMeshes = [];
  rawScene.traverse((o) => {
    if (o.isMesh && (o.name.includes('Tastatur') || o.name.includes('Tasten'))) {
      keyboardMeshes.push(o);
    }
  });

  // 3. Center monitor on x=0 and align stand base on desk surface y=0
  const bScreen = new THREE.Box3().setFromObject(screen);
  const cScreen = bScreen.getCenter(new THREE.Vector3());

  rawScene.position.x = -cScreen.x;
  const deskTopRaw = deskSlab ? new THREE.Box3().setFromObject(deskSlab).max.y : 0.254;
  rawScene.position.y = -deskTopRaw;

  inner.scale.setScalar(DESKTOP_SCALE);
  if (deskSlab) deskSlab.visible = !!includeDesk;
  inner.updateMatrixWorld(true);

  // 4. Apply merge optimization if requested
  let activeScene = rawScene;
  if (optimize) {
    const merged = mergeDesktopMeshes(rawScene);
    merged.position.copy(rawScene.position);
    merged.rotation.copy(rawScene.rotation);
    merged.scale.copy(rawScene.scale);
    inner.remove(rawScene);
    inner.add(merged);
    activeScene = merged;
    inner.updateMatrixWorld(true);
  }

  const activeScreen = activeScene.getObjectByName('MY_SCREEN_MY_SCREEN_0');
  const activeDesk = activeScene.getObjectByName('Cube_Material_0');
  if (activeDesk) activeDesk.visible = !!includeDesk;

  // 5. Derive exact dimensions, center, normal, and tilt from actual transformed vertices in root space
  root.updateMatrixWorld(true);
  const screenGeom = activeScreen.geometry;
  const posAttr = screenGeom.attributes.position;
  const invRoot = root.matrixWorld.clone().invert();
  const screenPts = [];
  for (let i = 0; i < posAttr.count; i++) {
    const pt = new THREE.Vector3().fromBufferAttribute(posAttr, i)
      .applyMatrix4(activeScreen.matrixWorld)
      .applyMatrix4(invRoot);
    screenPts.push(pt);
  }

  // Four vertices of the quad:
  // bottom edge: pts[0] -> pts[1], left edge: pts[0] -> pts[3]
  const v0 = screenPts[0];
  const v1 = screenPts[1];
  const v3 = screenPts[3];
  const edgeX = new THREE.Vector3().subVectors(v1, v0);
  const edgeY = new THREE.Vector3().subVectors(v3, v0);
  const screenWidth = edgeX.length();   // 0.631957m
  const screenHeight = edgeY.length();  // 0.348065m
  const screenCenter = new THREE.Vector3()
    .add(v0).add(v1).add(screenPts[2]).add(v3).multiplyScalar(0.25);
  const screenNormal = new THREE.Vector3().crossVectors(edgeX, edgeY).normalize();
  const tiltAngleRad = Math.atan2(edgeY.z, edgeY.y); // -0.069813 rad (-4.00 deg)

  // Additive surface mesh aligned to the authored face (z=0 in surface.mesh local space)
  const surfaceGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);
  surfaceGeo.computeBoundingBox();
  const surfaceMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
  const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
  surfaceMesh.name = 'ScreenSurfaceMesh';
  surfaceMesh.position.copy(screenCenter);
  surfaceMesh.rotation.x = tiltAngleRad;
  root.add(surfaceMesh);
  root.updateMatrixWorld(true);

  return {
    group: root,
    rawScene,
    activeScene,
    screen: activeScreen,
    screenWidth,
    screenHeight,
    screenCenter,
    surface: {
      mesh: surfaceMesh,
      width: screenWidth,
      height: screenHeight,
      frameWidth: 0.645,
      frameHeight: 0.360,
      center: screenCenter.clone(),
      normal: screenNormal.clone(),
      quaternion: surfaceMesh.quaternion.clone(),
      tiltAngleRad,
    },
    desk: activeDesk,
    keyboardCount: keyboardMeshes.length,
    hasMouse: !!mouse,
    scale: DESKTOP_SCALE,
    optimized: optimize,
  };
}

/**
 * Normalizes the Japanese bulletin board:
 * - Verified +z front, centered at x=0
 * - Frame mesh ('OPM0036_OPM0036_0') preserved untouched with all notices and pins
 * - Exposes additive `surface`: measured inner cork region (0.864m x 0.564m) and aligned PlaneGeometry
 */
export function normalizeBulletinBoard(rawScene) {
  const root = new THREE.Group();
  root.name = 'BulletinBoard';
  root.add(rawScene);
  root.updateMatrixWorld(true);

  const frameMesh = rawScene.getObjectByName('OPM0036_OPM0036_0') || rawScene;
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());

  // Inner cork region measured from actual geometry vertices:
  // x: [-0.4320, 0.4320] (w = 0.864m), y: [-0.2888, 0.2752] (h = 0.564m), frontZ = 0.0197m
  const corkWidth = 0.864;
  const corkHeight = 0.564;
  const corkCenter = new THREE.Vector3(0, -0.0068, 0.0197);

  const surfaceGeo = new THREE.PlaneGeometry(corkWidth, corkHeight);
  surfaceGeo.computeBoundingBox();
  const surfaceMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
  const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
  surfaceMesh.name = 'BoardSurfaceMesh';
  surfaceMesh.position.copy(corkCenter);
  root.add(surfaceMesh);
  root.updateMatrixWorld(true);

  const contentPlane = {
    width: corkWidth,
    height: corkHeight,
    depth: 0.03,
    frontZ: 0.0197,
    normal: new THREE.Vector3(0, 0, 1),
  };

  const surface = {
    mesh: surfaceMesh,
    width: corkWidth,
    height: corkHeight,
    frameWidth: 0.900,
    frameHeight: 0.614,
    center: corkCenter.clone(),
    normal: new THREE.Vector3(0, 0, 1),
    quaternion: surfaceMesh.quaternion.clone(),
    frontZ: 0.0197,
  };

  return {
    group: root,
    rawScene,
    frameMesh,
    contentPlane,
    surface,
    dimensions: size,
    bounds: box,
  };
}

// ---------------------------------------------------------------------------
// Production Loaders (with leak-free safe dispose)
// ---------------------------------------------------------------------------

export async function loadGamingChair({
  url = GAMING_CHAIR_URL,
  renderer,
  optimize = true,
  seatTargetY = CHAIR_SEAT_Y,
} = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  let normalized;
  try {
    normalized = normalizeGamingChair(gltf.scene, { optimize, seatTargetY });
  } catch (err) {
    const errorDisposer = createDisposer(gltf.scene, null);
    errorDisposer.dispose();
    throw err;
  }

  normalized.group.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
  });

  const disposer = createDisposer(gltf.scene, normalized.group);

  return {
    ...normalized,
    dispose: disposer.dispose,
    _disposer: disposer,
  };
}

export async function loadGamingDesktop({
  url = GAMING_DESKTOP_URL,
  renderer,
  optimize = true,
  includeDesk = false,
} = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  let normalized;
  try {
    normalized = normalizeGamingDesktop(gltf.scene, { optimize, includeDesk });
  } catch (err) {
    const errorDisposer = createDisposer(gltf.scene, null);
    errorDisposer.dispose();
    throw err;
  }

  normalized.group.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
  });

  const disposer = createDisposer(gltf.scene, normalized.group);

  return {
    ...normalized,
    dispose: disposer.dispose,
    _disposer: disposer,
  };
}

export async function loadBulletinBoard({ url = BULLETIN_BOARD_URL, renderer } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  let normalized;
  try {
    normalized = normalizeBulletinBoard(gltf.scene);
  } catch (err) {
    const errorDisposer = createDisposer(gltf.scene, null);
    errorDisposer.dispose();
    throw err;
  }

  normalized.group.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
  });

  const disposer = createDisposer(gltf.scene, normalized.group);

  return {
    ...normalized,
    dispose: disposer.dispose,
    _disposer: disposer,
  };
}
