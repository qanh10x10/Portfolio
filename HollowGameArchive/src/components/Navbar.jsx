import React from 'react';

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Resume' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar({ activeTab, onSelectTab }) {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <ul className="navbar-list">
        {TABS.map((tab) => (
          <li className="navbar-item" key={tab.id}>
            <a
              href={`/${tab.id}`}
              className={`navbar-link ${activeTab === tab.id ? 'active' : ''}`}
              data-nav-link
              onClick={(e) => onSelectTab(tab.id, e)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
