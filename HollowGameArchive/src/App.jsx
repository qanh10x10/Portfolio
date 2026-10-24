import React, { useState, useEffect, useRef } from 'react';
import DeskScene from './components/DeskScene.jsx';
import Lightbox from './components/Lightbox.jsx';
import { getRoute } from './utils/routes.js';
import { formatVietnamTime, isVietnamDaytime } from './utils/vnTime.js';

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


  const sceneWrapperRef = useRef(null);

  // Vietnam clock & daylight ticker (refreshed every 15s)
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
    const onLocationChange = () => {
      setLightboxMedia(null);
      setRoute(getRoute(window.location.pathname));
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);

  const navigate = (targetPath, event) => {
    if (event && isModifiedEvent(event)) return;
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    const parsed = getRoute(cleanPath);
    if (!parsed) return;
    event?.preventDefault();

    const targetHash = cleanPath.includes('#') ? cleanPath.slice(cleanPath.indexOf('#')) : '';

    if (window.location.pathname + window.location.search + window.location.hash === cleanPath) return;

    window.history.pushState(null, '', cleanPath);
    setLightboxMedia(null);
    setRoute(parsed);
    setCurrentHash(targetHash);
  };

  const handleSelectDockTab = (tab) => {
    if (tab === 'projects') {
      navigate('/portfolio');
    } else {
      navigate('/about#about');
    }
  };

  const handleSelectDetail = (detailId, e) => {
    navigate(`/portfolio/${detailId}`, e);
  };

  const handleBackToPortfolio = (e) => {
    navigate('/portfolio', e);
  };

  // Derive active focus target and dock tab from route and hash
  let currentFocus = null;
  let activeDockTab = 'projects';

  if (route) {
    if (route.tab === 'about') {
      if (currentHash === '#about') {
        currentFocus = 'monitor';
        activeDockTab = 'about';
      } else if (currentHash === '#work') {
        currentFocus = 'monitor';
        activeDockTab = 'projects';
      } else if (currentHash === '#resume') {
        currentFocus = 'resume';
      } else if (currentHash === '#contact') {
        currentFocus = 'contact';
      } else if (currentHash === '#chat') {
        currentFocus = 'chat';
      } else if (currentHash === '#music') {
        currentFocus = 'music';
      } else {
        currentFocus = null; // Landing room view
      }
    } else if (route.tab === 'portfolio') {
      currentFocus = 'monitor';
      activeDockTab = 'projects';
    } else if (route.tab === 'resume') {
      currentFocus = 'resume';
    } else if (route.tab === 'contact') {
      currentFocus = 'contact';
    }
  }

  useEffect(() => {
    document.body.classList.toggle('object-focused', Boolean(currentFocus));
  }, [currentFocus]);

  // Escape key handler to return to room view
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxMedia) {
          setLightboxMedia(null);
          return;
        }
        if (currentFocus) {
          navigate('/about');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentFocus, lightboxMedia]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* 3D Room Diorama & Projected Physical Surfaces */}
      <main id="main-content" className="room-viewport" ref={sceneWrapperRef}>
        <DeskScene
          currentFocus={currentFocus}
          currentHash={currentHash}
          activeDockTab={activeDockTab}
          onSelectDockTab={handleSelectDockTab}
          activeDetail={route?.detail}
          onSelectDetail={handleSelectDetail}
          onBackToPortfolio={handleBackToPortfolio}
          onNavigate={navigate}
          onOpenMedia={setLightboxMedia}
          isDay={isDay}
          vnClock={vnTime}

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
      </main>

      {/* 404 Overlay for completely invalid routes */}
      {!route && (
        <div
          className="room-overlay-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Page Not Found"
        >
          <div className="panel-sheet" style={{ maxWidth: '480px', height: 'auto', margin: 'auto', padding: '32px' }}>
            <h1 className="h2 article-title">Page Not Found</h1>
            <p style={{ margin: '16px 0', color: 'var(--soft)' }}>
              The requested page does not exist.
            </p>
            <a
              href="/about"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                navigate('/about');
              }}
            >
              Back to room
            </a>
          </div>
        </div>
      )}

      {/* Media Lightbox */}
      <Lightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </>
  );
}
