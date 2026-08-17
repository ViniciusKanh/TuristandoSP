'use client';

import { useRef, useState } from 'react';

async function downscale(file: File, maxDim = 1600, quality = 0.82): Promise<{ blob: Blob; w: number; h: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas indisponível');
    ctx.drawImage(img, 0, 0, w, h);
    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('falha ao converter'))), 'image/jpeg', quality),
    );
    return { blob, w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImageUpload({
  value,
  onChange,
  alt = '',
  aspect = '16 / 9',
}: {
  value?: string;
  onChange: (url: string) => void;
  alt?: string;
  aspect?: string;
}) {
  const [preview, setPreview] = useState(value ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setMsg('reduzindo e enviando…');
    try {
      const { blob, w, h } = await downscale(file);
      const fd = new FormData();
      fd.append('file', new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
      fd.append('width', String(w));
      fd.append('height', String(h));
      fd.append('alt', alt);
      const res = await fetch('/api/images', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j?.error?.message ?? 'Falha no upload.');
        return;
      }
      setPreview(j.data.url);
      onChange(j.data.url);
      setMsg(`✓ salvo no banco (${Math.round((j.data.size ?? 0) / 1024)} KB)`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        className="photo"
        style={{ aspectRatio: aspect, border: '1px dashed var(--border-strong)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={alt || 'prévia'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span className="u-label" style={{ color: 'var(--text-faint)' }}>Clique para enviar uma foto</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? 'Enviando…' : preview ? 'Trocar foto' : 'Enviar foto'}
        </button>
        {preview ? (
          <button type="button" className="tag" onClick={() => { setPreview(''); onChange(''); setMsg(''); }}>remover</button>
        ) : null}
        {msg ? <span className="coord">{msg}</span> : null}
      </div>
      <label className="field" style={{ marginTop: '0.6rem' }}>
        <span className="field__label">ou cole uma URL</span>
        <input className="input" value={preview.startsWith('/api/images/') ? '' : preview} onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }} placeholder="https://…" />
      </label>
    </div>
  );
}
