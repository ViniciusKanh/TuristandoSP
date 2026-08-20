import type { MetadataRoute } from 'next';
import { neighborhoods, categories } from '@turistando/core';
import { getAllPlaces, getPublishedExplorations, getAllTags } from '@/lib/repo';
import { listRoteiros } from '@/lib/roteiros';
import { SITE_URL } from '@/lib/site-url';

const base = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [places, exps, tags, roteiros] = await Promise.all([
    getAllPlaces(),
    getPublishedExplorations(),
    getAllTags(),
    listRoteiros(),
  ]);

  const staticPages = ['', '/explorar', '/roteiros', '/lugares', '/bairros', '/mapa', '/diario', '/tags', '/sobre', '/minha-sao-paulo', '/contato'].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }));
  const explorationPages = exps.map((e) => ({ url: `${base}/exploracoes/${e.slug}`, lastModified: e.publishedAt, changeFrequency: 'monthly' as const, priority: 0.8 }));
  const placePages = places.map((p) => ({ url: `${base}/lugares/${p.slug}`, changeFrequency: 'monthly' as const, priority: 0.6 }));
  const hoodPages = neighborhoods.map((n) => ({ url: `${base}/bairros/${n.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 }));
  const catPages = categories.map((c) => ({ url: `${base}/categorias/${c.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 }));
  const tagPages = tags.map((t) => ({ url: `${base}/tags/${t.tag}`, changeFrequency: 'monthly' as const, priority: 0.4 }));
  const roteiroPages = roteiros.map((r) => ({ url: `${base}/roteiros/${r.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 }));

  return [...staticPages, ...explorationPages, ...placePages, ...hoodPages, ...catPages, ...tagPages, ...roteiroPages];
}
