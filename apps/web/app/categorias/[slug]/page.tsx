import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategory } from '@turistando/core';
import { getPlacesByCategory, getExplorationsForPlace } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { PlaceCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCategory(params.slug);
  if (!c) return {};
  return { title: c.name, description: `Lugares da categoria ${c.name} que explorei em São Paulo.`, alternates: { canonical: `/categorias/${c.slug}` } };
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const c = getCategory(params.slug);
  if (!c) notFound();
  const placesHere = await getPlacesByCategory(c.slug);
  const counts = await Promise.all(placesHere.map((p) => getExplorationsForPlace(p.slug).then((e) => e.length)));

  return (
    <div className="section container container-wide">
      <nav className="crumbs" style={{ marginBottom: '2rem' }}>
        <Link href="/">Início</Link> <span>/</span> <Link href="/lugares">Lugares</Link> <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{c.name}</span>
      </nav>
      <UrbanLabel>Categoria · {placesHere.length} lugares</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>{c.name}</h1>
      {placesHere.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '2rem' }}>Nada nesta categoria ainda.</div>
      ) : (
        <div className="grid grid-2" style={{ marginTop: '2.5rem' }}>
          {placesHere.map((p, i) => (<PlaceCard key={p.id} place={p} explorations={counts[i]} />))}
        </div>
      )}
    </div>
  );
}
