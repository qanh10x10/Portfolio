import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';

const source = fs.readFileSync(new URL('../src/components/deskSceneBuilder.js', import.meta.url), 'utf8');
const initial = source.slice(source.indexOf('  // 3. Camera'), source.indexOf('  // Disposal tracking'));
const resize = source.slice(source.indexOf('    const isMobilePortrait', source.indexOf('  const handleResize')), source.indexOf('    renderer.setSize', source.indexOf('  const handleResize')));

function cameraAt(width, height) {
  const context = vm.createContext({THREE, width, height});
  vm.runInContext(initial + '\nglobalThis.state = {camera, defaultCamPos, targetLookAt};', context);
  return {context, ...context.state};
}

test('portrait home camera keeps the workstation close, including resize and Back defaults', () => {
  for (const [width, height] of [[320,844],[390,844],[458,854],[699,844]]) {
    const state = cameraAt(width, height);
    const distance = state.defaultCamPos.distanceTo(state.targetLookAt);
    assert.ok(distance >= 6 && distance <= 8, `${width}px portrait camera is ${distance.toFixed(2)}m from subject, not a distant full-room overview`);
    assert.ok(state.camera.fov >= 50 && state.camera.fov <= 75);
    const fromDesktop = cameraAt(1280,900);
    vm.runInContext(`width=${width};height=${height};{${resize}}`, fromDesktop.context);
    assert.deepEqual(fromDesktop.defaultCamPos.toArray(), state.defaultCamPos.toArray());
    assert.deepEqual(fromDesktop.targetLookAt.toArray(), state.targetLookAt.toArray());
    assert.equal(fromDesktop.camera.fov, state.camera.fov);
    assert.equal(fromDesktop.camera.aspect, width / height);
  }
  for (const [width,height,pos,fov] of [[1280,900,[4.8,3.8,5.8],38],[844,390,[5.2,4,6.4],44]]) {
    const state = cameraAt(width,height);
    assert.deepEqual(state.defaultCamPos.toArray(),pos);
    assert.equal(state.camera.fov,fov,'desktop and landscape framing stay unchanged');
  }
});
