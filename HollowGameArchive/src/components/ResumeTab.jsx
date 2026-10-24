import React, { useState, useEffect } from 'react';
import { JOBS, SKILL_GROUPS } from '../data/jobs.js';

export default function ResumeTab({ initialTab = 'experience', currentHash = '', style = {} }) {
  const [tab, setTab] = useState(() =>
    currentHash === '#skills' || initialTab === 'skills' || (typeof window !== 'undefined' && window.location.hash === '#skills')
      ? 'skills'
      : 'experience'
  );

  useEffect(() => {
    if (currentHash === '#skills' || window.location.hash === '#skills') {
      setTab('skills');
    } else if (currentHash === '#experience' || window.location.hash === '#experience') {
      setTab('experience');
    }
  }, [currentHash]);

  return (
    <section
      id="badge-board"
      data-focus-surface="resume"
      className="object-surface"
      style={style}
      aria-label="Resume board"
    >
      <header className="resume-board-header">
        <h2 className="resume-board-title">Resume <span>Chu Quang Anh</span></h2>
        <nav className="board-subtabs" aria-label="Resume sections">
          <button type="button" onClick={() => setTab('experience')} aria-pressed={tab === 'experience'}>
            Experience
          </button>
          <button type="button" onClick={() => setTab('skills')} aria-pressed={tab === 'skills'}>
            Skills ({SKILL_GROUPS.reduce((acc, g) => acc + g.skills.length, 0)})
          </button>
        </nav>
      </header>

      <div className="resume-notices" key={tab}>
        <article className="resume-paper resume-profile">
          <img src="/assets/images/site/avatar.jpg" alt="Chu Quang Anh portfolio avatar" width="64" height="64" />
          <h3>Chu Quang Anh</h3>
          <p>Unity Developer</p>
          <p>Ha Noi, Vietnam</p>
          <small>{tab === 'experience' ? 'Select a pinned role to read the work details.' : 'Tools, languages and engineering experience.'}</small>
        </article>
        {tab === 'experience' ? JOBS.map((job, index) => (
          <details className="resume-paper resume-job" key={job.company} open={index === 0}>
            <summary>
              <h3>{job.company}</h3>
              <p>{job.role}</p>
              <p className="resume-dates">{job.dates}</p>
              <span className="resume-details-hint">Work details</span>
            </summary>
            <ul>
              {job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </details>
        )) : SKILL_GROUPS.map((group) => (
          <article className="resume-paper resume-skills" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
