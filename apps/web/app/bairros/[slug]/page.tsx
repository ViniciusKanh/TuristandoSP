import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categoryBySlug, siteConfig } from '@turistando/core';
import { getPlacesInNeighborhood, getExplorationsForPlace, getNeighborhoodView } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { PlaceCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const n = await getNeighborhoodView(params.slug);
  if (!n) return {};
  return { title: `${n.name} — bairro`, description: n.description, alternates: { canonical: `/bairros/${n.slug}` } };
}

export default async function BairroPage({ params }: { params: { slug: string } }) {
  const n = await getNeighborhoodView(params.slug);
  if (!n) notFound();
  const placesHere = await getPlacesInNeighborhood(n.slug);
  const counts = await Promise.all(placesHere.map((p) => getExplorationsForPlace(p.slug).then((e) => e.length)));
  const totalExp = counts.reduce((s, c) => s + c, 0);
  const catCount = new Map<string, number>();
  placesHere.forEach((p) => p.categories.forEach((c) => catCount.set(c, (catCount.get(c) ?? 0) + 1)));
  const topCats = [...catCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <div className="container container-wide" style={{ paddingTop: '2rem' }}>
        <nav className="crumbs">
          <Link href="/">Início</Link> <span>/</span> <Link href="/bairros">Bairros</Link> <span>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{n.name}</span>
        </nav>
      </div>

      <section className="section-tight container container-wide">
        <UrbanLabel>{n.region.replace('-', ' ')} · {siteConfig.city}</UrbanLabel>
        <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>{n.name}</h1>
        <p className="lead" style={{ marginTop: '1rem', maxWidth: '60ch' }}>{n.description}</p>
        <div className="stat-row" style={{ marginTop: '2rem' }}>
          <div className="stat"><div className="stat__val">{placesHere.length}</div><div className="stat__key">Lugares</div></div>
          <div className="stat"><div className="stat__val">{totalExp}</div><div className="stat__key">Explorações</div></div>
          {topCats.map(([c, count]) => (
            <div className="stat" key={c}><div className="stat__val">{count}</div><div className="stat__key">{categoryBySlug.get(c)?.name ?? c}</div></div>
          ))}
        </div>
      </section>

      <section className="section-tight container container-wide" style={{ paddingBottom: '5rem' }}>
        <div className="section-head"><h2 className="heading h2">Todos os lugares no bairro</h2></div>
        {placesHere.length === 0 ? (
          <div className="empty-state">Ainda não explorei nada por aqui. A cidade é grande.</div>
        ) : (
          <div className="grid grid-2">
            {placesHere.map((p, i) => (<PlaceCard key={p.id} place={p} explorations={counts[i]} />))}
          </div>
        )}
      </section>
    </div>
  );
}
