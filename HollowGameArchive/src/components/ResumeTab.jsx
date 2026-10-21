import React from 'react';

export default function ResumeTab() {
  return (
    <article className="resume active" data-page="resume">
      <header>
        <div>
          <h1 className="h2 article-title">Resume</h1>
          <p className="resume-intro">Unity Developer</p>
        </div>
        <div className="resume-links">
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
        </div>
      </header>

      <section className="skill" id="skills" tabIndex="-1" style={{ outline: 'none' }}>
        <header>
          <h2 className="h2 article-title">My Skills</h2>
        </header>
        <div className="skills-categories">
          <div className="skills-primary">
            <div className="skills-category engines">
              <h3 className="skills-header">Engines &amp; frameworks</h3>
              <ul className="skills-list">
                <li className="skills-item">Unity</li>
                <li className="skills-item">Cocos / Cocos Creator</li>
                <li className="skills-item">React.js</li>
                <li className="skills-item">PixiJS</li>
                <li className="skills-item">Phaser</li>
                <li className="skills-item">Unreal</li>
              </ul>
            </div>
            <div className="skills-category languages">
              <h3 className="skills-header">Languages</h3>
              <ul className="skills-list">
                <li className="skills-item">C#</li>
                <li className="skills-item">C++</li>
                <li className="skills-item">C</li>
                <li className="skills-item">Lua</li>
                <li className="skills-item">TypeScript</li>
                <li className="skills-item">JavaScript</li>
                <li className="skills-item">PHP</li>
                <li className="skills-item">HTML5</li>
              </ul>
            </div>
          </div>
          <div className="skills-secondary">
            <div className="skills-category">
              <h3 className="skills-header">Engineering practices</h3>
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
              <h3 className="skills-header">Ways of working</h3>
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
          </div>
          <div className="skills-workflow">
            <div className="skills-category">
              <h3 className="skills-header">Tools</h3>
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
              <h3 className="skills-header">Editors</h3>
              <ul className="skills-list">
                <li className="skills-item">Rider</li>
                <li className="skills-item">Visual Studio Code</li>
                <li className="skills-item">Visual Studio</li>
              </ul>
            </div>
            <div className="skills-category">
              <h3 className="skills-header">DevOps</h3>
              <ul className="skills-list">
                <li className="skills-item">Github Action</li>
                <li className="skills-item">Docker</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="timeline" id="experience" tabIndex="-1" style={{ outline: 'none' }}>
        <h2 className="h3">Experience</h2>
        <ol className="timeline-list">
          <li className="timeline-item">
            <div className="timeline-meta">
              <h3 className="timeline-item-title">ADNX</h3>
              <div className="timeline-item-position">Unity Developer</div>
              <span>August 2024 — present</span>
            </div>
            <ul className="timeline-description-list">
              <li>Developed and maintained casual games such as Sandwich, DOP, DIY, and Puzzle games.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
              <li>Trained team members.</li>
            </ul>
          </li>
          <li className="timeline-item">
            <div className="timeline-meta">
              <h3 className="timeline-item-title">Rise Up</h3>
              <div className="timeline-item-position">Unity Developer</div>
              <span>Dec 2023 — May 2024</span>
            </div>
            <ul className="timeline-description-list">
              <li>Developed and maintained a turn-based GameFi project.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Managed and assigned tasks, supporting team members.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
              <li>Trained team members.</li>
            </ul>
          </li>
          <li className="timeline-item">
            <div className="timeline-meta">
              <h3 className="timeline-item-title">Gamota - Gabros Team</h3>
              <div className="timeline-item-position">Unity Developer</div>
              <span>May 2023 — Oct 2023</span>
            </div>
            <ul className="timeline-description-list">
              <li>Developed and maintained an RTS strategy game combined with GameFi.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Managed and assigned tasks, supporting team members.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
              <li>Trained team members.</li>
            </ul>
          </li>
          <li className="timeline-item">
            <div className="timeline-meta">
              <h3 className="timeline-item-title">WeeGoon</h3>
              <div className="timeline-item-position">Unity Developer</div>
              <span>Feb 2021 — April 2023</span>
            </div>
            <ul className="timeline-description-list">
              <li>Developed, maintained, and fixed bugs.</li>
              <li>Deployed, monitored, and supported customers.</li>
              <li>Designed systems and databases.</li>
              <li>Researched new technologies.</li>
            </ul>
          </li>
        </ol>
      </section>
    </article>
  );
}
