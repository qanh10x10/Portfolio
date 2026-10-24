// Loading screen controller (CSP self compliant)
window.dismissLoadingScreen = () => {
  const s = document.getElementById('loading-screen');
  if (s && !s.classList.contains('fade-out')) {
    s.classList.add('fade-out');
    setTimeout(() => {
      if (s && s.parentNode) s.parentNode.removeChild(s);
    }, 500);
  }
};
window.updateLoadingScreen = ({ loaded = 0, errors = {} } = {}) => {
  const hint = document.querySelector('.loader-hint');
  const alert = document.getElementById('loader-error');
  const retry = document.getElementById('loader-retry');
  const messages = errors ? Object.values(errors).filter(Boolean) : [];
  if (hint) hint.textContent = `Loading 3D Workspace (${loaded}/5)…`;
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
