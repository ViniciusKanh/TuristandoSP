import type { Metadata } from 'next';
import Link from 'next/link';
import { search, type SearchResult } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';

export const metadata: Metadata = { title: 'Busca', robots: { index: false } };
export const dynamic = 'force-dynamic';

const HREF: Record<SearchResult['kind'], (slug: string) => string> = {
  place: (s) => `/lugares/${s}`,
  exploration: (s) => `/exploracoes/${s}`,
  neighborhood: (s) => `/bairros/${s}`,
};
const GROUP: Record<SearchResult['kind'], string> = {
  exploration: 'Explorações',
  place: 'Lugares',
  neighborhood: 'Bairros',
};

export default async function BuscaPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const results = q ? await search(q) : [];
  const groups = (['exploration', 'place', 'neighborhood'] as SearchResult['kind'][])
    .map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.items.length);

  return (
    <div className="section container container-wide" style={{ maxWidth: '860px' }}>
      <UrbanLabel>Busca</UrbanLabel>
      <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>
        {q ? <>Resultados para “{q}”</> : 'O que você procura?'}
      </h1>

      <form action="/busca" method="get" style={{ display: 'flex', gap: '0.6rem', margin: '1.5rem 0 2.5rem' }}>
        <input className="input" name="q" defaultValue={q} placeholder="Museu, parque, Liberdade, café perto do metrô…" autoFocus />
        <button className="btn" type="submit">Buscar</button>
      </form>

      {q && results.length === 0 ? (
        <div className="empty-state">Nada encontrado para “{q}”. Tente outro termo — um bairro, uma categoria, o nome de um lugar.</div>
      ) : null}

      {groups.map((g) => (
        <section key={g.kind} className="section-tight" style={{ paddingTop: 0 }}>
          <div className="section-head" style={{ marginBottom: '1rem' }}>
            <h2 className="heading h3">{GROUP[g.kind]} <span className="coord">· {g.items.length}</span></h2>
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {g.items.map((r) => (
              <Link key={`${r.kind}-${r.slug}`} href={HREF[r.kind](r.slug)} style={{ display: 'block', padding: '0.9rem 0', borderBottom: '1px solid var(--border)' }}>
                <div className="h3" style={{ fontSize: '1.15rem' }}>{r.title}</div>
                <span className="coord">{r.subtitle}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
