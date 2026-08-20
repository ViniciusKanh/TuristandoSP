import type { Metadata } from 'next';
import Link from 'next/link';
import { getFeed, getExplorationYears } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { InfiniteFeed } from '@/components/feature/InfiniteFeed';

export const metadata: Metadata = {
  title: 'Diário',
  description: 'Todas as minhas explorações pela cidade de São Paulo, uma parada por vez.',
  alternates: { canonical: '/diario' },
};
export const dynamic = 'force-dynamic';

const PAGE = 12;

export default async function DiarioPage() {
  const [{ items, total }, years] = await Promise.all([getFeed(0, PAGE), getExplorationYears()]);
  return (
    <div className="section container container-wide">
      <div className="eyebrow"><UrbanLabel>Diário de bordo · {total} paradas</UrbanLabel></div>
      <h1 className="display title-xl" style={{ maxWidth: '16ch' }}>O que eu andei turistando</h1>
      <p className="lead" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        Cada saída vira uma rota, e cada rota vira um relato. Do mais recente ao começo de tudo.
      </p>
      {years.length > 1 ? (
        <div className="chips" style={{ marginBottom: '2.5rem' }}>
          <span className="chip" aria-current="page">Tudo <span className="chip__n">{total}</span></span>
          {years.map((y) => (
            <Link key={y.year} href={`/diario/${y.year}`} className="chip">{y.year} <span className="chip__n">{y.count}</span></Link>
          ))}
        </div>
      ) : null}
      {total === 0 ? (
        <div className="empty-state">Nenhuma exploração publicada ainda.</div>
      ) : (
        <InfiniteFeed initial={items} total={total} pageSize={PAGE} />
      )}
    </div>
  );
}
