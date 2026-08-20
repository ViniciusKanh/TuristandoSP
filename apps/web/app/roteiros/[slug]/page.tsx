import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRoteiro, ROTEIROS } from '@/lib/roteiros';
import { UrbanLabel } from '@/components/brand';
import { PlaceCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const def = ROTEIROS.find((r) => r.slug === params.slug);
  if (!def) return {};
  return { title: def.title, description: def.description, alternates: { canonical: `/roteiros/${def.slug}` } };
}

export default async function RoteiroPage({ params }: { params: { slug: string } }) {
  const data = await getRoteiro(params.slug);
  if (!data || data.places.length === 0) notFound();
  const { def, places } = data;
  return (
    <div className="section container container-wide">
      <nav className="crumbs" aria-label="Trilha" style={{ marginBottom: '1rem' }}>
        <Link href="/">Início</Link> <span>/</span> <Link href="/roteiros">Roteiros</Link> <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{def.title}</span>
      </nav>
      <UrbanLabel>Roteiro · {places.length} {places.length === 1 ? 'lugar' : 'lugares'}</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>{def.emoji} {def.title}</h1>
      <p className="lead" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>{def.description}</p>
      <div className="grid grid-3">
        {places.map((p) => (<PlaceCard key={p.id} place={p} />))}
      </div>
    </div>
  );
}
