import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPlaces, getExplorationsForPlace, placeNeighborhoodName } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';

export const metadata: Metadata = { title: 'Lugares', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLugares() {
  const places = await getAllPlaces();
  const counts = await Promise.all(places.map((p) => getExplorationsForPlace(p.slug).then((e) => e.length)));

  return (
    <div className="section container container-wide">
      <div className="section-head">
        <div>
          <UrbanLabel>Catálogo · {places.length} lugares</UrbanLabel>
          <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>Lugares cadastrados</h1>
        </div>
        <Link href="/admin/lugares/novo" className="btn btn-accent btn-sm">+ Novo lugar</Link>
      </div>
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {places.map((p, i) => (
          <div key={p.slug} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="h3" style={{ fontSize: '1.15rem' }}>{p.name}</div>
              <span className="coord">{placeNeighborhoodName(p)} · {p.geo.lat.toFixed(4)}, {p.geo.lng.toFixed(4)}</span>
            </div>
            <span className="coord">{counts[i]} exp.</span>
            <Link href={`/admin/lugares/${p.slug}/editar`} className="btn btn-ghost btn-sm">Editar</Link>
            <Link href={`/lugares/${p.slug}`} className="tag" target="_blank">abrir ↗</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
