import type { Metadata } from 'next';
import Link from 'next/link';
import { listRoteiros } from '@/lib/roteiros';
import { UrbanLabel } from '@/components/brand';

export const metadata: Metadata = {
  title: 'Roteiros',
  description: 'Coleções de lugares por tema: SP de graça, museus, ao ar livre e mais.',
  alternates: { canonical: '/roteiros' },
};
export const dynamic = 'force-dynamic';

export default async function RoteirosPage() {
  const roteiros = await listRoteiros();
  return (
    <div className="section container container-wide">
      <UrbanLabel>Coleções pela cidade</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>Roteiros</h1>
      <p className="lead" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
        Jeitos diferentes de fatiar São Paulo. Cada roteiro junta os lugares que combinam com um clima — e se atualiza sozinho conforme eu cadastro mais paradas.
      </p>
      <div className="grid grid-3">
        {roteiros.map((r) => (
          <Link key={r.slug} href={`/roteiros/${r.slug}`} className="roteiro-card">
            <span className="roteiro-card__emoji" aria-hidden>{r.emoji}</span>
            <h2 className="roteiro-card__title">{r.title}</h2>
            <p className="roteiro-card__desc">{r.description}</p>
            <span className="roteiro-card__count">{r.count} {r.count === 1 ? 'lugar' : 'lugares'} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
