import React, { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

export default function Lightbox({ media, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!media) return;
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, [media]);

  if (!media) return null;
  return (
    <dialog
      ref={dialog}
      className="lightbox-overlay"
      aria-label="Expanded media preview"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, margin: 0, border: 0,
        width: '100vw', height: '100dvh', maxWidth: 'none', maxHeight: 'none',
        background: 'rgba(0,0,0,0.85)', padding: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button
        type="button" onClick={onClose} aria-label="Close preview"
        style={{ position: 'absolute', top: 20, right: 20, color: '#fff',
          background: '#222', borderRadius: '50%', width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <Icon name="close-outline" />
      </button>
      <div style={{ maxWidth: '92vw', maxHeight: '90vh' }}>
        {media.type === 'video' ? (
          <video src={media.src} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12 }} />
        ) : (
          <img src={media.src} alt={media.alt || 'Enlarged project media'} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
        )}
      </div>
    </dialog>
  );
}
