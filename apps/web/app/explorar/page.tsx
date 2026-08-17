import type { Metadata } from 'next';
import { neighborhoodBySlug } from '@turistando/core';
import { getAllPlaces } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { ExploreFilters, type ExploreItem } from '@/components/feature/ExploreFilters';

export const metadata: Metadata = {
  title: 'Explorar',
  description: 'O que conhecer em São Paulo hoje? Filtre por vontade, tempo, orçamento, região e transporte.',
  alternates: { canonical: '/explorar' },
};
export const dynamic = 'force-dynamic';

export default async function ExplorarPage() {
  const places = await getAllPlaces();
  const items: ExploreItem[] = places.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    neighborhoodName: p.neighborhoodName ?? neighborhoodBySlug.get(p.neighborhood)?.name ?? p.neighborhood,
    region: p.region,
    categories: p.categories,
    tags: p.tags,
    free: p.price.free,
    priceMax: p.price.max,
    minutes: p.recommendedMinutes ?? 120,
    hasMetro: p.nearestStations.some((s) => s.type === 'metro'),
    hasTrain: p.nearestStations.some((s) => s.type === 'trem'),
    cover: p.coverImage,
  }));

  return (
    <div className="section container container-wide">
      <div className="eyebrow"><UrbanLabel>Ferramenta de exploração · 003</UrbanLabel></div>
      <h1 className="display title-xl" style={{ maxWidth: '18ch' }}>O que conhecer em São Paulo hoje?</h1>
      <p className="lead" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
        Escolhe o que você quer, quanto tem de tempo e de grana, e a cidade responde.
      </p>
      <ExploreFilters items={items} />
    </div>
  );
}
