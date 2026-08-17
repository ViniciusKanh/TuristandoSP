'use client';

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';

export function HeroImageField({ initial }: { initial: string }) {
  const [saved, setSaved] = useState('');
  async function save(url: string) {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ heroImageUrl: url }),
    });
    setSaved(url ? '✓ fundo salvo' : '✓ fundo removido');
  }
  return (
    <div>
      <ImageUpload value={initial} onChange={save} alt="Imagem de fundo da Home" aspect="16 / 6" />
      {saved ? <p className="mono" style={{ color: 'var(--green)', marginTop: '0.5rem', fontSize: '0.8rem' }}>{saved}</p> : null}
    </div>
  );
}
