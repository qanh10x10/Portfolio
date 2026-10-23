import * as THREE from 'three';
import { RoundedBoxGeometry as FallbackRoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Sci-fi holo chat terminal on the desk: projector pad + beam + floating, tilted holographic panel with corner brackets.
// Origin = pad centre on the desk surface, panel faces +z. The panel group is tilted back so it reads as a hologram.
export const PANEL = { w: 0.6, h: 0.375, lift: 0.17, tilt: -0.14, frame: 0.012 };

function paintScreen(x, w, h) {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(2,18,34,0.94)');
  g.addColorStop(1, 'rgba(4,34,58,0.94)');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(80,220,255,0.12)';
  x.lineWidth = 1;
  for (let i = 0; i <= w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
  for (let j = 0; j <= h; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
  x.fillStyle = 'rgba(70,220,255,0.18)';
  x.fillRect(0, 0, w, 70);
  x.strokeStyle = 'rgba(126,240,255,0.7)';
  x.lineWidth = 2;
  x.beginPath(); x.moveTo(0, 70); x.lineTo(w, 70); x.stroke();
  // reactor glyph
  x.strokeStyle = '#8ff4ff'; x.lineWidth = 4;
  x.beginPath(); x.arc(46, 35, 21, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 3;
  x.beginPath(); x.arc(46, 35, 10, 0, Math.PI * 2); x.stroke();
  x.fillStyle = '#eaffff'; x.beginPath(); x.arc(46, 35, 4.5, 0, Math.PI * 2); x.fill();
  x.textBaseline = 'middle';
  x.fillStyle = '#9ff6ff'; x.font = '700 28px Poppins, sans-serif';
  x.fillText('AI ASSISTANT', 88, 35);
  x.font = '600 18px Poppins, sans-serif'; x.fillStyle = '#5dffb0';
  x.fillText('● ONLINE', w - 130, 35);
  // bubbles
  x.fillStyle = 'rgba(40,150,220,0.28)'; x.fillRect(28, 100, w * 0.72, 130);
  x.strokeStyle = 'rgba(126,240,255,0.7)'; x.lineWidth = 2; x.strokeRect(28, 100, w * 0.72, 130);
  x.fillStyle = '#e2fbff'; x.font = '500 24px Poppins, sans-serif';
  x.fillText('Ask about Quang Anh’s Unity', 46, 136);
  x.fillText('games, skills and demos.', 46, 172);
  x.fillStyle = '#7ef0ff'; x.font = '500 18px Poppins, sans-serif';
  x.fillText('Answers only from this portfolio', 46, 208);
  x.fillStyle = 'rgba(126,240,255,0.34)'; x.fillRect(w * 0.28, 256, w * 0.68, 64);
  x.fillStyle = '#f2ffff'; x.font = '500 22px Poppins, sans-serif';
  x.fillText('Which games has he shipped?', w * 0.28 + 18, 288);
  // input
  x.strokeStyle = '#8ff4ff'; x.lineWidth = 3; x.strokeRect(28, h - 92, w - 56, 58);
  x.fillStyle = 'rgba(226,251,255,0.6)'; x.font = '400 22px Poppins, sans-serif';
  x.fillText('Type a question…', 50, h - 63);
  x.fillStyle = '#8ff4ff'; x.font = '700 20px Poppins, sans-serif';
  x.fillText('SEND ▸', w - 140, h - 63);
}

export function buildChatPanel(ctx) {
  const { track, makeCanvasTex } = ctx;
  const RoundedBox = ctx.RoundedBoxGeometry || FallbackRoundedBoxGeometry;
  const { w, h, lift, tilt, frame } = PANEL;
  const group = new THREE.Group();
  group.name = 'ChatPanel';

  const dark = track(new THREE.MeshStandardMaterial({ color: 0x0b1322, roughness: 0.3, metalness: 0.9 }));
  const glow = track(new THREE.MeshBasicMaterial({ color: 0x8ff4ff, toneMapped: false }));
  const beamMat = track(new THREE.MeshBasicMaterial({
    color: 0x35d9ff, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  }));
  const add = (mesh, name, x, y, z, parent = group) => { mesh.name = name; mesh.position.set(x, y, z); parent.add(mesh); return mesh; };

  // projector pad + glowing ring
  add(new THREE.Mesh(track(new RoundedBox(0.3, 0.022, 0.17, 3, 0.008)), dark), 'ChatPad', 0, 0.011, 0).castShadow = true;
  const ring = add(new THREE.Mesh(track(new THREE.TorusGeometry(0.07, 0.004, 8, 48)), glow), 'ChatPadRing', 0, 0.0235, 0);
  ring.rotation.x = Math.PI / 2;
  add(new THREE.Mesh(track(new THREE.CircleGeometry(0.058, 32)), track(new THREE.MeshBasicMaterial({ color: 0x35d9ff, transparent: true, opacity: 0.55, toneMapped: false }))), 'ChatPadCore', 0, 0.0235, 0).rotation.x = -Math.PI / 2;
  // light beam from pad to panel
  add(new THREE.Mesh(track(new THREE.CylinderGeometry(w * 0.34, 0.058, lift - 0.02, 32, 1, true)), beamMat), 'ChatBeam', 0, 0.0235 + (lift - 0.02) / 2, 0);

  // floating panel (tilted back)
  const panel = new THREE.Group();
  panel.name = 'ChatPanelFloat';
  panel.position.set(0, lift + h / 2, 0);
  panel.rotation.x = tilt;
  group.add(panel);

  add(new THREE.Mesh(track(new THREE.PlaneGeometry(w + 0.03, h + 0.03)), track(new THREE.MeshBasicMaterial({ color: 0x0a3a5c, transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false }))), 'ChatGlass', 0, 0, -0.004, panel);

  const tex = makeCanvasTex(paintScreen, 960, 600);
  const screen = new THREE.Mesh(
    track(new THREE.PlaneGeometry(w, h)),
    track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.97, toneMapped: false })),
  );
  add(screen, 'ChatScreen', 0, 0, 0, panel);

  // thin edge lines + corner brackets (no dark bezel: reads as a projection, not a monitor)
  const bar = (bw, bh, x, y) => add(new THREE.Mesh(track(new THREE.BoxGeometry(bw, bh, 0.003)), glow), 'ChatEdge', x, y, 0.002, panel);
  const L = 0.07, T = 0.006;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    bar(L, T, sx * (w / 2 - L / 2 + frame), sy * (h / 2 + frame));
    bar(T, L, sx * (w / 2 + frame), sy * (h / 2 - L / 2 + frame));
  }
  bar(w * 0.5, 0.003, 0, -(h / 2 + frame)); // bottom edge accent
  // side projector fins
  for (const sx of [-1, 1]) add(new THREE.Mesh(track(new THREE.BoxGeometry(0.01, 0.07, 0.018)), dark), 'ChatFin', sx * (w * 0.5 + 0.03), -h * 0.28, 0, panel);

  return { group, panel, screen, width: w, height: h, frameWidth: w + 2 * frame + 0.02, frameHeight: h + 2 * frame + 0.02, centerY: lift + h / 2 };
}
