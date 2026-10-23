import React from 'react';
import PortfolioTab from './PortfolioTab.jsx';
import AboutTab from './AboutTab.jsx';

export default function DesktopScreen({
  activeDockTab = 'projects',
  onSelectDockTab,
  activeDetail = null,
  onSelectDetail,
  onBackToPortfolio,
  onNavigate,
  onOpenMedia,
  vnClockText = 'Ha Noi',
  style = {},
}) {
  return (
    <section
      id="desktop-screen"
      data-focus-surface="monitor"
      className="object-surface"
      style={style}
      aria-label="Computer workspace"
    >
      <header className="screen-status">
        <b>Quang Anh · workspace</b>
        <span>{vnClockText}</span>
      </header>

      <main className="desktop-content">
        {activeDockTab === 'projects' ? (
          <PortfolioTab
            activeDetail={activeDetail}
            onSelectDetail={onSelectDetail}
            onBackToPortfolio={onBackToPortfolio}
            onOpenMedia={onOpenMedia}
          />
        ) : (
          <AboutTab
            onNavigate={onNavigate}
            onSelectDetail={onSelectDetail}
            onExploreResume={(e) => onNavigate('/resume#skills', e)}
          />
        )}
      </main>

      <nav className="screen-dock" aria-label="Computer workspace">
        <button
          type="button"
          data-tab="projects"
          aria-selected={activeDockTab === 'projects'}
          onClick={() => onSelectDockTab?.('projects')}
        >
          Projects
        </button>
        <button
          type="button"
          data-tab="about"
          aria-selected={activeDockTab === 'about'}
          onClick={() => onSelectDockTab?.('about')}
        >
          About
        </button>
      </nav>
    </section>
  );
}
