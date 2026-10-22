import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import DeskScene from './components/DeskScene.jsx';
import AboutTab from './components/AboutTab.jsx';
import ResumeTab from './components/ResumeTab.jsx';
import PortfolioTab from './components/PortfolioTab.jsx';
import ContactTab from './components/ContactTab.jsx';
import PortfolioChat from './components/PortfolioChat.jsx';
import Lightbox from './components/Lightbox.jsx';
import { getRoute } from './utils/routes.js';
import { formatVietnamTime, isVietnamDaytime } from './utils/vnTime.js';
import { PROJECTS } from './data/projects.js';

function isModifiedEvent(event) {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  );
}

export default function App() {
  const [route, setRoute] = useState(() => getRoute(window.location.pathname));
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);
  const [lightboxMedia, setLightboxMedia] = useState(null);

  // Time & Day/Night in Vietnam
  const [vnTime, setVnTime] = useState(() => formatVietnamTime());
  const [isDay, setIsDay] = useState(() => isVietnamDaytime());

  // Animation pause control
  const [isPaused, setIsPaused] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const chatDialogRef = useRef(null);
  const panelRef = useRef(null);
  const panelCloseBtnRef = useRef(null);
  const lastTriggerRef = useRef(null);
  const sceneWrapperRef = useRef(null);

  // Vietnam clock & daylight ticker (refreshed every 15s, >= 30s)
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setVnTime(formatVietnamTime(now));
      setIsDay(isVietnamDaytime(now));
    };
    tick();
    const timer = setInterval(tick, 15000);
    return () => clearInterval(timer);
  }, []);

  // Landing route redirect: / or /index.html -> /about
  useEffect(() => {
    if (['/', '/index.html'].includes(window.location.pathname)) {
      window.history.replaceState(null, '', '/about' + window.location.search + window.location.hash);
    }
    const onPopState = () => {
      setLightboxMedia(null);
      setRoute(getRoute(window.location.pathname));
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openChat = () => {
    chatDialogRef.current?.showModal();
    chatDialogRef.current?.querySelector('input')?.focus();
  };

  const navigate = (targetPath, event) => {
    if (event && isModifiedEvent(event)) return;
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    const parsed = getRoute(cleanPath);
    if (!parsed) return;
    event?.preventDefault();

    const targetHash = cleanPath.includes('#') ? cleanPath.slice(cleanPath.indexOf('#')) : '';

    if (window.location.pathname + window.location.search + window.location.hash === cleanPath) return;

    // Record trigger element ONLY when opening a panel from the landing room
    if (isLanding) {
      let trigger = null;
      if (event?.currentTarget && event.currentTarget.classList?.contains('room-label')) {
        trigger = event.currentTarget;
      } else if (document.activeElement && document.activeElement.classList?.contains('room-label')) {
        trigger = document.activeElement;
      } else {
        const tabToHotspot = {
          portfolio: 'portfolio',
          resume: 'resume',
          contact: 'contact',
          about: 'about',
        };
        const id = tabToHotspot[parsed.tab];
        if (id) {
          trigger = document.querySelector(`.room-label[data-hotspot-id="${id}"]`);
        }
      }
      if (trigger) {
        lastTriggerRef.current = trigger;
      }
    }

    window.history.pushState(null, '', cleanPath);
    setLightboxMedia(null);
    setRoute(parsed);
    setCurrentHash(targetHash);
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

  const handleClosePanel = (e) => {
    navigate('/about', e);
  };

  const activeTab = route?.tab;
  const activeDetail = route?.detail;

  // Panel is open for any subroute, or for /about with a section hash (#about, #work, #resume, #contact)
  const isLanding = activeTab === 'about' && (!currentHash || currentHash === '' || currentHash === '#top');
  const isPanelOpen = !isLanding;

  // Escape key handler to close panel
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxMedia) {
          setLightboxMedia(null);
          return;
        }
        if (chatDialogRef.current?.open) {
          chatDialogRef.current.close();
          return;
        }
        if (isPanelOpen) {
          navigate('/about');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPanelOpen, lightboxMedia]);

  // Focus management: move focus into panel on open, return to trigger on close
  useEffect(() => {
    if (isPanelOpen) {
      panelCloseBtnRef.current?.focus();
    } else if (lastTriggerRef.current) {
      // Focus synchronously and on next frame after inert removal
      lastTriggerRef.current.focus?.();
      requestAnimationFrame(() => {
        lastTriggerRef.current?.focus?.();
      });
    }
  }, [isPanelOpen]);

  // Scroll to hash section inside panel
  useEffect(() => {
    if (isPanelOpen && currentHash && currentHash !== '#top') {
      const section = document.querySelector(currentHash);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [route, currentHash, isPanelOpen]);

  // Compute panel title
  let panelTitle = 'About';
  if (!route) {
    panelTitle = 'Page Not Found';
  } else if (activeTab === 'resume') {
    panelTitle = 'Resume & Skills';
  } else if (activeTab === 'contact') {
    panelTitle = 'Contact';
  } else if (activeTab === 'portfolio') {
    if (activeDetail) {
      const p = PROJECTS.find((proj) => proj.id === activeDetail);
      panelTitle = p ? p.title : 'Project Details';
    } else {
      panelTitle = 'Portfolio';
    }
  } else if (activeTab === 'about') {
    if (currentHash === '#work') panelTitle = 'Work';
    else if (currentHash === '#resume') panelTitle = 'Resume';
    else if (currentHash === '#contact') panelTitle = 'Contact';
    else panelTitle = 'About';
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* 3D Room Diorama Viewport (Always rendered, full 100dvh) */}
      <div
        className="room-viewport"
        ref={sceneWrapperRef}
        inert={isPanelOpen ? true : undefined}
        aria-hidden={isPanelOpen ? 'true' : undefined}
      >
        <DeskScene
          onNavigatePortfolio={(e) => navigate('/portfolio', e)}
          onNavigateResume={(e) => navigate('/resume', e)}
          onNavigateContact={(e) => navigate('/contact', e)}
          onNavigateAbout={(e) => navigate('/about#about', e)}
          onNavigateChat={openChat}
          isDay={isDay}
          vnClock={vnTime}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((prev) => !prev)}
          fallback={
            <img
              className="hero-art hero-art-fallback"
              src="/assets/images/site/mu3.jpg"
              alt="Chu Quang Anh 3D diorama workspace preview"
              width="1500"
              height="946"
            />
          }
        />
      </div>

      {/* Subroute Overlay Panel (Merges content on top of the 3D room) */}
      {isPanelOpen && (
        <div
          className="room-overlay-panel"
          role="dialog"
          aria-modal="true"
          aria-label={panelTitle}
          ref={panelRef}
        >
          <div className="panel-sheet">
            <header className="panel-header">
              <div className="panel-header-left">
                <h2 className="panel-title">{panelTitle}</h2>
              </div>

              <div className="panel-header-nav">
                <Navbar activeTab={activeTab || 'about'} onSelectTab={handleSelectTab} />
              </div>

              <a
                href="/about"
                className="panel-close-btn"
                onClick={handleClosePanel}
                aria-label="Back to room"
                ref={panelCloseBtnRef}
              >
                Back to room ✕
              </a>
            </header>

            <main id="main-content" className="panel-body" tabIndex="-1">
              {!route ? (
                <article style={{ padding: '64px 24px', textAlign: 'center' }}>
                  <h1 className="h2 article-title">Page Not Found</h1>
                  <p style={{ margin: '24px 0', color: 'var(--soft)' }}>
                    The requested page does not exist.
                  </p>
                  <a
                    href="/about"
                    className="btn"
                    onClick={handleClosePanel}
                  >
                    Back to room
                  </a>
                </article>
              ) : activeTab === 'about' ? (
                <AboutTab
                  onNavigate={navigate}
                  onSelectDetail={handleSelectDetail}
                  onExploreResume={handleExploreResume}
                />
              ) : activeTab === 'resume' ? (
                <div className="subpage resume-page">
                  <ResumeTab />
                </div>
              ) : activeTab === 'portfolio' ? (
                <div className="subpage">
                  <PortfolioTab
                    activeDetail={activeDetail}
                    onSelectDetail={handleSelectDetail}
                    onBackToPortfolio={handleBackToPortfolio}
                    onOpenMedia={setLightboxMedia}
                  />
                </div>
              ) : activeTab === 'contact' ? (
                <div className="subpage">
                  <ContactTab />
                </div>
              ) : null}
            </main>
          </div>
        </div>
      )}

      {/* Quang Anh’s AI Chat Dialog */}
      <dialog ref={chatDialogRef} className="portfolio-chat-dialog" aria-label="Quang Anh’s AI assistant">
        <button
          type="button"
          className="chat-close"
          aria-label="Close AI chat"
          onClick={() => chatDialogRef.current?.close()}
        >
          Close ×
        </button>
        <PortfolioChat />
      </dialog>

      {/* Media Lightbox */}
      <Lightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </>
  );
}
