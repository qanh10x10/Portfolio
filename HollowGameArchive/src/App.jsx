import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import AboutTab from './components/AboutTab.jsx';
import ResumeTab from './components/ResumeTab.jsx';
import PortfolioTab from './components/PortfolioTab.jsx';
import ContactTab from './components/ContactTab.jsx';
import Lightbox from './components/Lightbox.jsx';
import Icon from './components/Icon.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'; }
    catch { /* Storage is optional in private/restricted browser contexts. */ }
    return 'dark';
  });

  const mainContentRef = useRef(null);

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

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setActiveDetail(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const handleSelectDetail = (detailId) => {
    setActiveDetail(detailId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const handleBackToPortfolio = () => {
    setActiveDetail(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  };

  const handleExploreResume = () => {
    setActiveTab('resume');
    setActiveDetail(null);
    setTimeout(() => {
      const skillsElem = document.getElementById('skills');
      if (skillsElem) {
        skillsElem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Back button - only visible when viewing a project detail */}
      <button
        type="button"
        className={`button-floating ${activeDetail ? '' : 'hidden'}`}
        id="portfolio-back-button"
        title="Go back to portfolio"
        aria-label="Go back to portfolio"
        onClick={handleBackToPortfolio}
        style={{
          visibility: activeDetail ? 'visible' : 'hidden',
          opacity: activeDetail ? 1 : 0,
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        }}
      >
        <Icon name="home-outline" />
      </button>

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
