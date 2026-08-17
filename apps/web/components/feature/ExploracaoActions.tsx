'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function ExploracaoActions({ slug, title, status }: { slug: string; title: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(next: 'publicado' | 'rascunho') {
    setBusy(true);
    await fetch(`/api/explorations/${slug}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
    setBusy(false);
  }

  async function remove() {
    if (!confirm(`Excluir "${title}"? Isso apaga a exploração de vez.`)) return;
    setBusy(true);
    await fetch(`/api/explorations/${slug}`, { method: 'DELETE' });
    router.refresh();
    setBusy(false);
  }

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {status === 'publicado' ? (
        <>
          <Link href={`/exploracoes/${slug}`} className="tag" target="_blank">ver ↗</Link>
          <button type="button" className="tag" disabled={busy} onClick={() => setStatus('rascunho')}>despublicar</button>
        </>
      ) : (
        <button type="button" className="tag" style={{ borderColor: 'var(--green)', color: 'var(--green)' }} disabled={busy} onClick={() => setStatus('publicado')}>publicar</button>
      )}
      <Link href={`/admin/exploracoes/${slug}/editar`} className="tag">editar</Link>
      <button type="button" className="tag" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} disabled={busy} onClick={remove}>excluir</button>
    </div>
  );
}
