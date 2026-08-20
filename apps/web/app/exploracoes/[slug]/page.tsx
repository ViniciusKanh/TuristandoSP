import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  neighborhoodBySlug,
  siteConfig,
  formatDateLong,
  formatDuration,
  formatBRL,
  formatExplorationNumber,
  TRANSPORT_LABEL,
  composeArticle,
  type ArticleBlock,
} from '@turistando/core';
import { getExploration, getPlace, getPublishedExplorations } from '@/lib/repo';
import { Photo } from '@/components/brand/Photo';
import { UrbanLabel, Rating, Coordinates, WouldReturnLabel, Tag } from '@/components/brand';
import { ArticleRenderer } from '@/components/feature/ArticleRenderer';
import { ShareButton } from '@/components/feature/ShareButton';
import { ExplorationCard } from '@/components/cards';
import { ReadingProgress } from '@/components/feature/ReadingProgress';
import { Lightbox } from '@/components/feature/Lightbox';
import { Comments } from '@/components/feature/Comments';
import { ListenButton } from '@/components/feature/ListenButton';
import { SaveButton } from '@/components/feature/SaveButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const exp = await getExploration(params.slug);
  if (!exp) return {};
  const place = await getPlace(exp.placeSlug);
  return {
    title: exp.title,
    description: exp.subtitle ?? `${formatExplorationNumber(exp.number)} — ${place?.name ?? ''}`,
    alternates: { canonical: `/exploracoes/${exp.slug}` },
    openGraph: { type: 'article', title: exp.title, description: exp.subtitle ?? '', publishedTime: exp.publishedAt },
  };
}

function readingMinutes(blocks: ArticleBlock[]): number {
  let words = 0;
  for (const b of blocks) {
    if ('text' in b && typeof b.text === 'string') words += b.text.split(/\s+/).filter(Boolean).length;
  }
  return Math.max(1, Math.round(words / 200));
}

export default async function ExplorationPage({ params }: { params: { slug: string } }) {
  const exp = await getExploration(params.slug);
  if (!exp || exp.status !== 'publicado') notFound();
  const place = await getPlace(exp.placeSlug);
  const hoodName = place ? place.neighborhoodName || neighborhoodBySlug.get(place.neighborhood)?.name || place.neighborhood : '';
  const total = exp.expenses.reduce((s, e) => s + e.amount, 0);
  const r = exp.rating;
  const cover = exp.photos[0] ?? place?.coverImage;
  const readMin = readingMinutes(exp.article);
  // Fotos são a fonte da verdade: reconstrói o corpo com a ordem atual das fotos.
  const renderBlocks = composeArticle(exp.article, exp.photos);

  const published = await getPublishedExplorations();
  const selfIdx = published.findIndex((e) => e.slug === exp.slug);
  // lista vem do mais novo pro mais antigo: "próxima" = mais recente, "anterior" = mais antiga
  const newer = selfIdx > 0 ? published[selfIdx - 1] : undefined;
  const older = selfIdx >= 0 && selfIdx < published.length - 1 ? published[selfIdx + 1] : undefined;
  const others = published.filter((e) => e.slug !== exp.slug).slice(0, 3);
  const otherPlaces = await Promise.all(others.map((o) => getPlace(o.placeSlug)));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: exp.title,
    datePublished: exp.publishedAt,
    author: { '@type': 'Person', name: siteConfig.authorName },
    about: place ? { '@type': 'TouristAttraction', name: place.name } : undefined,
    inLanguage: 'pt-BR',
  };

  const dims: Array<[string, number | undefined]> = [
    ['Experiência', r.experience],
    ['Custo-benefício', r.costBenefit],
    ['Infraestrutura', r.infrastructure],
    ['Acessibilidade', r.accessibility],
    ['Fotografia', r.photography],
  ];

  return (
    <article>
      <ReadingProgress />
      <Lightbox />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container container-wide" style={{ paddingTop: '1.5rem' }}>
        <nav className="crumbs" aria-label="Trilha">
          <Link href="/">Início</Link> <span>/</span>
          <Link href="/diario">Diário</Link> <span>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{formatExplorationNumber(exp.number)}</span>
        </nav>
      </div>

      {/* HERO com capa (estilo blog de viagem) */}
      {cover ? (
        <div className="container container-wide" style={{ marginTop: '1.25rem' }}>
          <header className="exp-hero">
            <div className="exp-hero__media"><Photo photo={cover} priority /></div>
            <div className="exp-hero__overlay">
              <div className="exp-dateline">
                <span>{siteConfig.siteShortName}</span><span>·</span>
                <span>{formatExplorationNumber(exp.number)}</span><span>·</span>
                <span>{formatDateLong(exp.date)}</span>
              </div>
              <h1 className="display title-xl" style={{ marginTop: '1rem' }}>{exp.title}</h1>
              {exp.subtitle ? <p className="lead" style={{ marginTop: '0.9rem', fontStyle: 'italic', maxWidth: '40ch' }}>{exp.subtitle}</p> : null}
              {place ? (
                <p className="coord" style={{ marginTop: '0.9rem' }}>
                  <Link href={`/lugares/${place.slug}`} style={{ borderBottom: '2px solid var(--accent)' }}>{place.name}</Link> · {hoodName} · {siteConfig.city}
                </p>
              ) : null}
            </div>
          </header>
        </div>
      ) : (
        <div className="container container-wide">
          <header style={{ marginTop: '2rem', maxWidth: '46rem', marginInline: 'auto', textAlign: 'center' }}>
            <div className="exp-dateline"><span>{siteConfig.siteShortName}</span><span>·</span><span>{formatExplorationNumber(exp.number)}</span><span>·</span><span>{formatDateLong(exp.date)}</span></div>
            <h1 className="display title-xl" style={{ marginTop: '1rem' }}>{exp.title}</h1>
            {exp.subtitle ? <p className="lead" style={{ marginTop: '0.9rem', fontStyle: 'italic', marginInline: 'auto' }}>{exp.subtitle}</p> : null}
          </header>
        </div>
      )}

      {/* BYLINE */}
      <div className="container container-wide">
        <div className="exp-byline">
          <span className="u-label" style={{ color: 'var(--text-muted)' }}>Por {siteConfig.authorName}</span>
          <span className="coord">{readMin} min de leitura</span>
          {r.overall ? <Rating value={r.overall} /> : null}
          <span className="exp-byline__actions">
            <ListenButton />
            <SaveButton slug={exp.slug} title={exp.title} place={place?.name} />
            <ShareButton title={exp.title} path={`/exploracoes/${exp.slug}`} />
          </span>
        </div>
      </div>

      {/* FICHA */}
      <div className="container container-wide" style={{ marginTop: '2rem' }}>
        <div className="ficha">
          <div className="ficha__cell"><div className="ficha__val">{r.overall || '—'}</div><div className="ficha__key">Minha nota</div></div>
          <div className="ficha__cell"><div className="ficha__val" style={{ fontSize: '1.6rem' }}>{total > 0 ? formatBRL(total) : 'Grátis'}</div><div className="ficha__key">Quanto paguei</div></div>
          <div className="ficha__cell"><div className="ficha__val">{formatDuration(exp.durationMinutes)}</div><div className="ficha__key">Quanto fiquei</div></div>
          {exp.transport.length ? <div className="ficha__cell"><div className="ficha__val" style={{ fontSize: '1.3rem' }}>{exp.transport.map((t) => TRANSPORT_LABEL[t.mode]).join(' + ')}</div><div className="ficha__key">Como cheguei</div></div> : null}
          <div className="ficha__cell"><div className="ficha__val" style={{ fontSize: '1.3rem' }}><WouldReturnLabel value={r.wouldReturn} /></div><div className="ficha__key">Eu voltaria?</div></div>
        </div>
      </div>

      {/* ARTIGO */}
      <div className="section container container-wide">
        <ArticleRenderer blocks={renderBlocks} />
      </div>

      {/* AVALIAÇÃO */}
      {dims.some(([, v]) => v != null) ? (
        <section className="section-tight container container-wide">
          <div className="section-head">
            <div><UrbanLabel>Avaliação</UrbanLabel><h2 className="heading h2" style={{ marginTop: '0.6rem' }}>O que eu achei, por partes</h2></div>
            <Rating value={r.overall} size={22} />
          </div>
          <div className="grid grid-3">
            {dims.filter(([, v]) => v != null).map(([label, v]) => (
              <div className="mini-card" key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="u-label" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <Rating value={v as number} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {exp.tags.length ? (
        <div className="container container-wide">
          <div className="tag-row" style={{ marginTop: '0.5rem' }}>
            {exp.tags.map((t) => (<Tag key={t} slug={t}>{t.replace(/-/g, ' ')}</Tag>))}
          </div>
        </div>
      ) : null}

      {/* SOBRE O LUGAR */}
      {place ? (
        <section className="section-tight container container-wide">
          <div className="mini-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="u-label">Sobre este lugar</span>
              <div className="h3" style={{ fontSize: '1.4rem', marginTop: '0.4rem' }}>{place.name}</div>
              <Coordinates geo={place.geo} />
            </div>
            <Link href={`/lugares/${place.slug}`} className="btn">Ver todas as minhas visitas aqui</Link>
          </div>
        </section>
      ) : null}

      {/* ANTERIOR / PRÓXIMA */}
      {newer || older ? (
        <nav className="expnav container container-wide" aria-label="Navegar entre explorações">
          {older ? (
            <Link href={`/exploracoes/${older.slug}`} className="expnav__link expnav__link--prev">
              <span className="expnav__dir">← parada anterior</span>
              <span className="expnav__title">{older.title}</span>
            </Link>
          ) : <span />}
          {newer ? (
            <Link href={`/exploracoes/${newer.slug}`} className="expnav__link expnav__link--next">
              <span className="expnav__dir">próxima parada →</span>
              <span className="expnav__title">{newer.title}</span>
            </Link>
          ) : <span />}
        </nav>
      ) : null}

      {/* LEIA TAMBÉM */}
      {others.length ? (
        <section className="section-tight container container-wide">
          <div className="section-head"><h2 className="heading h2">Leia também</h2><Link href="/diario" className="tag">todo o diário</Link></div>
          <div className="grid grid-3">
            {others.map((o, i) => <ExplorationCard key={o.id} exp={o} place={otherPlaces[i] ?? undefined} />)}
          </div>
        </section>
      ) : null}

      {/* COMENTÁRIOS (Giscus, se configurado) */}
      <Comments />
      <div style={{ paddingBottom: '4rem' }} />
    </article>
  );
}
