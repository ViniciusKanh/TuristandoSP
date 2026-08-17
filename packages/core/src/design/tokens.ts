/**
 * Design tokens — fonte única da identidade visual.
 * Inspiração: papel, concreto paulistano, sinalização urbana, placas de rua,
 * grids e coordenadas. Espelhado em CSS custom properties no globals.css.
 *
 * Contraste: pares de texto/fundo validados para WCAG AA (seção 7/43).
 */

export const palette = {
  // Base — papel e concreto
  paper: '#F2EDE3', // off-white / papel (fundo claro)
  surface: '#FBF8F1', // superfície elevada clara
  surfaceSunk: '#E7E1D3', // faixa afundada
  ink: '#191512', // preto urbano (texto principal)
  graphite: '#5C554A', // concreto (texto secundário)
  mutedInk: '#8A8172', // legendas / mono discreto

  border: '#D9D2C2',
  borderStrong: '#C3BAA6',

  // Identidade
  accent: '#F4B400', // amarelo de sinalização (accent)
  accentInk: '#191512', // texto sobre o amarelo
  terracotta: '#C24A2C', // vermelho/terracota (cor de identidade, pontual)
  urbanGreen: '#3E6B4B', // verde urbano (pontual)

  // Escuro (faixas escuras + dark mode)
  night: '#17130E', // preto urbano profundo
  nightSurface: '#221D16',
  nightBorder: '#37302676',
  onNight: '#F1ECE1', // texto sobre escuro
  onNightMuted: '#A69C89',

  // Semânticos
  success: '#3E6B4B',
  warning: '#C98A00',
  error: '#C24A2C',
} as const;

export const themes = {
  light: {
    '--bg': palette.paper,
    '--surface': palette.surface,
    '--surface-sunk': palette.surfaceSunk,
    '--text': palette.ink,
    '--text-muted': palette.graphite,
    '--text-faint': palette.mutedInk,
    '--border': palette.border,
    '--border-strong': palette.borderStrong,
    '--primary': palette.ink,
    '--on-primary': palette.paper,
    '--accent': palette.accent,
    '--on-accent': palette.accentInk,
    '--terracotta': palette.terracotta,
    '--green': palette.urbanGreen,
    '--band': palette.night,
    '--band-surface': palette.nightSurface,
    '--on-band': palette.onNight,
    '--on-band-muted': palette.onNightMuted,
    '--success': palette.success,
    '--warning': palette.warning,
    '--error': palette.error,
  },
  dark: {
    '--bg': palette.night,
    '--surface': palette.nightSurface,
    '--surface-sunk': '#1B1710',
    '--text': palette.onNight,
    '--text-muted': palette.onNightMuted,
    '--text-faint': '#7C7360',
    '--border': '#342E24',
    '--border-strong': '#4A4232',
    '--primary': palette.onNight,
    '--on-primary': palette.night,
    '--accent': palette.accent,
    '--on-accent': palette.accentInk,
    '--terracotta': '#E06A4B',
    '--green': '#6FA07C',
    '--band': '#100D09',
    '--band-surface': '#1B1710',
    '--on-band': palette.onNight,
    '--on-band-muted': palette.onNightMuted,
    '--success': '#6FA07C',
    '--warning': palette.accent,
    '--error': '#E06A4B',
  },
} as const;

/** Papéis tipográficos (seção 8). Famílias resolvidas via next/font. */
export const typography = {
  display: 'var(--font-display)', // condensada e pesada (Anton) — manchetes
  heading: 'var(--font-heading)', // grotesca forte (Archivo) — títulos de seção
  body: 'var(--font-body)', // legível para leitura longa (Inter)
  mono: 'var(--font-mono)', // ficha urbana: EXP.042, coordenadas, R$ (Space Mono)
  scale: {
    hero: 'clamp(3rem, 9vw, 8.5rem)',
    display: 'clamp(2.25rem, 5.5vw, 5rem)',
    h1: 'clamp(2rem, 4vw, 3.25rem)',
    h2: 'clamp(1.5rem, 2.6vw, 2.25rem)',
    h3: '1.375rem',
    body: '1.0625rem',
    small: '0.875rem',
    label: '0.72rem',
  },
} as const;

export const space = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2.5rem',
  '2xl': '4rem',
  '3xl': '6rem',
  section: 'clamp(3.5rem, 8vw, 7rem)',
} as const;

export const radius = {
  none: '0',
  sm: '2px', // cantos quase retos — brutalismo editorial
  md: '4px',
  pill: '999px',
} as const;

export const layout = {
  maxWidth: '1280px',
  wide: '1480px',
  gutter: 'clamp(1.25rem, 4vw, 4rem)',
} as const;

/** Cores de categoria para o mapa e marcadores (derivadas, não aleatórias). */
export const categoryHue: Record<string, number> = {
  museus: 20,
  cultura: 300,
  historia: 30,
  arquitetura: 210,
  gastronomia: 12,
  cafes: 25,
  parques: 140,
  mercados: 40,
  bibliotecas: 260,
  teatros: 330,
  mirantes: 190,
  exposicoes: 285,
  eventos: 350,
  bairros: 220,
  'lugares-curiosos': 170,
  'passeios-gratuitos': 90,
};
