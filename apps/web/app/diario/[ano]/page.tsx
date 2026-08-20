import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { placeBySlug } from '@turistando/core';
import { getExplorationsByYear, getExplorationYears } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { ExplorationCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { ano: string } }): Promise<Metadata> {
  return { title: `Diário ${params.ano}`, description: `Explorações de ${params.ano} pela cidade de São Paulo.`, alternates: { canonical: `/diario/${params.ano}` } };
}

export default async function DiarioAnoPage({ params }: { params: { ano: string } }) {
  const year = Number(params.ano);
  if (!year || year < 2000 || year > 2100) notFound();
  const [exps, years] = await Promise.all([getExplorationsByYear(year), getExplorationYears()]);
  if (exps.length === 0) notFound();

  return (
    <div className="section container container-wide">
      <nav className="crumbs" aria-label="Trilha" style={{ marginBottom: '1rem' }}>
        <Link href="/">Início</Link> <span>/</span> <Link href="/diario">Diário</Link> <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{year}</span>
      </nav>
      <UrbanLabel>Arquivo · {exps.length} {exps.length === 1 ? 'parada' : 'paradas'}</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>Diário de {year}</h1>

      <div className="chips" style={{ margin: '1.5rem 0 2.5rem' }}>
        <Link href="/diario" className="chip">Tudo</Link>
        {years.map((y) => (
          <Link key={y.year} href={`/diario/${y.year}`} className="chip" aria-current={y.year === year ? 'page' : undefined}>
            {y.year} <span className="chip__n">{y.count}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-4">
        {exps.map((e) => (<ExplorationCard key={e.id} exp={e} place={placeBySlug.get(e.placeSlug)} />))}
      </div>
    </div>
  );
}
