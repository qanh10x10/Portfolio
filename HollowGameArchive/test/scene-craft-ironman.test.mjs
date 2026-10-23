// Iron Man seated pose + sci-fi chat panel contract. Runs the production modules in node (no browser): node test/scene-craft-ironman.test.mjs
import assert from 'node:assert/strict';
globalThis.ProgressEvent ??= class ProgressEvent extends Event {}; // three's FileLoader expects the DOM class

import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { poseSeated, seat, POSE, SCALE } from '../src/components/scene/ironMan.js';
import { buildChatPanel, PANEL } from '../src/components/scene/chatPanel.js';
import { buildRobotChair } from '../src/components/scene/robotChair.js';

// --- load the shipped asset exactly as the browser does (json + external .data/.jpg), parsed from disk
const dir = new URL('../public/assets/ironman/', import.meta.url).pathname;
const json = fs.readFileSync(`${dir}ironman.json`, 'utf8');
const bin = fs.readFileSync(`${dir}ironman.data`);
const gltf = JSON.parse(json);
gltf.images = []; gltf.textures = []; gltf.materials.forEach((m) => { delete m.pbrMetallicRoughness.baseColorTexture; delete m.pbrMetallicRoughness.metallicRoughnessTexture; delete m.emissiveTexture; });
gltf.buffers[0].uri = `data:application/octet-stream;base64,${bin.toString('base64')}`;
const parsed = await new Promise((res, rej) => new GLTFLoader().parse(JSON.stringify(gltf), '', res, rej));
const fig = parsed.scene.getObjectByName('IronMan');
assert.ok(fig, 'IronMan root node present');

// 1) size budget (CSP-friendly static files, no blob:)
const size = fs.readdirSync(dir).reduce((n, f) => n + fs.statSync(dir + f).size, 0);
assert.ok(size < 4.2e6, `asset folder ${size} bytes must stay under 4.2 MB`);
assert.ok(!/^data:|^blob:/.test(JSON.parse(json).images?.[0]?.uri ?? 'ironman-baseColor.jpg'), 'textures are separate files');
let tris = 0; fig.traverse((o) => { if (o.isMesh) tris += o.geometry.index.count / 3; });
assert.ok(tris > 40000 && tris < 80000, `triangle count ${tris} within 40k..80k`);
console.log(`✓ asset ${(size / 1e6).toFixed(2)} MB, ${tris} tris, separate texture files`);

// 2) every joint the pose code touches exists, and a part mesh hangs on each limb joint
for (const j of ['Pelvis', 'Torso', 'Neck', ...['L', 'R'].flatMap((s) => [`Shoulder${s}`, `Elbow${s}`, `Wrist${s}`, `Hip${s}`, `Knee${s}`])]) assert.ok(fig.getObjectByName(j), `joint ${j}`);
const meshNames = []; fig.traverse((o) => o.isMesh && meshNames.push(o.name));
assert.equal(new Set(meshNames).size, 12, '12 rigid body parts');

// 3) seated fit against the REAL chair + keyboard-height contract
const mats = { chair: new THREE.MeshStandardMaterial(), metalDark: new THREE.MeshStandardMaterial(), robotBody: new THREE.MeshStandardMaterial(), robotJoint: new THREE.MeshStandardMaterial(), warmGold: new THREE.MeshStandardMaterial() };
const rig = buildRobotChair({ THREE, track: (x) => x, makeCanvasTex: () => new THREE.Texture(), RoundedBoxGeometry, mats });
rig.robot.removeFromParent();
poseSeated(fig);
seat(fig, { hipY: 0.907, z: 0.01 });
rig.root.add(fig);
rig.root.updateMatrixWorld(true);
const verts = (o) => { const p = o.geometry.attributes.position, v = new THREE.Vector3(), a = []; for (let i = 0; i < p.count; i += 2) { v.fromBufferAttribute(p, i); a.push(o.localToWorld(v.clone())); } return a; };
const named = (n) => fig.getObjectByName(n);
const soles = Math.min(...['KneeL', 'KneeR'].flatMap((k) => verts(named(k)).map((v) => v.y)));
assert.ok(soles > 0 && soles < 0.03, `soles ${soles.toFixed(3)} m must rest on the floor (0..3 cm)`);
const seatMesh = rig.chair.getObjectByName('ChairSeatCushion');
seatMesh.geometry.computeBoundingBox();
const inner = seatMesh.geometry.boundingBox.clone().expandByScalar(-0.004);
const inv = seatMesh.matrixWorld.clone().invert();
const depth = (pts) => Math.max(0, ...pts.map((w) => { const l = w.clone().applyMatrix4(inv); return inner.containsPoint(l) ? Math.min(l.x - inner.min.x, inner.max.x - l.x, l.y - inner.min.y, inner.max.y - l.y, l.z - inner.min.z, inner.max.z - l.z) : 0; }));
const thighDepth = depth(['HipL', 'HipR'].flatMap((k) => verts(named(k))));
assert.ok(thighDepth < 0.03, `thighs sink ${(thighDepth * 1000).toFixed(0)} mm into the seat (limit 30)`);
const butt = ['HipL', 'HipR'].flatMap((k) => verts(named(k))).map((v) => rig.root.worldToLocal(v.clone())).filter((v) => v.z > -0.32 && v.z < 0.02 && Math.abs(v.x) < 0.3);
assert.ok(Math.min(...butt.map((v) => v.y)) - 0.68 < 0.06, 'thighs rest on the seat (no air gap > 6 cm)');
const head = Math.max(...verts(named('Neck')).map((v) => v.y));
assert.ok(head > 1.6 && head < 2.1, `helmet top ${head.toFixed(2)} m is at a plausible seated head height`);
console.log(`✓ seated: soles ${(soles * 100).toFixed(1)} cm, seat penetration ${(thighDepth * 1000).toFixed(0)} mm, helmet ${head.toFixed(2)} m`);

// 4) gloves reach forward over the keyboard height band (keyboard 0.58 m ahead of the robot, top ~1.125 m)
for (const s of ['L', 'R']) {
  const hp = verts(named(`Wrist${s}`)).map((v) => rig.root.worldToLocal(v.clone()));
  const cz = hp.reduce((n, v) => n + v.z, 0) / hp.length;
  const lowest = Math.min(...hp.map((v) => v.y));
  assert.ok(cz > 0.4 && cz < 0.75, `${s} glove ${cz.toFixed(2)} m ahead of the pelvis (keyboard at 0.58 m)`);
  assert.ok(lowest > 1.095 + 0.0 && lowest < 1.2, `${s} glove bottom ${lowest.toFixed(3)} m must clear the desk surface (1.095) and hover near the keys`);
}
console.log('✓ both gloves hover over the keyboard, above the desk surface');

// 5) chat panel contract: screen-aligned plane with the declared size, facing +z, standing on its pad
const ctx = { THREE, track: (x) => x, makeCanvasTex: (paint, w, h) => { const calls = []; const c = new Proxy({}, { get: (_, k) => (k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : (...a) => calls.push([k, a])), set: () => true }); paint(c, w, h); assert.ok(calls.length > 20, 'screen paints content'); return new THREE.Texture(); }, RoundedBoxGeometry };
const panel = buildChatPanel(ctx);
assert.equal(panel.screen.geometry.parameters.width, PANEL.w);
assert.equal(panel.screen.geometry.parameters.height, PANEL.h);
panel.group.updateMatrixWorld(true);
const n = new THREE.Vector3(0, 0, 1).applyQuaternion(panel.screen.getWorldQuaternion(new THREE.Quaternion()));
assert.ok(n.z > 0.98 && n.y > 0, `screen faces +z and leans back (normal ${n.toArray().map((x) => x.toFixed(2))})`);
const box = new THREE.Box3().setFromObject(panel.group);
assert.ok(box.min.y >= -1e-6 && box.max.y < 0.65, `panel stands on the desk: y ${box.min.y.toFixed(3)}..${box.max.y.toFixed(3)}`);
assert.ok(box.max.x - box.min.x < 0.8, `footprint width ${(box.max.x - box.min.x).toFixed(2)} m fits beside the monitor`);
console.log('✓ chat panel: faces camera, stands on desk, compact footprint');
console.log('ALL IRONMAN/CHAT CHECKS PASSED');
