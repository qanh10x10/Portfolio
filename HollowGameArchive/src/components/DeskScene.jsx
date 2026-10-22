import React, { useEffect, useRef, useState } from 'react';
import { initDeskScene } from './deskSceneBuilder.js';
import '../styles/desk-scene.css';

export default function DeskScene({
  onNavigateWork,
  onNavigateResume,
  onNavigateContact,
  onNavigateChat,
  fallback,
  children,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const controllerRef = useRef(null);
  const callbacks = useRef({});
  callbacks.current = { work: onNavigateWork, resume: onNavigateResume, contact: onNavigateContact, chat: onNavigateChat };

  const [isPaused, setIsPaused] = useState(false);
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

    if (reducedMotion) {
      setIsPaused(true);
    }

    const handleSelectHotspot = (id) => {
      callbacks.current[id]?.();
    };

    try {
      const controller = initDeskScene(canvasRef.current, containerRef.current, {
        onSelectHotspot: handleSelectHotspot,
        reducedMotion,
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

  const togglePause = () => {
    if (!controllerRef.current) return;
    if (isPaused) {
      controllerRef.current.resume();
      setIsPaused(false);
    } else {
      controllerRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResetCamera = () => {
    if (controllerRef.current) {
      controllerRef.current.resetCamera();
    }
  };

  return (
    <div className="desk-scene-container" ref={containerRef} aria-label="3D Developer Room Diorama">
      {webglSupported ? (
        <canvas ref={canvasRef} className="desk-scene-canvas" tabIndex="0" aria-label="Interactive 3D workspace. Drag to inspect." />
      ) : (
        fallback
      )}

      {/* Accessible native 44px scene controls */}
      <nav className="desk-scene-controls" aria-label="3D Scene Controls">
        <button type="button" className="desk-scene-btn" onClick={onNavigateChat}>Ask AI</button>
        <button
          type="button"
          className="desk-scene-btn"
          onClick={togglePause}
          aria-label={isPaused ? 'Resume 3D animation' : 'Pause 3D animation'}
        >
          {isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
        <button
          type="button"
          className="desk-scene-btn"
          onClick={handleResetCamera}
          aria-label="Reset camera view"
        >
          ↺ Reset
        </button>
        <button
          type="button"
          className="desk-scene-btn"
          onClick={onNavigateWork}
          aria-label="Jump to Work section"
        >
          Work
        </button>
        <button
          type="button"
          className="desk-scene-btn"
          onClick={onNavigateResume}
          aria-label="Jump to Skills and Resume"
        >
          Skills
        </button>
        <button
          type="button"
          className="desk-scene-btn"
          onClick={onNavigateContact}
          aria-label="Jump to Contact section"
        >
          Contact
        </button>
      </nav>

      {/* Hero overlay content */}
      {children}
    </div>
  );
}
