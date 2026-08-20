import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import {
  haversineKm,
  neighborhoodBySlug,
  formatDateShort,
  formatDuration,
  formatBRL,
  type Place,
  type Exploration,
  type SiteStats,
  type Category,
  type Neighborhood,
} from '@turistando/core';
import { categories as allCategories } from '@turistando/core';
import { db, ensureDb } from './db';

async function rows<T = unknown>(sql: string, args: unknown[] = []): Promise<T[]> {
  // Nunca cachear leituras do banco — o Next cacheia fetch HTTP (Turso) por padrão,
  // o que fazia o site não refletir cadastros/exclusões. noStore() garante dado fresco.
  try {
    noStore();
  } catch {
    /* fora de request (build) — ignore */
  }
  await ensureDb();
  const res = await db().execute({ sql, args: args as never });
  return res.rows as unknown as T[];
}

function parsePlace(row: { data: string }): Place {
  return JSON.parse(row.data) as Place;
}
function parseExp(row: { data: string }): Exploration {
  return JSON.parse(row.data) as Exploration;
}

export async function getAllPlaces(): Promise<Place[]> {
  const r = await rows<{ data: string }>('SELECT data FROM places ORDER BY name');
  return r.map(parsePlace);
}

export async function getPlace(slug: string): Promise<Place | undefined> {
  const r = await rows<{ data: string }>('SELECT data FROM places WHERE slug = ?', [slug]);
  return r[0] ? parsePlace(r[0]) : undefined;
}

export async function getPublishedExplorations(): Promise<Exploration[]> {
  const r = await rows<{ data: string }>(
    "SELECT data FROM explorations WHERE status = 'publicado' ORDER BY date DESC",
  );
  return r.map(parseExp);
}

export async function getLatestExploration(): Promise<Exploration | undefined> {
  return (await getPublishedExplorations())[0];
}

/** Item leve para o feed do diário (paginado). */
export interface FeedItem {
  slug: string;
  number: number;
  title: string;
  dateText: string;
  durationText: string;
  priceText: string;
  ratingOverall: number;
  placeName: string;
  neighborhoodName: string;
  cover: { url: string; demo: boolean; hue: number; alt: string };
}

export async function getFeed(offset = 0, limit = 12): Promise<{ items: FeedItem[]; total: number }> {
  const [exps, places] = await Promise.all([getPublishedExplorations(), getAllPlaces()]);
  const placeMap = new Map(places.map((p) => [p.slug, p]));
  const total = exps.length;
  const items = exps.slice(offset, offset + limit).map((e) => {
    const place = placeMap.get(e.placeSlug);
    const cover = e.photos[0] ?? place?.coverImage;
    const spent = e.expenses.reduce((s, x) => s + x.amount, 0);
    return {
      slug: e.slug,
      number: e.number,
      title: e.title,
      dateText: formatDateShort(e.date),
      durationText: formatDuration(e.durationMinutes),
      priceText: spent > 0 ? formatBRL(spent) : 'Grátis',
      ratingOverall: e.rating.overall,
      placeName: place?.name ?? '',
      neighborhoodName: place ? placeNeighborhoodName(place) : '',
      cover: { url: cover?.url ?? '', demo: cover?.demo ?? true, hue: cover?.hue ?? 30, alt: cover?.alt ?? e.title },
    };
  });
  return { items, total };
}

/** Todas as explorações (inclui rascunhos) — só para o painel. */
export async function getAllExplorationsAdmin(): Promise<Exploration[]> {
  const r = await rows<{ data: string }>('SELECT data FROM explorations ORDER BY number DESC');
  return r.map(parseExp);
}

export async function getExploration(slug: string): Promise<Exploration | undefined> {
  const r = await rows<{ data: string }>('SELECT data FROM explorations WHERE slug = ?', [slug]);
  return r[0] ? parseExp(r[0]) : undefined;
}

export async function getExplorationsForPlace(placeSlug: string): Promise<Exploration[]> {
  const r = await rows<{ data: string }>(
    "SELECT data FROM explorations WHERE place_slug = ? AND status = 'publicado' ORDER BY date DESC",
    [placeSlug],
  );
  return r.map(parseExp);
}

export async function getPlacesInNeighborhood(slug: string): Promise<Place[]> {
  return (await getAllPlaces()).filter((p) => p.neighborhood === slug);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const exps = await getPublishedExplorations();
  const counts = new Map<string, number>();
  for (const e of exps) for (const t of e.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getExplorationsByTag(tag: string): Promise<Exploration[]> {
  const exps = await getPublishedExplorations();
  return exps.filter((e) => (e.tags ?? []).includes(tag));
}

export async function getPlacesByCategory(slug: string): Promise<Place[]> {
  return (await getAllPlaces()).filter((p) => p.categories.includes(slug));
}

export async function getExplorationsByCategory(slug: string): Promise<Exploration[]> {
  return (await getPublishedExplorations()).filter((e) => e.categories.includes(slug));
}

export interface MapMarker {
  slug: string;
  name: string;
  neighborhood: string;
  neighborhoodName: string;
  geo: { lat: number; lng: number };
  categories: string[];
  free: boolean;
  favorite: boolean;
  wantToReturn: boolean;
  explorations: number;
  shortDescription: string;
  rating: number;
  coverUrl: string;
  coverDemo: boolean;
  coverHue: number;
}

/** Marcadores do mapa: só lugares cadastrados (cada um é um lugar visitado). */
export async function getMapMarkers(): Promise<MapMarker[]> {
  const [places, exps] = await Promise.all([getAllPlaces(), getPublishedExplorations()]);
  const expCount = new Map<string, number>();
  exps.forEach((e) => expCount.set(e.placeSlug, (expCount.get(e.placeSlug) ?? 0) + 1));
  return places.map((p) => ({
    slug: p.slug,
    name: p.name,
    neighborhood: p.neighborhood,
    neighborhoodName: p.neighborhoodName ?? neighborhoodBySlug.get(p.neighborhood)?.name ?? p.neighborhood,
    geo: p.geo,
    categories: p.categories,
    free: p.price.free,
    favorite: p.favorite,
    wantToReturn: p.wantToReturn,
    explorations: expCount.get(p.slug) ?? 0,
    shortDescription: p.shortDescription,
    rating: p.rating ?? 0,
    coverUrl: p.coverImage?.url ?? '',
    coverDemo: p.coverImage?.demo ?? true,
    coverHue: p.coverImage?.hue ?? 30,
  }));
}

export async function getStats(): Promise<SiteStats> {
  const [places, exps, settings] = await Promise.all([
    getAllPlaces(),
    getPublishedExplorations(),
    getSettings(),
  ]);
  const totalMinutes = exps.reduce((s, e) => s + e.durationMinutes, 0);
  const totalSpent = exps.reduce((s, e) => s + e.expenses.reduce((a, x) => a + x.amount, 0), 0);
  const photos = exps.reduce((s, e) => s + e.photos.length, 0);
  return {
    places: places.length,
    explorations: exps.length,
    neighborhoods: new Set(places.map((p) => p.neighborhood)).size,
    museums: places.filter((p) => p.categories.includes('museus')).length,
    parks: places.filter((p) => p.categories.includes('parques')).length,
    photos,
    totalMinutes,
    totalSpent: Math.round(totalSpent * 100) / 100,
    kmWalked: Number(settings.kmWalked ?? 0) || places.length * 8,
  };
}

export interface CategoryCount {
  category: Category;
  places: number;
  explorations: number;
}
export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const [places, exps] = await Promise.all([getAllPlaces(), getPublishedExplorations()]);
  return allCategories
    .map((category) => ({
      category,
      places: places.filter((p) => p.categories.includes(category.slug)).length,
      explorations: exps.filter((e) => e.categories.includes(category.slug)).length,
    }))
    .filter((c) => c.places > 0)
    .sort((a, b) => b.places - a.places);
}

/** Nome de exibição do bairro de um lugar (dinâmico → core → slug). */
export function placeNeighborhoodName(place: Place): string {
  return place.neighborhoodName || neighborhoodBySlug.get(place.neighborhood)?.name || place.neighborhood;
}

/** Bairro montado dinamicamente: usa o core quando existe, senão deriva dos lugares. */
export async function getNeighborhoodView(slug: string): Promise<Neighborhood | undefined> {
  const core = neighborhoodBySlug.get(slug);
  if (core) return core;
  const places = (await getAllPlaces()).filter((p) => p.neighborhood === slug);
  if (places.length === 0) return undefined;
  const p = places[0]!;
  return {
    id: `n-${slug}`,
    slug,
    name: p.neighborhoodName ?? slug,
    region: p.region,
    description: 'Um bairro de São Paulo no meu mapa de explorações.',
    center: p.geo,
  };
}

export interface NeighborhoodSummary {
  neighborhood: Neighborhood;
  places: number;
  explorations: number;
}
export async function getNeighborhoodSummaries(): Promise<NeighborhoodSummary[]> {
  const [places, exps] = await Promise.all([getAllPlaces(), getPublishedExplorations()]);
  const placeToHood = new Map(places.map((p) => [p.slug, p.neighborhood]));
  const expByHood = new Map<string, number>();
  for (const e of exps) {
    const h = placeToHood.get(e.placeSlug);
    if (h) expByHood.set(h, (expByHood.get(h) ?? 0) + 1);
  }
  const byHood = new Map<string, { name: string; region: Place['region']; places: number }>();
  for (const p of places) {
    const cur = byHood.get(p.neighborhood) ?? { name: placeNeighborhoodName(p), region: p.region, places: 0 };
    cur.places += 1;
    byHood.set(p.neighborhood, cur);
  }
  return [...byHood.entries()]
    .map(([slug, v]) => {
      const core = neighborhoodBySlug.get(slug);
      const neighborhood: Neighborhood = core ?? {
        id: `n-${slug}`,
        slug,
        name: v.name,
        region: v.region,
        description: 'Um bairro de São Paulo no meu mapa de explorações.',
        center: { lat: 0, lng: 0 },
      };
      return { neighborhood, places: v.places, explorations: expByHood.get(slug) ?? 0 };
    })
    .sort((a, b) => b.places - a.places);
}

export async function getRelatedPlaces(place: Place, limit = 6): Promise<Place[]> {
  const places = await getAllPlaces();
  return places
    .filter((p) => p.slug !== place.slug)
    .map((p) => {
      let score = 0;
      if (p.neighborhood === place.neighborhood) score += 4;
      if (p.region === place.region) score += 1;
      score += p.categories.filter((c) => place.categories.includes(c)).length * 2;
      score += Math.max(0, 3 - haversineKm(place.geo, p.geo) / 3);
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}

export interface SearchResult {
  kind: 'place' | 'exploration' | 'neighborhood';
  slug: string;
  title: string;
  subtitle: string;
}
export async function search(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const match = (h: string) => terms.every((t) => h.toLowerCase().includes(t));
  const [places, exps] = await Promise.all([getAllPlaces(), getPublishedExplorations()]);
  const placeBy = new Map(places.map((p) => [p.slug, p]));
  const out: SearchResult[] = [];

  // Bairros (dinâmicos, a partir dos lugares)
  const hoods = new Map<string, string>();
  for (const p of places) hoods.set(p.neighborhood, placeNeighborhoodName(p));
  for (const [slug, name] of hoods) {
    if (match(`${name} ${slug}`)) out.push({ kind: 'neighborhood', slug, title: name, subtitle: 'Bairro' });
  }

  for (const p of places) {
    if (match([p.name, p.shortDescription, placeNeighborhoodName(p), ...p.categories, ...p.tags].join(' ')))
      out.push({ kind: 'place', slug: p.slug, title: p.name, subtitle: `Lugar · ${placeNeighborhoodName(p)}` });
  }
  for (const e of exps) {
    const place = placeBy.get(e.placeSlug);
    if (match([e.title, e.subtitle ?? '', ...e.tags, ...e.categories, place?.name ?? ''].join(' ')))
      out.push({ kind: 'exploration', slug: e.slug, title: e.title, subtitle: `Exploração · ${place?.name ?? ''}` });
  }
  return out.slice(0, 30);
}

// ---- escrita ----
export async function insertPlace(place: Place): Promise<void> {
  await ensureDb();
  await db().execute({
    sql: `INSERT INTO places (slug,name,short_desc,neighborhood,region,lat,lng,is_free,price_max,favorite,want_to_return,recommended_minutes,status,categories,data,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      place.slug, place.name, place.shortDescription, place.neighborhood, place.region,
      place.geo.lat, place.geo.lng, place.price.free ? 1 : 0, place.price.max,
      place.favorite ? 1 : 0, place.wantToReturn ? 1 : 0, place.recommendedMinutes ?? null,
      place.status, JSON.stringify(place.categories), JSON.stringify(place), place.createdAt, place.updatedAt,
    ],
  });
}

export async function slugExists(slug: string): Promise<boolean> {
  const r = await rows('SELECT 1 FROM places WHERE slug = ?', [slug]);
  return r.length > 0;
}

export async function updatePlace(slug: string, place: Place): Promise<void> {
  await ensureDb();
  await db().execute({
    sql: `UPDATE places SET name=?,short_desc=?,neighborhood=?,region=?,lat=?,lng=?,is_free=?,price_max=?,favorite=?,want_to_return=?,recommended_minutes=?,status=?,categories=?,data=?,updated_at=?
          WHERE slug=?`,
    args: [
      place.name, place.shortDescription, place.neighborhood, place.region,
      place.geo.lat, place.geo.lng, place.price.free ? 1 : 0, place.price.max,
      place.favorite ? 1 : 0, place.wantToReturn ? 1 : 0, place.recommendedMinutes ?? null,
      place.status, JSON.stringify(place.categories), JSON.stringify(place), place.updatedAt, slug,
    ],
  });
}

export async function deletePlace(slug: string): Promise<void> {
  await ensureDb();
  await db().execute({ sql: 'DELETE FROM places WHERE slug = ?', args: [slug] });
}

// ---- escrita de explorações ----
export async function explorationSlugExists(slug: string): Promise<boolean> {
  const r = await rows('SELECT 1 FROM explorations WHERE slug = ?', [slug]);
  return r.length > 0;
}

export async function nextExplorationNumber(): Promise<number> {
  const r = await rows<{ n: number }>('SELECT MAX(number) AS n FROM explorations');
  return (Number(r[0]?.n ?? 0) || 0) + 1;
}

export async function insertExploration(e: Exploration): Promise<void> {
  await ensureDb();
  await db().execute({
    sql: `INSERT INTO explorations (slug,number,place_slug,title,date,status,published_at,categories,data,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [e.slug, e.number, e.placeSlug, e.title, e.date, e.status, e.publishedAt ?? null, JSON.stringify(e.categories), JSON.stringify(e), e.createdAt, e.updatedAt],
  });
}

export async function updateExploration(slug: string, e: Exploration): Promise<void> {
  await ensureDb();
  await db().execute({
    sql: `UPDATE explorations SET number=?,place_slug=?,title=?,date=?,status=?,published_at=?,categories=?,data=?,updated_at=? WHERE slug=?`,
    args: [e.number, e.placeSlug, e.title, e.date, e.status, e.publishedAt ?? null, JSON.stringify(e.categories), JSON.stringify(e), e.updatedAt, slug],
  });
}

export async function deleteExploration(slug: string): Promise<void> {
  await ensureDb();
  await db().execute({ sql: 'DELETE FROM explorations WHERE slug = ?', args: [slug] });
}

// ---- settings (agora no BANCO: tabela settings) ----
const SECRET_KEYS = new Set(['geminiApiKey', 'adminPassword']);

export type Settings = Record<string, string>;

async function allSettings(): Promise<Settings> {
  const r = await rows<{ key: string; value: string }>('SELECT key, value FROM settings');
  const out: Settings = {};
  for (const row of r) out[row.key] = row.value;
  return out;
}

/** Config pública (sem segredos e sem valores vazios) — usada nas páginas. */
export async function getSettings(): Promise<Settings> {
  const all = await allSettings();
  const out: Settings = {};
  for (const [k, v] of Object.entries(all)) {
    if (!v || SECRET_KEYS.has(k)) continue;
    out[k] = v;
  }
  return out;
}
export async function getSetting(key: string): Promise<string | undefined> {
  const r = await rows<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return r[0]?.value || undefined;
}
export async function setSettings(entries: Record<string, string | undefined>): Promise<void> {
  await ensureDb();
  const stmts = Object.entries(entries)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({
      sql: 'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      args: [key, String(value)] as never,
    }));
  if (stmts.length) await db().batch(stmts, 'write');
}

// ---- imagens (guardadas no BANCO como base64) ----
export interface ImageRow {
  id: string;
  mime: string;
  data: string;
  width?: number;
  height?: number;
  alt?: string;
  size?: number;
}
export async function insertImage(img: ImageRow): Promise<void> {
  await ensureDb();
  await db().execute({
    sql: 'INSERT INTO images (id,mime,data,width,height,alt,size,created_at) VALUES (?,?,?,?,?,?,?,?)',
    args: [img.id, img.mime, img.data, img.width ?? null, img.height ?? null, img.alt ?? null, img.size ?? null, new Date().toISOString()],
  });
}
export async function getImage(id: string): Promise<{ mime: string; data: string } | undefined> {
  const r = await rows<{ mime: string; data: string }>('SELECT mime, data FROM images WHERE id = ?', [id]);
  return r[0];
}
