import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  categoryBySlug,
  siteConfig,
  formatBRL,
  formatExplorationNumber,
  formatDateShort,
} from '@turistando/core';
import { getPlace, getExplorationsForPlace, getRelatedPlaces, placeNeighborhoodName } from '@/lib/repo';
import { WikiCard } from '@/components/feature/WikiCard';
import { HolidayNote } from '@/components/feature/HolidayNote';
import { Photo } from '@/components/brand/Photo';
import { UrbanLabel, Coordinates, Stamp, Rating } from '@/components/brand';
import { PlaceCard } from '@/components/cards';
import { ArrowRight } from '@/components/brand/Icons';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const place = await getPlace(params.slug);
  if (!place) return {};
  return {
    title: place.name,
    description: place.shortDescription,
    alternates: { canonical: `/lugares/${place.slug}` },
    openGraph: { title: place.name, description: place.shortDescription },
  };
}

export default async function PlacePage({ params }: { params: { slug: string } }) {
  const place = await getPlace(params.slug);
  if (!place) notFound();
  const hoodName = placeNeighborhoodName(place);
  const [exps, related] = await Promise.all([getExplorationsForPlace(place.slug), getRelatedPlaces(place)]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.name,
    description: place.shortDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${place.address.street}${place.address.number ? ', ' + place.address.number : ''}`,
      addressLocality: siteConfig.city,
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: place.geo.lat, longitude: place.geo.lng },
    isAccessibleForFree: place.price.free,
    url: place.website,
  };

  const info = (
    [
      place.categories.length ? ['Categoria', place.categories.map((c) => categoryBySlug.get(c)?.name ?? c).join(' · ')] : null,
      ['Bairro', hoodName],
      ['Região', place.region.replace('-', ' ')],
      place.address.street ? ['Endereço', `${place.address.street}${place.address.number ? ', ' + place.address.number : ''}`] : null,
      place.nearestStations.length ? ['Estação mais próxima', place.nearestStations.map((s) => `${s.name} (${s.walkingMinutes} min a pé)`).join(' · ')] : null,
      ['Preço', place.price.free ? 'Gratuito' : `${formatBRL(place.price.min)}–${formatBRL(place.price.max)}`],
      place.hours?.summary ? ['Horário', place.hours.summary] : null,
      place.recommendedMinutes ? ['Tempo recomendado', `${Math.round(place.recommendedMinutes / 60)}h`] : null,
      place.rating ? ['Minha nota', `${'★'.repeat(place.rating)} ${place.rating}/5`] : null,
      place.accessibility.wheelchair ? ['Acessibilidade', 'Acessível para cadeirantes'] : null,
    ].filter(Boolean) as Array<[string, string]>
  );

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container container-wide" style={{ paddingTop: '2rem' }}>
        <nav className="crumbs" aria-label="Trilha">
          <Link href="/">Início</Link> <span>/</span>
          <Link href="/lugares">Lugares</Link> <span>/</span>
          <Link href={`/bairros/${place.neighborhood}`}>{hoodName}</Link>
        </nav>
      </div>

      <section className="section-tight container container-wide">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 'clamp(1.5rem, 4vw, 3rem)', alignItems: 'start' }} className="feature-split">
          <Photo photo={place.coverImage} priority />
          <div className="stack">
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {place.favorite ? <Stamp variant="fav">Favorito</Stamp> : null}
              {place.wantToReturn ? <Stamp>Quero voltar</Stamp> : null}
              {place.price.free ? <span className="tag">Grátis</span> : null}
            </div>
            <UrbanLabel>{hoodName} · {siteConfig.city}</UrbanLabel>
            <h1 className="display title-lg">{place.name}</h1>
            {place.rating ? <Rating value={place.rating} size={20} /> : null}
            <p className="lead">{place.description}</p>
            <Coordinates geo={place.geo} />
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {place.website ? <a className="btn btn-sm" href={place.website} target="_blank" rel="noreferrer noopener">Site oficial</a> : null}
              {place.instagram ? <a className="btn btn-ghost btn-sm" href={`https://instagram.com/${place.instagram.replace('@', '')}`} target="_blank" rel="noreferrer noopener">{place.instagram}</a> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight container container-wide">
        <UrbanLabel>Ficha do lugar</UrbanLabel>
        <div style={{ border: '1px solid var(--border)', marginTop: '1rem' }}>
          {info.map(([k, v], i) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', borderBottom: i < info.length - 1 ? '1px solid var(--border)' : 'none' }} className="ficha-row">
              <div style={{ padding: '0.9rem 1.1rem', borderRight: '1px solid var(--border)' }} className="u-label">{k}</div>
              <div style={{ padding: '0.9rem 1.1rem' }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-tight container container-wide" style={{ paddingBottom: 0 }}>
        <HolidayNote />
        <WikiCard query={place.name} />
      </div>

      <section className="section-tight container container-wide">
        <div className="section-head">
          <div><UrbanLabel>Minhas visitas</UrbanLabel><h2 className="heading h2" style={{ marginTop: '0.6rem' }}>Minhas experiências aqui</h2></div>
          <span className="coord">{exps.length} {exps.length === 1 ? 'exploração' : 'explorações'}</span>
        </div>
        {exps.length === 0 ? (
          <div className="empty-state">Ainda não publiquei uma exploração deste lugar. Em breve.</div>
        ) : (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {exps.map((e) => (
              <Link key={e.id} href={`/exploracoes/${e.slug}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '1.3rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <div>
                  <span className="u-label" style={{ color: 'var(--text-faint)' }}>{formatExplorationNumber(e.number)} · {formatDateShort(e.date)}</span>
                  <div className="h3" style={{ fontSize: '1.3rem', marginTop: '0.3rem' }}>{e.title}</div>
                </div>
                <ArrowRight aria-hidden style={{ flex: 'none' }} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section-tight container container-wide" style={{ paddingBottom: '5rem' }}>
        <div className="section-head"><div><UrbanLabel>Recomendações</UrbanLabel><h2 className="heading h2" style={{ marginTop: '0.6rem' }}>Perto e parecido</h2></div></div>
        <div className="grid grid-3">
          {related.slice(0, 6).map((p) => (<PlaceCard key={p.id} place={p} />))}
        </div>
      </section>
    </div>
  );
}
