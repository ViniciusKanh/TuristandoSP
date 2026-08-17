'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from '../brand/Icons';

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/busca?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} className={`header-search ${open ? 'is-open' : ''}`}>
      <button type="button" className="icon-btn" aria-label="Buscar" onClick={() => setOpen((o) => !o)}>
        <Search aria-hidden />
      </button>
      <input
        className="header-search__input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar lugares, bairros…"
        aria-label="Buscar no site"
      />
    </form>
  );
}
