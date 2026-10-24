import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadHoverCarTraffic } from '../src/components/scene/traffic.js';

test('production traffic is not pickable, without changing its geometry or movement', async () => {
  const root = new THREE.Group();
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), new THREE.MeshBasicMaterial()));
  const original = GLTFLoader.prototype.loadAsync;
  GLTFLoader.prototype.loadAsync = async () => ({ scene: root });
  let traffic;
  try { traffic = await loadHoverCarTraffic(); }
  finally { GLTFLoader.prototype.loadAsync = original; }
  try {
    const car = traffic.cars[0];
    traffic.group.updateMatrixWorld(true);
    const mesh = car.carInstance.children[0];
    const box = new THREE.Box3().setFromObject(mesh), center = box.getCenter(new THREE.Vector3());
    const ray = new THREE.Raycaster(center.clone().add(new THREE.Vector3(0, 10, 0)), new THREE.Vector3(0, -1, 0));
    assert.equal(ray.intersectObject(car.carInstance, true).length, 0);
    const skip = mesh.raycast;
    mesh.raycast = THREE.Mesh.prototype.raycast;
    assert.ok(ray.intersectObject(car.carInstance, true).length > 0, 'same ray hits actual geometry when exclusion is removed');
    mesh.raycast = skip;
    const x = car.mesh.position.x;
    traffic.update(0.1);
    assert.notEqual(car.mesh.position.x, x);
  } finally { traffic.dispose(); }
});
