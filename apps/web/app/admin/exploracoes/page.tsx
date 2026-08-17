import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllExplorationsAdmin, getPlace } from '@/lib/repo';
import { formatExplorationNumber, formatDateShort } from '@turistando/core';
import { UrbanLabel } from '@/components/brand';
import { ExploracaoActions } from '@/components/feature/ExploracaoActions';

export const metadata: Metadata = { title: 'Explorações', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminExploracoes() {
  const exps = await getAllExplorationsAdmin();
  const withPlace = await Promise.all(
    exps.map(async (e) => ({ e, place: await getPlace(e.placeSlug) })),
  );

  return (
    <div className="section container container-wide">
      <div className="section-head">
        <div>
          <UrbanLabel>Diário · {exps.length} explorações</UrbanLabel>
          <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>Minhas explorações</h1>
        </div>
        <Link href="/admin/exploracoes/nova" className="btn btn-sm">+ Nova exploração</Link>
      </div>

      {exps.length === 0 ? (
        <div className="empty-state">Nenhuma exploração ainda. Comece registrando uma visita.</div>
      ) : (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {withPlace.map(({ e, place }) => (
            <div key={e.slug} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className="u-label" style={{ color: 'var(--text-faint)' }}>
                  {formatExplorationNumber(e.number)} · {formatDateShort(e.date)} · {place?.name ?? e.placeSlug}
                  {' '}
                  <span className="tag" style={{ marginLeft: '0.4rem', borderColor: e.status === 'publicado' ? 'var(--green)' : 'var(--border-strong)', color: e.status === 'publicado' ? 'var(--green)' : 'var(--text-faint)' }}>
                    {e.status === 'publicado' ? 'publicada' : 'rascunho'}
                  </span>
                </span>
                <div className="h3" style={{ fontSize: '1.2rem', marginTop: '0.3rem' }}>{e.title}</div>
              </div>
              <ExploracaoActions slug={e.slug} title={e.title} status={e.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
