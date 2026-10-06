import React from 'react';
import Icon from './Icon.jsx';

export default function ResumeTab() {
  return (
    <article className="resume active" data-page="resume">
      <header>
        <h2 className="h2 article-title gradient-title">Resume</h2>
      </header>

      <section className="timeline">
        <div className="title-wrapper">
          <div className="icon-box">
            <Icon name="book-outline" className="icon-colored" />
          </div>
          <h3 className="h3 gradient-subtitle transition">Experience</h3>
        </div>

        <ol className="timeline-list">
          <li className="timeline-item animated fadeInUp shadow-box">
            <h3 className="h3 timeline-item-title">ADNX</h3>
            <h4 className="h4 timeline-item-position">Unity Developer</h4>
            <span>August 2024 — present</span>
            <ul className="timeline-text">
              <li>Developed and maintained casual games such as Sandwich, DOP, DIY, and Puzzle games.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
              <li>Trained team members.</li>
            </ul>
          </li>

          <li className="timeline-item animated fadeInUp shadow-box">
            <h3 className="h3 timeline-item-title">Rise Up</h3>
            <h4 className="h4 timeline-item-position">Unity Developer</h4>
            <span>Dec 2023 — May 2024</span>
            <ul className="timeline-text">
              <li>Developed and maintained a turn-based GameFi project.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Managed and assigned tasks, supporting team members.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
              <li>Trained team members.</li>
            </ul>
          </li>

          <li className="timeline-item animated fadeInUp shadow-box">
            <h3 className="h3 timeline-item-title">Gamota - Gabros Team</h3>
            <h4 className="h4 timeline-item-position">Unity Developer</h4>
            <span>May 2023 — Oct 2023</span>
            <ul className="timeline-text">
              <li>Developed and maintained an RTS strategy game combined with GameFi.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Managed and assigned tasks, supporting team members.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
              <li>Trained team members.</li>
            </ul>
          </li>

          <li className="timeline-item animated fadeInUp shadow-box">
            <h3 className="h3 timeline-item-title">WeeGoon</h3>
            <h4 className="h4 timeline-item-position">Unity Developer</h4>
            <span>Feb 2021 — April 2023</span>
            <ul className="timeline-text">
              <li>Developed, maintained, and fixed bugs.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section className="skill" id="skills">
        <header>
          <h2 className="h2 article-title">My Skills</h2>
        </header>
        <div className="skills-categories">
          <div className="skills-category">
            <h4 className="h4 skills-header">Language</h4>
            <ul className="skills-list">
              <li className="skills-item">Modern C/C++</li>
              <li className="skills-item">C#</li>
              <li className="skills-item">HTML5</li>
              <li className="skills-item">TypeScript</li>
              <li className="skills-item">JavaScript</li>
              <li className="skills-item">PHP</li>
              <li className="skills-item">Lua</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">Engine & Frameworks</h4>
            <ul className="skills-list">
              <li className="skills-item">Unity</li>
              <li className="skills-item">Unreal</li>
              <li className="skills-item">Cocos Creator</li>
              <li className="skills-item">PixiJS</li>
              <li className="skills-item">Phaser</li>
              <li className="skills-item">React</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">Tools</h4>
            <ul className="skills-list">
              <li className="skills-item">Git</li>
              <li className="skills-item">Github Project</li>
              <li className="skills-item">AI Agent</li>
              <li className="skills-item">Notion</li>
              <li className="skills-item">Blender</li>
              <li className="skills-item">Jira</li>
              <li className="skills-item">Photoshop</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">Principle</h4>
            <ul className="skills-list">
              <li className="skills-item" title="Object Oriented Programming">OOP</li>
              <li className="skills-item">Design Patterns</li>
              <li className="skills-item">SOLID</li>
              <li className="skills-item" title="Test Driven Development">TDD</li>
              <li className="skills-item" title="Don't Repeat Yourself">DRY</li>
              <li className="skills-item" title="Keep It Simple, Stupid">KISS</li>
              <li className="skills-item" title="You Aren't Gonna Need It">YAGNI</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">Soft Skills</h4>
            <ul className="skills-list">
              <li className="skills-item">Agile</li>
              <li className="skills-item">Communication</li>
              <li className="skills-item">Teamwork</li>
              <li className="skills-item">Self-planning</li>
              <li className="skills-item">RnD</li>
              <li className="skills-item">Critical Thinking</li>
              <li className="skills-item">Problem Solving</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">IDE</h4>
            <ul className="skills-list">
              <li className="skills-item">Rider</li>
              <li className="skills-item">Visual Studio Code</li>
              <li className="skills-item">Visual Studio</li>
            </ul>
          </div>

          <div className="skills-category">
            <h4 className="h4 skills-header">DevOps</h4>
            <ul className="skills-list">
              <li className="skills-item">Github Action</li>
              <li className="skills-item">Docker</li>
            </ul>
          </div>
        </div>
      </section>
    </article>
  );
}
