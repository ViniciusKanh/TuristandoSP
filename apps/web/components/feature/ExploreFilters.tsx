'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Photo } from '../brand/Photo';
import type { PhotoRef } from '@turistando/core';

export interface ExploreItem {
  slug: string;
  name: string;
  shortDescription: string;
  neighborhoodName: string;
  region: string;
  categories: string[];
  tags: string[];
  free: boolean;
  priceMax: number;
  minutes: number;
  hasMetro: boolean;
  hasTrain: boolean;
  cover: PhotoRef;
}

const WANT = [
  { key: 'cultura', label: 'Cultura' },
  { key: 'parques', label: 'Natureza' },
  { key: 'gastronomia', label: 'Comer' },
  { key: 'cafes', label: 'Tomar café' },
  { key: 'historia', label: 'História' },
  { key: 'arquitetura', label: 'Arquitetura' },
  { key: 'fotografia', label: 'Fotografar' },
  { key: 'lugares-curiosos', label: 'Algo diferente' },
];
const BUDGET = [
  { key: 'free', label: 'Grátis', max: 0 },
  { key: '30', label: 'Até R$30', max: 30 },
  { key: '60', label: 'Até R$60', max: 60 },
  { key: '100', label: 'Até R$100', max: 100 },
  { key: 'any', label: 'Tanto faz', max: Infinity },
];
const TIME = [
  { key: '60', label: 'Até 1 hora', max: 60 },
  { key: '120', label: 'Até 2 horas', max: 120 },
  { key: '240', label: 'Meio período', max: 240 },
  { key: 'day', label: 'Dia inteiro', max: Infinity },
];
const REGION = [
  { key: 'centro', label: 'Centro' },
  { key: 'zona-norte', label: 'Zona Norte' },
  { key: 'zona-sul', label: 'Zona Sul' },
  { key: 'zona-leste', label: 'Zona Leste' },
  { key: 'zona-oeste', label: 'Zona Oeste' },
];
const TRANSPORT = [
  { key: 'metro', label: 'Metrô perto' },
  { key: 'trem', label: 'Trem perto' },
  { key: 'free', label: 'A pé/grátis' },
];

export function ExploreFilters({ items }: { items: ExploreItem[] }) {
  const [want, setWant] = useState<string | null>(null);
  const [budget, setBudget] = useState<string>('any');
  const [time, setTime] = useState<string>('day');
  const [region, setRegion] = useState<string | null>(null);
  const [transport, setTransport] = useState<string | null>(null);

  const results = useMemo(() => {
    const budgetMax = BUDGET.find((b) => b.key === budget)?.max ?? Infinity;
    const timeMax = TIME.find((t) => t.key === time)?.max ?? Infinity;
    return items.filter((it) => {
      if (want && !it.categories.includes(want) && !it.tags.includes(want)) return false;
      if (budget === 'free' ? !it.free : it.priceMax > budgetMax) return false;
      if (it.minutes > timeMax) return false;
      if (region && it.region !== region) return false;
      if (transport === 'metro' && !it.hasMetro) return false;
      if (transport === 'trem' && !it.hasTrain) return false;
      if (transport === 'free' && !it.free) return false;
      return true;
    });
  }, [items, want, budget, time, region, transport]);

  const toggle = (cur: string | null, val: string, set: (v: string | null) => void) =>
    set(cur === val ? null : val);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 'clamp(1.5rem, 4vw, 3.5rem)', alignItems: 'start' }} className="explore-layout">
      <aside>
        <Group label="Quero">
          {WANT.map((o) => (
            <Chip key={o.key} on={want === o.key} onClick={() => toggle(want, o.key, setWant)}>{o.label}</Chip>
          ))}
        </Group>
        <Group label="Quanto gastar">
          {BUDGET.map((o) => (
            <Chip key={o.key} on={budget === o.key} onClick={() => setBudget(o.key)}>{o.label}</Chip>
          ))}
        </Group>
        <Group label="Tenho">
          {TIME.map((o) => (
            <Chip key={o.key} on={time === o.key} onClick={() => setTime(o.key)}>{o.label}</Chip>
          ))}
        </Group>
        <Group label="Região">
          {REGION.map((o) => (
            <Chip key={o.key} on={region === o.key} onClick={() => toggle(region, o.key, setRegion)}>{o.label}</Chip>
          ))}
        </Group>
        <Group label="Transporte">
          {TRANSPORT.map((o) => (
            <Chip key={o.key} on={transport === o.key} onClick={() => toggle(transport, o.key, setTransport)}>{o.label}</Chip>
          ))}
        </Group>
      </aside>

      <div>
        <div className="section-head" style={{ marginBottom: '1.5rem' }}>
          <span className="u-label">{results.length} {results.length === 1 ? 'resultado' : 'resultados'}</span>
        </div>
        {results.length === 0 ? (
          <div className="empty-state">
            Nenhum lugar combina com esses filtros ainda. Afrouxa um critério — a cidade é grande, mas o diário ainda está no começo.
          </div>
        ) : (
          <div className="grid grid-2">
            {results.map((it) => (
              <Link key={it.slug} href={`/lugares/${it.slug}`} className="exp-card">
                <div className="exp-card__media" style={{ aspectRatio: '16/9' }}>
                  <Photo photo={it.cover} />
                </div>
                <div className="exp-card__body">
                  <span className="u-label" style={{ color: 'var(--text-faint)' }}>{it.neighborhoodName}</span>
                  <h3 className="exp-card__title">{it.name}</h3>
                  <p className="muted" style={{ fontSize: '0.92rem' }}>{it.shortDescription.slice(0, 90)}…</p>
                  <div className="exp-card__meta">
                    <span className="coord">{it.free ? 'GRÁTIS' : `ATÉ R$${it.priceMax}`}</span>
                    <span className="coord">{Math.round(it.minutes / 60) || 1}H</span>
                    {it.hasMetro ? <span className="coord">METRÔ</span> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="filter-group">
      <div className="filter-group__label">{label}</div>
      <div className="chips">{children}</div>
    </div>
  );
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}
