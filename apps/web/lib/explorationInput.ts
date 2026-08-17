import { z } from 'zod';
import { slugify, type Exploration, type ArticleBlock, type PhotoRef } from '@turistando/core';

export const PhotoInput = z.object({
  id: z.string().optional(),
  url: z.string(),
  width: z.coerce.number().optional().default(1600),
  height: z.coerce.number().optional().default(1067),
  alt: z.string().optional().default(''),
  caption: z.string().optional(),
  order: z.coerce.number().optional().default(0),
});

const TransportLeg = z.object({
  mode: z.enum(['metro', 'trem', 'onibus', 'carro', 'bike', 'a-pe', 'outro']),
  detail: z.string().optional(),
});
const Expense = z.object({
  label: z.string(),
  category: z.enum(['entrada', 'transporte', 'alimentacao', 'estacionamento', 'outros']),
  amount: z.coerce.number().min(0),
});

export const ExplorationInput = z.object({
  placeSlug: z.string().min(1, 'Escolha o lugar da visita.'),
  title: z.string().min(3, 'Dê um título.'),
  subtitle: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.'),
  durationMinutes: z.coerce.number().int().min(0).optional().default(0),
  transport: z.array(TransportLeg).optional().default([]),
  expenses: z.array(Expense).optional().default([]),
  rating: z
    .object({
      overall: z.coerce.number().min(0).max(5).default(0),
      experience: z.coerce.number().min(0).max(5).optional(),
      costBenefit: z.coerce.number().min(0).max(5).optional(),
      infrastructure: z.coerce.number().min(0).max(5).optional(),
      accessibility: z.coerce.number().min(0).max(5).optional(),
      photography: z.coerce.number().min(0).max(5).optional(),
      wouldReturn: z.enum(['com-certeza', 'talvez', 'nao-prioridade']).default('com-certeza'),
    })
    .default({ overall: 0, wouldReturn: 'com-certeza' }),
  photos: z.array(PhotoInput).max(20, 'Máximo de 20 fotos.').optional().default([]),
  article: z.array(z.any()).optional().default([]),
  rawText: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['rascunho', 'agendado', 'publicado']).optional().default('publicado'),
});

export type ExplorationInputData = z.infer<typeof ExplorationInput>;

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'image', 'gallery', 'quote', 'tip', 'info', 'warning', 'separator', 'costs', 'transport', 'relatedPlaces']);

/** Sanitiza blocos vindos do cliente/Gemini, resolvendo fotos por índice quando preciso. */
export function sanitizeArticle(blocks: unknown[], photos: PhotoRef[]): ArticleBlock[] {
  const out: ArticleBlock[] = [];
  const photoAt = (i: unknown): PhotoRef | undefined => {
    const idx = typeof i === 'number' ? i : Number(i);
    return Number.isFinite(idx) ? photos[idx] : undefined;
  };
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') continue;
    const b = raw as Record<string, unknown>;
    const t = String(b.type);
    if (!BLOCK_TYPES.has(t)) continue;
    switch (t) {
      case 'paragraph':
        if (b.text) out.push({ type: 'paragraph', text: String(b.text) });
        break;
      case 'heading':
        out.push({ type: 'heading', level: b.level === 3 ? 3 : 2, text: String(b.text ?? '') });
        break;
      case 'quote':
        if (b.text) out.push({ type: 'quote', text: String(b.text), cite: b.cite ? String(b.cite) : undefined });
        break;
      case 'tip':
        if (b.text) out.push({ type: 'tip', title: b.title ? String(b.title) : undefined, text: String(b.text) });
        break;
      case 'info':
        if (b.text) out.push({ type: 'info', title: b.title ? String(b.title) : undefined, text: String(b.text) });
        break;
      case 'warning':
        if (b.text) out.push({ type: 'warning', title: b.title ? String(b.title) : undefined, text: String(b.text) });
        break;
      case 'separator':
        out.push({ type: 'separator' });
        break;
      case 'image': {
        const p = (b.photo && typeof b.photo === 'object' ? (b.photo as PhotoRef) : undefined) ?? photoAt(b.photo);
        if (p?.url) out.push({ type: 'image', photo: p });
        break;
      }
      case 'gallery': {
        const arr = Array.isArray(b.photos) ? b.photos : [];
        const ps = arr.map((x) => (x && typeof x === 'object' ? (x as PhotoRef) : photoAt(x))).filter((p): p is PhotoRef => Boolean(p?.url));
        if (ps.length) out.push({ type: 'gallery', photos: ps });
        break;
      }
      default:
        break;
    }
  }
  return out;
}

/** Monta a Exploração final a partir do input já validado. */
export function buildExploration(
  v: ExplorationInputData,
  opts: { slug: string; number: number; createdAt: string; updatedAt: string; placeCategories: string[] },
): Exploration {
  const photos: PhotoRef[] = v.photos.map((p, i) => ({
    id: p.id || `ph-${opts.slug}-${i}`,
    url: p.url,
    demo: false,
    width: p.width,
    height: p.height,
    alt: p.alt || v.title,
    caption: p.caption,
    order: p.order ?? i,
  }));
  let article = sanitizeArticle(v.article, photos);
  if (article.length === 0) article = fallbackArticle(v.rawText, photos);
  const publishedAt = v.status === 'publicado' ? opts.createdAt : undefined;
  return {
    id: `e-${opts.slug}`,
    number: opts.number,
    slug: opts.slug,
    placeSlug: v.placeSlug,
    title: v.title,
    subtitle: v.subtitle,
    date: v.date,
    durationMinutes: v.durationMinutes,
    transport: v.transport,
    expenses: v.expenses,
    rating: {
      overall: v.rating.overall,
      experience: v.rating.experience,
      costBenefit: v.rating.costBenefit,
      infrastructure: v.rating.infrastructure,
      accessibility: v.rating.accessibility,
      photography: v.rating.photography,
      wouldReturn: v.rating.wouldReturn,
    },
    article,
    photos,
    categories: opts.placeCategories,
    tags: v.tags,
    status: v.status,
    publishedAt,
    createdAt: opts.createdAt,
    updatedAt: opts.updatedAt,
  };
}

/**
 * Sem Gemini / sem blocos: divide o relato em parágrafos (só texto).
 * As fotos NÃO entram aqui — a página intercala as fotos atuais no render
 * (ver composeArticle no core), então o gerenciador de fotos é a fonte da verdade.
 * `photos` é mantido na assinatura por compatibilidade.
 */
export function fallbackArticle(rawText: string, _photos: PhotoRef[]): ArticleBlock[] {
  const paras = (rawText ?? '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  return paras.map((p) => ({ type: 'paragraph', text: p }));
}
