import React from 'react';


const TABS = [
  { id: 'portfolio', label: 'Work', hash: '#work' },
  { id: 'about', label: 'About', hash: '#about' },
  { id: 'resume', label: 'Resume', hash: '#resume' },
  { id: 'contact', label: 'Contact', hash: '#contact' },
];

export default function Navbar({ activeTab, onSelectTab }) {
  const isLanding = activeTab === 'about';

  return (
    <nav aria-label="Main navigation">
      <a
        href="/about"
        onClick={(e) => onSelectTab('about', e)}
        aria-label="Home"
        className="nav-avatar-link"
      >
        <img
          src="/assets/images/site/avatar.jpg"
          alt="Chu Quang Anh"
          width="44"
          height="44"
          className="nav-avatar"
        />
      </a>

      {TABS.map((tab) => {
        const targetHref = isLanding ? tab.hash : `/${tab.id}`;
        return (
          <a
            key={tab.id}
            href={targetHref}
            className={`navbar-link ${activeTab === tab.id ? 'active' : ''}`}
            data-nav-link
            onClick={(e) => {
              if (isLanding && tab.hash.startsWith('#')) {
                // Let native smooth anchor scroll take effect
                return;
              }
              onSelectTab(tab.id, e);
            }}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}
