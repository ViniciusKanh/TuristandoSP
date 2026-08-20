'use client';

import { useState } from 'react';

/** Endereço → coordenadas via Nominatim (OpenStreetMap, grátis). */
export function GeocodeButton({ getQuery, onResult }: { getQuery: () => string; onResult: (lat: number, lng: number) => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function go() {
    const q = getQuery().trim();
    if (!q) { setMsg('Preencha o endereço ou bairro primeiro.'); return; }
    setBusy(true);
    setMsg('Buscando no mapa…');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(`${q}, São Paulo, SP`)}`;
      const r = await fetch(url, { headers: { accept: 'application/json' } });
      const j = (await r.json()) as { lat: string; lon: string }[];
      if (Array.isArray(j) && j[0]) {
        onResult(Math.round(parseFloat(j[0].lat) * 1e6) / 1e6, Math.round(parseFloat(j[0].lon) * 1e6) / 1e6);
        setMsg('✓ Coordenadas preenchidas — confira no mapa.');
      } else {
        setMsg('Não encontrei esse endereço. Ajuste direto no mapa.');
      }
    } catch {
      setMsg('Falha na busca. Ajuste direto no mapa.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={go} disabled={busy}>
        {busy ? 'Buscando…' : '📍 Buscar coordenadas pelo endereço'}
      </button>
      {msg ? <span className="coord">{msg}</span> : null}
    </div>
  );
}
