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
// Fallback dismiss after 3.5s
setTimeout(() => {
  if (window.dismissLoadingScreen) window.dismissLoadingScreen();
}, 3500);

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
