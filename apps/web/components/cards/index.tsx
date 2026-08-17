import Link from 'next/link';
import {
  formatDateShort,
  formatDuration,
  formatBRL,
  formatExplorationNumber,
  neighborhoodBySlug,
  type Exploration,
  type Place,
  type Neighborhood,
} from '@turistando/core';
import { Photo } from '../brand/Photo';
import { Rating } from '../brand';
import { ArrowRight } from '../brand/Icons';

export function ExplorationCard({ exp, place }: { exp: Exploration; place?: Place }) {
  const hoodName = place ? place.neighborhoodName || neighborhoodBySlug.get(place.neighborhood)?.name || place.neighborhood : '';
  const cover = exp.photos[0] ?? place?.coverImage;
  const total = exp.expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <Link href={`/exploracoes/${exp.slug}`} className="exp-card reveal">
      <div className="exp-card__media">
        {cover ? <Photo photo={cover} /> : null}
        <span className="exp-card__badge">{formatExplorationNumber(exp.number)}</span>
      </div>
      <div className="exp-card__body">
        <span className="u-label" style={{ color: 'var(--text-faint)' }}>
          {place?.name} · {hoodName}
        </span>
        <h3 className="exp-card__title">{exp.title}</h3>
        <Rating value={exp.rating.overall} />
        <div className="exp-card__meta">
          <span className="coord">{formatDateShort(exp.date)}</span>
          <span className="coord">{formatDuration(exp.durationMinutes)}</span>
          <span className="coord">{total > 0 ? formatBRL(total) : 'GRÁTIS'}</span>
        </div>
      </div>
    </Link>
  );
}

export function PlaceCard({ place, explorations }: { place: Place; explorations?: number }) {
  const hoodName = place.neighborhoodName || neighborhoodBySlug.get(place.neighborhood)?.name || place.neighborhood;
  return (
    <Link href={`/lugares/${place.slug}`} className="place-card">
      <div className="place-card__thumb">
        <Photo photo={place.coverImage} />
      </div>
      <div style={{ flex: 1 }}>
        <span className="u-label" style={{ color: 'var(--text-faint)' }}>
          {hoodName}
        </span>
        <div className="h3" style={{ fontSize: '1.05rem', margin: '0.2rem 0' }}>
          {place.name}
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {place.rating ? <Rating value={place.rating} /> : null}
          {place.price.free ? <span className="tag">Grátis</span> : null}
          {explorations ? <span className="coord">{explorations} exp.</span> : null}
        </div>
      </div>
      <ArrowRight aria-hidden style={{ color: 'var(--text-faint)' }} />
    </Link>
  );
}

export function CategoryCard({
  slug,
  name,
  count,
  km,
}: {
  slug: string;
  name: string;
  count: number;
  km?: number;
}) {
  return (
    <Link href={`/categorias/${slug}`} className="mini-card">
      <div className="place-card__accent" style={{ marginBottom: '0.6rem', width: '48px' }} />
      <span className="u-label">{count} {count === 1 ? 'lugar' : 'lugares'}</span>
      <div className="h3" style={{ fontSize: '1.25rem' }}>{name}</div>
      {km ? <span className="coord">{km} km de distância média</span> : null}
    </Link>
  );
}

export function NeighborhoodCard({
  neighborhood,
  places,
  explorations,
}: {
  neighborhood: Neighborhood;
  places: number;
  explorations: number;
}) {
  return (
    <Link href={`/bairros/${neighborhood.slug}`} className="mini-card">
      <span className="u-label">{neighborhood.region.replace('-', ' ')}</span>
      <div className="h3" style={{ fontSize: '1.4rem' }}>{neighborhood.name}</div>
      <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
        {neighborhood.description.slice(0, 96)}…
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
        <span className="coord">{places} lugares</span>
        <span className="coord">{explorations} explorações</span>
      </div>
    </Link>
  );
}
