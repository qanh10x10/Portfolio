import React from 'react';

// Inline SVG icons mapping to replace Ionicons CDN dependency cleanly.
// ponytail: local SVG map covers all 18 portfolio icons; add extra SVGs only if a new icon is referenced.
const ICONS = {
  'arrow-back-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M244 400L100 256l144-144M120 256h292" />
    </svg>
  ),
  'home-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
      <path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256m368-77V96h-64v43" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
    </svg>
  ),
  'contrast-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <circle cx="256" cy="256" r="208" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" />
      <path d="M256 464c-114.88 0-208-93.12-208-208S141.12 48 256 48z" />
    </svg>
  ),
  'chevron-down': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M112 184l144 144 144-144" />
    </svg>
  ),
  'mail-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <rect x="48" y="96" width="416" height="320" rx="40" ry="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M112 160l144 112 144-112" />
    </svg>
  ),
  'phone-portrait-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <rect x="128" y="48" width="256" height="416" rx="48" ry="48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
      <path d="M176 96h160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
    </svg>
  ),
  'calendar-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <rect fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" x="48" y="80" width="416" height="384" rx="48" />
      <circle cx="296" cy="232" r="24" />
      <circle cx="376" cy="232" r="24" />
      <circle cx="296" cy="312" r="24" />
      <circle cx="376" cy="312" r="24" />
      <circle cx="136" cy="312" r="24" />
      <circle cx="216" cy="312" r="24" />
      <circle cx="136" cy="392" r="24" />
      <circle cx="216" cy="392" r="24" />
      <circle cx="296" cy="392" r="24" />
      <path fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" strokeLinecap="round" d="M128 48v32m256-32v32" />
      <path fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" strokeLinecap="round" d="M464 160H48" />
    </svg>
  ),
  'location-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M256 48c-79.5 0-144 61.39-144 137 0 87 144 279 144 279s144-192 144-279c0-75.61-64.5-137-144-137z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
      <circle cx="256" cy="184" r="48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
    </svg>
  ),
  'logo-github': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M256 32C132.3 32 32 134.9 32 261.3c0 101.1 64.2 186.8 153.2 217.1 11.2 2.1 15.3-5 15.3-11.1 0-5.5-.2-23.9-.3-43.2-62.3 13.9-75.5-27.1-75.5-27.1-10.2-26.5-24.9-33.6-24.9-33.6-20.3-14.3 1.5-14 1.5-14 22.5 1.6 34.3 23.7 34.3 23.7 20 35.1 52.4 25 65.2 19.1 2-14.9 7.8-25 14.2-30.8-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8 0 0 18.8-6.2 61.6 23.5 17.9-5.1 37-7.6 56.1-7.7 19 .1 38.2 2.6 56.1 7.7 42.8-29.7 61.5-23.5 61.5-23.5 12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 6.1 4 13.3 15.4 11C415.9 448 480 362.4 480 261.3 480 134.9 379.7 32 256 32z" />
    </svg>
  ),
  'logo-facebook': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M480 257.35c0-123.7-100.3-224-224-224s-224 100.3-224 224c0 111.8 81.9 204.47 189 221.29V322.12h-56.89v-64.77H221V208c0-56.13 33.45-87.16 84.61-87.16 24.51 0 50.15 4.38 50.15 4.38v55.13H327.5c-27.81 0-36.51 17.26-36.51 35v42h62.12l-9.92 64.77H291v156.54c107.1-16.81 189-109.48 189-221.31z" fillRule="evenodd" />
    </svg>
  ),
  'logo-linkedin': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M444.17 32H70.28C49.11 32 32 49.08 32 70.18V441.8C32 462.9 49.11 480 70.28 480h373.89c21.17 0 38.31-17.1 38.31-38.2V70.18C482.48 49.08 465.34 32 444.17 32zM170.87 405.43H106.6V205.88h64.27zM138.74 177.8a37.3 37.3 0 1137.3-37.3 37.34 37.34 0 01-37.3 37.3zm266.69 227.63h-64.21V304.82c0-24-8.58-40.38-30.06-40.38-16.4 0-26.17 11.05-30.46 21.72-1.57 3.82-2 9.14-2 14.48v104.79H214.5s.86-180.83 0-199.55h64.21v28.28c8.53-13.14 23.77-31.9 57.85-31.9 42.23 0 73.88 27.6 73.88 86.92v116.25z" />
    </svg>
  ),
  'open': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
      <path d="M336 64h112v112M224 288L440 72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
    </svg>
  ),
  'close-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M368 368L144 144m224 0L144 368" />
    </svg>
  ),
  'book-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M256 160c16-63.16 76.43-95.41 208-96a15.94 15.94 0 0116 16v288a16 16 0 01-16 16c-128 0-176 16-208 64-32-48-80-64-208-64a16 16 0 01-16-16V80a16 16 0 0116-16c131.57.59 192 32.84 208 96zM256 160v288" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
    </svg>
  ),
  'school-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M32 192L256 64l224 128-224 128L32 192z" />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M112 240v128l144 80 144-80V240m80 72v128" />
    </svg>
  ),
  'eye-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.33C97.41 354.89 177.36 400 255.66 400c78.65 0 158.6-45.11 221.72-135.33a16 16 0 00.27-17.33C414.59 157.11 334.64 112 255.66 112z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
      <circle cx="256" cy="256" r="80" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32" />
    </svg>
  ),
  'game-controller-outline': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M467.51 248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5 91.5 0 00352 96c-26.89 0-48.11 16-71.43 32-15 10.29-30 20.6-49.14 20.6s-34.13-10.31-49.14-20.6C158.97 112 137.75 96 110.86 96a91.5 91.5 0 00-26.08 3.66c-43.74 12.93-71 66-89.43 149.17a8 8 0 001.35 6.64l64.21 95.77A64 64 0 00114 384h284a64 64 0 0053.09-32.76l64.21-95.77a8 8 0 001.21-6.64z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32" />
      <circle cx="292" cy="224" r="20" />
      <circle cx="332" cy="184" r="20" />
      <circle cx="332" cy="264" r="20" />
      <circle cx="372" cy="224" r="20" />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M128 224h64m-32-32v64" />
    </svg>
  ),
  'paper-plane': (
    <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
      <path d="M473 39.05a24 24 0 00-25.5-5.46L47.47 185h-.08a24 24 0 00-1 45.16l165.73 66.3 66.3 165.73A24 24 0 00301 478a23.92 23.92 0 0023.44-19.14L478.4 64.55A24 24 0 00473 39.05zM380.6 142.12L227.4 295.32l-97.43-39 281.3-138.89z" />
    </svg>
  )
};

export default function Icon({ name, className, style, ...rest }) {
  const icon = ICONS[name] || ICONS['home-outline'];
  return (
    <span className={`inline-icon ${className || ''}`} style={{ display: 'inline-flex', verticalAlign: 'middle', lineHeight: 1, ...style }} {...rest}>
      {icon}
    </span>
  );
}
