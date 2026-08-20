'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'tsp-saved';
interface Saved { slug: string; title: string; place?: string; at: number }

export function SavedList() {
  const [items, setItems] = useState<Saved[] | null>(null);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]') as Saved[]); } catch { setItems([]); }
  }, []);

  function remove(slug: string) {
    const list = (items || []).filter((x) => x.slug !== slug);
    setItems(list);
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
  }

  if (items === null) return <div className="empty-state">Carregando…</div>;
  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '3rem 1rem' }}>
        Você ainda não salvou nada. Abra uma exploração e toque em <strong>☆ Ler depois</strong> — ela aparece aqui, só no seu navegador.
      </div>
    );
  }
  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      {items.map((it) => (
        <div key={it.slug} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', padding: '1.2rem 0', borderBottom: '1px solid var(--border)' }}>
          <Link href={`/exploracoes/${it.slug}`}>
            <div className="h3" style={{ fontSize: '1.2rem' }}>{it.title}</div>
            {it.place ? <span className="coord">{it.place}</span> : null}
          </Link>
          <button type="button" className="tag" onClick={() => remove(it.slug)} style={{ flex: 'none' }}>remover</button>
        </div>
      ))}
    </div>
  );
}
