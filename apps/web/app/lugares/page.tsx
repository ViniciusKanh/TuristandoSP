import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPlaces, getExplorationsForPlace, getCategoryCounts } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { PlaceCard } from '@/components/cards';

export const metadata: Metadata = {
  title: 'Lugares',
  description: 'Catálogo de lugares que já explorei pela cidade de São Paulo — museus, parques, mercados, cafés e curiosidades.',
  alternates: { canonical: '/lugares' },
};
export const dynamic = 'force-dynamic';

export default async function LugaresPage() {
  const [places, cats] = await Promise.all([getAllPlaces(), getCategoryCounts()]);
  const counts = await Promise.all(places.map((p) => getExplorationsForPlace(p.slug).then((e) => e.length)));

  return (
    <div className="section container container-wide">
      <div className="eyebrow"><UrbanLabel>Catálogo · {places.length} lugares</UrbanLabel></div>
      <h1 className="display title-xl">Lugares pela cidade</h1>
      <div className="tag-row" style={{ margin: '1.5rem 0 2.5rem' }}>
        {cats.map((c) => (<Link key={c.category.slug} className="tag" href={`/categorias/${c.category.slug}`}>{c.category.name} · {c.places}</Link>))}
      </div>
      <div className="grid grid-2">
        {places.map((p, i) => (<PlaceCard key={p.id} place={p} explorations={counts[i]} />))}
      </div>
    </div>
  );
}
