'use client';

import { useState } from 'react';

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.origin + path : path;
    // Web Share API (celular) quando disponível
    if (typeof navigator !== 'undefined' && (navigator as Navigator & { share?: unknown }).share) {
      try {
        await (navigator as Navigator & { share: (d: { title: string; url: string }) => Promise<void> }).share({ title, url });
        return;
      } catch {
        /* usuário cancelou → cai pro copiar */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={share}>
      {copied ? '✓ Link copiado' : 'Compartilhar'}
    </button>
  );
}
