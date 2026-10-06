import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import AboutTab from './components/AboutTab.jsx';
import ResumeTab from './components/ResumeTab.jsx';
import PortfolioTab from './components/PortfolioTab.jsx';
import ContactTab from './components/ContactTab.jsx';
import Lightbox from './components/Lightbox.jsx';
import Icon from './components/Icon.jsx';
import { getRoute } from './utils/routes.js';

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

export default function App() {
  const [route, setRoute] = useState(() => getRoute(window.location.pathname));

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'; }
    catch { /* Storage is optional in private/restricted browser contexts. */ }
    return 'dark';
  });

  const mainContentRef = useRef(null);

  // ponytail: native history for four tabs and fixed project IDs; no router dependency.
  useEffect(() => {
    if (['/', '/index.html'].includes(window.location.pathname)) {
      window.history.replaceState(null, '', '/about' + window.location.search + window.location.hash);
    }
    const onPopState = () => {
      setLightboxMedia(null);
      setRoute(getRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const skills = route?.tab === 'resume' && window.location.hash === '#skills'
      ? document.getElementById('skills') : null;
    const target = skills || mainContentRef.current;
    target?.focus({ preventScroll: true });
    if (skills) skills.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [route]);

  // Sync theme to document element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // LocalStorage access may be restricted
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navigate = (targetPath, event) => {
    if (event && isModifiedEvent(event)) return;
    const parsed = getRoute(targetPath);
    if (!parsed) return;
    event?.preventDefault();
    if (window.location.pathname + window.location.search + window.location.hash === targetPath) return;
    window.history.pushState(null, '', targetPath);
    setLightboxMedia(null);
    setRoute(parsed);
  };

  const handleSelectTab = (tab, e) => {
    navigate(`/${tab}`, e);
  };

  const handleSelectDetail = (detailId, e) => {
    navigate(`/portfolio/${detailId}`, e);
  };

  const handleBackToPortfolio = (e) => {
    navigate('/portfolio', e);
  };

  const handleExploreResume = (e) => {
    navigate('/resume#skills', e);
  };

  const activeTab = route?.tab;
  const activeDetail = route?.detail;

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Back button - only visible when viewing a project detail */}
      <a
        href="/portfolio"
        className={`button-floating ${activeDetail ? '' : 'hidden'}`}
        id="portfolio-back-button"
        title="Go back to portfolio"
        aria-label="Go back to portfolio"
        onClick={handleBackToPortfolio}
        style={{
          visibility: activeDetail ? 'visible' : 'hidden',
          opacity: activeDetail ? 1 : 0,
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
          textDecoration: 'none',
        }}
      >
        <Icon name="home-outline" />
      </a>

      {/* Theme toggle button positioned at top-right */}
      <button
        type="button"
        className="theme-toggle button-floating"
        id="theme-toggle"
        aria-label="Toggle dark/light mode"
        title="Toggle dark/light mode"
        aria-pressed={theme === 'light'}
        onClick={toggleTheme}
      >
        <Icon name="contrast-outline" />
      </button>

      <main>
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />

        <div
          className="main-content"
          id="main-content"
          ref={mainContentRef}
          tabIndex="-1"
          style={{ outline: 'none' }}
        >
          <Navbar activeTab={activeTab} onSelectTab={handleSelectTab} />

          {!route ? (
            <article className="active" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <h2 className="h2 article-title">Page Not Found</h2>
              <p style={{ margin: '1.5rem 0', color: 'var(--light-gray)' }}>
                The requested page does not exist.
              </p>
              <a
                href="/about"
                className="skills-button"
                style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px', textDecoration: 'none' }}
                onClick={(e) => navigate('/about', e)}
              >
                Back to Home
              </a>
            </article>
          ) : (
            <>
              {activeTab === 'about' && (
                <AboutTab onExploreResume={handleExploreResume} />
              )}

              {activeTab === 'resume' && <ResumeTab />}

              {activeTab === 'portfolio' && (
                <PortfolioTab
                  activeDetail={activeDetail}
                  onSelectDetail={handleSelectDetail}
                  onBackToPortfolio={handleBackToPortfolio}
                  onOpenMedia={setLightboxMedia}
                />
              )}

              {activeTab === 'contact' && <ContactTab />}
            </>
          )}
        </div>
      </main>

      {/* Lightbox modal for expanded image/video view */}
      <Lightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </>
  );
}
