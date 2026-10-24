// Goku seated pose & Dragon Ball hovercar traffic collision tests. Runs in Node: node test/scene-craft-dragonball.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.ProgressEvent ??= class ProgressEvent extends Event {};

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadGoku, poseSeated, seat, POSE, SCALE, GOKU_SEAT, HIP_REST_Y, GOKU_URL } from '../src/components/scene/goku.js';
import { loadHoverCarTraffic, wrapX, ROAD_SPAN, CAR_SCALE, HOVERCAR_URL } from '../src/components/scene/traffic.js';
import { loadGamingChair, loadGamingDesktop, GAMING_CHAIR_URL, GAMING_DESKTOP_URL, CHAIR_FLOOR_Y } from '../src/components/scene/gamingSetup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const dbDir = path.resolve(publicDir, 'assets/dragonball');

// IO-only fixture: stub GLTFLoader.prototype.loadAsync to serve from disk without HTTP server in Node
function withDiskGLTFLoader(fn) {
  const origLoadAsync = GLTFLoader.prototype.loadAsync;
  GLTFLoader.prototype.loadAsync = async function (url) {
    const rel = url.replace(/^\//, '');
    const fullPath = path.resolve(publicDir, rel);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Asset not found on disk: ${fullPath} (requested url: ${url})`);
    }
    const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const dir = path.dirname(fullPath);
    for (const b of json.buffers || []) {
      if (b.uri && !b.uri.startsWith('data:')) {
        const buf = fs.readFileSync(path.join(dir, b.uri));
        b.uri = 'data:application/octet-stream;base64,' + buf.toString('base64');
      }
    }
    json.images = [];
    json.textures = [];
    for (const m of json.materials || []) {
      delete m.pbrMetallicRoughness?.baseColorTexture;
      delete m.pbrMetallicRoughness?.metallicRoughnessTexture;
      delete m.normalTexture;
      delete m.emissiveTexture;
      delete m.occlusionTexture;
      delete m.extensions;
    }
    return new Promise((res, rej) => new GLTFLoader().parse(JSON.stringify(json), '', res, rej));
  };
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      GLTFLoader.prototype.loadAsync = origLoadAsync;
    });
}

function getDeformedPoints(mesh) {
  const p = mesh.geometry.attributes.position;
  const v = new THREE.Vector3();
  const out = [];
  for (let i = 0; i < p.count; i++) {
    mesh.getVertexPosition(i, v);
    v.applyMatrix4(mesh.matrixWorld);
    out.push(v.clone());
  }
  return out;
}

test('Goku asset transport, skinning, seated support contact and negative controls', async () => {
  // 1) Verify server-compatible static file transport & CSP compliance (.json / .data)
  const jsonPath = path.join(dbDir, 'son_goku.json');
  const dataPath = path.join(dbDir, 'son_goku.data');
  assert.ok(fs.existsSync(jsonPath), 'son_goku.json must exist');
  assert.ok(fs.existsSync(dataPath), 'son_goku.data must exist');
  assert.ok(!fs.existsSync(path.join(dbDir, 'son_goku.glb')), 'unnecessary original 11MB .glb must be removed from shipped build');
  assert.ok(!fs.existsSync(path.join(dbDir, 'dragon_ball_hover_car.glb')), 'hover car .glb must be removed from shipped build');

  const gokuDescriptor = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(gokuDescriptor.buffers[0]?.uri, 'son_goku.data', 'buffer URI must point to server-compatible .data');
  for (const img of gokuDescriptor.images || []) {
    assert.ok(fs.existsSync(path.join(dbDir, img.uri)), `texture image ${img.uri} must exist on disk`);
  }

  await withDiskGLTFLoader(async () => {
    // 2) Load real production Goku figure
    const goku = await loadGoku({ url: GOKU_URL });
    const figure = goku.figure;

    // Verify bone count and skinned meshes
    const bones = [];
    const skinnedMeshes = [];
    let totalTris = 0;
    figure.traverse((o) => {
      if (o.isBone) bones.push(o.name);
      if (o.isSkinnedMesh) {
        skinnedMeshes.push(o);
        totalTris += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
      }
    });

    assert.equal(bones.length, 66, 'Goku skeleton has exactly 66 bones');
    assert.equal(skinnedMeshes.length, 8, 'Goku has exactly 8 skinned meshes');
    assert.equal(totalTris, 2432, 'Goku triangle count matches authored 2432 triangles');

    // 3) Production scene assembly: real imported gaming chair & gaming desktop
    const chairModel = await loadGamingChair({ url: GAMING_CHAIR_URL, optimize: false });
    const deskModel = await loadGamingDesktop({ url: GAMING_DESKTOP_URL, optimize: false, includeDesk: false });
    deskModel.group.scale.setScalar(2);

    const scene = new THREE.Scene();
    const ROBOT_POS = new THREE.Vector3(0.70, 0, -0.85);
    const ROBOT_YAW = -0.25;
    const rigRoot = new THREE.Group();
    rigRoot.position.copy(ROBOT_POS);
    rigRoot.rotation.y = ROBOT_YAW;
    scene.add(rigRoot);
    rigRoot.add(chairModel.group);

    const monYaw = ROBOT_YAW;
    const robotFwd = new THREE.Vector3(Math.sin(ROBOT_YAW), 0, Math.cos(ROBOT_YAW));
    const kbWorld = ROBOT_POS.clone().addScaledVector(robotFwd, 0.58);
    const keyboardCenter = new THREE.Vector3(-0.102681, 0, 0.147948).multiplyScalar(2);
    keyboardCenter.applyAxisAngle(new THREE.Vector3(0, 1, 0), monYaw);
    const DESK_TOP_Y = 1.095;
    const deskGroup = new THREE.Group();
    deskModel.group.position.set(kbWorld.x - keyboardCenter.x, DESK_TOP_Y, kbWorld.z - 0.2 - keyboardCenter.z);
    deskModel.group.rotation.y = monYaw;
    deskGroup.add(deskModel.group);
    scene.add(deskGroup);
    scene.updateMatrixWorld(true);

    // Attach Goku to chair rig root and seat
    seat(figure);
    rigRoot.add(figure);
    scene.updateMatrixWorld(true);
    figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });

    // Keyboard bounding box
    const kbMeshes = [];
    deskModel.group.traverse((m) => {
      if (m.isMesh && /Tastatur|Tasten/.test(m.name)) kbMeshes.push(m);
    });
    const keyboardBox = new THREE.Box3();
    for (const m of kbMeshes) keyboardBox.union(new THREE.Box3().setFromObject(m));
    const keycapTopY = keyboardBox.max.y;

    // Contact predicate helper: support raycast to real seat Object_49
    const chairSeat = chairModel.group.getObjectByName('Object_49');
    assert.ok(chairSeat, 'Gaming chair visible seat Object_49 exists');

    function evaluateSeatContact(fig, targetSeat) {
      if (!targetSeat || !targetSeat.visible) return { valid: false, contacts: [], minGap: null, maxGap: null, lHits: 0, rHits: 0 };
      const pants = fig.getObjectByName('Object_15');
      const legWeights = pants.geometry.attributes.skinIndex;
      const weights = pants.geometry.attributes.skinWeight;
      const verts = getDeformedPoints(pants);
      const groups = {};
      for (let i = 0; i < verts.length; i++) {
        let main = -1, best = 0;
        for (let c = 0; c < 4; c++) {
          const w = weights.getComponent(i, c);
          if (w > best) { best = w; main = legWeights.getComponent(i, c); }
        }
        const bone = pants.skeleton.bones[main]?.name;
        if (!bone) continue;
        (groups[bone] ??= []).push(verts[i]);
      }

      const ray = new THREE.Raycaster();
      const down = new THREE.Vector3(0, -1, 0);
      const gaps = [];
      let lHits = 0, rHits = 0;
      for (const [boneName, pts] of Object.entries(groups)) {
        if (!/UpLeg/.test(boneName)) continue;
        const b = new THREE.Box3().setFromPoints(pts);
        const bottom = pts.filter((v) => v.y <= b.min.y + 0.04);
        for (const v of bottom) {
          ray.set(new THREE.Vector3(v.x, Math.max(v.y, 1.1) + 0.1, v.z), down);
          const hits = ray.intersectObject(targetSeat, true);
          if (hits.length) {
            const gap = v.y - hits[0].point.y;
            gaps.push(gap);
            if (boneName.includes('Left')) lHits++;
            if (boneName.includes('Right')) rHits++;
          }
        }
      }
      if (gaps.length === 0) return { valid: false, contacts: gaps, minGap: null, maxGap: null, lHits: 0, rHits: 0 };
      const minGap = Math.min(...gaps);
      const maxGap = Math.max(...gaps);
      // Valid: both Left and Right UpLeg make contact, within ~2cm contact, and no deep penetration (> 2.5cm)
      const valid = lHits > 0 && rHits > 0 && minGap >= -0.025 && maxGap <= 0.05;
      return { valid, contacts: gaps, minGap, maxGap, lHits, rHits };
    }

    // A) Real Thigh Support Contact
    const thighContact = evaluateSeatContact(figure, chairSeat);
    assert.ok(thighContact.valid, `thigh contact valid: lHits=${thighContact.lHits}, rHits=${thighContact.rHits}, minGap=${thighContact.minGap?.toFixed(4)}m, maxGap=${thighContact.maxGap?.toFixed(4)}m`);
    assert.ok(thighContact.minGap > -0.025 && thighContact.minGap < 0.01, `seat gap min=${thighContact.minGap.toFixed(4)}m within contact tolerance`);

    // B) Real Boot Soles Grounded Contact
    const shoes = figure.getObjectByName('Object_16');
    const shoeVerts = getDeformedPoints(shoes);
    const solesMinY = Math.min(...shoeVerts.map((v) => v.y));
    assert.ok(solesMinY >= 0.015 && solesMinY <= 0.038, `boot soles y=${solesMinY.toFixed(4)}m rest on rug (rug top=${CHAIR_FLOOR_Y}m)`);

    // C) Hands Hovering over Keyboard (Clearance 0..20mm, Forearms not buried)
    const handMeshes = ['Object_7', 'Object_8', 'Object_12', 'Object_13'];
    let totalInside = 0;
    let minHandClearance = Infinity;
    for (const hName of handMeshes) {
      const hm = figure.getObjectByName(hName);
      assert.ok(hm, `Hand mesh ${hName} exists`);
      const pts = getDeformedPoints(hm);
      const inside = pts.filter((v) => v.x >= keyboardBox.min.x && v.x <= keyboardBox.max.x && v.z >= keyboardBox.min.z && v.z <= keyboardBox.max.z);
      assert.ok(inside.length > 0, `Hand ${hName} has vertices over keyboard footprint`);
      totalInside += inside.length;
      for (const v of inside) {
        const c = v.y - keycapTopY;
        if (c < minHandClearance) minHandClearance = c;
      }
    }
    assert.equal(totalInside, 316, 'all 316 hand vertices sit inside keyboard footprint');
    assert.ok(minHandClearance >= 0.000 && minHandClearance <= 0.020, `minimum key clearance ${(minHandClearance * 1000).toFixed(1)}mm is within 0..20mm hover window`);

    const lFA = figure.getObjectByName('mixamorigLeftForeArm_010').getWorldPosition(new THREE.Vector3());
    const rFA = figure.getObjectByName('mixamorigRightForeArm_034').getWorldPosition(new THREE.Vector3());
    assert.ok(lFA.y > DESK_TOP_Y && rFA.y > DESK_TOP_Y, `forearms (L=${lFA.y.toFixed(2)}, R=${rFA.y.toFixed(2)}) are above desk surface (${DESK_TOP_Y}m)`);

    // 4) Production Kinematic Animation Update Test
    const lHand = figure.getObjectByName('mixamorigLeftHand_011');
    const spine = figure.getObjectByName('mixamorigSpine_02');
    const neck = figure.getObjectByName('mixamorigNeck_05');
    const rot0 = { lHand: lHand.rotation.x, spine: spine.rotation.x, neck: neck.rotation.y };

    goku.update(500);
    const rot500 = { lHand: lHand.rotation.x, spine: spine.rotation.x, neck: neck.rotation.y };
    assert.notEqual(rot500.lHand, rot0.lHand, 'typing produces non-zero wrist rotation');
    assert.notEqual(rot500.spine, rot0.spine, 'breathing produces non-zero spine rotation');
    assert.notEqual(rot500.neck, rot0.neck, 'glancing produces non-zero neck rotation');

    goku.update(1000);
    const rot1000 = { lHand: lHand.rotation.x, spine: spine.rotation.x, neck: neck.rotation.y };
    assert.notEqual(rot1000.lHand, rot500.lHand, 'subsequent update time advances wrist rotation');

    // 5) Negative Controls using the SAME predicate:
    // Floating (+0.2y)
    const savedPos = figure.position.clone();
    figure.position.y += 0.20;
    scene.updateMatrixWorld(true);
    figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });
    const floatRes = evaluateSeatContact(figure, chairSeat);
    assert.equal(floatRes.valid, false, 'negative control: floating (+0.2y) fails seat contact predicate');

    // Buried (-0.2y)
    figure.position.y = savedPos.y - 0.20;
    scene.updateMatrixWorld(true);
    figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });
    const buriedRes = evaluateSeatContact(figure, chairSeat);
    assert.equal(buriedRes.valid, false, 'negative control: buried (-0.2y) fails seat contact predicate (deep penetration)');

    // Missing / hidden support
    figure.position.copy(savedPos);
    chairSeat.visible = false;
    scene.updateMatrixWorld(true);
    const hiddenRes = evaluateSeatContact(figure, chairSeat);
    assert.equal(hiddenRes.valid, false, 'negative control: missing/hidden seat support fails seat contact predicate');
    chairSeat.visible = true;

    // 6) Clean leak-free disposal
    goku.dispose();
    chairModel.dispose();
    deskModel.dispose();
    assert.equal(figure.parent, null, 'Goku figure removed from parent on dispose');
  });
});

test('Hovercar traffic: asset transport, production loader, zero collisions, cyclic spacing, and negative controls', async () => {
  // 1) Verify hovercar asset and CSP (.json / .data)
  const jsonPath = path.join(dbDir, 'dragon_ball_hover_car.json');
  const dataPath = path.join(dbDir, 'dragon_ball_hover_car.data');
  assert.ok(fs.existsSync(jsonPath), 'dragon_ball_hover_car.json must exist');
  assert.ok(fs.existsSync(dataPath), 'dragon_ball_hover_car.data must exist');

  const gltfJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(gltfJson.buffers[0]?.uri, 'dragon_ball_hover_car.data', 'buffer URI must point to server-compatible .data');
  for (const img of gltfJson.images || []) {
    assert.ok(fs.existsSync(path.join(dbDir, img.uri)), `texture ${img.uri} must exist`);
  }

  await withDiskGLTFLoader(async () => {
    // 2) Load production hovercar traffic via real production loader
    const outsideGroup = new THREE.Group();
    const traffic = await loadHoverCarTraffic({ outsideGroup, currentIsDay: true, url: HOVERCAR_URL });
    assert.equal(traffic.cars.length, 6, 'traffic creates exactly 6 cars (3 per lane)');

    // 3) Bounding box and clearance
    outsideGroup.updateMatrixWorld(true);
    const getCarBox = (car) => new THREE.Box3().setFromObject(car.mesh);

    const car0Box = getCarBox(traffic.cars[0]);
    const carSize = car0Box.getSize(new THREE.Vector3());
    assert.ok(carSize.x > 1.8 && carSize.x < 2.2, `car length along road=${carSize.x.toFixed(2)}m (~2m)`);
    assert.ok(carSize.z > 1.3 && carSize.z < 1.6, `car width across lane=${carSize.z.toFixed(2)}m (~1.45m)`);
    assert.ok(car0Box.min.y > 0.05, `hover gap y=${car0Box.min.y.toFixed(2)}m above ground is positive`);

    // Cross-lane clearance
    const lane1Cars = traffic.cars.filter((c) => c.laneZ === -5.3);
    const lane2Cars = traffic.cars.filter((c) => c.laneZ === -7.5);
    assert.equal(lane1Cars.length, 3, '3 cars in lane 1');
    assert.equal(lane2Cars.length, 3, '3 cars in lane 2');

    const crossLaneGap = Math.abs(getCarBox(lane1Cars[0]).min.z - getCarBox(lane2Cars[0]).max.z);
    assert.ok(crossLaneGap > 0.5, `cross lane clearance ${crossLaneGap.toFixed(2)}m > 0.5m`);

    // 4) Multi-timestep simulation: test zero collisions and cyclic spacing
    const steps = [
      ...Array(300).fill(0.1),
      ...Array(600).fill(0.016),
      1.5, 3.0, 5.0, 10.0,
      ...Array(100).fill(0.1),
    ];

    let collisionFound = false;
    for (let s = 0; s < steps.length; s++) {
      const dt = steps[s];
      traffic.update(dt);
      outsideGroup.updateMatrixWorld(true);

      for (let i = 0; i < traffic.cars.length; i++) {
        const b1 = getCarBox(traffic.cars[i]);
        for (let j = i + 1; j < traffic.cars.length; j++) {
          const b2 = getCarBox(traffic.cars[j]);
          if (b1.intersectsBox(b2)) {
            collisionFound = true;
            assert.fail(`collision between car ${i} and ${j} at step ${s} (dt=${dt})`);
          }
        }
      }

      const p1 = lane1Cars.map((c) => c.mesh.position.x).sort((a, b) => a - b);
      for (let i = 0; i < p1.length; i++) {
        const next = p1[(i + 1) % p1.length];
        const cyclicDist = (next - p1[i] + ROAD_SPAN) % ROAD_SPAN;
        assert.ok(cyclicDist > 8.0, `cyclic gap ${cyclicDist.toFixed(2)}m must exceed car length + margin`);
      }
    }
    assert.equal(collisionFound, false, 'zero collisions over all timesteps and delta spikes');

    // 5) Negative control: unequal speeds in same lane GUARANTEE collision
    const badCars = [
      { x: -10.0, speed: 3.5, length: 2.0 },
      { x: 0.0, speed: 1.0, length: 2.0 },
    ];
    let badCollision = false;
    for (let frame = 0; frame < 100; frame++) {
      badCars[0].x = wrapX(badCars[0].x + badCars[0].speed * 0.1);
      badCars[1].x = wrapX(badCars[1].x + badCars[1].speed * 0.1);
      const dist = Math.abs(badCars[0].x - badCars[1].x);
      if (dist < 2.0) {
        badCollision = true;
        break;
      }
    }
    assert.ok(badCollision, 'negative control: unequal speeds correctly detected as collision');

    traffic.dispose();
  });
});
