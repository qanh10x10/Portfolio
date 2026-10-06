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
      <header>
        <h2 className="h2 article-title">Portfolio</h2>
      </header>

      {/* If a project detail is active, render it */}
      {activeDetail ? (
        <div className="project-detail-container">
          <ProjectDetails detailId={activeDetail} onOpenMedia={onOpenMedia} />
        </div>
      ) : (
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

          {/* Project Thumbnail Grid */}
          <ul
            className="project-list"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              padding: 0,
              margin: 0,
            }}
          >
            {filteredProjects.map((project) => (
              <li
                key={project.id}
                className="project-item active"
                data-filter-item
                data-category={project.category}
                data-detail-category={project.id}
                style={{ listStyle: 'none' }}
              >
                <button
                  type="button"
                  onClick={() => onSelectDetail(project.id)}
                  aria-label={`View details for ${project.title}`}
                  className="project-card-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    display: 'block',
                    color: 'inherit',
                  }}
                >
                  <figure
                    className="project-img"
                    style={{
                      width: '100%',
                      maxWidth: '360px',
                      aspectRatio: '1 / 1',
                      height: 'auto',
                      overflow: 'hidden',
                      borderRadius: '16px',
                      position: 'relative',
                    }}
                  >
                    <div className="project-item-icon-box">
                      <Icon name="eye-outline" />
                    </div>
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </figure>

                  <h3
                    className="project-title"
                    style={{ marginTop: '12px' }}
                  >
                    {project.title}
                  </h3>

                  <div className={project.category === 'unreal' ? 'unreal-icon' : 'unity-icon'}>
                    <p className="project-category tag">{project.tag}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
