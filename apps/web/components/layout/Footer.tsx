import Link from 'next/link';
import { siteConfig } from '@turistando/core';
import { getStats } from '@/lib/repo';
import { Mark } from '../brand/Icons';

export async function Footer() {
  const stats = await getStats().catch(() => ({ kmWalked: 0, explorations: 0, places: 0 }));
  const year = 2026;
  return (
    <footer className="site-footer">
      <div className="container container-wide">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ color: 'var(--on-band)', fontSize: '1.5rem' }}>
              <Mark className="brand__mark" aria-hidden />
              <span>
                {siteConfig.siteShortName.replace(siteConfig.logoAccent, '').trim()}
                <span className="brand__accent">{siteConfig.logoAccent}</span>
              </span>
            </div>
            <p style={{ color: 'var(--on-band-muted)', maxWidth: '30ch', marginTop: '1rem' }}>{siteConfig.tagline}</p>
          </div>
          <div className="footer-col">
            <h4>Navegar</h4>
            <Link href="/explorar">Explorar</Link>
            <Link href="/roteiros">Roteiros</Link>
            <Link href="/mapa">Mapa</Link>
            <Link href="/bairros">Bairros</Link>
            <Link href="/lugares">Lugares</Link>
            <Link href="/diario">Diário</Link>
            <Link href="/tags">Tags</Link>
          </div>
          <div className="footer-col">
            <h4>O projeto</h4>
            <Link href="/sobre">Sobre</Link>
            <Link href="/minha-sao-paulo">Minha São Paulo</Link>
            <Link href="/contato">Contato</Link>
            {siteConfig.socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener">
                {s.label}
              </a>
            ))}
          </div>
          <div className="footer-col" style={{ textAlign: 'right' }}>
            <h4>Quilômetros pela cidade</h4>
            <div className="footer-km">{stats.kmWalked}<span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}> KM</span></div>
            <p style={{ color: 'var(--on-band-muted)', marginTop: '0.5rem' }}>{stats.explorations} explorações · {stats.places} lugares</p>
          </div>
        </div>
        <hr className="divider" style={{ borderColor: 'var(--band-surface)', margin: '2.5rem 0 1.5rem' }} />
        <p className="u-label" style={{ color: 'var(--on-band-muted)' }}>
          © {year} {siteConfig.siteShortName} · Feito na estrada · São Paulo · Brasil
        </p>
      </div>
    </footer>
  );
}
