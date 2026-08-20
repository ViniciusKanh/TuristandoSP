import Link from 'next/link';
import { siteConfig } from '@turistando/core';
import { Home, Compass, MapIcon, Book } from '../brand/Icons';
import { ThemeToggle } from './ThemeToggle';
import { HeaderSearch } from './HeaderSearch';

const NAV = [
  { href: '/explorar', label: 'Explorar' },
  { href: '/roteiros', label: 'Roteiros' },
  { href: '/lugares', label: 'Lugares' },
  { href: '/bairros', label: 'Bairros' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/diario', label: 'Diário' },
  { href: '/sobre', label: 'Sobre' },
];

export function Header() {
  return (
    <>
      <header className="site-header">
        <div className="container container-wide site-header__inner">
          <Link href="/" className="brand" aria-label={siteConfig.siteName}>
            {/* eslint-disable @next/next/no-img-element */}
            <img className="brand-logo brand-logo--wide brand-logo--light" src="/brand-expansivo-light.png" alt={siteConfig.siteName} width={220} height={73} />
            <img className="brand-logo brand-logo--wide brand-logo--dark" src="/brand-expansivo-dark.png" alt="" aria-hidden width={220} height={73} />
            <img className="brand-logo brand-logo--compact brand-logo--light" src="/brand-responsivo-light.png" alt={siteConfig.siteName} width={48} height={48} />
            <img className="brand-logo brand-logo--compact brand-logo--dark" src="/brand-responsivo-dark.png" alt="" aria-hidden width={48} height={48} />
            {/* eslint-enable @next/next/no-img-element */}
          </Link>
          <nav className="nav" aria-label="Principal">
            {NAV.map((i) => (
              <Link key={i.href} href={i.href}>
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <HeaderSearch />
            <ThemeToggle />
            <Link href="/admin" className="btn btn-ghost btn-sm" style={{ borderColor: 'var(--border-strong)' }}>
              Painel
            </Link>
          </div>
        </div>
      </header>

      <nav className="mobile-nav" aria-label="Navegação mobile">
        <Link href="/"><Home aria-hidden /> Início</Link>
        <Link href="/explorar"><Compass aria-hidden /> Explorar</Link>
        <Link href="/mapa"><MapIcon aria-hidden /> Mapa</Link>
        <Link href="/diario"><Book aria-hidden /> Diário</Link>
      </nav>
    </>
  );
}
