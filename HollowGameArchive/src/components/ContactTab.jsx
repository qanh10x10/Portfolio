import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { RECIPIENT_EMAIL } from '../utils/contact.js';

export { RECIPIENT_EMAIL };

export default function ContactTab({ style = {}, vnTime = '12:00' }) {
  const [phoneTab, setPhoneTab] = useState('home');
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comments: '',
    website: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isValid =
    formData.name.trim().length > 0 &&
    isValidEmail &&
    formData.comments.trim().length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSending) return;

    setIsSending(true);
    setStatus({ type: 'sending', message: 'Sending message...' });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    const unconfirmedMessage = 'Sending was not confirmed. Please check with me before resending.';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          comments: formData.comments,
          website: formData.website,
        }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result && result.ok) {
        setStatus({
          type: 'success',
          message: 'Message sent successfully! Thank you for reaching out.',
        });
        setFormData({ name: '', email: '', comments: '', website: '' });
      } else {
        const errorMsg =
          (!response.ok && result && result.error) || unconfirmedMessage;
        setStatus({ type: 'error', message: errorMsg });
      }
    } catch {
      setStatus({ type: 'error', message: unconfirmedMessage });
    } finally {
      clearTimeout(timer);
      setIsSending(false);
    }
  };

  return (
    <section
      id="phone-contact"
      data-focus-surface="contact"
      className="object-surface"
      style={style}
      aria-label="Contact phone"
    >
      <div className="phone-status">
        <span>Ha Noi</span>
        <span aria-hidden="true">•••</span>
      </div>

      <div className="phone-app">
        {phoneTab === 'home' ? (
          <div className="phone-home">
            <div className="phone-time">{vnTime}</div>
            <p className="phone-location">Ha Noi, Vietnam</p>
            <h1>Chu Quang Anh</h1>
            <p className="phone-role">Unity developer</p>

            <a className="phone-email" href="mailto:chuquanganh00@gmail.com">
              <span>Email</span>
              <strong>chuquanganh00@gmail.com</strong>
            </a>

            <div className="phone-link-row">
              <a href="https://github.com/qanh10x10" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/ch%E1%BB%AD-quang-anh-633bb3223/" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>

            <div className="phone-link-row">
              <a href="https://www.facebook.com/quanganh.chu.9619/" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="https://play.google.com/store/apps/dev?id=4917555335442358774" target="_blank" rel="noopener noreferrer">
                Google Play
              </a>
            </div>

            <a className="phone-telegram" href="https://t.me/hollow2908" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>

            <button
              className="phone-message"
              type="button"
              onClick={() => setPhoneTab('message')}
            >
              Send a direct message
            </button>

            <button
              className="phone-map-toggle"
              type="button"
              onClick={() => setShowMap((prev) => !prev)}
            >
              {showMap ? 'Hide Hanoi Map' : 'View Location Map'}
            </button>

            {showMap && (
              <div className="phone-mapbox">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.7341848539253!2d105.82454867504386!3d21.00307418857871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSMOgIE7hu5lpLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1712677439273!5m2!1svi!2s"
                  width="100%"
                  height="160"
                  style={{ border: 0, borderRadius: '6px' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Location - Hanoi, Vietnam"
                />
              </div>
            )}
          </div>
        ) : (
          <form className="phone-form" onSubmit={handleSubmit} noValidate={false}>
            <h1>Contact Form</h1>
            <p>Send a direct message to chuquanganh00@gmail.com.</p>

            {/* Honeypot field for bot protection */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <label htmlFor="contact-name">
              Full Name
              <input
                id="contact-name"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                disabled={isSending}
                value={formData.name}
                onChange={handleChange}
              />
            </label>

            <label htmlFor="contact-email">
              Email Address
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={100}
                autoComplete="email"
                disabled={isSending}
                value={formData.email}
                onChange={handleChange}
              />
            </label>

            <label htmlFor="contact-comments">
              Your Message
              <textarea
                id="contact-comments"
                name="comments"
                required
                maxLength={2000}
                rows={3}
                disabled={isSending}
                value={formData.comments}
                onChange={handleChange}
              />
            </label>

            <button
              type="submit"
              disabled={isSending}
              aria-disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </button>

            {status.message && (
              <p
                role="status"
                aria-live="polite"
                className="preview-form-note"
                style={{
                  color: status.type === 'error' ? '#ff8585' : '#a0d4c9',
                }}
              >
                {status.message}
              </p>
            )}
          </form>
        )}
      </div>

      <nav className="phone-tabs" aria-label="Phone apps">
        <button
          type="button"
          data-phone-tab="home"
          aria-selected={phoneTab === 'home'}
          onClick={() => setPhoneTab('home')}
        >
          Contact
        </button>
        <button
          type="button"
          data-phone-tab="message"
          aria-selected={phoneTab === 'message'}
          onClick={() => setPhoneTab('message')}
        >
          Message
        </button>
      </nav>

      <div className="phone-home-bar" aria-hidden="true"></div>
    </section>
  );
}
