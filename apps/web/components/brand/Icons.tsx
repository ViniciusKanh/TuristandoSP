import type { SVGProps } from 'react';

/** Ícones de traço, geométricos — sem emoji (seção 66). currentColor. */
type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const MapIcon = (p: P) => (
  <svg {...base(p)}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>
);
export const Compass = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 4-4 2 2-4 4-2Z" /></svg>
);
export const Home = (p: P) => (
  <svg {...base(p)}><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg>
);
export const Book = (p: P) => (
  <svg {...base(p)}><path d="M5 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H5Z" /><path d="M17 4h2v14" /></svg>
);
export const Search = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const Sun = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></svg>
);
export const Moon = (p: P) => (
  <svg {...base(p)}><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z" /></svg>
);
export const Metro = (p: P) => (
  <svg {...base(p)}><rect x="6" y="3" width="12" height="14" rx="3" /><path d="M6 10h12M9 20l-2 2M15 20l2 2" /><circle cx="9" cy="13.5" r=".6" fill="currentColor" /><circle cx="15" cy="13.5" r=".6" fill="currentColor" /></svg>
);
export const Train = (p: P) => (
  <svg {...base(p)}><rect x="5" y="3" width="14" height="13" rx="2" /><path d="M5 11h14M8 20l-2 2M16 20l2 2" /></svg>
);
export const Bus = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="16" height="13" rx="2" /><path d="M4 11h16M7 20v-3M17 20v-3" /></svg>
);
export const Car = (p: P) => (
  <svg {...base(p)}><path d="M4 13l2-5h12l2 5" /><path d="M3 13h18v4H3zM7 17v1M17 17v1" /></svg>
);
export const Bike = (p: P) => (
  <svg {...base(p)}><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17 10 8h4l2 9M9 8h5" /></svg>
);
export const Walk = (p: P) => (
  <svg {...base(p)}><circle cx="13" cy="4" r="1.6" /><path d="M11 21l1.5-6L10 12l1-5 3 2 2 1M12.5 15 9 21" /></svg>
);
export const Star = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}><path d="m12 3 2.6 5.7 6.4.6-4.8 4.2 1.4 6.2L12 17l-5.6 2.9 1.4-6.2L3 9.3l6.4-.6L12 3Z" /></svg>
);
export const Instagram = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r=".8" fill="currentColor" /></svg>
);
export const Youtube = (p: P) => (
  <svg {...base(p)}><rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" /></svg>
);
export const Github = (p: P) => (
  <svg {...base(p)}><path d="M9 19c-4 1.3-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2 2.8-.3 4.5-1.4 4.5-4.8a3.7 3.7 0 0 0-1-2.6 3.4 3.4 0 0 0-.1-2.6s-.9-.3-2.9 1a10 10 0 0 0-5 0C6.5 3.6 5.6 3.9 5.6 3.9a3.4 3.4 0 0 0-.1 2.6 3.7 3.7 0 0 0-1 2.6c0 3.4 1.7 4.5 4.5 4.8-.4.4-.5.9-.5 1.5V21" /></svg>
);
export const Mark = (p: P) => (
  <svg {...base(p)} viewBox="0 0 24 24"><path d="M3 20 14 4l1 7 6-1-11 14 1-6-8 2Z" /></svg>
);

export const TRANSPORT_ICON = { metro: Metro, trem: Train, onibus: Bus, carro: Car, bike: Bike, 'a-pe': Walk, outro: Compass } as const;
