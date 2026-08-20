import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { placeBySlug } from '@turistando/core';
import { getExplorationsByTag } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { ExplorationCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `#${tag.replace(/-/g, ' ')}`,
    description: `Explorações marcadas com ${tag.replace(/-/g, ' ')}.`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const exps = await getExplorationsByTag(tag);
  if (exps.length === 0) notFound();
  return (
    <div className="section container container-wide">
      <nav className="crumbs" aria-label="Trilha" style={{ marginBottom: '1rem' }}>
        <Link href="/">Início</Link> <span>/</span> <Link href="/tags">Tags</Link> <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{tag.replace(/-/g, ' ')}</span>
      </nav>
      <UrbanLabel>Tag · {exps.length} {exps.length === 1 ? 'exploração' : 'explorações'}</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>#{tag.replace(/-/g, ' ')}</h1>
      <div className="grid grid-4" style={{ marginTop: '2.5rem' }}>
        {exps.map((e) => (
          <ExplorationCard key={e.id} exp={e} place={placeBySlug.get(e.placeSlug)} />
        ))}
      </div>
    </div>
  );
}
