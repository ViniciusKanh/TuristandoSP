import type { Category } from '../types/index';

/** Categorias base (seção 14). Novas podem ser criadas depois. */
export const categories: Category[] = [
  { id: 'c-museus', slug: 'museus', name: 'Museus', parent: 'cultura' },
  { id: 'c-parques', slug: 'parques', name: 'Parques' },
  { id: 'c-cultura', slug: 'cultura', name: 'Cultura' },
  { id: 'c-historia', slug: 'historia', name: 'História' },
  { id: 'c-arquitetura', slug: 'arquitetura', name: 'Arquitetura' },
  { id: 'c-gastronomia', slug: 'gastronomia', name: 'Gastronomia' },
  { id: 'c-cafes', slug: 'cafes', name: 'Cafés', parent: 'gastronomia' },
  { id: 'c-exposicoes', slug: 'exposicoes', name: 'Exposições', parent: 'cultura' },
  { id: 'c-eventos', slug: 'eventos', name: 'Eventos' },
  { id: 'c-mercados', slug: 'mercados', name: 'Mercados' },
  { id: 'c-bibliotecas', slug: 'bibliotecas', name: 'Bibliotecas', parent: 'cultura' },
  { id: 'c-teatros', slug: 'teatros', name: 'Teatros', parent: 'cultura' },
  { id: 'c-mirantes', slug: 'mirantes', name: 'Mirantes' },
  { id: 'c-bairros', slug: 'bairros', name: 'Bairros' },
  { id: 'c-curiosos', slug: 'lugares-curiosos', name: 'Lugares curiosos' },
  { id: 'c-gratuitos', slug: 'passeios-gratuitos', name: 'Passeios gratuitos' },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
