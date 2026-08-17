/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // O pacote compartilhado é TS puro — o Next transpila em tempo de build.
  transpilePackages: ['@turistando/core'],
  images: {
    // Storage de imagens é trocável (Vercel Blob por padrão).
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

module.exports = nextConfig;
