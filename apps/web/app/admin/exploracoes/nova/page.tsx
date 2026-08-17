import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPlaces, placeNeighborhoodName } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { ExploracaoForm } from '@/components/feature/ExploracaoForm';

export const metadata: Metadata = { title: 'Nova exploração', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function NovaExploracaoPage() {
  const places = await getAllPlaces();
  const opts = places.map((p) => ({ slug: p.slug, name: p.name, neighborhoodName: placeNeighborhoodName(p) }));

  return (
    <div className="section container container-wide" style={{ maxWidth: '1000px' }}>
      <UrbanLabel>Diário · registrar visita</UrbanLabel>
      <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>Nova exploração</h1>
      <p className="lead" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
        Escolha o lugar, suba as fotos, escreva o relato solto e deixe o Gemini montar o artigo no estilo de página de jornal. No fim, publica com link próprio pra compartilhar.
      </p>

      {opts.length === 0 ? (
        <div className="empty-state">
          Você ainda não tem lugares cadastrados. <Link href="/admin/lugares/novo" style={{ borderBottom: '2px solid var(--accent)' }}>Cadastre um lugar</Link> antes de registrar a visita.
        </div>
      ) : (
        <ExploracaoForm places={opts} />
      )}
    </div>
  );
}
