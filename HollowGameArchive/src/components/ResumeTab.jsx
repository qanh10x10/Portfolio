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
  const [selectedJob, setSelectedJob] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const job = JOBS[selectedJob];

  const handlePrevJob = () => {
    setSelectedJob((prev) => (prev - 1 + JOBS.length) % JOBS.length);
    setFlipped(false);
  };

  const handleNextJob = () => {
    setSelectedJob((prev) => (prev + 1) % JOBS.length);
    setFlipped(false);
  };

  return (
    <section
      id="badge-board"
      data-focus-surface="resume"
      className="object-surface"
      style={style}
      aria-label="Resume board"
    >
      <header className="pegboard-title">
        <div>
          Resume <span>Chu Quang Anh</span>
        </div>
        <nav className="board-subtabs" aria-label="Resume sections">
          <button
            type="button"
            className={tab === 'experience' ? 'active' : ''}
            onClick={() => setTab('experience')}
            aria-pressed={tab === 'experience'}
          >
            Experience
          </button>
          <button
            type="button"
            className={tab === 'skills' ? 'active' : ''}
            onClick={() => setTab('skills')}
            aria-pressed={tab === 'skills'}
          >
            Skills ({SKILL_GROUPS.reduce((acc, g) => acc + g.skills.length, 0)})
          </button>
        </nav>
      </header>

      {tab === 'experience' ? (
        <div className="board-experience-view">
          <div className="lanyard-gallery">
            {[-1, 0, 1].map((offset) => {
              const j = JOBS[(selectedJob + offset + JOBS.length) % JOBS.length];
              if (offset !== 0) {
                return (
                  <div key={offset} className="neighbor-badge" aria-hidden="true">
                    <div className="lanyard"></div>
                    <div className="badge-company">{j.company}</div>
                    <img
                      className="badge-monogram"
                      src="/assets/images/site/avatar.jpg"
                      alt="Chu Quang Anh portfolio avatar"
                    />
                    <p>{j.role}</p>
                  </div>
                );
              }

              return (
                <div key="active" className="active-badge">
                  <div className="lanyard"></div>
                  <button
                    type="button"
                    className={`employee-card ${flipped ? 'card-back' : ''}`}
                    onClick={() => setFlipped((prev) => !prev)}
                    aria-label={flipped ? 'Show job summary' : 'Show job details'}
                  >
                    <div className="badge-company">{job.company}</div>
                    {flipped ? (
                      <ul className="bullet-list">
                        {job.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    ) : (
                      <>
                        <img
                          className="badge-monogram"
                          src="/assets/images/site/avatar.jpg"
                          alt="Chu Quang Anh portfolio avatar"
                        />
                        <h2>Chu Quang Anh</h2>
                        <p>{job.role}</p>
                        <p className="badge-dates">{job.dates}</p>
                        <div className="barcode" aria-hidden="true"></div>
                        <span className="flip-hint">View details ↻</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <nav className="badge-controls" aria-label="Experience">
            <button
              type="button"
              data-step="-1"
              aria-label="Previous job"
              onClick={handlePrevJob}
            >
              ←
            </button>
            <span>{String(selectedJob + 1).padStart(2, '0')} / 04</span>
            <button
              type="button"
              data-step="1"
              aria-label="Next job"
              onClick={handleNextJob}
            >
              →
            </button>
          </nav>
        </div>
      ) : (
        <div className="board-skills-view" id="skills" tabIndex="-1">
          <div className="skills-scroll-container">
            {SKILL_GROUPS.map((group) => (
              <div key={group.title} className={`skills-group ${group.className}`}>
                <h3 className="skills-header">{group.title}</h3>
                <ul className="skills-list">
                  {group.skills.map((s) => (
                    <li key={s} className="skills-item">{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
