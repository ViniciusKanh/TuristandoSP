import Link from 'next/link';
import {
  formatExplorationNumber,
  formatGeo,
  TRANSPORT_LABEL,
  type GeoPoint,
  type Rating as RatingType,
  type TransportMode,
} from '@turistando/core';
import { Star, TRANSPORT_ICON } from './Icons';

export function UrbanLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="u-label">
      <span className="tick" aria-hidden />
      {children}
    </span>
  );
}

export function ExplorationNumber({ n }: { n: number }) {
  return (
    <span className="exp-number">
      <span className="dot" aria-hidden />
      {formatExplorationNumber(n)}
    </span>
  );
}

export function Coordinates({ geo }: { geo: GeoPoint }) {
  return <span className="coord">{formatGeo(geo)}</span>;
}

export function Rating({ value, size }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="rating" aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} filled={i < full} width={size ?? 16} height={size ?? 16} className={i < full ? '' : 'off'} />
      ))}
    </span>
  );
}

export function TransportBadge({ mode, detail }: { mode: TransportMode; detail?: string }) {
  const Icon = TRANSPORT_ICON[mode];
  return (
    <span className="tbadge" title={detail}>
      <Icon aria-hidden /> {TRANSPORT_LABEL[mode]}
    </span>
  );
}

export function Tag({ slug, children }: { slug?: string; children: React.ReactNode }) {
  if (slug) return <Link className="tag" href={`/explorar?tag=${slug}`}>{children}</Link>;
  return <span className="tag">{children}</span>;
}

export function Stamp({ variant = 'visited', children }: { variant?: 'visited' | 'fav'; children: React.ReactNode }) {
  return <span className={`stamp ${variant === 'fav' ? 'stamp--fav' : ''}`}>{children}</span>;
}

export function WouldReturnLabel({ value }: { value: RatingType['wouldReturn'] }) {
  const map = { 'com-certeza': 'Com certeza', talvez: 'Talvez', 'nao-prioridade': 'Não seria prioridade' };
  return <span>{map[value]}</span>;
}
