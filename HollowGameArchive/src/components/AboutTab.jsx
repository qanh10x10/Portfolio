import React, { useState, useEffect } from 'react';
import { STAGE } from '../data/stage.js';
import { PROJECTS } from '../data/projects.js';

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

const FEATURED_PROJECTS = [
  { key: 'tinhThienHa1', title: 'Tinh Thien Ha 1', kind: 'MMORPG', blurb: 'ADNX martial-arts MMORPG with 10 schools, available on mobile and PC, activities, guilds and PvP.' },
  { key: 'muloren', title: 'MU Loren Mobile', kind: 'MMORPG', blurb: 'Fantasy MMORPG for mobile. Unity client work.' },
  { key: 'idleCyber', title: 'Idle Cyber', kind: 'GameFi', blurb: 'Idle defence game with NFT features. Boss waves, weapon and character upgrades.' },
  { key: 'archero', title: 'Archero clone', kind: 'Play in browser', blurb: 'Roguelike shooter built to show the craft. Runs in the browser, no install.' },
  { key: 'surviver', title: 'Survivor.IO template', kind: 'Play in browser', blurb: 'Swarm survival template with stages, shop and loadouts.' },
  { key: 'tilecandy', title: 'Tile Candy!', kind: 'Play in browser', blurb: 'Candy tile-matching puzzle with a level map and boosters.' },
  { key: 'sudoku', title: 'Sudoku Universe', kind: 'Play in browser', blurb: 'Sudoku with daily puzzles, four difficulty levels and unlockable themes.' },
  { key: 'tilesmatch3', title: 'Tiles Match 3', kind: 'Play in browser', blurb: 'Jungle-themed tile match with boosters and a level path.' },
  { key: 'nekoverse', title: 'Nekoverse', kind: 'GameFi', blurb: 'Creature battler with an NFT layer.' },
];

export default function AboutTab({ onNavigate, onSelectDetail, onExploreResume }) {
  const [activeKey, setActiveKey] = useState('muloren');
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 820px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const totalProjects = PROJECTS.length;
  const currentItem = FEATURED_PROJECTS.find((p) => p.key === activeKey) || FEATURED_PROJECTS[0];
  const stageData = STAGE[activeKey] || STAGE.muloren;

  const renderPanel = () => (
    <figure
      className="panel"
      aria-label="Project picture"
      style={{ backgroundColor: stageData.bg || '' }}
    >
      {FEATURED_PROJECTS.map((proj) => {
        const s = STAGE[proj.key];
        if (!s) return null;
        const isLo = s.w <= 300 || s.h <= 300;
        const modeClass = s.mode === 'fit' ? (isLo ? 'fit lo' : 'fit') : (s.mode === 'nat' ? 'fit lo' : '');
        return (
          <img
            key={proj.key}
            className={`${activeKey === proj.key ? 'on' : ''} ${modeClass}`}
            data-k={proj.key}
            data-bg={s.bg}
            src={s.src}
            alt={proj.title}
            style={{
              objectPosition: s.pos || undefined,
            }}
            width={s.w}
            height={s.h}
            loading={proj.key === 'muloren' ? undefined : 'lazy'}
          />
        );
      })}
      <figcaption>
        <span id="cap">{currentItem.title}</span>
        <span id="tag">{currentItem.kind}</span>
      </figcaption>
    </figure>
  );

  return (
    <div className="stage">
      <div className="col">
        <section id="work" aria-labelledby="h-work">
          <h2 id="h-work">Work</h2>

          {/* On mobile, panel renders right before the list */}
          {isMobile && renderPanel()}

          <ul className="list">
            {FEATURED_PROJECTS.map((item) => (
              <li key={item.key}>
                <a
                  href={`/portfolio/${item.key}`}
                  className={`work-item ${activeKey === item.key ? 'on' : ''}`}
                  onMouseEnter={() => setActiveKey(item.key)}
                  onFocus={() => setActiveKey(item.key)}
                  onClick={(e) => {
                    if (isModifiedEvent(e)) return;
                    onSelectDetail(item.key, e);
                  }}
                >
                  {item.title}
                  <span>{item.kind}</span>
                </a>
                <p>{item.blurb}</p>
              </li>
            ))}
          </ul>
          <a
            className="more"
            href="/portfolio"
            onClick={(e) => {
              if (isModifiedEvent(e)) return;
              onNavigate('portfolio', e);
            }}
          >
            All {totalProjects} projects →
          </a>
        </section>

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
          <ul className="what">
            <li>
              <b>Unity game development</b>
              <span>2D and 3D mobile games, from core mechanics to monetization and publishing.</span>
            </li>
            <li>
              <b>Application development</b>
              <span>Mobile and desktop apps built around the business.</span>
            </li>
            <li>
              <b>Game blockchain integration</b>
              <span>NFTs, wallets and GameFi features inside Unity.</span>
            </li>
            <li>
              <b>n8n automation</b>
              <span>Workflows, AI agents and cross-platform integrations.</span>
            </li>
            <li>
              <b>Telegram games and bots</b>
              <span>Mini-apps, games and AI bots for Telegram.</span>
            </li>
            <li>
              <b>Ads and monetization</b>
              <span>Ad networks, in-app purchases, plugins and reskin workflows.</span>
            </li>
          </ul>
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

        <section id="resume" aria-labelledby="h-resume">
          <h2 id="h-resume">Resume</h2>
          <ul className="jobs">
            <li><div>ADNX<em>Unity developer</em></div><span>Aug 2024 – now</span></li>
            <li><div>Rise Up<em>Unity developer, turn-based GameFi</em></div><span>Dec 2023 – May 2024</span></li>
            <li><div>Gamota, Gabros team<em>Unity developer, RTS with GameFi</em></div><span>May 2023 – Oct 2023</span></li>
            <li><div>WeeGoon<em>Unity developer</em></div><span>Feb 2021 – Apr 2023</span></li>
          </ul>
          <a
            className="more"
            href="/resume"
            onClick={(e) => {
              if (isModifiedEvent(e)) return;
              onNavigate('resume', e);
            }}
          >
            Full resume →
          </a>
        </section>

        <section id="contact" aria-labelledby="h-contact">
          <h2 id="h-contact">Contact</h2>
          <a className="mail" href="mailto:chuquanganh00@gmail.com">
            chuquanganh00<wbr />@gmail.com
          </a>
          <div className="links">
            <a href="https://t.me/hollow2908" target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href="https://github.com/qanh10x10" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/ch%E1%BB%AD-quang-anh-633bb3223/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.facebook.com/quanganh.chu.9619/" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://play.google.com/store/apps/dev?id=4917555335442358774" target="_blank" rel="noopener noreferrer">Google Play</a>
          </div>
          <a
            className="more"
            href="/contact"
            onClick={(e) => {
              if (isModifiedEvent(e)) return;
              onNavigate('contact', e);
            }}
          >
            Send a direct message →
          </a>
        </section>
        <details className="model-credits">
          <summary>3D model credits</summary>
          <ul>
            <li><a href="https://sketchfab.com/3d-models/son-goku-117fe1c12ffe44f698fe5d68f94a61ad" target="_blank" rel="noopener noreferrer">Son Goku — ejohnson967</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Adapted into a seated typing pose; skin and skeleton preserved.</li>
            <li><a href="https://sketchfab.com/3d-models/iron-man-69dde1ad49e94852984e3d83928efd65" target="_blank" rel="noopener noreferrer">Iron Man — Grant Riley</a> · <a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>. Legacy asset retained for regression fixtures; not displayed in the room.</li>
            <li><a href="https://sketchfab.com/3d-models/dragon-ball-hover-car-c1fab1f37a81487eb5b5db7e21627840" target="_blank" rel="noopener noreferrer">Dragon Ball Hover Car — Tiến Sỹ</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Adapted with opaque physical material flags and shared geometry traffic.</li>
            <li><a href="https://sketchfab.com/3d-models/3d-modelling-my-cat-fripouille-0ab14bf98e754f8d90fe1bf1c84ca66c" target="_blank" rel="noopener noreferrer">Fripouille — guillaume bolis</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Rig posed for resting.</li>
            <li><a href="https://sketchfab.com/3d-models/simple-bean-bag-64d111cec3d842f09cbb8c68b1e49c8d" target="_blank" rel="noopener noreferrer">Simple Bean Bag — AleixoAlonso</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Scaled and placed.</li>
            <li><a href="https://sketchfab.com/3d-models/gaming-chair-828ec54fabde46a8900fadf64c05433b" target="_blank" rel="noopener noreferrer">Gaming Chair — PixelPlay</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Scaled and oriented for the seated figure.</li>
            <li><a href="https://sketchfab.com/3d-models/gaming-desktop-pc-d1d8282c9916438091f11aeb28787b66" target="_blank" rel="noopener noreferrer">Gaming Desktop PC — Yolala1232</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Meshes batched; display adapted for portfolio content.</li>
            <li><a href="https://sketchfab.com/3d-models/japanese-bulletin-board-01-44c982a5367d4af8b845c7494ee55e6b" target="_blank" rel="noopener noreferrer">Japanese Bulletin Board 01 — Nichgon</a> · <a href="https://sketchfab.com/licenses">Sketchfab Standard</a> in the downloaded asset and API; the source page also lists CC0. Scaled and adapted as the resume board.</li>
          </ul>
          <p>Third-party models remain the property of their respective creators. The bulletin-board asset is embedded only as part of this portfolio; republication, retransmission, reproduction or redistribution as a standalone model or asset pack is not permitted under its Standard license.</p>
        </details>
      </div>

      {/* Desktop sticky panel */}
      {!isMobile && renderPanel()}
    </div>
  );
}
