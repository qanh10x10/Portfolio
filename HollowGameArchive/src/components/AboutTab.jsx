import React from 'react';
import Icon from './Icon.jsx';

export default function AboutTab({ onExploreResume }) {
  return (
    <article className="about active" data-page="about">
      <header>
        <h2 className="h2 article-title">About me</h2>
      </header>

      <section className="about-text">
        <p>
          As a highly experienced <strong>Unity Developer</strong> with 4+ years in the game industry, I specialize in building high-quality 2D/3D games for mobile and web platforms. My expertise spans <strong>idle, defense, strategy, and GameFi games</strong> with deep integration of <strong>blockchain technologies (NFT, Web3)</strong> and monetization systems.
        </p>

        <p>
          I take pride in delivering <strong>cross-platform Unity experiences</strong> with custom game mechanics, clean UI/UX, optimized performance, and scalable design systems — all crafted with precision and creativity. I’ve led and solo-developed projects from concept to release, and continuously improve through prototyping, reskinning, and long-term support.
        </p>

        <p>
          🔧 <strong>Tech stack & Skills:</strong> Unity, C#, C++, Firebase, WebGL, AdMob, Game Optimization, Game Design, Web3/NFT, N8N, Telegram App/Bot Automation, React, PixiJS, Cocos Creator, Phaser
        </p>

        <p>
          🚀 Let’s connect and bring your game idea to life with scalable tech and engaging gameplay!
        </p>

        <p>
          🚀 <strong>Unlock the Future of Gaming with a Professional Unity Developer!</strong>
        </p>

        <p>
          🎯 <strong>Why Me?</strong><br />
          🔹 Passionate & Reliable — From concept to release<br />
          🔹 Fast & Professional — Delivery with high quality<br />
          🔹 Creative Problem Solver — Focused on gameplay and performance<br />
          🔹 Long-Term Support — Helping you scale your product
        </p>

        <p>
          💬 Let’s connect and turn your ideas into powerful gaming experiences!
        </p>
      </section>

      <header>
        <h2 className="h2 article-title">What I'm doing</h2>
      </header>

      <section className="service">
        <ul className="service-list">
          <li className="service-item-box2">
            <div className="service-icon-box">
              <img src="/assets/images/icon_unity.png" alt="Unity Developer" width="40" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Unity Game Development</h4>
              <p>Build high-quality 2D/3D mobile games, from core mechanics to monetization and publishing.</p>
            </div>
          </li>

          <li className="service-item-box2">
            <div className="service-icon-box">
              <img src="/assets/images/icon-app.svg" alt="App Development" width="35" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Application Development</h4>
              <p>Create mobile and desktop apps tailored to business needs and user experiences.</p>
            </div>
          </li>

          <li className="service-item-box2">
            <div className="service-icon-box">
              <img src="/assets/images/icon_gamefi.png" alt="Blockchain" width="40" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Game Blockchain Integration</h4>
              <p>Integrate NFTs, wallets, and GameFi features seamlessly into Unity games.</p>
            </div>
          </li>

          <li className="service-item-box2">
            <div className="service-icon-box">
              <img src="/assets/images/icon_n8n.png" alt="n8n Automation" width="40" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">n8n Automation</h4>
              <p>Automate workflows, AI agents, and cross-platform integrations with n8n.</p>
            </div>
          </li>

          <li className="service-item-box2">
            <div className="service-icon-box">
              <img src="/assets/images/icon_tele.png" alt="Telegram Bot" width="40" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Telegram Game & Bot</h4>
              <p>Build interactive Telegram games, AI bots, and mini-apps for global audiences.</p>
            </div>
          </li>

          <li className="service-item-box2">
            <div className="service-icon-box">
              <img src="/assets/images/icon-ads.png" alt="Ads & Monetization" width="40" />
            </div>
            <div className="service-content-box">
              <h4 className="h4 service-item-title">Ads & Monetization</h4>
              <p>Boost revenue with ad networks, in-app purchases, plugin systems, and reskin workflows.</p>
            </div>
          </li>
        </ul>

        <p style={{ color: 'var(--light-gray)' }}>
          🔥 <strong>More:</strong><br />
          ✅ High-Quality Game Design & Custom Mechanics<br />
          ✅ Mobile & Cross-Platform Unity Development<br />
          ✅ Web3 Blockchain & NFT Integration<br />
          ✅ UI/UX, Animation, and Wireframing<br />
          ✅ Monetization: Ads, IAP, and ASO<br />
          ✅ App Store & Play Store Publishing<br />
          ✅ Game Optimization & Performance Tuning<br />
          ✅ Google Ads, SDK Integration, and Analytics<br />
          ✅ Reskin, Rapid Prototyping, and Maintenance
        </p>
      </section>

      <header>
        <h2 className="h2 article-title">Main Skill</h2>
      </header>

      <section className="main-skills">
        <div className="skills-categories">
          <div className="skills-category">
            <h4 className="h4 skills-header">Language</h4>
            <ul className="skills-list">
              <li className="skills-item">C#</li>
              <li className="skills-item">Modern C/C++</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">Engine</h4>
            <ul className="skills-list">
              <li className="skills-item">Unity</li>
              <li className="skills-item">Unreal</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">Principle</h4>
            <ul className="skills-list">
              <li className="skills-item" title="Object Oriented Programming">OOP</li>
              <li className="skills-item">SOLID</li>
              <li className="skills-item" title="Test Driven Development">TDD</li>
            </ul>
          </div>
        </div>

        <div className="skills-box-separator"></div>

        <a
          href="/resume#skills"
          className="skills-button"
          id="skills-button"
          onClick={(e) => onExploreResume(e)}
          aria-label="Explore full resume and skills"
          style={{ textDecoration: 'none' }}
        >
          <Icon name="open" />
          <span>Explore Resume</span>
        </a>
      </section>
    </article>
  );
}
