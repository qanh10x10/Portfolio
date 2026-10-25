// Production holographic chat geometry; retired Iron Man model is not shipped.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildChatPanel, PANEL } from '../src/components/scene/chatPanel.js';

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
console.log('ALL CHAT PANEL CHECKS PASSED');
