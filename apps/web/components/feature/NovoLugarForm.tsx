'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories, REGIONS, DISTRICT_REGION } from '@turistando/core';
import { SPMap } from './SPMap';
import { ImageUpload } from './ImageUpload';

export interface PlaceFormInitial {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  neighborhoodName: string;
  region: string;
  lat: number;
  lng: number;
  categories: string[];
  tags: string[];
  priceMin: number;
  priceMax: number;
  free: boolean;
  favorite: boolean;
  wantToReturn: boolean;
  website: string;
  instagram: string;
  hours: string;
  coverImageUrl: string;
  recommendedMinutes?: number;
  cep: string;
  street: string;
  rating?: number;
  stationName?: string;
  stationType?: string;
  stationMinutes?: number;
}

interface District { name: string; slug: string; region: string }

export function PlaceForm({ initial }: { initial?: PlaceFormInitial }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [lat, setLat] = useState(initial?.lat ?? -23.5505);
  const [lng, setLng] = useState(initial?.lng ?? -46.6333);
  const [bairro, setBairro] = useState(initial?.neighborhoodName ?? '');
  const [region, setRegion] = useState(initial?.region ?? 'centro');
  const [cats, setCats] = useState<string[]>(initial?.categories ?? []);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cep, setCep] = useState(initial?.cep ?? '');
  const [street, setStreet] = useState(initial?.street ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? '');
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [cepMsg, setCepMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/geo/neighborhoods')
      .then((r) => r.json())
      .then((j) => setDistricts(j.data ?? []))
      .catch(() => setDistricts([]));
  }, []);

  function onBairro(value: string) {
    setBairro(value);
    const reg = DISTRICT_REGION[value];
    if (reg) setRegion(reg);
  }

  async function buscarCep() {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepMsg('CEP precisa ter 8 dígitos.');
      return;
    }
    setCepMsg('buscando…');
    try {
      const r = await fetch(`/api/geo/cep?cep=${digits}`);
      const j = await r.json();
      if (!r.ok) {
        setCepMsg(j?.error?.message ?? 'CEP não encontrado.');
        return;
      }
      if (j.data.bairro) onBairro(j.data.bairro);
      if (j.data.logradouro) setStreet(j.data.logradouro);
      setCepMsg(`✓ ${j.data.logradouro || ''}${j.data.bairro ? ' · ' + j.data.bairro : ''}`);
    } catch {
      setCepMsg('Falha ao buscar o CEP.');
    }
  }

  function toggleCat(slug: string) {
    setCats((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      shortDescription: fd.get('shortDescription'),
      description: fd.get('description') || '',
      neighborhood: bairro,
      region,
      cep,
      street,
      lat,
      lng,
      categories: cats,
      tags: String(fd.get('tags') || '').split(',').map((s) => s.trim()).filter(Boolean),
      priceMin: Number(fd.get('priceMin') || 0),
      priceMax: Number(fd.get('priceMax') || 0),
      free: fd.get('free') === 'on',
      favorite: fd.get('favorite') === 'on',
      wantToReturn: fd.get('wantToReturn') === 'on',
      website: fd.get('website') || '',
      instagram: fd.get('instagram') || '',
      hours: fd.get('hours') || '',
      coverImageUrl: coverImageUrl || '',
      recommendedMinutes: fd.get('recommendedMinutes') ? Number(fd.get('recommendedMinutes')) : undefined,
      rating,
      stationName: fd.get('stationName') || '',
      stationType: fd.get('stationType') || 'metro',
      stationMinutes: fd.get('stationMinutes') ? Number(fd.get('stationMinutes')) : undefined,
    };
    const url = editing ? `/api/places/${initial!.slug}` : '/api/places';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const { data } = await res.json();
      router.push(`/lugares/${data.slug}`);
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err?.error?.message ?? 'Não deu para salvar. Confira os campos.');
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm(`Excluir "${initial.name}"? Isso remove o lugar do mapa e do catálogo.`)) return;
    setSubmitting(true);
    const res = await fetch(`/api/places/${initial.slug}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/lugares');
      router.refresh();
    } else {
      setError('Não deu para excluir.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)', gap: 'clamp(1.5rem,4vw,2.5rem)', alignItems: 'start' }} className="feature-split">
      <div className="stack">
        <Field label="Nome do lugar" required>
          <input className="input" name="name" required defaultValue={initial?.name} placeholder="Ex.: Museu da Língua Portuguesa" />
        </Field>
        <Field label="Descrição curta" required>
          <input className="input" name="shortDescription" required defaultValue={initial?.shortDescription} placeholder="Uma frase que resume o lugar" />
        </Field>
        <Field label="Descrição completa">
          <textarea className="input" name="description" rows={3} defaultValue={initial?.description} placeholder="O que é, por que vale, o que esperar" />
        </Field>

        <Field label="CEP (opcional — preenche bairro e endereço)">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input className="input mono" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="01120-010" />
            <button type="button" className="btn btn-ghost btn-sm" onClick={buscarCep} style={{ flex: 'none' }}>Buscar</button>
          </div>
          {cepMsg ? <span className="coord" style={{ marginTop: '0.35rem' }}>{cepMsg}</span> : null}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.75rem' }}>
          <Field label="Bairro" required>
            <input className="input" list="bairros-sp" value={bairro} onChange={(e) => onBairro(e.target.value)} required placeholder="Digite ou escolha…" autoComplete="off" />
            <datalist id="bairros-sp">
              {districts.map((d) => <option key={d.slug} value={d.name} />)}
            </datalist>
          </Field>
          <Field label="Região">
            <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
            </select>
          </Field>
        </div>
        <span className="coord">{districts.length ? `${districts.length} bairros de São Paulo carregados` : 'carregando bairros…'}</span>

        <Field label="Endereço (rua)"><input className="input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua / Avenida" /></Field>

        <Field label="Categorias">
          <div className="chips">
            {categories.map((c) => (
              <button type="button" key={c.slug} className="chip" aria-pressed={cats.includes(c.slug)} onClick={() => toggleCat(c.slug)}>{c.name}</button>
            ))}
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <Field label="Preço mín (R$)"><input className="input" name="priceMin" type="number" min="0" step="0.01" defaultValue={initial?.priceMin ?? 0} /></Field>
          <Field label="Preço máx (R$)"><input className="input" name="priceMax" type="number" min="0" step="0.01" defaultValue={initial?.priceMax ?? 0} /></Field>
          <Field label="Tempo (min)"><input className="input" name="recommendedMinutes" type="number" min="0" defaultValue={initial?.recommendedMinutes} placeholder="120" /></Field>
        </div>

        <Field label="Horário"><input className="input" name="hours" defaultValue={initial?.hours} placeholder="Ter–Dom, 9h–17h" /></Field>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
          <Field label="Estação mais próxima"><input className="input" name="stationName" defaultValue={initial?.stationName} placeholder="Ex.: Luz" /></Field>
          <Field label="Tipo">
            <select className="input" name="stationType" defaultValue={initial?.stationType ?? 'metro'}>
              <option value="metro">Metrô</option>
              <option value="trem">Trem</option>
            </select>
          </Field>
          <Field label="Minutos a pé"><input className="input" name="stationMinutes" type="number" min="0" defaultValue={initial?.stationMinutes} placeholder="5" /></Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label="Site"><input className="input" name="website" defaultValue={initial?.website} placeholder="https://…" /></Field>
          <Field label="Instagram"><input className="input" name="instagram" defaultValue={initial?.instagram} placeholder="@perfil" /></Field>
        </div>
        <div className="field">
          <span className="field__label">Foto de capa (guardada no banco)</span>
          <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} alt="Foto de capa do lugar" aspect="16 / 9" />
        </div>
        <Field label="Tags (separadas por vírgula)"><input className="input" name="tags" defaultValue={initial?.tags?.join(', ')} placeholder="gratis, perto-do-metro" /></Field>

        <div className="field">
          <span className="field__label">Minha nota</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n === rating ? 0 : n)}
                aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                style={{ background: 'none', border: 0, padding: 0, lineHeight: 1, fontSize: '1.7rem', color: n <= rating ? 'var(--gold)' : 'var(--border-strong)' }}
              >
                ★
              </button>
            ))}
            {rating ? <span className="coord" style={{ marginLeft: '0.5rem' }}>{rating}/5</span> : <span className="coord" style={{ marginLeft: '0.5rem' }}>opcional</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <label className="check"><input type="checkbox" name="free" defaultChecked={initial?.free} /> Gratuito</label>
          <label className="check"><input type="checkbox" name="favorite" defaultChecked={initial?.favorite} /> Favorito</label>
          <label className="check"><input type="checkbox" name="wantToReturn" defaultChecked={initial?.wantToReturn} /> Quero voltar</label>
        </div>

        {error ? <p style={{ color: 'var(--error)' }}>{error}</p> : null}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-accent" type="submit" disabled={submitting} style={{ justifyContent: 'center' }}>
            {submitting ? 'Salvando…' : editing ? 'Salvar alterações' : 'Salvar e colocar no mapa'}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete} disabled={submitting} style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>Excluir lugar</button>
          ) : null}
        </div>
      </div>

      <div style={{ position: 'sticky', top: '80px' }}>
        <div className="filter-group__label">Marque no mapa (clique ou arraste o pino) — só São Paulo capital</div>
        <SPMap picker initial={{ lat, lng }} onPick={(la, ln) => { setLat(la); setLng(ln); }} height={420} />
        <div className="coord" style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
          <span>LAT {lat.toFixed(6)}</span>
          <span>LNG {lng.toFixed(6)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
          <Field label="Latitude"><input className="input" value={lat} onChange={(e) => setLat(Number(e.target.value))} type="number" step="0.000001" /></Field>
          <Field label="Longitude"><input className="input" value={lng} onChange={(e) => setLng(Number(e.target.value))} type="number" step="0.000001" /></Field>
        </div>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}
