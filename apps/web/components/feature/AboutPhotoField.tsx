'use client';

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';

export function AboutPhotoField({ initial }: { initial: string }) {
  const [saved, setSaved] = useState('');
  async function save(url: string) {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ aboutPhotoUrl: url }),
    });
    setSaved(url ? '✓ foto salva' : '✓ foto removida');
  }
  return (
    <div>
      <ImageUpload value={initial} onChange={save} alt="Foto da página Sobre" aspect="1 / 1" />
      {saved ? <p className="mono" style={{ color: 'var(--green)', marginTop: '0.5rem', fontSize: '0.8rem' }}>{saved}</p> : null}
    </div>
  );
}
