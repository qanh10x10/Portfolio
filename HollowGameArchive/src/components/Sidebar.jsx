import React from 'react';
import Icon from './Icon.jsx';

export default function Sidebar({ isOpen, onToggle }) {
  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`} data-sidebar>
      <div className="sidebar-info">
        <figure className="avatar-box">
          <img src="assets/logo.png" alt="Chử Quang Anh" width="80" />
        </figure>

        <div className="info-content">
          <h1 className="realname" title="Chử Quang Anh">CHU QUANG ANH</h1>
          <h1 className="name" title="HOLLOW">---Hollow---</h1>
          <p className="title">Game Developer</p>
        </div>

        <button
          className="info_more-btn"
          data-sidebar-btn
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Hide contact details' : 'Show contact details'}
        >
          <span>{isOpen ? 'Hide Contacts' : 'Show Contacts'}</span>
          <Icon name="chevron-down" />
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box">
              <Icon name="mail-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href="mailto:chuquanganh00@gmail.com" className="contact-link">
                chuquanganh00@gmail.com
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <Icon name="phone-portrait-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href="tel:+84964622718" className="contact-link">
                0964622718
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <Icon name="calendar-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Birthday</p>
              <time dateTime="2000-08-29">August 29, 2000</time>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <Icon name="location-outline" />
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>Ha Noi VN</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <ul className="social-list">
          <li className="social-item">
            <a
              href="https://play.google.com/store/apps/dev?id=4917555335442358774"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Play developer page"
            >
              <img src="assets/images/GooglePlay-Icon.svg" alt="Google Play" height="20" width="20" />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://t.me/hollow2908"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Telegram_2019_Logo.svg" alt="Telegram" height="20" width="20" />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://github.com/qanh10x10"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
            >
              <Icon name="logo-github" />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://www.facebook.com/quanganh.chu.9619/"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook profile"
            >
              <Icon name="logo-facebook" />
            </a>
          </li>

          <li className="social-item">
            <a
              href="https://www.linkedin.com/in/ch%E1%BB%AD-quang-anh-633bb3223/"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
            >
              <Icon name="logo-linkedin" />
            </a>
          </li>
        </ul>

        <div className="separator"></div>
      </div>
    </aside>
  );
}
