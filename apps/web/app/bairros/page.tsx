import type { Metadata } from 'next';
import { REGIONS } from '@turistando/core';
import { getNeighborhoodSummaries } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { NeighborhoodCard } from '@/components/cards';

export const metadata: Metadata = {
  title: 'Bairros',
  description: 'São Paulo por bairros: cada canto da cidade com seus lugares, explorações e histórias.',
  alternates: { canonical: '/bairros' },
};
export const dynamic = 'force-dynamic';

export default async function BairrosPage() {
  const summaries = await getNeighborhoodSummaries();
  return (
    <div className="section container container-wide">
      <div className="eyebrow"><UrbanLabel>São Paulo por bairros</UrbanLabel></div>
      <h1 className="display title-xl">A cidade, quarteirão por quarteirão</h1>
      <p className="lead" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
        {summaries.length} bairros no diário, espalhados por {REGIONS.length} regiões da capital.
      </p>
      <div className="grid grid-3">
        {summaries.map((s) => (<NeighborhoodCard key={s.neighborhood.slug} neighborhood={s.neighborhood} places={s.places} explorations={s.explorations} />))}
      </div>
    </div>
  );
}
