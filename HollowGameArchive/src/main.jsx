// Loading screen controller (CSP self compliant)
window.dismissLoadingScreen = () => {
  const s = document.getElementById('loading-screen');
  if (s && !s.classList.contains('fade-out')) {
    const bar = document.querySelector('.loader-bar');
    if (bar) { bar.classList.remove('indeterminate'); bar.style.width = '100%'; }
    document.querySelector('.loader-bar-wrap')?.setAttribute('aria-valuenow', '100');
    s.classList.add('fade-out');
    setTimeout(() => {
      if (s && s.parentNode) s.parentNode.removeChild(s);
    }, 500);
  }
};
window.updateLoadingScreen = ({ loaded = 0, total, errors = {} } = {}) => {
  const hint = document.querySelector('.loader-hint');
  const alert = document.getElementById('loader-error');
  const retry = document.getElementById('loader-retry');
  const bar = document.querySelector('.loader-bar');
  const barWrap = document.querySelector('.loader-bar-wrap');
  const messages = errors ? Object.values(errors).filter(Boolean) : [];
  if (hint) hint.textContent = total ? `Loading 3D Workspace (${loaded}/${total})…` : 'Loading 3D Workspace…';
  if (bar) {
    if (typeof total === 'number' && total > 0) {
      const pct = Math.max(0, Math.min(99, Math.round((loaded / total) * 100)));
      bar.classList.remove('indeterminate');
      bar.style.width = `${pct}%`;
      if (barWrap) barWrap.setAttribute('aria-valuenow', String(pct));
    } else {
      bar.classList.add('indeterminate');
      bar.style.width = '';
      if (barWrap) barWrap.removeAttribute('aria-valuenow');
    }
  }
  if (alert) {
    alert.textContent = messages.join('. ');
    alert.hidden = messages.length === 0;
    if (messages.length > 0) {
      alert.setAttribute('role', 'alert');
    } else {
      alert.removeAttribute('role');
    }
  }
  if (retry) retry.hidden = messages.length === 0;
};
document.getElementById('loader-retry')?.addEventListener('click', () => window.location.reload());
// Only scene readiness (or the rendered no-WebGL fallback) may dismiss the loader.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/style.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
