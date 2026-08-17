import type { TransportMode, GeoPoint } from '../types/index';

/** R$ 32,00 — moeda brasileira. */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** 160 min → "2H40". Estilo ficha urbana. */
export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}MIN`;
  return `${h}H${m.toString().padStart(2, '0')}`;
}

/** 42 → "EXP.042". */
export function formatExplorationNumber(n: number): string {
  return `EXP.${n.toString().padStart(3, '0')}`;
}

const MONTHS_PT = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

/** '2026-08-14' → "14 AGO 2026". */
export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d.toString().padStart(2, '0')} ${MONTHS_PT[m - 1]} ${y}`;
}

/** '2026-08-14' → "14.08.26". */
export function formatDateStamp(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}.${y
    .toString()
    .slice(2)}`;
}

/** '2026-08-14' → "14 de agosto de 2026". */
export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const full = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return `${d} de ${full[m - 1]} de ${y}`;
}

/** -23.55052 → `23°33'02"S`. Formato de coordenada urbana. */
export function formatCoordinate(value: number, axis: 'lat' | 'lng'): string {
  const positive = axis === 'lat' ? value >= 0 : value >= 0;
  const hemisphere =
    axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);
  void positive;
  return `${deg}°${min.toString().padStart(2, '0')}'${sec
    .toString()
    .padStart(2, '0')}"${hemisphere}`;
}

export function formatGeo(geo: GeoPoint): string {
  return `${formatCoordinate(geo.lat, 'lat')} ${formatCoordinate(geo.lng, 'lng')}`;
}

export const TRANSPORT_LABEL: Record<TransportMode, string> = {
  metro: 'Metrô',
  trem: 'Trem',
  onibus: 'Ônibus',
  carro: 'Carro',
  bike: 'Bike',
  'a-pe': 'A pé',
  outro: 'Outro',
};

/** Distância aproximada entre dois pontos (Haversine, km). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}
