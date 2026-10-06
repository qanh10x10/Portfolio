import { ALL_PROJECT_DETAIL_KEYS } from '../data/projects.js';

const VALID_TABS = new Set(['about', 'resume', 'portfolio', 'contact']);
const VALID_DETAILS = new Set(ALL_PROJECT_DETAIL_KEYS);

// ponytail: pure route mapper with exact key validation; add dynamic routes only if a CMS or API is introduced.
export function getRoute(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return null;
  }

  const clean = pathname.split(/[?#]/)[0];
  if (clean === '/' || clean === '/index.html') {
    return { tab: 'about', detail: null };
  }

  const trimmed = clean.endsWith('/') ? clean.slice(0, -1) : clean;
  if (!trimmed) return null;

  const segments = trimmed.split('/');
  if (segments.length === 2) {
    const tab = segments[1];
    if (tab === 'index.html') return { tab: 'about', detail: null };
    if (VALID_TABS.has(tab)) return { tab, detail: null };
    return null;
  }

  if (segments.length === 3) {
    const [, tab, detail] = segments;
    if (tab === 'portfolio' && VALID_DETAILS.has(detail)) {
      return { tab: 'portfolio', detail };
    }
    return null;
  }

  return null;
}
