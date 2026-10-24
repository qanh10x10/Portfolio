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
    const gltf = await new Promise((res, rej) => new GLTFLoader().parse(JSON.stringify(json), '', res, rej));
    // Attach real Texture sentinels to materials for lifecycle check
    gltf.scene.traverse((o) => {
      if (o.isMesh && o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m.map) m.map = new THREE.Texture();
        });
      }
    });
    return gltf;
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

    // 3) Production scene assembly: matching deskSceneBuilder lines 537..574, 868..880
    const chairModel = await loadGamingChair({ url: GAMING_CHAIR_URL, optimize: false });
    const deskModel = await loadGamingDesktop({ url: GAMING_DESKTOP_URL, optimize: true, includeDesk: false });
    deskModel.group.scale.setScalar(2);

    const scene = new THREE.Scene();
    const ROBOT_POS = new THREE.Vector3(0.70, 0, -0.85);
    const ROBOT_YAW = -0.25;
    const rigRoot = new THREE.Group();
    rigRoot.position.copy(ROBOT_POS);
    rigRoot.rotation.y = ROBOT_YAW;
    scene.add(rigRoot);
    rigRoot.add(chairModel.group);

    const DESK_TOP_Y = 1.095;
    const deskGroup = new THREE.Group();
    deskGroup.name = 'DeskGroup';
    deskGroup.position.set(0, 0, 0.2);
    scene.add(deskGroup);

    const placeOnDesk = (obj, { x, z, yaw = 0 }) => {
      obj.position.set(x, DESK_TOP_Y, z);
      obj.rotation.y = yaw;
      deskGroup.add(obj);
    };

    const robotFwd = new THREE.Vector3(Math.sin(ROBOT_YAW), 0, Math.cos(ROBOT_YAW));
    const kbWorld = ROBOT_POS.clone().addScaledVector(robotFwd, 0.58);
    const monYaw = ROBOT_YAW + Math.PI;

    const keyboardCenter = new THREE.Vector3(-0.102681, 0, 0.147948).multiplyScalar(2);
    keyboardCenter.applyAxisAngle(new THREE.Vector3(0, 1, 0), monYaw);
    placeOnDesk(deskModel.group, { x: kbWorld.x - keyboardCenter.x, z: kbWorld.z - 0.2 - keyboardCenter.z, yaw: monYaw });
    scene.updateMatrixWorld(true);

    // Attach Goku to chair rig root and seat
    seat(figure);
    rigRoot.add(figure);
    scene.updateMatrixWorld(true);
    figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });

    // Keyboard bounding box: verify exact browser fixture bounds regression to 1e-4
    const kbMeshes = [];
    deskModel.group.traverse((m) => {
      if (m.isMesh && /Tastatur|Tasten/.test(m.name)) kbMeshes.push(m);
    });
    const keyboardBox = new THREE.Box3();
    for (const m of kbMeshes) keyboardBox.union(new THREE.Box3().setFromObject(m));
    const keycapTopY = keyboardBox.max.y;

    const EXPECTED_KB = {
      min: [0.132738, 1.095852, -0.504323],
      max: [0.980273, 1.151489, -0.071739],
    };
    assert.ok(Math.abs(keyboardBox.min.x - EXPECTED_KB.min[0]) < 1e-4, 'keyboard min.x matches browser bounds');
    assert.ok(Math.abs(keyboardBox.max.x - EXPECTED_KB.max[0]) < 1e-4, 'keyboard max.x matches browser bounds');
    assert.ok(Math.abs(keyboardBox.min.y - EXPECTED_KB.min[1]) < 1e-4, 'keyboard min.y matches browser bounds');
    assert.ok(Math.abs(keyboardBox.max.y - EXPECTED_KB.max[1]) < 1e-4, 'keyboard max.y matches browser bounds');
    assert.ok(Math.abs(keyboardBox.min.z - EXPECTED_KB.min[2]) < 1e-4, 'keyboard min.z matches browser bounds');
    assert.ok(Math.abs(keyboardBox.max.z - EXPECTED_KB.max[2]) < 1e-4, 'keyboard max.z matches browser bounds');

    // Contact predicate helper: support raycast to real seat Object_49
    const chairSeat = chairModel.group.getObjectByName('Object_49');
    assert.ok(chairSeat, 'Gaming chair visible seat Object_49 exists');

    function evaluateSeatContact(fig, targetSeat) {
      if (!targetSeat || !targetSeat.visible) return { valid: false, contacts: [], minGap: null, maxGap: null, lHits: 0, rHits: 0, deepPen: 0 };
      const seatBox = new THREE.Box3().setFromObject(targetSeat);
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
      let deepPen = 0;
      for (const [boneName, pts] of Object.entries(groups)) {
        if (!/UpLeg/.test(boneName)) continue;
        for (const v of pts) {
          if (v.x >= seatBox.min.x && v.x <= seatBox.max.x &&
              v.z >= seatBox.min.z && v.z <= seatBox.max.z) {
            ray.set(new THREE.Vector3(v.x, 1.6, v.z), down);
            const hits = ray.intersectObject(targetSeat, true);
            if (hits.length) {
              const gap = v.y - hits[0].point.y;
              if (gap < -0.015) deepPen++;
              if (gap >= -0.015 && gap <= 0.015) {
                gaps.push(gap);
                if (boneName.includes('Left')) lHits++;
                if (boneName.includes('Right')) rHits++;
              }
            }
          }
        }
      }
      if (gaps.length === 0 || deepPen > 0) {
        return { valid: false, contacts: gaps, minGap: gaps.length ? Math.min(...gaps) : null, maxGap: gaps.length ? Math.max(...gaps) : null, lHits, rHits, deepPen };
      }
      const minGap = Math.min(...gaps);
      const maxGap = Math.max(...gaps);
      const valid = lHits >= 2 && rHits >= 2 && deepPen === 0;
      return { valid, contacts: gaps, minGap, maxGap, lHits, rHits, deepPen };
    }

    // A) Real Thigh Support Contact on Object_49
    const chairSeatBox = new THREE.Box3().setFromObject(chairSeat);
    const hipWorld = figure.getObjectByName('mixamorigHips_01').getWorldPosition(new THREE.Vector3());
    assert.ok(hipWorld.x >= chairSeatBox.min.x && hipWorld.x <= chairSeatBox.max.x, 'Goku hips centered laterally over chair cushion');
    assert.ok(hipWorld.z >= chairSeatBox.min.z && hipWorld.z <= chairSeatBox.max.z, 'Goku hips positioned over chair cushion bounds');

    const thighContact = evaluateSeatContact(figure, chairSeat);
    assert.ok(thighContact.valid, `thigh contact valid: lHits=${thighContact.lHits}, rHits=${thighContact.rHits}, minGap=${thighContact.minGap?.toFixed(4)}m, maxGap=${thighContact.maxGap?.toFixed(4)}m`);
    assert.ok(thighContact.minGap >= -0.015 && thighContact.maxGap <= 0.015, `seat gap min=${(thighContact.minGap * 1000).toFixed(1)}mm, max=${(thighContact.maxGap * 1000).toFixed(1)}mm within strict [-15mm, +15mm] support tolerance`);
    assert.ok(thighContact.lHits > 0 && thighContact.rHits > 0, 'bilateral thigh support confirmed on Object_49');

    // B) Per-Boot Anatomical Heel/Toe Flat Support Contact & Negative Control
    const shoes = figure.getObjectByName('Object_16');
    const posAttr = shoes.geometry.attributes.position;

    function evaluateSoleSupport(fig) {
      const mesh = fig.getObjectByName('Object_16');
      const shoeVerts = getDeformedPoints(mesh);
      const results = {};

      for (const side of ['Left', 'Right']) {
        const sideFilter = side === 'Left' ? (x => x > 0) : (x => x < 0);
        const heelIndices = [];
        const toeIndices = [];
        const allSoleIndices = [];

        for (let i = 0; i < posAttr.count; i++) {
          const rx = posAttr.getX(i);
          const ry = posAttr.getY(i);
          const rz = posAttr.getZ(i);
          if (!sideFilter(rx)) continue;
          if (ry <= 1.05) {
            allSoleIndices.push(i);
            if (rz < 0) heelIndices.push(i);
            if (rz > 7) toeIndices.push(i);
          }
        }

        // Deduplicate original coordinates for patch centroids
        const dedupIndices = (indices) => {
          const seen = new Set();
          const out = [];
          for (const idx of indices) {
            const key = `${posAttr.getX(idx).toFixed(2)},${posAttr.getY(idx).toFixed(2)},${posAttr.getZ(idx).toFixed(2)}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push(idx);
            }
          }
          return out;
        };

        const heelDedup = dedupIndices(heelIndices);
        const toeDedup = dedupIndices(toeIndices);

        const heelWorld = heelIndices.map((i) => shoeVerts[i]);
        const toeWorld = toeIndices.map((i) => shoeVerts[i]);
        const allWorld = allSoleIndices.map((i) => shoeVerts[i]);

        const heelGaps = heelWorld.map((v) => v.y - CHAIR_FLOOR_Y);
        const toeGaps = toeWorld.map((v) => v.y - CHAIR_FLOOR_Y);
        const allGaps = allWorld.map((v) => v.y - CHAIR_FLOOR_Y);

        const minHeelGap = Math.min(...heelGaps);
        const minToeGap = Math.min(...toeGaps);
        const minSoleGap = Math.min(...allGaps);

        const heelCentroid = new THREE.Vector3();
        heelDedup.forEach((i) => heelCentroid.add(shoeVerts[i]));
        heelCentroid.divideScalar(heelDedup.length);

        const toeCentroid = new THREE.Vector3();
        toeDedup.forEach((i) => toeCentroid.add(shoeVerts[i]));
        toeCentroid.divideScalar(toeDedup.length);

        let minAbsX = Infinity, maxAbsX = -Infinity;
        let medialIdx = -1, lateralIdx = -1;
        for (const idx of heelDedup) {
          const ax = Math.abs(posAttr.getX(idx));
          if (ax < minAbsX) { minAbsX = ax; medialIdx = idx; }
          if (ax > maxAbsX) { maxAbsX = ax; lateralIdx = idx; }
        }

        const vLatMed = new THREE.Vector3().subVectors(shoeVerts[lateralIdx], shoeVerts[medialIdx]);
        const vLength = new THREE.Vector3().subVectors(toeCentroid, heelCentroid);
        const norm = new THREE.Vector3().crossVectors(vLatMed, vLength).normalize();
        const absY = Math.abs(norm.y);

        const medialHeelGap = shoeVerts[medialIdx].y - CHAIR_FLOOR_Y;
        const lateralHeelGap = shoeVerts[lateralIdx].y - CHAIR_FLOOR_Y;

        const valid = minHeelGap >= 0.000 && minHeelGap <= 0.010 &&
                      minToeGap >= 0.000 && minToeGap <= 0.010 &&
                      minSoleGap >= -0.0001 &&
                      absY >= 0.95;

        results[side] = {
          valid,
          minHeelGap,
          minToeGap,
          minSoleGap,
          absY,
          medialHeelGap,
          lateralHeelGap,
          heelGaps,
          toeGaps,
        };
      }
      return results;
    }

    const soleSupport = evaluateSoleSupport(figure);

    // Negative control: baseline prior toes-down tiptoe pose (ankleFlex L: -0.63, R: -0.56) fails flat sole predicate
    const lFootBone = figure.getObjectByName('mixamorigLeftFoot_057');
    const rFootBone = figure.getObjectByName('mixamorigRightFoot_062');
    lFootBone.rotation.set(0.966, 0.015, -0.021);
    lFootBone.rotateX(-0.63);
    rFootBone.rotation.set(0.975, -0.012, 0.018);
    rFootBone.rotateX(-0.56);
    scene.updateMatrixWorld(true);
    figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });
    const toesDownSupport = evaluateSoleSupport(figure);
    assert.equal(toesDownSupport.Right.valid, false, 'negative control: prior toes-down pose fails flat sole predicate (Right heel elevated ~165mm, absY=0.814 < 0.95)');
    assert.equal(toesDownSupport.Left.valid, false, 'negative control: prior toes-down pose fails flat sole predicate (Left heel elevated ~180mm, absY=0.775 < 0.95)');

    // Restore candidate pose
    poseSeated(figure);
    scene.updateMatrixWorld(true);
    figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });

    // Assert strict production flat sole support contact on rug
    assert.ok(soleSupport.Right.valid, `Right boot anatomical flat support: heelGap=${(soleSupport.Right.minHeelGap * 1000).toFixed(1)}mm, toeGap=${(soleSupport.Right.minToeGap * 1000).toFixed(1)}mm, absY=${soleSupport.Right.absY.toFixed(4)} rests within [0..10mm] rug support`);
    assert.ok(soleSupport.Left.valid, `Left boot anatomical flat support: heelGap=${(soleSupport.Left.minHeelGap * 1000).toFixed(1)}mm, toeGap=${(soleSupport.Left.minToeGap * 1000).toFixed(1)}mm, absY=${soleSupport.Left.absY.toFixed(4)} rests within [0..10mm] rug support`);
    assert.ok(soleSupport.Right.minSoleGap >= -0.0001 && soleSupport.Left.minSoleGap >= -0.0001, 'no boot vertices penetrate rug surface');

    // C) Palms-Down Horizontal Metric & Negative Control
    const evalPalm = (fig, side) => {
      const isL = side === 'Left';
      const wrist = fig.getObjectByName(isL ? 'mixamorigLeftHand_011' : 'mixamorigRightHand_035');
      const idx = fig.getObjectByName(isL ? 'mixamorigLeftHandIndex1_016' : 'mixamorigRightHandIndex1_040');
      const pnk = fig.getObjectByName(isL ? 'mixamorigLeftHandPinky1_028' : 'mixamorigRightHandPinky1_052');
      const pW = wrist.getWorldPosition(new THREE.Vector3());
      const pI = idx.getWorldPosition(new THREE.Vector3());
      const pP = pnk.getWorldPosition(new THREE.Vector3());
      const v1 = new THREE.Vector3().subVectors(pI, pW);
      const v2 = new THREE.Vector3().subVectors(pP, pW);
      const norm = new THREE.Vector3().crossVectors(v1, v2).normalize();
      return { norm, absY: Math.abs(norm.y) };
    };

    const lPalm = evalPalm(figure, 'Left');
    const rPalm = evalPalm(figure, 'Right');
    assert.ok(lPalm.absY >= 0.85, `Left palm normal horizontal: abs(y)=${lPalm.absY.toFixed(4)} >= 0.85`);
    assert.ok(rPalm.absY >= 0.85, `Right palm normal horizontal: abs(y)=${rPalm.absY.toFixed(4)} >= 0.85`);

    // Negative control: baseline upright martial-hands pose fails horizontal normal predicate
    const uprightHandRot = {
      L: [0.00, 0.00, 0.25],
      R: [0.00, 0.00, -0.25],
    };
    const uprightArm = {
      L: [0.70, 0.20, 0.80],
      R: [0.70, -0.20, -0.80],
    };
    const uprightForearm = {
      L: [0.20, 0.10, 1.35],
      R: [0.20, -0.10, -1.35],
    };
    const lHandBone = figure.getObjectByName('mixamorigLeftHand_011');
    const rHandBone = figure.getObjectByName('mixamorigRightHand_035');
    const lArmBone = figure.getObjectByName('mixamorigLeftArm_09');
    const rArmBone = figure.getObjectByName('mixamorigRightArm_033');
    const lForeArmBone = figure.getObjectByName('mixamorigLeftForeArm_010');
    const rForeArmBone = figure.getObjectByName('mixamorigRightForeArm_034');

    lHandBone.rotation.set(...uprightHandRot.L);
    rHandBone.rotation.set(...uprightHandRot.R);
    lArmBone.rotation.set(...uprightArm.L);
    rArmBone.rotation.set(...uprightArm.R);
    lForeArmBone.rotation.set(...uprightForearm.L);
    rForeArmBone.rotation.set(...uprightForearm.R);
    scene.updateMatrixWorld(true);

    const lPalmNeg = evalPalm(figure, 'Left');
    const rPalmNeg = evalPalm(figure, 'Right');
    assert.ok(lPalmNeg.absY < 0.85, `Negative control: upright left hand fails horizontal predicate (absY=${lPalmNeg.absY.toFixed(4)} < 0.85)`);
    assert.ok(rPalmNeg.absY < 0.85, `Negative control: upright right hand fails horizontal predicate (absY=${rPalmNeg.absY.toFixed(4)} < 0.85)`);

    // Restore typing pose
    poseSeated(figure);
    scene.updateMatrixWorld(true);
    figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });

    // D) Hands Hovering over Keyboard (Clearance 0..20mm, Forearms not buried)
    const handMeshesL = ['Object_12', 'Object_13'];
    const handMeshesR = ['Object_7', 'Object_8'];
    let insideL = 0, insideR = 0;
    let minClearanceL = Infinity, minClearanceR = Infinity;

    for (const hName of handMeshesL) {
      const hm = figure.getObjectByName(hName);
      assert.ok(hm, `Hand mesh ${hName} exists`);
      const pts = getDeformedPoints(hm);
      for (const v of pts) {
        if (v.x >= keyboardBox.min.x && v.x <= keyboardBox.max.x && v.z >= keyboardBox.min.z && v.z <= keyboardBox.max.z) {
          insideL++;
          const c = v.y - keycapTopY;
          if (c < minClearanceL) minClearanceL = c;
        }
      }
    }
    for (const hName of handMeshesR) {
      const hm = figure.getObjectByName(hName);
      assert.ok(hm, `Hand mesh ${hName} exists`);
      const pts = getDeformedPoints(hm);
      for (const v of pts) {
        if (v.x >= keyboardBox.min.x && v.x <= keyboardBox.max.x && v.z >= keyboardBox.min.z && v.z <= keyboardBox.max.z) {
          insideR++;
          const c = v.y - keycapTopY;
          if (c < minClearanceR) minClearanceR = c;
        }
      }
    }

    assert.ok(insideL > 50, `Left hand fingertip patch reaches keyboard (${insideL} verts)`);
    assert.ok(insideR > 50, `Right hand fingertip patch reaches keyboard (${insideR} verts)`);
    const totalInside = insideL + insideR;
    assert.ok(totalInside >= 200 && totalInside <= 300, `Total inside footprint (${totalInside}) agrees with checkpoint2 baseline`);
    assert.ok(minClearanceL >= 0.000 && minClearanceL <= 0.020, `minimum key clearance Left ${(minClearanceL * 1000).toFixed(1)}mm is within 0..20mm hover window`);
    assert.ok(minClearanceR >= 0.000 && minClearanceR <= 0.020, `minimum key clearance Right ${(minClearanceR * 1000).toFixed(1)}mm is within 0..20mm hover window`);

    // Forearm surface above desk
    const faMesh = figure.getObjectByName('Object_15');
    const faVerts = getDeformedPoints(faMesh);
    const faSW = faMesh.geometry.attributes.skinWeight;
    const faSI = faMesh.geometry.attributes.skinIndex;
    let minFAY = Infinity;
    for (let i = 0; i < faVerts.length; i++) {
      for (let c = 0; c < 4; c++) {
        if (faSW.getComponent(i, c) > 0.2) {
          const b = faMesh.skeleton.bones[faSI.getComponent(i, c)];
          if (b && /ForeArm/.test(b.name) && faVerts[i].y < minFAY) {
            minFAY = faVerts[i].y;
          }
        }
      }
    }
    assert.ok(minFAY >= DESK_TOP_Y, `Forearm surface minY=${minFAY.toFixed(4)} avoids desk penetration (DESK_TOP_Y=${DESK_TOP_Y})`);

    // 4) Production Kinematic Animation Update Test over 0..8s
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

    const handMeshesAll = ['Object_7', 'Object_8', 'Object_12', 'Object_13'];

    let dynMinKeyClearance = Infinity;
    for (let ms = 0; ms <= 8000; ms += 40) {
      goku.update(ms);
      scene.updateMatrixWorld(true);
      figure.traverse((o) => { if (o.isSkinnedMesh) o.skeleton?.update(); });
      for (const mName of handMeshesAll) {
        const m = figure.getObjectByName(mName);
        const pts = getDeformedPoints(m);
        for (const v of pts) {
          if (v.x >= keyboardBox.min.x && v.x <= keyboardBox.max.x && v.z >= keyboardBox.min.z && v.z <= keyboardBox.max.z) {
            const c = v.y - keycapTopY;
            if (c < dynMinKeyClearance) dynMinKeyClearance = c;
            assert.ok(c >= -0.0001, `No dynamic keyboard penetration at t=${ms}ms (clearance=${(c * 1000).toFixed(1)}mm)`);
          }
          assert.ok(v.y >= DESK_TOP_Y - 0.005, `Hand vertex avoids deep desk/mat penetration at t=${ms}ms (y=${v.y.toFixed(4)} >= ${DESK_TOP_Y})`);
        }
      }
    }
    assert.ok(dynMinKeyClearance >= 0.005 && dynMinKeyClearance <= 0.015, `dynamic key clearance across 201 samples=${(dynMinKeyClearance * 1000).toFixed(2)}mm within 5..15mm target`);

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

    // 6) Clean leak-free disposal with actual skeleton & texture dispose events
    let disposedTextures = 0;
    let disposedGeometries = 0;
    let disposedMaterials = 0;
    let disposedSkeletons = 0;

    figure.traverse((o) => {
      if (o.isSkinnedMesh && o.skeleton) {
        if (!o.skeleton._tracked) {
          o.skeleton._tracked = true;
          o.skeleton.computeBoneTexture();
          if (o.skeleton.boneTexture) {
            o.skeleton.boneTexture.addEventListener('dispose', () => { disposedSkeletons++; });
          }
        }
      }
      if (o.geometry && !o.geometry._tracked) {
        o.geometry._tracked = true;
        o.geometry.addEventListener('dispose', () => { disposedGeometries++; });
      }
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m._tracked) {
            m._tracked = true;
            m.addEventListener('dispose', () => { disposedMaterials++; });
          }
          if (m.map && !m.map._tracked) {
            m.map._tracked = true;
            m.map.addEventListener('dispose', () => { disposedTextures++; });
          }
        });
      }
    });

    goku.dispose();
    chairModel.dispose();
    deskModel.dispose();

    assert.equal(figure.parent, null, 'Goku figure removed from parent on dispose');
    assert.equal(disposedGeometries, 8, 'All 8 Goku geometries disposed');
    assert.equal(disposedMaterials, 5, 'All 5 Goku materials disposed');
    assert.ok(disposedTextures > 0, `Textures disposed (${disposedTextures})`);
    assert.equal(disposedSkeletons, 1, 'Skeleton boneTexture disposed');
  });
});

test('Hovercar traffic: asset transport, production loader, zero collisions, cyclic spacing', async () => {
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

    traffic.dispose();
  });
});
