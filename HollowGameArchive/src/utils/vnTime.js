/**
 * Vietnam timezone utility functions (Asia/Ho_Chi_Minh).
 */

// Pure function returning true if Vietnam local hour is in [6, 18)
export function isVietnamDaytime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hourCycle: 'h23',
    hour: 'numeric',
  }).formatToParts(d);
  const hourPart = parts.find((p) => p.type === 'hour');
  const hour = parseInt(hourPart ? hourPart.value : '0', 10);
  return hour >= 6 && hour < 18;
}

export function formatVietnamTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value || '';
  const y = get('year');
  const m = get('month');
  const dStr = get('day');
  const hh = get('hour');
  const mm = get('minute');
  return {
    text: `Ha Noi ${hh}:${mm}`,
    datetime: `${y}-${m}-${dStr}T${hh}:${mm}:00+07:00`,
    hour: parseInt(hh, 10),
    minute: parseInt(mm, 10),
  };
}
