import Link from 'next/link';
import {
  siteConfig,
  placeBySlug,
  neighborhoodBySlug,
  formatDuration,
  formatBRL,
  formatExplorationNumber,
} from '@turistando/core';
import {
  getLatestExploration,
  getPublishedExplorations,
  getStats,
  getCategoryCounts,
  getNeighborhoodSummaries,
  getMapMarkers,
  getSettings,
} from '@/lib/repo';
import { Photo } from '@/components/brand/Photo';
import { UrbanLabel, Coordinates } from '@/components/brand';
import { ArrowRight, MapIcon } from '@/components/brand/Icons';
import { ExplorationCard, CategoryCard, NeighborhoodCard } from '@/components/cards';
import { SPMap } from '@/components/feature/SPMap';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [latest, feedAll, stats, categories, hoods, markers, settings] = await Promise.all([
    getLatestExploration(),
    getPublishedExplorations(),
    getStats(),
    getCategoryCounts(),
    getNeighborhoodSummaries(),
    getMapMarkers(),
    getSettings(),
  ]);
  const feed = feedAll.slice(0, 4);
  const latestPlace = latest ? placeBySlug.get(latest.placeSlug) : undefined;
  const latestHood = latestPlace ? neighborhoodBySlug.get(latestPlace.neighborhood) : undefined;
  const latestTotal = latest ? latest.expenses.reduce((s, e) => s + e.amount, 0) : 0;

  const siteName = settings.siteName ?? siteConfig.siteName;
  const headline = settings.heroHeadline ?? 'São Paulo é grande demais para conhecer de uma vez.';
  const heroImage = settings.heroImageUrl;

  return (
    <>
      {/* HERO */}
      <section className={`hero ${heroImage ? 'hero--photo' : 'hero--type'}`}>
        <div className="hero__media" aria-hidden>
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="" />
          ) : (
            <div className="hero__type-bg">
              <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
                <defs>
                  <pattern id="hg" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M48 0H0V48" fill="none" stroke="var(--border)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="1200" height="600" fill="url(#hg)" opacity="0.5" />
              </svg>
            </div>
          )}
        </div>
        <div className="hero__content">
          <div className="container container-wide">
            <UrbanLabel>{siteName} · {formatExplorationNumber(stats.explorations)}</UrbanLabel>
            <h1 className="display hero-title" style={{ marginTop: '1.5rem', maxWidth: '15ch' }}>{headline}</h1>
            <p className="lead" style={{ marginTop: '1.5rem' }}>
              Então estou conhecendo um lugar por vez. Bairros, museus, comida, história e lugares que encontrei pelas ruas da cidade.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <Link href="/explorar" className="btn">Explorar São Paulo comigo <ArrowRight aria-hidden /></Link>
              <Link href="/mapa" className="btn btn-ghost">Ver no mapa <MapIcon aria-hidden /></Link>
            </div>
            {latest && latestPlace ? (
              <div className="hero__meta">
                <div>
                  <span className="big-number">{stats.kmWalked}<sub> KM</sub></span>
                  <div className="u-label" style={{ marginTop: '0.5rem' }}>Marco zero → {latestPlace.name}</div>
                </div>
                <Coordinates geo={latestPlace.geo} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ÚLTIMA EXPLORAÇÃO */}
      {latest && latestPlace ? (
        <section className="section container container-wide">
          <div className="eyebrow"><UrbanLabel>Última parada · {formatExplorationNumber(latest.number)}</UrbanLabel></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 'clamp(1.5rem, 4vw, 3.5rem)', alignItems: 'center' }} className="feature-split">
            <Photo photo={latest.photos[0] ?? latestPlace.coverImage} />
            <div className="stack">
              <span className="u-label" style={{ color: 'var(--text-faint)' }}>{latestHood?.name} · {siteConfig.city}</span>
              <h2 className="display title-lg">{latest.title}</h2>
              <p className="lead">{latest.subtitle}</p>
              <div className="ficha" style={{ marginTop: '1rem' }}>
                <div className="ficha__cell"><div className="ficha__val">{Math.round(latest.durationMinutes / 60)}</div><div className="ficha__key">Tempo · {formatDuration(latest.durationMinutes)}</div></div>
                <div className="ficha__cell"><div className="ficha__val">{latest.rating.overall}</div><div className="ficha__key">Nota</div></div>
                <div className="ficha__cell"><div className="ficha__val" style={{ fontSize: '1.6rem' }}>{latestTotal > 0 ? formatBRL(latestTotal) : 'Grátis'}</div><div className="ficha__key">Gastei</div></div>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <Link href={`/exploracoes/${latest.slug}`} className="btn btn-accent">Ler experiência completa <ArrowRight aria-hidden /></Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* FEED */}
      <section className="section-tight container container-wide">
        <div className="section-head">
          <div><UrbanLabel>Diário · Paradas pela cidade</UrbanLabel><h2 className="heading title-lg" style={{ marginTop: '0.75rem' }}>Últimas aventuras pela cidade</h2></div>
          <Link href="/diario" className="btn btn-ghost btn-sm">Ver diário <ArrowRight aria-hidden /></Link>
        </div>
        <div className="grid grid-4">
          {feed.map((e) => (<ExplorationCard key={e.id} exp={e} place={placeBySlug.get(e.placeSlug)} />))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="section-tight container container-wide">
        <div className="section-head"><div><UrbanLabel>Pontos na cidade</UrbanLabel><h2 className="heading title-lg" style={{ marginTop: '0.75rem' }}>Explorar por categoria</h2></div></div>
        <div className="grid grid-3">
          {categories.slice(0, 6).map((c) => (<CategoryCard key={c.category.slug} slug={c.category.slug} name={c.category.name} count={c.places} />))}
        </div>
      </section>

      {/* BAIRROS */}
      <section className="section-tight container container-wide">
        <div className="section-head">
          <div><UrbanLabel>São Paulo por bairros</UrbanLabel><h2 className="heading title-lg" style={{ marginTop: '0.75rem' }}>Onde eu andei</h2></div>
          <Link href="/bairros" className="btn btn-ghost btn-sm">Todos os bairros <ArrowRight aria-hidden /></Link>
        </div>
        <div className="grid grid-4">
          {hoods.slice(0, 4).map((h) => (<NeighborhoodCard key={h.neighborhood.slug} neighborhood={h.neighborhood} places={h.places} explorations={h.explorations} />))}
        </div>
      </section>

      {/* STATS BAND */}
      <section className="band section">
        <div className="container container-wide">
          <div className="section-head"><div><UrbanLabel>Ranking pessoal</UrbanLabel><h2 className="display title-lg" style={{ marginTop: '0.75rem', color: 'var(--on-band)' }}>Minha São Paulo até aqui</h2></div></div>
          <div className="stat-row" style={{ background: 'var(--band-surface)', borderColor: 'var(--band-surface)' }}>
            <Stat v={stats.places} k="Lugares" /><Stat v={stats.explorations} k="Explorações" /><Stat v={stats.neighborhoods} k="Bairros" />
            <Stat v={stats.museums} k="Museus" /><Stat v={stats.parks} k="Parques" /><Stat v={stats.photos} k="Fotos" /><Stat v={`${Math.round(stats.totalMinutes / 60)}h`} k="Explorando" />
          </div>
        </div>
      </section>

      {/* MAPA */}
      <section className="section container container-wide">
        <div className="section-head">
          <div><UrbanLabel>Mapa · Rotas pela cidade</UrbanLabel><h2 className="display title-lg" style={{ marginTop: '0.75rem' }}>Cada ponto tem uma história</h2></div>
          <Link href="/mapa" className="btn btn-ghost btn-sm">Abrir mapa <MapIcon aria-hidden /></Link>
        </div>
        <SPMap markers={markers} height={460} />
      </section>
    </>
  );
}

function Stat({ v, k }: { v: number | string; k: string }) {
  return (
    <div className="stat" style={{ background: 'var(--band)' }}>
      <div className="stat__val" style={{ color: 'var(--on-band)' }}>{v}</div>
      <div className="stat__key">{k}</div>
    </div>
  );
}
