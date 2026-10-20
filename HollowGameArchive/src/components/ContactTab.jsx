import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { RECIPIENT_EMAIL } from '../utils/contact.js';

export { RECIPIENT_EMAIL };

export default function ContactTab() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comments: '',
    website: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const isValid =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.email.includes('@') &&
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
    <article className="contact active" data-page="contact">
      <header>
        <h1 className="h2 article-title">Contact</h1>
      </header>

      <section className="mapbox" data-mapbox>
        <figure>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.7341848539253!2d105.82454867504386!3d21.00307418857871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSMOgIE7hu5lpLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1712677439273!5m2!1svi!2s"
            width="400"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Location - Hanoi, Vietnam"
          />
        </figure>
      </section>

      <section className="contact-form">
        <h2 className="h3 form-title">Contact Form</h2>

        <p className="contact-notice">
          Send a direct message to chuquanganh00@gmail.com.
        </p>

        <form onSubmit={handleSubmit} className="form contactForm" noValidate={false}>
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

          <div className="input-wrapper">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label
                htmlFor="contact-name"
                style={{ fontSize: '13px', color: 'var(--soft)', marginBottom: '6px', fontWeight: 600 }}
              >
                Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Full name"
                required
                maxLength={100}
                disabled={isSending}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label
                htmlFor="contact-email"
                style={{ fontSize: '13px', color: 'var(--soft)', marginBottom: '6px', fontWeight: 600 }}
              >
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="Email address"
                required
                maxLength={100}
                disabled={isSending}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1.25rem' }}>
            <label
              htmlFor="contact-comments"
              style={{ fontSize: '13px', color: 'var(--soft)', marginBottom: '6px', fontWeight: 600 }}
            >
              Your Message
            </label>
            <textarea
              id="contact-comments"
              name="comments"
              rows={4}
              className="form-input"
              placeholder="Your Message..."
              required
              maxLength={2000}
              disabled={isSending}
              value={formData.comments}
              onChange={handleChange}
            />
          </div>

          <button
            className="form-btn submitBnt"
            type="submit"
            disabled={!isValid || isSending}
            aria-disabled={!isValid || isSending}
            style={{ marginTop: '1.5rem' }}
          >
            <Icon name="paper-plane" />
            <span>{isSending ? 'Sending...' : 'Send Message'}</span>
          </button>

          {status.message && (
            <p
              role="status"
              aria-live="polite"
              style={{
                marginTop: '1rem',
                color: status.type === 'error' ? '#ff6b6b' : 'var(--accent)',
                fontSize: '14px',
              }}
            >
              {status.message}
            </p>
          )}
        </form>
      </section>
    </article>
  );
}
