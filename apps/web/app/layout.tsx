import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@turistando/core';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BackToTop } from '@/components/feature/BackToTop';
import './globals.css';

// Fontes carregadas via <link> (as famílias e os fallbacks vivem em globals.css).
const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${siteConfig.siteName} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.siteShortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.siteName,
  authors: [{ name: siteConfig.authorName }],
  keywords: ['São Paulo', 'turismo', 'exploração urbana', 'museus', 'parques', 'bairros', 'guia autoral'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: siteConfig.siteName,
    title: `${siteConfig.siteName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: { card: 'summary_large_image', title: siteConfig.siteName, description: siteConfig.description },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF5EA' },
    { media: '(prefers-color-scheme: dark)', color: '#1B1712' },
  ],
};

const themeInit = `(function(){try{var t=localStorage.getItem('tsp-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: appUrl,
    description: siteConfig.description,
    inLanguage: 'pt-BR',
    author: { '@type': 'Person', name: siteConfig.authorName },
  };

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
