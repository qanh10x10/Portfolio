import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const HOVERCAR_URL = '/assets/dragonball/dragon_ball_hover_car.gltf';
export const ROAD_SPAN = 32; // x in [-16, 16]
export const CAR_SCALE = 0.50;
export const HOVER_Y = 0.22;

export const TRAFFIC_CONFIGS = [
  // Lane 1: Near lane, moving +X (dir = 1), speed = 2.2 m/s
  { laneZ: -5.3, dir: 1, speed: 2.2, phase: -16.0 },
  { laneZ: -5.3, dir: 1, speed: 2.2, phase: -16.0 + 32 / 3 },
  { laneZ: -5.3, dir: 1, speed: 2.2, phase: -16.0 + 64 / 3 },
  // Lane 2: Far lane, moving -X (dir = -1), speed = 2.0 m/s
  { laneZ: -7.5, dir: -1, speed: 2.0, phase: 10.6667 },
  { laneZ: -7.5, dir: -1, speed: 2.0, phase: 0.0 },
  { laneZ: -7.5, dir: -1, speed: 2.0, phase: -10.6667 },
];

export function wrapX(x, span = ROAD_SPAN) {
  const half = span / 2;
  const shifted = x + half;
  return ((shifted % span + span) % span) - half;
}

export async function loadHoverCarTraffic({ outsideGroup, currentIsDay = true, carBeamMat, url = HOVERCAR_URL } = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const baseModel = gltf.scene;
  baseModel.name = 'HoverCarBase';

  // Apply verified opaque material settings to prevent transmission see-through/self-overlap
  const disposables = [];
  baseModel.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (o.geometry) disposables.push(o.geometry);
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        disposables.push(m);
        if (m.transmission > 0) m.transmission = 0;
        m.transparent = false;
        m.depthWrite = true;
        m.needsUpdate = true;
        if (m.map) disposables.push(m.map);
        if (m.normalMap) disposables.push(m.normalMap);
        if (m.roughnessMap) disposables.push(m.roughnessMap);
        if (m.metalnessMap) disposables.push(m.metalnessMap);
        if (m.emissiveMap) disposables.push(m.emissiveMap);
      });
    }
  });

  const trafficGroup = new THREE.Group();
  trafficGroup.name = 'HoverCarTraffic';
  if (outsideGroup) outsideGroup.add(trafficGroup);

  const cars = [];
  TRAFFIC_CONFIGS.forEach((cfg, idx) => {
    const carInstance = baseModel.clone(true);
    carInstance.name = `HoverCar_${idx}`;
    carInstance.scale.setScalar(CAR_SCALE);

    const carRoot = new THREE.Group();
    carRoot.name = `CarRoot_${idx}`;
    carRoot.position.set(cfg.phase, HOVER_Y, cfg.laneZ);
    // Authored model front is +Z; rotate to point along lane direction
    carRoot.rotation.y = cfg.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    carRoot.add(carInstance);

    // Optional headlight road projection beam
    if (carBeamMat) {
      const headBeam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), carBeamMat);
      headBeam.name = `HeadBeam_${idx}`;
      headBeam.rotation.x = -Math.PI / 2;
      headBeam.rotation.z = -Math.PI / 2; // align along car forward (+Z)
      headBeam.position.set(0, -HOVER_Y + 0.11, 2.0);
      carRoot.add(headBeam);
      disposables.push(headBeam.geometry);
    }

    trafficGroup.add(carRoot);
    cars.push({
      mesh: carRoot,
      carInstance,
      dir: cfg.dir,
      speed: cfg.speed,
      laneZ: cfg.laneZ,
    });
  });

  function update(delta) {
    if (!delta || delta <= 0) return;
    cars.forEach((car) => {
      car.mesh.position.x = wrapX(car.mesh.position.x + car.dir * car.speed * delta);
    });
  }

  function carPositions() {
    return cars.map((c) => c.mesh.position.x);
  }

  return {
    group: trafficGroup,
    cars,
    update,
    carPositions,
    readiness: true,
    dispose: () => {
      trafficGroup.removeFromParent();
      disposables.forEach((d) => d?.dispose?.());
    },
  };
}
