'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface FeedItem {
  slug: string;
  number: number;
  title: string;
  dateText: string;
  durationText: string;
  priceText: string;
  ratingOverall: number;
  placeName: string;
  neighborhoodName: string;
  cover: { url: string; demo: boolean; hue: number; alt: string };
}

function expNo(n: number) {
  return `EXP.${String(n).padStart(3, '0')}`;
}

function FeedCard({ it }: { it: FeedItem }) {
  const real = it.cover.url && !it.cover.demo;
  const hue = it.cover.hue;
  const full = Math.round(it.ratingOverall);
  return (
    <Link href={`/exploracoes/${it.slug}`} className="exp-card reveal">
      <div className="exp-card__media">
        {real ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={it.cover.url} alt={it.cover.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, hsl(${hue} 34% 30%), hsl(${(hue + 18) % 360} 30% 20%))` }} />
        )}
        <span className="exp-card__badge">{expNo(it.number)}</span>
      </div>
      <div className="exp-card__body">
        <span className="u-label" style={{ color: 'var(--text-faint)' }}>{it.placeName}{it.neighborhoodName ? ` · ${it.neighborhoodName}` : ''}</span>
        <h3 className="exp-card__title">{it.title}</h3>
        {it.ratingOverall ? (
          <span className="rating" aria-label={`${it.ratingOverall} de 5`}>
            {Array.from({ length: 5 }, (_, i) => <span key={i} className={i < full ? '' : 'off'}>★</span>)}
          </span>
        ) : null}
        <div className="exp-card__meta">
          <span className="coord">{it.dateText}</span>
          <span className="coord">{it.durationText}</span>
          <span className="coord">{it.priceText === 'Grátis' ? 'GRÁTIS' : it.priceText}</span>
        </div>
      </div>
    </Link>
  );
}

export function InfiniteFeed({ initial, total, pageSize = 12 }: { initial: FeedItem[]; total: number; pageSize?: number }) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [loading, setLoading] = useState(false);
  const done = items.length >= total;
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || items.length >= total) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?offset=${items.length}&limit=${pageSize}`);
      const j = await res.json();
      setItems((cur) => [...cur, ...(j.data ?? [])]);
    } finally {
      setLoading(false);
    }
  }, [items.length, total, loading, pageSize]);

  useEffect(() => {
    if (done) return;
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, done]);

  return (
    <>
      <div className="grid grid-4">
        {items.map((it) => <FeedCard key={it.slug} it={it} />)}
      </div>
      {!done ? (
        <div ref={sentinel} style={{ display: 'grid', placeItems: 'center', padding: '2rem' }}>
          <button type="button" className="btn btn-ghost" onClick={loadMore} disabled={loading}>
            {loading ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      ) : (
        <p className="coord" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-faint)' }}>
          {total} {total === 1 ? 'parada' : 'paradas'} · você chegou ao começo de tudo.
        </p>
      )}
    </>
  );
}
