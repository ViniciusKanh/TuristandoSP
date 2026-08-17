import type { MetadataRoute } from 'next';
import { neighborhoods, categories } from '@turistando/core';
import { getAllPlaces, getPublishedExplorations } from '@/lib/repo';

const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [places, exps] = await Promise.all([getAllPlaces(), getPublishedExplorations()]);

  const staticPages = ['', '/explorar', '/lugares', '/bairros', '/mapa', '/diario', '/sobre', '/minha-sao-paulo'].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }));
  const explorationPages = exps.map((e) => ({ url: `${base}/exploracoes/${e.slug}`, lastModified: e.publishedAt, changeFrequency: 'monthly' as const, priority: 0.8 }));
  const placePages = places.map((p) => ({ url: `${base}/lugares/${p.slug}`, changeFrequency: 'monthly' as const, priority: 0.6 }));
  const hoodPages = neighborhoods.map((n) => ({ url: `${base}/bairros/${n.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 }));
  const catPages = categories.map((c) => ({ url: `${base}/categorias/${c.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 }));

  return [...staticPages, ...explorationPages, ...placePages, ...hoodPages, ...catPages];
}
