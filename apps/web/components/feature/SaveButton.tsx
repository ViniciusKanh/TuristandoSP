'use client';

import { useEffect, useState } from 'react';

const KEY = 'tsp-saved';

interface Saved { slug: string; title: string; place?: string; at: number }

/** Salvar exploração para "ler depois" (localStorage, sem login). */
export function SaveButton({ slug, title, place }: { slug: string; title: string; place?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) || '[]') as Saved[];
      setSaved(list.some((x) => x.slug === slug));
    } catch { /* noop */ }
  }, [slug]);

  function toggle() {
    try {
      let list = JSON.parse(localStorage.getItem(KEY) || '[]') as Saved[];
      if (list.some((x) => x.slug === slug)) {
        list = list.filter((x) => x.slug !== slug);
        setSaved(false);
      } else {
        list.unshift({ slug, title, place, at: Date.now() });
        setSaved(true);
      }
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
    } catch { /* noop */ }
  }

  return (
    <button type="button" className={`savebtn ${saved ? 'is-saved' : ''}`} onClick={toggle} aria-pressed={saved}>
      {saved ? '★ Salvo' : '☆ Ler depois'}
    </button>
  );
}
