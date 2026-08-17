/**
 * Camada de acesso a dados (repositório em memória sobre o seed).
 * A API real (Turso/Drizzle) exporá exatamente estas mesmas assinaturas,
 * então as páginas não mudam quando o banco entrar.
 */
import type {
  Exploration,
  Place,
  Neighborhood,
  Category,
  SiteStats,
  RegionSlug,
} from '../types/index';
import { places, placeBySlug } from './places';
import { explorations, explorationBySlug } from './explorations';
import { neighborhoods, neighborhoodBySlug } from './neighborhoods';
import { categories, categoryBySlug } from './categories';
import { haversineKm } from '../utils/format';
import { REGIONS } from '../config/site';

export { places, explorations, neighborhoods, categories };
export { placeBySlug, explorationBySlug, neighborhoodBySlug, categoryBySlug };

const published = () =>
  explorations
    .filter((e) => e.status === 'publicado')
    .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getPublishedExplorations(): Exploration[] {
  return published();
}

export function getLatestExploration(): Exploration | undefined {
  return published()[0];
}

export function getExploration(slug: string): Exploration | undefined {
  return explorationBySlug.get(slug);
}

export function getPlace(slug: string): Place | undefined {
  return placeBySlug.get(slug);
}

export function getExplorationsForPlace(placeSlug: string): Exploration[] {
  return published()
    .filter((e) => e.placeSlug === placeSlug)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getNeighborhood(slug: string): Neighborhood | undefined {
  return neighborhoodBySlug.get(slug);
}

export function getPlacesInNeighborhood(slug: string): Place[] {
  return places.filter((p) => p.neighborhood === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug);
}

export function getPlacesByCategory(slug: string): Place[] {
  return places.filter((p) => p.categories.includes(slug));
}

export function getExplorationsByCategory(slug: string): Exploration[] {
  return published().filter((e) => e.categories.includes(slug));
}

export function getRegions() {
  return REGIONS;
}

export function countPlacesByCategorySlug(slug: string): number {
  return getPlacesByCategory(slug).length;
}

/** Estatísticas globais derivadas (Home + "Minha São Paulo"). */
export function getStats(): SiteStats {
  const pub = published();
  const totalMinutes = pub.reduce((s, e) => s + e.durationMinutes, 0);
  const totalSpent = pub.reduce(
    (s, e) => s + e.expenses.reduce((es, x) => es + x.amount, 0),
    0,
  );
  const photos = pub.reduce((s, e) => s + e.photos.length, 0);
  return {
    places: places.length,
    explorations: pub.length,
    neighborhoods: new Set(places.map((p) => p.neighborhood)).size,
    museums: getPlacesByCategory('museus').length,
    parks: getPlacesByCategory('parques').length,
    photos,
    totalMinutes,
    totalSpent: Math.round(totalSpent * 100) / 100,
    kmWalked: 312, // acumulado do projeto (demo)
  };
}

export interface CategoryCount {
  category: Category;
  places: number;
  explorations: number;
}

export function getCategoryCounts(): CategoryCount[] {
  return categories
    .map((category) => ({
      category,
      places: getPlacesByCategory(category.slug).length,
      explorations: getExplorationsByCategory(category.slug).length,
    }))
    .filter((c) => c.places > 0)
    .sort((a, b) => b.places - a.places);
}

export interface NeighborhoodSummary {
  neighborhood: Neighborhood;
  places: number;
  explorations: number;
}

export function getNeighborhoodSummaries(): NeighborhoodSummary[] {
  return neighborhoods
    .map((neighborhood) => ({
      neighborhood,
      places: getPlacesInNeighborhood(neighborhood.slug).length,
      explorations: published().filter(
        (e) => placeBySlug.get(e.placeSlug)?.neighborhood === neighborhood.slug,
      ).length,
    }))
    .sort((a, b) => b.places - a.places);
}

/** Recomendações relacionadas (seção 25): mesmo bairro, categoria e proximidade. */
export function getRelatedPlaces(place: Place, limit = 6): Place[] {
  const scored = places
    .filter((p) => p.slug !== place.slug)
    .map((p) => {
      let score = 0;
      if (p.neighborhood === place.neighborhood) score += 4;
      if (p.region === place.region) score += 1;
      score += p.categories.filter((c) => place.categories.includes(c)).length * 2;
      const km = haversineKm(place.geo, p.geo);
      score += Math.max(0, 3 - km / 3);
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export interface MapMarker {
  slug: string;
  name: string;
  neighborhood: string;
  region: RegionSlug;
  geo: { lat: number; lng: number };
  categories: string[];
  free: boolean;
  favorite: boolean;
  wantToReturn: boolean;
  status: Place['status'];
  explorations: number;
  hue: number;
}

export function getMapMarkers(): MapMarker[] {
  return places.map((p) => ({
    slug: p.slug,
    name: p.name,
    neighborhood: p.neighborhood,
    region: p.region,
    geo: p.geo,
    categories: p.categories,
    free: p.price.free,
    favorite: p.favorite,
    wantToReturn: p.wantToReturn,
    status: p.status,
    explorations: getExplorationsForPlace(p.slug).length,
    hue: p.coverImage.hue ?? 30,
  }));
}

/** Busca global simples (seção 24), otimizável para semântica depois. */
export interface SearchResult {
  kind: 'place' | 'exploration' | 'neighborhood' | 'category';
  slug: string;
  title: string;
  subtitle: string;
}

export function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const match = (haystack: string) =>
    terms.every((t) => haystack.toLowerCase().includes(t));

  const results: SearchResult[] = [];

  for (const p of places) {
    const hay = [p.name, p.shortDescription, p.neighborhood, ...p.categories, ...p.tags].join(' ');
    if (match(hay)) {
      results.push({
        kind: 'place',
        slug: p.slug,
        title: p.name,
        subtitle: `Lugar · ${neighborhoodBySlug.get(p.neighborhood)?.name ?? ''}`,
      });
    }
  }
  for (const e of published()) {
    const place = placeBySlug.get(e.placeSlug);
    const hay = [e.title, e.subtitle ?? '', ...e.tags, ...e.categories, place?.name ?? ''].join(' ');
    if (match(hay)) {
      results.push({
        kind: 'exploration',
        slug: e.slug,
        title: e.title,
        subtitle: `Exploração · ${place?.name ?? ''}`,
      });
    }
  }
  for (const n of neighborhoods) {
    if (match(`${n.name} ${n.description}`)) {
      results.push({ kind: 'neighborhood', slug: n.slug, title: n.name, subtitle: 'Bairro' });
    }
  }
  return results.slice(0, 20);
}
