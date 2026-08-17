'use client';

import { useRef, useState } from 'react';

export interface UploadedPhoto {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

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
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('falha'))), 'image/jpeg', quality));
    return { blob, w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function MultiImageUpload({
  value,
  onChange,
  max = 20,
}: {
  value: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleFiles(files: FileList) {
    const room = max - value.length;
    if (room <= 0) {
      setMsg(`Limite de ${max} fotos atingido.`);
      return;
    }
    const list = Array.from(files).slice(0, room);
    setBusy(true);
    const added: UploadedPhoto[] = [];
    for (let i = 0; i < list.length; i++) {
      setMsg(`Enviando ${i + 1}/${list.length}…`);
      try {
        const { blob, w, h } = await downscale(list[i]!);
        const fd = new FormData();
        fd.append('file', new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
        fd.append('width', String(w));
        fd.append('height', String(h));
        const res = await fetch('/api/images', { method: 'POST', body: fd });
        const j = await res.json();
        if (res.ok) added.push({ url: j.data.url, width: w, height: h, alt: '', caption: '' });
      } catch {
        /* ignora a que falhou */
      }
    }
    onChange([...value, ...added]);
    setBusy(false);
    setMsg(`${value.length + added.length}/${max} fotos`);
  }

  function update(i: number, patch: Partial<UploadedPhoto>) {
    onChange(value.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const copy = [...value];
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    onChange(copy);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()} disabled={busy || value.length >= max}>
          {busy ? 'Enviando…' : `+ Adicionar fotos (${value.length}/${max})`}
        </button>
        {msg ? <span className="coord">{msg}</span> : null}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && handleFiles(e.target.files)} />

      {value.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 1rem' }}>Nenhuma foto ainda. A primeira vira a capa.</div>
      ) : (
        <div className="grid grid-4" style={{ gap: '0.8rem' }}>
          {value.map((p, i) => (
            <div key={p.url} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface)' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.alt || 'foto'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {i === 0 ? <span className="exp-card__badge" style={{ top: '0.4rem', left: '0.4rem' }}>Capa</span> : null}
              </div>
              <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input className="input" style={{ padding: '0.4rem 0.5rem', fontSize: '0.82rem' }} placeholder="Legenda (opcional)" value={p.caption ?? ''} onChange={(e) => update(i, { caption: e.target.value })} />
                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'space-between' }}>
                  <button type="button" className="tag" onClick={() => move(i, -1)} disabled={i === 0}>←</button>
                  <button type="button" className="tag" onClick={() => move(i, 1)} disabled={i === value.length - 1}>→</button>
                  <button type="button" className="tag" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => remove(i)}>remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
