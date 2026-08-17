'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categoryHue, type MapMarker } from '@turistando/core';

const FILTERS = [
  { key: 'all', label: 'Tudo' },
  { key: 'museus', label: 'Museus' },
  { key: 'parques', label: 'Parques' },
  { key: 'gastronomia', label: 'Comer' },
  { key: 'cafes', label: 'Café' },
  { key: 'cultura', label: 'Cultura' },
  { key: 'historia', label: 'História' },
  { key: 'arquitetura', label: 'Arquitetura' },
  { key: 'mirantes', label: 'Mirantes' },
  { key: 'free', label: 'Grátis' },
];

export function MapCanvas({ markers }: { markers: MapMarker[] }) {
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState<string | null>(null);

  const bounds = useMemo(() => {
    const lats = markers.map((m) => m.geo.lat);
    const lngs = markers.map((m) => m.geo.lng);
    const pad = 0.02;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [markers]);

  const W = 100;
  const H = 62.5;
  const project = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * W;
    const y = H - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * H;
    return { x, y };
  };

  const visible = markers.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'free') return m.free;
    return m.categories.includes(filter);
  });

  const activeMarker = markers.find((m) => m.slug === active);

  return (
    <div>
      <div className="chips" style={{ marginBottom: '1.25rem' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className="chip"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="map-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa de lugares explorados em São Paulo">
          <defs>
            <pattern id="mapgrid" width="6.25" height="6.25" patternUnits="userSpaceOnUse">
              <path d="M6.25 0H0V6.25" fill="none" stroke="var(--border)" strokeWidth="0.15" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#mapgrid)" />
          {/* linhas cartográficas ligando ao marco zero */}
          {visible.map((m) => {
            const p = project(m.geo.lat, m.geo.lng);
            const c = project(-23.5505, -46.6333);
            return (
              <line
                key={`l-${m.slug}`}
                x1={c.x}
                y1={c.y}
                x2={p.x}
                y2={p.y}
                stroke="var(--border-strong)"
                strokeWidth="0.15"
                strokeDasharray="0.8 0.8"
                opacity="0.5"
              />
            );
          })}
          {/* marcadores */}
          {visible.map((m) => {
            const p = project(m.geo.lat, m.geo.lng);
            const hue = categoryHue[m.categories[0] ?? 'museus'] ?? m.hue;
            const isActive = m.slug === active;
            const stroke = m.favorite ? 'var(--terracotta)' : m.wantToReturn ? 'var(--accent)' : 'var(--primary)';
            return (
              <g key={m.slug} onClick={() => setActive(isActive ? null : m.slug)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={isActive ? 2.4 : 1.7} fill={`hsl(${hue} 45% 45%)`} stroke={stroke} strokeWidth="0.6" />
                {m.explorations > 1 ? (
                  <text x={p.x} y={p.y + 0.7} fontSize="1.8" textAnchor="middle" fill="#fff" style={{ fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}>
                    {m.explorations}
                  </text>
                ) : null}
              </g>
            );
          })}
          {/* marco zero */}
          {(() => {
            const c = project(-23.5505, -46.6333);
            return (
              <g>
                <circle cx={c.x} cy={c.y} r="2" fill="var(--accent)" stroke="var(--primary)" strokeWidth="0.5" />
                <text x={c.x + 3} y={c.y + 0.7} fontSize="2" fill="var(--text)" style={{ fontFamily: 'var(--font-mono)' }}>SÉ · MARCO ZERO</text>
              </g>
            );
          })()}
        </svg>

        {activeMarker ? (
          <div
            className="map-popup"
            style={{
              left: `${project(activeMarker.geo.lat, activeMarker.geo.lng).x}%`,
              top: `${project(activeMarker.geo.lat, activeMarker.geo.lng).y}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <span className="u-label" style={{ color: 'var(--text-faint)' }}>{activeMarker.neighborhood}</span>
            <div className="h3" style={{ fontSize: '1.05rem', margin: '0.2rem 0' }}>{activeMarker.name}</div>
            <div className="coord" style={{ marginBottom: '0.5rem' }}>
              {activeMarker.explorations} {activeMarker.explorations === 1 ? 'exploração' : 'explorações'} · {activeMarker.free ? 'grátis' : 'pago'}
            </div>
            <Link href={`/lugares/${activeMarker.slug}`} className="btn btn-sm">Abrir lugar</Link>
          </div>
        ) : null}
      </div>

      <div className="map-legend">
        <span><span className="legend-dot" style={{ borderColor: 'var(--terracotta)' }} /> Favorito</span>
        <span><span className="legend-dot" style={{ borderColor: 'var(--accent)' }} /> Quero voltar</span>
        <span><span className="legend-dot" style={{ borderColor: 'var(--primary)' }} /> Visitado</span>
        <span className="coord">{visible.length} de {markers.length} lugares</span>
      </div>
    </div>
  );
}
