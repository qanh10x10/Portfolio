import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initDeskScene } from './deskSceneBuilder.js';
import DesktopScreen from './DesktopScreen.jsx';
import ResumeTab from './ResumeTab.jsx';
import ContactTab from './ContactTab.jsx';
import PortfolioChat from './PortfolioChat.jsx';
import LocalMusicPlayer from './LocalMusicPlayer.jsx';
import '../styles/desk-scene.css';

function isModifiedEvent(event) {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  );
}

export default function DeskScene({
  currentFocus = null,
  currentHash = '',
  activeDockTab = 'projects',
  onSelectDockTab,
  activeDetail = null,
  onSelectDetail,
  onBackToPortfolio,
  onNavigate,
  onOpenMedia,
  fallback,
  isDay = true,
  vnClock = { text: 'Ha Noi 12:00', datetime: '' },
  isPaused = false,
  onTogglePause,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const controllerRef = useRef(null);
  const [surfaceBounds, setSurfaceBounds] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [modelStatus, setModelStatus] = useState({ loaded: 0, errors: {} });
  const modelErrors = Object.values(modelStatus.errors);

  const lastTriggerRef = useRef(null);
  const prevFocusRef = useRef(null);
  const firstCameraSyncRef = useRef(true);

  const triggerPaths = {
    monitor: '/portfolio',
    resume: '/resume',
    contact: '/contact',
    chat: '/about#chat',
    music: '/about#music',
  };

  // Map 3D raycast click target to route navigation
  const handleSelectHotspot = useCallback(
    (targetId) => {
      lastTriggerRef.current = triggerPaths[targetId] || '/portfolio';
      if (targetId === 'monitor') {
        onNavigate?.('/portfolio');
      } else if (targetId === 'resume') {
        onNavigate?.('/resume');
      } else if (targetId === 'contact') {
        onNavigate?.('/contact');
      } else if (targetId === 'chat') {
        onNavigate?.('/about#chat');
      } else if (targetId === 'music') {
        onNavigate?.('/about#music');
      }
    },
    [onNavigate]
  );

  const handleSurfaceBounds = useCallback((id, bounds) => {
    setSurfaceBounds((prev) => {
      const current = prev[id];
      if (
        current &&
        current.left === bounds.left &&
        current.top === bounds.top &&
        current.width === bounds.width &&
        current.height === bounds.height
      ) {
        return prev;
      }
      return { ...prev, [id]: bounds };
    });
  }, []);

  const handleTransitionEnd = useCallback((focusId) => {
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      const controller = initDeskScene(canvasRef.current, containerRef.current, {
        onSelectHotspot: handleSelectHotspot,
        onSurfaceBounds: handleSurfaceBounds,
        onTransitionEnd: handleTransitionEnd,
        onModelStatus: setModelStatus,
        reducedMotion: reducedMotion || isPaused,
        isDay,
      });
      controllerRef.current = controller;

      // The camera-sync effect owns initial focus too: never start it twice.
      if (currentFocus) {
        lastTriggerRef.current = triggerPaths[currentFocus] || '/portfolio';
      }
    } catch (err) {
      console.error('Failed to initialize Three.js desk scene:', err);
      setWebglSupported(false);
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, []);

  // Handle opening / closing focus restoration
  useEffect(() => {
    // Opening from room:
    if (currentFocus && !prevFocusRef.current) {
      if (!lastTriggerRef.current) {
        lastTriggerRef.current = triggerPaths[currentFocus] || '/portfolio';
      }
      prevFocusRef.current = currentFocus;
      document.getElementById('back')?.focus({ preventScroll: true });
    }
    // Closing to room:
    if (!currentFocus && prevFocusRef.current) {
      const targetHref = lastTriggerRef.current;
      prevFocusRef.current = null;
      const timer = setTimeout(() => {
        if (targetHref) {
          const el = document.querySelector(`.room-target-link[href="${targetHref}"]`);
          if (el) el.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    prevFocusRef.current = currentFocus;
  }, [currentFocus]);

  // Sync focus target with camera
  useEffect(() => {
    if (!controllerRef.current) return;
    const instant = firstCameraSyncRef.current;
    firstCameraSyncRef.current = false;
    if (currentFocus) {
      setIsTransitioning(true);
      controllerRef.current.focus(currentFocus, instant);
    } else if (!instant) {
      setIsTransitioning(true);
      controllerRef.current.reset();
    }
  }, [currentFocus]);

  // Sync day/night changes
  useEffect(() => {
    if (controllerRef.current?.setDaytime) {
      controllerRef.current.setDaytime(isDay);
    }
  }, [isDay]);

  // Sync pause state
  useEffect(() => {
    if (!controllerRef.current) return;
    if (isPaused) {
      controllerRef.current.pause();
    } else {
      controllerRef.current.resume();
    }
  }, [isPaused]);

  const currentBounds = currentFocus ? surfaceBounds[currentFocus] : null;

  const getSurfaceStyle = (id) => {
    const isTarget = currentFocus === id;
    const b = surfaceBounds[id];
    if (isTarget && b) {
      return {
        position: 'fixed',
        left: `${b.left}px`,
        top: `${b.top}px`,
        width: `${b.width}px`,
        height: `${b.height}px`,
        zIndex: 50,
        opacity: isTransitioning ? (id === 'resume' ? 0 : 0.3) : 1,
        visibility: id === 'resume' && isTransitioning ? 'hidden' : 'visible',
        pointerEvents: isTransitioning ? 'none' : 'auto',
      };
    }
    return { display: 'none' };
  };

  return (
    <div className="desk-scene-container" ref={containerRef} aria-label="3D Developer Room Diorama">
      <h1 className="sr-only">Chu Quang Anh — Unity developer, Ha Noi</h1>

      {/* 1. Ha Noi Vietnam Clock (hidden when focused to avoid HUD collision) */}
      {!currentFocus && (
        <time className="room-clock" dateTime={vnClock.datetime}>
          {vnClock.text}
        </time>
      )}

      {webglSupported && !currentFocus && modelStatus.loaded < 5 && (
        <p className="room-model-status" data-model-status role="status">
          {modelErrors.length
            ? `${modelErrors.join('. ')}. You can still open the portfolio sections; reload to retry.`
            : `Loading room details (${modelStatus.loaded}/5)…`}
        </p>
      )}

      {/* 2. Pause / Play button for 3D room animations */}
      <button
        type="button"
        className="room-pause-btn"
        onClick={onTogglePause}
        aria-label={isPaused ? 'Play scene motion' : 'Pause scene motion'}
        aria-pressed={isPaused}
      >
        <span aria-hidden="true">{isPaused ? '▶' : '⏸'}</span>
      </button>

      {/* 3. Back to room button when an object is focused */}
      {currentFocus && (
        <a
          href="/about"
          id="back"
          className="room-back-btn"
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            onNavigate?.('/about');
          }}
          aria-label="Back to room"
        >
          Back to room ✕
        </a>
      )}

      {/* 4. Semantic accessible targets for keyboard/screen readers */}
      <nav className="room-targets-nav" aria-label="Room workspace navigation">
        <a
          href="/portfolio"
          data-object-id="monitor"
          className="room-target-link"
          tabIndex={currentFocus ? -1 : 0}
          onFocus={() => controllerRef.current?.setHoveredTarget('monitor')}
          onBlur={() => controllerRef.current?.setHoveredTarget(null)}
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            lastTriggerRef.current = '/portfolio';
            onNavigate?.('/portfolio');
          }}
        >
          Projects
        </a>
        <a
          href="/about#about"
          data-object-id="about"
          className="room-target-link"
          tabIndex={currentFocus ? -1 : 0}
          onFocus={() => controllerRef.current?.setHoveredTarget('monitor')}
          onBlur={() => controllerRef.current?.setHoveredTarget(null)}
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            lastTriggerRef.current = '/about#about';
            onNavigate?.('/about#about');
          }}
        >
          About
        </a>
        <a
          href="/resume"
          data-object-id="resume"
          className="room-target-link"
          tabIndex={currentFocus ? -1 : 0}
          onFocus={() => controllerRef.current?.setHoveredTarget('resume')}
          onBlur={() => controllerRef.current?.setHoveredTarget(null)}
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            lastTriggerRef.current = '/resume';
            onNavigate?.('/resume');
          }}
        >
          Resume
        </a>
        <a
          href="/contact"
          data-object-id="contact"
          className="room-target-link"
          tabIndex={currentFocus ? -1 : 0}
          onFocus={() => controllerRef.current?.setHoveredTarget('contact')}
          onBlur={() => controllerRef.current?.setHoveredTarget(null)}
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            lastTriggerRef.current = '/contact';
            onNavigate?.('/contact');
          }}
        >
          Contact
        </a>
        <a
          href="/about#chat"
          data-object-id="chat"
          className="room-target-link"
          tabIndex={currentFocus ? -1 : 0}
          onFocus={() => controllerRef.current?.setHoveredTarget('chat')}
          onBlur={() => controllerRef.current?.setHoveredTarget(null)}
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            lastTriggerRef.current = '/about#chat';
            onNavigate?.('/about#chat');
          }}
        >
          Ask AI
        </a>
        <a
          href="/about#music"
          data-object-id="music"
          className="room-target-link"
          tabIndex={currentFocus ? -1 : 0}
          onFocus={() => controllerRef.current?.setHoveredTarget('music')}
          onBlur={() => controllerRef.current?.setHoveredTarget(null)}
          onClick={(e) => {
            if (isModifiedEvent(e)) return;
            e.preventDefault();
            lastTriggerRef.current = '/about#music';
            onNavigate?.('/about#music');
          }}
        >
          Music
        </a>
      </nav>

      {webglSupported ? (
        <>
          <canvas
            ref={canvasRef}
            className="desk-scene-canvas"
            tabIndex={currentFocus ? -1 : 0}
            aria-label="Interactive 3D workspace. Click computer, resume board, phone, robot, or speaker."
          />

          {/* 5. Projected Physical Surface DOM Overlays */}
          {currentFocus === 'monitor' && (
            <DesktopScreen
              activeDockTab={activeDockTab}
              onSelectDockTab={onSelectDockTab}
              activeDetail={activeDetail}
              onSelectDetail={onSelectDetail}
              onBackToPortfolio={onBackToPortfolio}
              onNavigate={onNavigate}
              onOpenMedia={onOpenMedia}
              vnClockText={vnClock.text}
              style={getSurfaceStyle('monitor')}
            />
          )}

          {currentFocus === 'resume' && (
            <ResumeTab
              currentHash={currentHash}
              style={getSurfaceStyle('resume')}
            />
          )}

          {/* Contact Tab is ALWAYS mounted to preserve draft across camera zooms */}
          <ContactTab
            isFocused={currentFocus === 'contact'}
            vnTime={vnClock.text.replace(/^Ha Noi\s*/i, '')}
            style={getSurfaceStyle('contact')}
          />

          {currentFocus === 'chat' && (
            <PortfolioChat
              style={getSurfaceStyle('chat')}
            />
          )}

          {/* Local Music Player is ALWAYS mounted to preserve playback & selection across camera zooms */}
          <LocalMusicPlayer
            isFocused={currentFocus === 'music'}
            style={getSurfaceStyle('music')}
          />
        </>
      ) : (
        <div className="room-fallback-wrapper">
          {currentFocus === 'monitor' && (
            <DesktopScreen
              activeDockTab={activeDockTab}
              onSelectDockTab={onSelectDockTab}
              activeDetail={activeDetail}
              onSelectDetail={onSelectDetail}
              onBackToPortfolio={onBackToPortfolio}
              onNavigate={onNavigate}
              onOpenMedia={onOpenMedia}
              vnClockText={vnClock.text}
              style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', opacity: 1, pointerEvents: 'auto', display: 'block' }}
            />
          )}
          {currentFocus === 'resume' && (
            <ResumeTab
              currentHash={currentHash}
              style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', opacity: 1, pointerEvents: 'auto', display: 'block' }}
            />
          )}
          <ContactTab
            isFocused={currentFocus === 'contact'}
            vnTime={vnClock.text.replace(/^Ha Noi\s*/i, '')}
            style={currentFocus === 'contact' ? { position: 'relative', width: '100%', maxWidth: '420px', margin: '0 auto', opacity: 1, pointerEvents: 'auto', display: 'block' } : { display: 'none' }}
          />
          {currentFocus === 'chat' && (
            <PortfolioChat
              style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto', opacity: 1, pointerEvents: 'auto', display: 'block' }}
            />
          )}
          <LocalMusicPlayer
            isFocused={currentFocus === 'music'}
            style={currentFocus === 'music' ? { position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto', opacity: 1, pointerEvents: 'auto', display: 'block' } : { display: 'none' }}
          />

          {!currentFocus && (
            <>
              {fallback}
              <nav className="room-fallback-nav" aria-label="Room navigation">
                <ul className="room-fallback-list">
                  <li>
                    <a
                      href="/portfolio"
                      className="room-label fallback"
                      onClick={(e) => {
                        if (isModifiedEvent(e)) return;
                        e.preventDefault();
                        onNavigate?.('/portfolio');
                      }}
                    >
                      Projects
                    </a>
                  </li>
                  <li>
                    <a
                      href="/resume"
                      className="room-label fallback"
                      onClick={(e) => {
                        if (isModifiedEvent(e)) return;
                        e.preventDefault();
                        onNavigate?.('/resume');
                      }}
                    >
                      Resume
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="room-label fallback"
                      onClick={(e) => {
                        if (isModifiedEvent(e)) return;
                        e.preventDefault();
                        onNavigate?.('/contact');
                      }}
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about#about"
                      className="room-label fallback"
                      onClick={(e) => {
                        if (isModifiedEvent(e)) return;
                        e.preventDefault();
                        onNavigate?.('/about#about');
                      }}
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about#chat"
                      className="room-label fallback"
                      onClick={(e) => {
                        if (isModifiedEvent(e)) return;
                        e.preventDefault();
                        onNavigate?.('/about#chat');
                      }}
                    >
                      Ask AI
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about#music"
                      className="room-label fallback"
                      onClick={(e) => {
                        if (isModifiedEvent(e)) return;
                        e.preventDefault();
                        onNavigate?.('/about#music');
                      }}
                    >
                      Music
                    </a>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      )}
    </div>
  );
}
