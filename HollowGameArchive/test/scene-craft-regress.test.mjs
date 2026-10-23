// Parent-owned regression: bugs the coder tests missed (found in rendered screenshots).
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildRobotChair } from '../src/components/scene/robotChair.js';
import { buildDeskProps } from '../src/components/scene/deskProps.js';
import { buildRoomDressing } from '../src/components/scene/roomDressing.js';

const std = (c) => new THREE.MeshStandardMaterial({ color: c });
const ctx = {
  THREE, track: (x) => x, RoundedBoxGeometry, makeCanvasTex: () => new THREE.Texture(),
  mats: { metalDark: std(1), deskTop: std(2), deskLegs: std(3), warmGold: std(4), chair: std(5), robotBody: std(6), robotJoint: std(7), rug: std(8) },
};
const front = (o) => o.getWorldQuaternion(new THREE.Quaternion());

// 1) The CRT face must be the first thing a ray from the front hits (else the blue eyes render hidden).
{
  const r = buildRobotChair(ctx);
  r.root.updateMatrixWorld(true);
  const c = r.crtFace.getWorldPosition(new THREE.Vector3());
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(front(r.crtFace));
  for (const [dx, dy] of [[0, 0], [-0.2, 0.1], [0.2, -0.1], [-0.25, -0.15], [0.25, 0.15]]) {
    const origin = c.clone().addScaledVector(n, 1).add(new THREE.Vector3(dx, dy, 0));
    const rc = new THREE.Raycaster(origin, n.clone().negate());
    const hit = rc.intersectObject(r.head, true).find((h) => h.object.visible);
    assert.ok(hit?.object === r.crtFace, `ray at (${dx},${dy}) hit ${hit?.object.name || 'nothing'} before the CRT face`);
  }
  console.log('✓ CRT face is the first surface hit from the front (5 rays)');
}

// 2) Phone screen must sit on the OUTSIDE face of the body at every flip step (checked in body-local space).
{
  const d = buildDeskProps(ctx);
  let body = null;
  d.phone.group.traverse((o) => { if (o.isMesh && o.name === 'PhoneBody') body = o; });
  assert.ok(body, 'phone body mesh found');
  body.geometry.computeBoundingBox();
  const bb = body.geometry.boundingBox;
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    d.phone.setFlip(t);
    d.phone.group.updateMatrixWorld(true);
    const nW = new THREE.Vector3(0, 0, 1).applyQuaternion(front(d.phone.screen));
    const cW = d.phone.screen.getWorldPosition(new THREE.Vector3());
    const out = body.worldToLocal(cW.clone().addScaledVector(nW, 0.003)); // 3mm in front of the screen
    const inn = body.worldToLocal(cW.clone().addScaledVector(nW, -0.003)); // 3mm behind it
    assert.ok(!bb.containsPoint(body.worldToLocal(cW.clone())), `phone screen centre is inside the body at flip ${t}`); // catches sub-mm burial
    assert.ok(!bb.containsPoint(out), `phone screen buried in body at flip ${t}`);
    assert.ok(bb.containsPoint(inn), `phone screen floats off the body at flip ${t}`);
  }
  console.log('✓ phone screen sits on the outside face of the body at all flip steps');
}
// 3) Floor cables must start ON the desk cable tray (desk group is placed at world z=0.2 by deskSceneBuilder).
{
  const DESK_Z = 0.2;
  const d = buildDeskProps(ctx);
  const dr = buildRoomDressing(ctx);
  let tray = null;
  d.desk.traverse((o) => { if (o.isMesh && o.geometry?.parameters?.width === 1.6 && o.geometry?.parameters?.depth === 0.16) tray = o; });
  assert.ok(tray, 'cable tray found');
  d.desk.updateMatrixWorld(true);
  const tb = new THREE.Box3().setFromObject(tray).translate(new THREE.Vector3(0, 0, DESK_Z)).expandByScalar(0.04);
  let n = 0;
  dr.cableBundles.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    let top = new THREE.Vector3(0, -1, 0), bot = new THREE.Vector3(0, 9, 0), v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); if (v.y > top.y) top.copy(v); if (v.y < bot.y) bot.copy(v); }
    assert.ok(tb.containsPoint(top), `cable top end (${top.toArray().map((x) => x.toFixed(2))}) is not on the cable tray`);
    assert.ok(bot.y < 0.03, 'cable bottom end reaches the floor');
    n++;
  });
  assert.ok(n >= 2, 'at least 2 floor cables');
  console.log('✓ floor cables start on the tray and reach the floor');
}
console.log('ALL REGRESSION CHECKS PASSED');
