import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import AboutTab from './components/AboutTab.jsx';
import ResumeTab from './components/ResumeTab.jsx';
import PortfolioTab from './components/PortfolioTab.jsx';
import ContactTab from './components/ContactTab.jsx';
import Lightbox from './components/Lightbox.jsx';
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
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const mainContentRef = useRef(null);

  // Skip direct root path to about for routing consistency
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
    const section = document.getElementById(window.location.hash.slice(1));
    const target = section || mainContentRef.current;
    target?.focus({ preventScroll: true });
    if (section) section.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [route]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // ponytail: once-only native entrances; use a motion library only for interactive gestures.
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('entered');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    document.querySelectorAll('.hero h1, .hero p, .hero .btn, section > h2, .letter p, .what li, .jobs li').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [route]);

  const navigate = (targetPath, event) => {
    if (event && isModifiedEvent(event)) return;
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    const parsed = getRoute(cleanPath);
    if (!parsed) return;
    event?.preventDefault();
    if (window.location.pathname + window.location.search + window.location.hash === cleanPath) return;
    window.history.pushState(null, '', cleanPath);
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
      <a href="#main-content" className="skip-link">Skip to main content</a>


      {!route ? (
        <div className="subpage">
          <Navbar activeTab="about" onSelectTab={handleSelectTab} />
          <main id="main-content" ref={mainContentRef} tabIndex="-1">
            <article style={{ padding: '64px 0', textAlign: 'center' }}>
              <h1 className="h2 article-title">Page Not Found</h1>
              <p style={{ margin: '24px 0', color: 'var(--soft)' }}>
                The requested page does not exist.
              </p>
              <a
                href="/about"
                className="btn"
                onClick={(e) => navigate('/about', e)}
              >
                Back to Home
              </a>
            </article>
          </main>
        </div>
      ) : activeTab === 'about' ? (
        <>
          <main id="main-content" ref={mainContentRef} tabIndex="-1">
            <AboutTab
              onNavigate={navigate}
              onSelectDetail={handleSelectDetail}
              onExploreResume={handleExploreResume}
            />
          </main>
        </>
      ) : (
        <>
          <div className={`subpage${activeTab === 'resume' ? ' resume-page' : ''}`}>
            <Navbar activeTab={activeTab} onSelectTab={handleSelectTab} />
            <main id="main-content" ref={mainContentRef} tabIndex="-1">
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
            </main>
          </div>
        </>
      )}

      <Lightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </>
  );
}
