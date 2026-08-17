'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TRANSPORT_LABEL, composeArticle, type ArticleBlock, type PhotoRef, type TransportMode } from '@turistando/core';
import { MultiImageUpload, type UploadedPhoto } from './MultiImageUpload';

interface PlaceOpt { slug: string; name: string; neighborhoodName: string }
interface Expense { label: string; category: string; amount: string }

export interface ExploracaoInitial {
  slug: string;
  placeSlug: string;
  title: string;
  subtitle?: string;
  date: string;
  durationMinutes: number;
  transport: { mode: TransportMode }[];
  expenses: { label: string; category: string; amount: number }[];
  rating: { overall: number; wouldReturn: string };
  photos: UploadedPhoto[];
  article: ArticleBlock[];
  tags: string[];
}

const MODES: TransportMode[] = ['metro', 'trem', 'onibus', 'carro', 'bike', 'a-pe', 'outro'];
const EXPENSE_CATS = [
  { v: 'entrada', l: 'Entrada' },
  { v: 'transporte', l: 'Transporte' },
  { v: 'alimentacao', l: 'Alimentação' },
  { v: 'estacionamento', l: 'Estacionamento' },
  { v: 'outros', l: 'Outros' },
];

export function ExploracaoForm({ places, initial }: { places: PlaceOpt[]; initial?: ExploracaoInitial }) {
  const router = useRouter();
  const editing = Boolean(initial);
  const today = new Date().toISOString().slice(0, 10);
  // reconstrói o texto solto a partir dos parágrafos, para permitir reorganizar
  const initialRaw = initial
    ? initial.article.filter((b) => b.type === 'paragraph').map((b) => (b as { text: string }).text).join('\n\n')
    : '';
  const [placeSlug, setPlaceSlug] = useState(initial?.placeSlug ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [date, setDate] = useState(initial?.date ?? today);
  const [duration, setDuration] = useState(initial?.durationMinutes ? String(initial.durationMinutes) : '');
  const [modes, setModes] = useState<TransportMode[]>(initial?.transport.map((t) => t.mode) ?? []);
  const [expenses, setExpenses] = useState<Expense[]>(initial?.expenses.map((e) => ({ label: e.label, category: e.category, amount: String(e.amount) })) ?? []);
  const [ratingOverall, setRatingOverall] = useState(initial?.rating.overall ?? 0);
  const [wouldReturn, setWouldReturn] = useState(initial?.rating.wouldReturn ?? 'com-certeza');
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initial?.photos ?? []);
  const [rawText, setRawText] = useState(initialRaw);
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [blocks, setBlocks] = useState<ArticleBlock[] | null>(initial?.article ?? null);
  const [organizing, setOrganizing] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const place = useMemo(() => places.find((p) => p.slug === placeSlug), [places, placeSlug]);

  // Preview do jornal: intercala as fotos ATUAIS (mesma lógica da página publicada).
  const previewBlocks = useMemo(() => {
    const refs: PhotoRef[] = photos.map((p, i) => ({
      id: `prev-${i}`, url: p.url, demo: false, width: p.width, height: p.height, alt: p.alt || title, caption: p.caption, order: i,
    }));
    return composeArticle(blocks ?? [], refs);
  }, [blocks, photos, title]);

  function toggleMode(m: TransportMode) {
    setModes((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  }

  async function organize() {
    if (!rawText.trim()) { setAiMsg('Escreva o relato primeiro.'); return; }
    setOrganizing(true);
    setAiMsg('Organizando com o Gemini…');
    try {
      const res = await fetch('/api/ai/organize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          placeName: place?.name,
          neighborhood: place?.neighborhoodName,
          date,
          rawText,
          photos: photos.map((p) => ({ url: p.url, width: p.width, height: p.height, alt: p.alt || '', caption: p.caption })),
        }),
      });
      const j = await res.json();
      const data = j.data ?? {};
      setBlocks(data.blocks ?? []);
      if (data.title && !title) setTitle(data.title);
      if (data.subtitle && !subtitle) setSubtitle(data.subtitle);
      setAiMsg(data.source === 'gemini' ? '✓ Organizado pelo Gemini. Revise o preview abaixo.' : (data.message ?? 'Organizado no modo local.'));
    } catch (e) {
      setAiMsg('Falha ao organizar: ' + (e as Error).message);
    } finally {
      setOrganizing(false);
    }
  }

  async function submit(status: 'publicado' | 'rascunho') {
    setError(null);
    if (!placeSlug) { setError('Escolha o lugar da visita.'); return; }
    if (title.trim().length < 3) { setError('Dê um título à exploração.'); return; }
    setPublishing(true);
    const body = {
      placeSlug,
      title,
      subtitle,
      date,
      durationMinutes: duration ? Number(duration) : 0,
      transport: modes.map((m) => ({ mode: m })),
      expenses: expenses.filter((e) => e.label && e.amount).map((e) => ({ label: e.label, category: e.category, amount: Number(e.amount) })),
      rating: { overall: ratingOverall, wouldReturn },
      photos: photos.map((p, i) => ({ url: p.url, width: p.width, height: p.height, alt: p.alt || title, caption: p.caption, order: i })),
      article: blocks ?? [],
      rawText,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
    };
    const url = editing ? `/api/explorations/${initial!.slug}` : '/api/explorations';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const { data } = await res.json();
      router.push(`/exploracoes/${data.slug}`);
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err?.error?.message ?? 'Não deu para salvar.');
      setPublishing(false);
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="stack" style={{ gap: '2rem' }}>
      {/* 1. Lugar + data */}
      <Section n="1" title="Onde e quando">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }} className="exp-grid">
          <Field label="Lugar (já cadastrado) *">
            <select className="input" value={placeSlug} onChange={(e) => setPlaceSlug(e.target.value)}>
              <option value="">Selecione…</option>
              {places.map((p) => <option key={p.slug} value={p.slug}>{p.name} — {p.neighborhoodName}</option>)}
            </select>
          </Field>
          <Field label="Data"><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Duração (min)"><input className="input" type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="160" /></Field>
        </div>
        <Field label="Como cheguei">
          <div className="chips">
            {MODES.map((m) => <button key={m} type="button" className="chip" aria-pressed={modes.includes(m)} onClick={() => toggleMode(m)}>{TRANSPORT_LABEL[m]}</button>)}
          </div>
        </Field>
      </Section>

      {/* 2. Fotos */}
      <Section n="2" title="Fotos (até 20)">
        <MultiImageUpload value={photos} onChange={setPhotos} max={20} />
      </Section>

      {/* 3. Relato */}
      <Section n="3" title="Seu relato">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="exp-grid">
          <Field label="Título *"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Uma tarde no Museu da Imigração" /></Field>
          <Field label="Linha fina / subtítulo"><input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Uma frase que resume a visita" /></Field>
        </div>
        <Field label="Relato (escreva solto — o Gemini organiza depois)">
          <textarea className="input" rows={10} value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Conte como foi a visita, o que viu, o que achou. Separe ideias em parágrafos (linha em branco entre eles)." />
        </Field>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-accent" onClick={organize} disabled={organizing}>
            {organizing ? 'Organizando…' : '✦ Organizar com Gemini'}
          </button>
          {aiMsg ? <span className="coord">{aiMsg}</span> : null}
        </div>
      </Section>

      {/* Preview */}
      {previewBlocks.length > 0 ? (
        <Section n="✓" title="Preview do artigo (layout de jornal)">
          <p className="coord" style={{ marginBottom: '1rem' }}>As fotos entram na ordem do gerenciador acima — reordene ou apague por lá e o preview (e o site) acompanham.</p>
          <div className="article" style={{ marginInline: 0 }}>
            {previewBlocks.map((b, i) => <PreviewBlock key={i} b={b} />)}
          </div>
        </Section>
      ) : null}

      {/* 4. Avaliação */}
      <Section n="4" title="Avaliação">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="exp-grid">
          <Field label="Minha nota">
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRatingOverall(n === ratingOverall ? 0 : n)} style={{ background: 'none', border: 0, padding: 0, fontSize: '1.7rem', color: n <= ratingOverall ? 'var(--gold)' : 'var(--border-strong)' }}>★</button>
              ))}
            </div>
          </Field>
          <Field label="Eu voltaria?">
            <select className="input" value={wouldReturn} onChange={(e) => setWouldReturn(e.target.value)}>
              <option value="com-certeza">Com certeza</option>
              <option value="talvez">Talvez</option>
              <option value="nao-prioridade">Não seria prioridade</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* 5. Gastos */}
      <Section n="5" title="Gastos (opcional)">
        {expenses.map((e, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input className="input" placeholder="Descrição" value={e.label} onChange={(ev) => setExpenses(expenses.map((x, ix) => ix === i ? { ...x, label: ev.target.value } : x))} />
            <select className="input" value={e.category} onChange={(ev) => setExpenses(expenses.map((x, ix) => ix === i ? { ...x, category: ev.target.value } : x))}>
              {EXPENSE_CATS.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
            <input className="input" type="number" step="0.01" placeholder="0,00" value={e.amount} onChange={(ev) => setExpenses(expenses.map((x, ix) => ix === i ? { ...x, amount: ev.target.value } : x))} />
            <button type="button" className="tag" onClick={() => setExpenses(expenses.filter((_, ix) => ix !== i))}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setExpenses([...expenses, { label: '', category: 'entrada', amount: '' }])}>+ Gasto</button>
          {totalExpenses > 0 ? <span className="coord">Total: R$ {totalExpenses.toFixed(2)}</span> : null}
        </div>
      </Section>

      {/* 6. Tags + publicar */}
      <Section n="6" title="Publicar">
        <Field label="Tags (vírgula)"><input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="museu, centro, imperdivel" /></Field>
        {error ? <p style={{ color: 'var(--error)' }}>{error}</p> : null}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button type="button" className="btn" onClick={() => submit('publicado')} disabled={publishing}>{publishing ? 'Salvando…' : editing ? 'Salvar e publicar' : 'Publicar exploração'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => submit('rascunho')} disabled={publishing}>Salvar rascunho</button>
        </div>
        {!blocks ? <p className="coord" style={{ marginTop: '0.5rem' }}>Dica: clique em "Organizar com Gemini" antes de publicar para o layout de jornal. Sem isso, o texto é publicado em parágrafos simples.</p> : null}
      </Section>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', padding: 'clamp(1.1rem, 3vw, 1.75rem)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
        <span className="mono" style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', background: 'var(--accent)', color: 'var(--on-accent)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>{n}</span>
        <h2 className="heading h3" style={{ fontSize: '1.2rem' }}>{title}</h2>
      </div>
      <div className="stack">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

function PreviewBlock({ b }: { b: ArticleBlock }) {
  switch (b.type) {
    case 'paragraph': return <p>{b.text}</p>;
    case 'heading': return b.level === 3 ? <h3>{b.text}</h3> : <h2>{b.text}</h2>;
    case 'quote': return <blockquote className="quote">“{b.text}”</blockquote>;
    case 'tip': return <div className="callout callout--tip"><div className="callout__title">{b.title ?? 'Minha dica'}</div><p>{b.text}</p></div>;
    case 'info': return <div className="callout callout--info"><div className="callout__title">{b.title ?? 'Vale saber'}</div><p>{b.text}</p></div>;
    case 'warning': return <div className="callout callout--warning"><div className="callout__title">{b.title ?? 'Atenção'}</div><p>{b.text}</p></div>;
    case 'separator': return <hr className="divider" />;
    case 'image': return <figure style={{ margin: 0 }}><div className="photo"><img src={b.photo.url} alt={b.photo.alt} /></div>{b.photo.caption ? <figcaption className="photo__cap">{b.photo.caption}</figcaption> : null}</figure>;
    case 'gallery': return <div className="gallery">{b.photos.map((p, i) => <div className="photo" key={i}><img src={p.url} alt={p.alt} /></div>)}</div>;
    default: return null;
  }
}
