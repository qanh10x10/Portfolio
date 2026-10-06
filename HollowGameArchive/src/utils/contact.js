export const RECIPIENT_EMAIL = 'chuquanganh00@gmail.com';

export function buildMailtoDraft(name, email, comments) {
  const safeName = String(name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 100).toWellFormed();
  const safeEmail = String(email || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 100).toWellFormed();
  const safeComments = String(comments || '').trim().slice(0, 2000).toWellFormed();

  const subject = `Portfolio Contact from ${safeName || 'Visitor'}`;
  const body = `Name: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeComments}`;

  return `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
