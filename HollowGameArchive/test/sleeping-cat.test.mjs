import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupCatSkinning, poseSleepingCat, placeOnBeanbag, sampleContact } from '../src/components/scene/sleepingCat.js';
globalThis.ProgressEvent ??= class extends Event {};
const assets = new URL('../public/assets/sleeping-cat/', import.meta.url);
async function load(name) {
  const data = JSON.parse(await fs.readFile(new URL(name + '.json', assets)));
  data.images = []; data.textures = []; data.materials = [];
  for (const mesh of data.meshes) for (const p of mesh.primitives) delete p.material;
  data.buffers[0].uri = 'data:application/octet-stream;base64,' + (await fs.readFile(new URL(name + '.data', assets))).toString('base64');
  return (await new GLTFLoader().parseAsync(JSON.stringify(data), '')).scene;
}
const cat = await load('cat'), bag = await load('beanbag'), assembly = new THREE.Group();
assembly.add(cat, bag);
setupCatSkinning(cat); poseSleepingCat(cat); placeOnBeanbag(cat, bag); assembly.updateMatrixWorld(true);
const body = cat.getObjectByName('Object_9'), bounds = new THREE.Box3(), v = new THREE.Vector3();
body.skeleton.update();
for (let i = 0; i < body.geometry.attributes.position.count; i++) bounds.expandByPoint(body.getVertexPosition(i, v).applyMatrix4(body.matrixWorld));
assert(body.isSkinnedMesh && body.skeleton.bones.length === 34);
const size = bounds.getSize(new THREE.Vector3());
assert(size.x > .35 && size.x < .85 && size.y > .08 && size.y < .4 && size.z > .1 && size.z < .65, `actual skin dimensions ${size.toArray()}`);
const head = cat.getObjectByName('Bone004_05').getWorldPosition(v);
assert(head.distanceTo(bounds.getCenter(new THREE.Vector3())) < .45, 'rig and actual skin must share coordinates');
const contact = sampleContact(cat, bag);
assert.equal(contact._summary.totalPoints, 7);
assert.equal(contact._summary.allSupported, true, JSON.stringify(contact));
for (const [name, p] of Object.entries(contact)) if (name !== '_summary') {
  assert(p.vertexCount > 0 && Number.isInteger(p.vertexIndex), `${name} must sample real skin vertices, not joints`);
  assert(p.minGap >= -.04 && p.gap <= .03, `${name} contact ${JSON.stringify(p)}`);
}
bag.visible = false;
assert.equal(sampleContact(cat, bag)._summary.allSupported, false, 'hidden support must fail');
bag.visible = true;
cat.position.y += .35; assembly.updateMatrixWorld(true);
assert.equal(sampleContact(cat, bag)._summary.allSupported, false, 'floating skin must fail');
cat.position.y -= .7; assembly.updateMatrixWorld(true);
assert.equal(sampleContact(cat, bag)._summary.allSupported, false, 'buried skin must fail');
assert.throws(() => sampleContact(cat, null), /Beanbag/);
console.log('PASS: source rig + actual skinned dimensions, 7 real-vertex support groups, floating/buried/missing-support negatives');
