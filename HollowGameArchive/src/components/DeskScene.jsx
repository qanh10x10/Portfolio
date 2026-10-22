import React, { useEffect, useRef, useState } from 'react';
import { initDeskScene } from './deskSceneBuilder.js';
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
  onNavigatePortfolio,
  onNavigateResume,
  onNavigateContact,
  onNavigateAbout,
  onNavigateChat,
  fallback,
  isDay = true,
  vnClock = { text: 'Ha Noi 12:00', datetime: '' },
  isPaused = false,
  onTogglePause,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const controllerRef = useRef(null);
  const callbacks = useRef({});
  callbacks.current = {
    portfolio: onNavigatePortfolio,
    resume: onNavigateResume,
    contact: onNavigateContact,
    about: onNavigateAbout,
    chat: onNavigateChat,
  };

  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Detect WebGL capability
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

    const handleSelectHotspot = (id) => {
      callbacks.current[id]?.();
    };

    try {
      const controller = initDeskScene(canvasRef.current, containerRef.current, {
        onSelectHotspot: handleSelectHotspot,
        reducedMotion: reducedMotion || isPaused,
        isDay,
      });
      controllerRef.current = controller;
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

  // Sync day/night changes to the 3D scene
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

  return (
    <div className="desk-scene-container" ref={containerRef} aria-label="3D Developer Room Diorama">
      {/* Visually hidden h1 for screen readers & SEO */}
      <h1 className="sr-only">Chu Quang Anh — Unity developer, Ha Noi</h1>

      {/* 1. Clock showing Ha Noi 24h time in Asia/Ho_Chi_Minh */}
      <time className="room-clock" dateTime={vnClock.datetime}>
        {vnClock.text}
      </time>

      {/* 2. Pause / Play button for scene motion */}
      <button
        type="button"
        className="room-pause-btn"
        onClick={onTogglePause}
        aria-label={isPaused ? 'Play scene motion' : 'Pause scene motion'}
        aria-pressed={isPaused}
      >
        <span aria-hidden="true">{isPaused ? '▶' : '⏸'}</span>
      </button>

      {webglSupported ? (
        <>
          <canvas
            ref={canvasRef}
            className="desk-scene-canvas"
            tabIndex="0"
            aria-label="Interactive 3D workspace. Drag to orbit."
          />

          {/* 3. In-scene object labels anchored to 3D objects */}
          <div className="room-labels-layer" aria-label="Room navigation labels">
            <a
              href="/portfolio"
              data-hotspot-id="portfolio"
              className="room-label"
              onClick={(e) => {
                if (isModifiedEvent(e)) return;
                e.preventDefault();
                onNavigatePortfolio?.(e);
              }}
            >
              Projects
            </a>

            <a
              href="/resume"
              data-hotspot-id="resume"
              className="room-label"
              onClick={(e) => {
                if (isModifiedEvent(e)) return;
                e.preventDefault();
                onNavigateResume?.(e);
              }}
            >
              Resume
            </a>

            <a
              href="/contact"
              data-hotspot-id="contact"
              className="room-label"
              onClick={(e) => {
                if (isModifiedEvent(e)) return;
                e.preventDefault();
                onNavigateContact?.(e);
              }}
            >
              Contact
            </a>

            <a
              href="/about#about"
              data-hotspot-id="about"
              className="room-label"
              onClick={(e) => {
                if (isModifiedEvent(e)) return;
                e.preventDefault();
                onNavigateAbout?.(e);
              }}
            >
              About
            </a>

            <button
              type="button"
              data-hotspot-id="chat"
              className="room-label"
              onClick={() => onNavigateChat?.()}
            >
              Ask AI
            </button>
          </div>
        </>
      ) : (
        <div className="room-fallback-wrapper">
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
                    onNavigatePortfolio?.(e);
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
                    onNavigateResume?.(e);
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
                    onNavigateContact?.(e);
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
                    onNavigateAbout?.(e);
                  }}
                >
                  About
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="room-label fallback"
                  onClick={() => onNavigateChat?.()}
                >
                  Ask AI
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
