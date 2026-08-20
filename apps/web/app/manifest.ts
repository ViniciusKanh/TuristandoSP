import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Turistando São Paulo',
    short_name: 'Turistando SP',
    description: 'Um diário de viagem pela cidade de São Paulo, um lugar de cada vez.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6EEDD',
    theme_color: '#B5482C',
    lang: 'pt-BR',
    categories: ['travel', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
