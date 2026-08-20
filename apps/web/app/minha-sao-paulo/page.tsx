import type { Metadata } from 'next';
import Link from 'next/link';
import { formatBRL } from '@turistando/core';
import { getStats, getCategoryCounts, getNeighborhoodSummaries, getAllPlaces, getExplorationsForPlace } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';

export const metadata: Metadata = {
  title: 'Minha São Paulo',
  description: 'As estatísticas pessoais deste diário: lugares, bairros, horas e quilômetros pela capital.',
  alternates: { canonical: '/minha-sao-paulo' },
};
export const dynamic = 'force-dynamic';

export default async function MinhaSaoPauloPage() {
  const [stats, cats, hoods, places] = await Promise.all([
    getStats(), getCategoryCounts(), getNeighborhoodSummaries(), getAllPlaces(),
  ]);
  const favorites = places.filter((p) => p.favorite);
  const favCounts = await Promise.all(favorites.map((p) => getExplorationsForPlace(p.slug).then((e) => e.length)));
  const topCats = cats.slice(0, 8);
  const maxCat = Math.max(...topCats.map((c) => c.places), 1);

  return (
    <div className="section container container-wide">
      <UrbanLabel>Ranking pessoal · 007</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>Minha São Paulo</h1>

      <div className="stat-row" style={{ marginTop: '2rem' }}>
        <div className="stat"><div className="stat__val">{stats.places}</div><div className="stat__key">Lugares visitados</div></div>
        <div className="stat"><div className="stat__val">{stats.explorations}</div><div className="stat__key">Explorações</div></div>
        <div className="stat"><div className="stat__val">{stats.neighborhoods}</div><div className="stat__key">Bairros</div></div>
        <div className="stat"><div className="stat__val">{stats.museums}</div><div className="stat__key">Museus</div></div>
        <div className="stat"><div className="stat__val">{stats.parks}</div><div className="stat__key">Parques</div></div>
        <div className="stat"><div className="stat__val">{stats.photos}</div><div className="stat__key">Fotos</div></div>
        <div className="stat"><div className="stat__val">{Math.round(stats.totalMinutes / 60)}h</div><div className="stat__key">Explorando</div></div>
        <div className="stat"><div className="stat__val" style={{ fontSize: '2rem' }}>{formatBRL(stats.totalSpent)}</div><div className="stat__key">Total gasto</div></div>
      </div>

      <section className="section-tight">
        <div className="section-head"><h2 className="heading h2">Categorias mais visitadas</h2></div>
        <div className="barchart">
          {topCats.map((c) => (
            <Link key={c.category.slug} href={`/categorias/${c.category.slug}`} className="barrow">
              <span className="barrow__label">{c.category.name}</span>
              <span className="barrow__track"><span className="barrow__fill" style={{ width: `${Math.max(6, (c.places / maxCat) * 100)}%` }} /></span>
              <span className="barrow__val">{c.places}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-tight">
        <div className="section-head"><h2 className="heading h2">Bairros mais explorados</h2></div>
        <div className="barchart">
          {hoods.slice(0, 8).map((h) => {
            const maxHood = Math.max(1, ...hoods.slice(0, 8).map((x) => x.explorations || x.places));
            const val = h.explorations || h.places;
            return (
              <Link key={h.neighborhood.slug} href={`/bairros/${h.neighborhood.slug}`} className="barrow">
                <span className="barrow__label">{h.neighborhood.name}</span>
                <span className="barrow__track"><span className="barrow__fill barrow__fill--gold" style={{ width: `${Math.max(6, (val / maxHood) * 100)}%` }} /></span>
                <span className="barrow__val">{val}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {favorites.length ? (
        <section className="section-tight" style={{ paddingBottom: '4rem' }}>
          <div className="section-head"><h2 className="heading h2">Lugares onde eu voltaria amanhã</h2></div>
          <div className="grid grid-3">
            {favorites.map((p, i) => (
              <Link key={p.id} href={`/lugares/${p.slug}`} className="mini-card">
                <span className="u-label" style={{ color: 'var(--accent)' }}>Favorito</span>
                <div className="h3" style={{ fontSize: '1.25rem' }}>{p.name}</div>
                <span className="coord">{favCounts[i]} exp.</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
