'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface PlanPlace {
  slug: string;
  name: string;
  hood: string;
  free: boolean;
  favorite: boolean;
  categories: string[];
  rating: number;
}

export function PlanTool({ places, cats }: { places: PlanPlace[]; cats: { slug: string; name: string }[] }) {
  const [cat, setCat] = useState('all');
  const [free, setFree] = useState(false);
  const [fav, setFav] = useState(false);

  const results = useMemo(
    () =>
      places
        .filter((p) => (cat === 'all' || p.categories.includes(cat)) && (!free || p.free) && (!fav || p.favorite))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8),
    [places, cat, free, fav],
  );

  return (
    <div className="plantool">
      <div className="plantool__controls">
        <label className="plantool__field">
          <span className="field__label">Categoria</span>
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">Qualquer uma</option>
            {cats.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className={`chip ${free ? 'is-on' : ''}`} aria-pressed={free} onClick={() => setFree((v) => !v)}>Só de graça</button>
        <button type="button" className={`chip ${fav ? 'is-on' : ''}`} aria-pressed={fav} onClick={() => setFav((v) => !v)}>Favoritos</button>
        <span className="plantool__count">{results.length} {results.length === 1 ? 'lugar' : 'lugares'}</span>
      </div>

      {results.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '1rem' }}>Nenhum lugar com esses filtros. Afrouxa um pouco. 😉</div>
      ) : (
        <div className="plantool__results">
          {results.map((p) => (
            <Link key={p.slug} href={`/lugares/${p.slug}`} className="plantool__card">
              <div className="plantool__name">{p.name}</div>
              <div className="plantool__meta">
                {p.hood ? <span>{p.hood}</span> : null}
                {p.free ? <span className="plantool__tag">grátis</span> : null}
                {p.rating ? <span className="plantool__stars">{'★'.repeat(Math.round(p.rating))}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
