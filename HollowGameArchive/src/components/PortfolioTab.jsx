import React, { useState } from 'react';
import Icon from './Icon.jsx';
import ProjectDetails from './ProjectDetails.jsx';
import { CATEGORIES, PROJECTS } from '../data/projects.js';

export { CATEGORIES, PROJECTS };

export default function PortfolioTab({
  activeDetail,
  onSelectDetail,
  onBackToPortfolio,
  onOpenMedia,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectOpen, setSelectOpen] = useState(false);

  const filteredProjects =
    activeCategory === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  const currentCategoryLabel =
    CATEGORIES.find((c) => c.id === activeCategory)?.label || 'All';

  return (
    <article className="portfolio active" data-page="portfolio">
      {/* If a project detail is active, render it */}
      {activeDetail ? (
        <div className="project-detail-container app-window">
          <header className="window-title">
            <span>Project Details</span>
            <span className="window-dots" aria-hidden="true">•••</span>
          </header>
          <div className="project-detail-header">
            <a
              href="/portfolio"
              className="back-to-portfolio-link"
              onClick={(e) => onBackToPortfolio(e)}
            >
              <Icon name="arrow-back-outline" />
              <span>Back to portfolio</span>
            </a>
          </div>
          <ProjectDetails detailId={activeDetail} onOpenMedia={onOpenMedia} />
        </div>
      ) : (
        <>
          <section className="projects">
            {/* Category filter buttons (desktop) */}
            <ul className="filter-list" aria-label="Project categories">
              {CATEGORIES.map((cat) => (
                <li className="filter-item" key={cat.id}>
                  <button
                    type="button"
                    className={activeCategory === cat.id ? 'active' : ''}
                    data-filter-btn
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={activeCategory === cat.id}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Category select dropdown (mobile) */}
            <div className="filter-select-box">
              <button
                type="button"
                className={`filter-select ${selectOpen ? 'active' : ''}`}
                data-select
                onClick={() => setSelectOpen((prev) => !prev)}
                aria-expanded={selectOpen}
                aria-label="Filter projects by category"
              >
                <div className="select-value" data-select-value>
                  {currentCategoryLabel}
                </div>
                <div className="select-icon">
                  <Icon name="chevron-down" />
                </div>
              </button>

              {selectOpen && (
                <ul className="select-list">
                  {CATEGORIES.map((cat) => (
                    <li className="select-item" key={cat.id}>
                      <button
                        type="button"
                        data-select-item
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setSelectOpen(false);
                        }}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Project Thumbnail Grid or Empty State */}
            {filteredProjects.length === 0 ? (
              <p className="empty-message">No projects found in this category.</p>
            ) : (
              <ul className="project-list">
                {filteredProjects.map((project) => (
                  <li
                    key={project.id}
                    className="project-item app-window mini-project active"
                    data-filter-item
                    data-category={project.category}
                    data-detail-category={project.id}
                  >
                    <header className="window-title">
                      <span>{project.title}</span>
                      <span className="window-dots" aria-hidden="true">•••</span>
                    </header>
                    <a
                      href={`/portfolio/${project.id}`}
                      onClick={(e) => onSelectDetail(project.id, e)}
                      aria-label={`View details for ${project.title}`}
                      className="project-card-btn"
                    >
                      <figure className="project-img">
                        <img
                          src={project.image}
                          alt={project.title}
                          loading="lazy"
                        />
                      </figure>

                      <div className="project-card-info project-caption">
                        <h2 className="project-title">{project.title}</h2>
                        <p className="project-category">{project.tag || project.category}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </article>
  );
}
