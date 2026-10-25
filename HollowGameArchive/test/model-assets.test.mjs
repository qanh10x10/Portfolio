import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const assets = new URL('../public/assets/', import.meta.url).pathname;
const models = ['sleeping-cat/cat.json', 'dragonball/son_goku.json', 'dragonball/dragon_ball_hover_car.json', 'gaming-setup/gaming-chair.json', 'gaming-setup/gaming-desktop.json', 'gaming-setup/bulletin-board.json'];
for (const name of models) {
  const file = path.join(assets, name), model = JSON.parse(fs.readFileSync(file));
  for (const resource of [...model.buffers, ...model.images]) {
    assert.equal(typeof resource.uri, 'string', `${name}: same-origin external resource`);
    assert.ok(!resource.uri.includes('..') && !/^(?:data:|blob:|https?:)/.test(resource.uri));
    assert.ok(fs.statSync(path.join(path.dirname(file), resource.uri)).size > 0, `${name}: ${resource.uri} exists`);
  }
}
for (const name of ['ironman/ironman.json', 'sleeping-cat/beanbag.json', 'sleeping-cat/cat-eye.webp', 'sleeping-cat/cat-frip-diffuse.webp', 'gaming-setup/board-tex_1.webp', 'gaming-setup/board-tex_2.webp']) assert.equal(fs.existsSync(path.join(assets, name)), false, `${name}: retired resource not shipped`);
const sha = name => createHash('sha256').update(fs.readFileSync(path.join(assets, name))).digest('hex');
assert.equal(sha('sleeping-cat/cat.data'), 'b9c34840468a71daf4735e8776276135196c0fee61d2e6c4f008accd99e80ab1', 'supplied scan BIN payload preserved exactly');
assert.equal(sha('sleeping-cat/cat-0.jpg'), '5225c79e19d6954e134bd86f506429c5def3d7647dd2c349b91f3aad6bbb4210', 'supplied scan JPEG preserved exactly');
const cat = JSON.parse(fs.readFileSync(path.join(assets, 'sleeping-cat/cat.json')));
assert.equal(cat.asset.extras.author, 'Alben Tan (https://sketchfab.com/albentan2012)');
assert.equal(cat.meshes.length, 1);
assert.equal(cat.skins, undefined);
assert.equal(cat.animations, undefined);
console.log('PASS: six active model descriptors, resolved CSP-safe resources, uploaded scan byte parity, retired assets absent');
