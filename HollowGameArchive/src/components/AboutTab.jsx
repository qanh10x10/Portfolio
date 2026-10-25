import React from 'react';

function isModifiedEvent(event) {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0 ||
    event.defaultPrevented
  );
}

export default function AboutTab({ onNavigate, onExploreResume }) {
  return (
    <div className="screen-about">
      <section id="about" aria-labelledby="h-about">
        <h2 id="h-about">About</h2>
        <div className="letter">
          <p>
            I'm a Unity developer with 5 years in the game industry. I build 2D and 3D games for mobile and web, mostly idle, defense, strategy and GameFi, with the blockchain and payment plumbing they need.
          </p>
          <p>
            I have led teams and shipped alone, from first prototype to release, then kept supporting the game as it grew.
          </p>
          <p>
            Unity and C# are home. I also work in C++, Lua, Cocos, TypeScript, React.js, PixiJS and Phaser, and automate the boring parts with n8n and Telegram bots.
          </p>
          <p className="sign">
            Chu Quang Anh<span>Unity developer, Ha Noi</span>
          </p>
      </div>

      <a
        href="/resume#skills"
        id="skills-button"
        className="more"
        onClick={(e) => {
          if (isModifiedEvent(e)) return;
          if (onExploreResume) {
            onExploreResume(e);
          } else {
            onNavigate('resume#skills', e);
          }
        }}
      >
        View all skills & technologies →
      </a>
    </section>

    <details className="model-credits">
      <summary>3D model credits</summary>
      <ul>
        <li><a href="https://sketchfab.com/3d-models/son-goku-117fe1c12ffe44f698fe5d68f94a61ad" target="_blank" rel="noopener noreferrer">Son Goku — ejohnson967</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Adapted into a seated typing pose; skin and skeleton preserved.</li>
        <li><a href="https://sketchfab.com/3d-models/dragon-ball-hover-car-c1fab1f37a81487eb5b5db7e21627840" target="_blank" rel="noopener noreferrer">Dragon Ball Hover Car — Tiến Sỹ</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Adapted with opaque physical material flags and shared geometry traffic.</li>
        <li><a href="https://sketchfab.com/3d-models/sleeping-cat-on-the-bed-1-3d-scan-ae07a741be6944e8ba5e2657069d3aaf" target="_blank" rel="noopener noreferrer">Sleeping Cat On The Bed 1 — Alben Tan</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Original sleeping scan and blanket preserved; subtle belly breathing added.</li>
        <li><a href="https://sketchfab.com/3d-models/gaming-chair-828ec54fabde46a8900fadf64c05433b" target="_blank" rel="noopener noreferrer">Gaming Chair — PixelPlay</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Scaled and oriented for the seated figure.</li>
        <li><a href="https://sketchfab.com/3d-models/gaming-desktop-pc-d1d8282c9916438091f11aeb28787b66" target="_blank" rel="noopener noreferrer">Gaming Desktop PC — Yolala1232</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Meshes batched; display adapted for portfolio content.</li>
        <li><a href="https://sketchfab.com/3d-models/japanese-bulletin-board-01-44c982a5367d4af8b845c7494ee55e6b" target="_blank" rel="noopener noreferrer">Japanese Bulletin Board 01 — Nichgon</a> · <a href="https://sketchfab.com/licenses">Sketchfab Standard</a> in the downloaded asset and API; the source page also lists CC0. Scaled and adapted as the resume board.</li>
      </ul>
      <p>Third-party models remain the property of their respective creators. The bulletin-board asset is embedded only as part of this portfolio; republication, retransmission, reproduction or redistribution as a standalone model or asset pack is not permitted under its Standard license.</p>
    </details>
    </div>
  );
}
