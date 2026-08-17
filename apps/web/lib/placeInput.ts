import { z } from 'zod';
import { slugify, DISTRICT_REGION, type Place, type RegionSlug, type NearestStation } from '@turistando/core';

const REGIONS = ['centro', 'zona-norte', 'zona-sul', 'zona-leste', 'zona-oeste'] as const;

export const PlaceInput = z.object({
  name: z.string().min(2, 'Informe o nome.'),
  shortDescription: z.string().min(4, 'Descrição curta muito curta.'),
  description: z.string().optional().default(''),
  neighborhood: z.string().min(1, 'Informe o bairro.'), // NOME do bairro
  region: z.enum(REGIONS).optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  lat: z.coerce.number().min(-24.1, 'Fora da cidade de São Paulo.').max(-23.3, 'Fora da cidade de São Paulo.'),
  lng: z.coerce.number().min(-46.9, 'Fora da cidade de São Paulo.').max(-46.3, 'Fora da cidade de São Paulo.'),
  categories: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  priceMin: z.coerce.number().min(0).optional().default(0),
  priceMax: z.coerce.number().min(0).optional().default(0),
  free: z.coerce.boolean().optional().default(false),
  rating: z.coerce.number().min(0).max(5).optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  hours: z.string().optional(),
  recommendedMinutes: z.coerce.number().int().positive().optional(),
  favorite: z.coerce.boolean().optional().default(false),
  wantToReturn: z.coerce.boolean().optional().default(false),
  // capa: pode ser caminho relativo (/api/images/...) ou URL — string livre
  coverImageUrl: z.string().optional().default(''),
  // estação/transporte mais próximo
  stationName: z.string().optional(),
  stationType: z.enum(['metro', 'trem']).optional(),
  stationMinutes: z.coerce.number().int().min(0).optional(),
});

export type PlaceInputData = z.infer<typeof PlaceInput>;

/** Normaliza corpo vindo de formulário (checkbox "on", listas por vírgula). */
export function normalizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const b = { ...(body as Record<string, unknown>) };
  for (const k of ['free', 'favorite', 'wantToReturn']) if (b[k] === 'on') b[k] = true;
  for (const k of ['categories', 'tags'])
    if (typeof b[k] === 'string') b[k] = (b[k] as string).split(',').map((s) => s.trim()).filter(Boolean);
  return b;
}

export function buildPlace(v: PlaceInputData, opts: { slug: string; id: string; createdAt: string; updatedAt: string }): Place {
  const neighborhoodSlug = slugify(v.neighborhood);
  const region: RegionSlug = v.region ?? (DISTRICT_REGION[v.neighborhood] as RegionSlug) ?? 'centro';
  const stations: NearestStation[] = v.stationName
    ? [{ type: v.stationType ?? 'metro', name: v.stationName, walkingMinutes: v.stationMinutes ?? 0 }]
    : [];
  const website = v.website && /^https?:\/\//.test(v.website) ? v.website : undefined;
  return {
    id: opts.id,
    slug: opts.slug,
    name: v.name,
    shortDescription: v.shortDescription,
    description: v.description || v.shortDescription,
    address: { street: v.street ?? '', zip: v.cep ?? '' },
    neighborhood: neighborhoodSlug,
    neighborhoodName: v.neighborhood,
    region,
    geo: { lat: v.lat, lng: v.lng },
    nearestStations: stations,
    categories: v.categories,
    tags: v.tags,
    website,
    instagram: v.instagram || undefined,
    price: { min: v.priceMin, max: v.free ? 0 : v.priceMax, free: v.free },
    hours: v.hours ? { summary: v.hours } : undefined,
    accessibility: { wheelchair: false },
    status: 'ativo',
    coverImage: {
      id: `img-${opts.slug}`,
      url: v.coverImageUrl || '',
      demo: !v.coverImageUrl,
      width: 1600,
      height: 1067,
      alt: v.name,
      order: 0,
    },
    favorite: v.favorite,
    wantToReturn: v.wantToReturn,
    rating: v.rating && v.rating > 0 ? v.rating : undefined,
    recommendedMinutes: v.recommendedMinutes,
    createdAt: opts.createdAt,
    updatedAt: opts.updatedAt,
  };
}
