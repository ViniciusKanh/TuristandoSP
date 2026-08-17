import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getExploration, getAllPlaces, placeNeighborhoodName } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { ExploracaoForm, type ExploracaoInitial } from '@/components/feature/ExploracaoForm';

export const metadata: Metadata = { title: 'Editar exploração', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditarExploracaoPage({ params }: { params: { slug: string } }) {
  const exp = await getExploration(params.slug);
  if (!exp) notFound();
  const places = await getAllPlaces();
  const opts = places.map((p) => ({ slug: p.slug, name: p.name, neighborhoodName: placeNeighborhoodName(p) }));

  const initial: ExploracaoInitial = {
    slug: exp.slug,
    placeSlug: exp.placeSlug,
    title: exp.title,
    subtitle: exp.subtitle,
    date: exp.date,
    durationMinutes: exp.durationMinutes,
    transport: exp.transport,
    expenses: exp.expenses,
    rating: { overall: exp.rating.overall, wouldReturn: exp.rating.wouldReturn },
    photos: exp.photos.map((p) => ({ url: p.url, width: p.width, height: p.height, alt: p.alt, caption: p.caption })),
    article: exp.article,
    tags: exp.tags,
  };

  return (
    <div className="section container container-wide" style={{ maxWidth: '1000px' }}>
      <UrbanLabel>Editar · {exp.title}</UrbanLabel>
      <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>Editar exploração</h1>
      <p className="lead" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
        Ajuste o que quiser. Para regenerar o layout, edite o relato e clique em "Organizar com Gemini" de novo. Salvar como rascunho tira do ar; publicar coloca de volta.
      </p>
      <ExploracaoForm places={opts} initial={initial} />
    </div>
  );
}
