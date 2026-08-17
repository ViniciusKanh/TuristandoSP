import type { Metadata } from 'next';
import { siteConfig } from '@turistando/core';
import { getStats, getSettings } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { MapIcon, Compass, Book, Star } from '@/components/brand/Icons';

export const metadata: Metadata = {
  title: 'Sobre',
  description: siteConfig.description,
  alternates: { canonical: '/sobre' },
};
export const dynamic = 'force-dynamic';

const PILLARS = [
  { icon: Compass, title: 'Ir', text: 'Sem roteiro pronto. Escolho um lugar e vou.' },
  { icon: Star, title: 'Ver', text: 'Presto atenção no que a pressa da cidade esconde.' },
  { icon: MapIcon, title: 'Fotografar', text: 'Cada parada vira imagem antes de virar texto.' },
  { icon: Book, title: 'Documentar', text: 'Escrevo o que achei — o bom, o caro, o que eu voltaria.' },
];

export default async function SobrePage() {
  const [stats, s] = await Promise.all([getStats(), getSettings()]);

  const title = s.aboutTitle || 'Um cara, a cidade, as ruas de São Paulo';
  const lead = s.aboutLead || `Sou eu quem anda, fotografa e escreve. O ${siteConfig.siteShortName} é o diário das minhas voltas pela cidade — sem roteiro pronto, sem patrocínio. Só o bairro, o que ele esconde e o que eu achei de cada parada.`;
  const bodyParas = (s.aboutBody || 'A ideia é simples e impossível ao mesmo tempo: conhecer São Paulo, um lugar de cada vez. Uma cidade que não dá pra terminar — e é justamente por isso que vale começar.')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const photo = s.aboutPhotoUrl || '';

  return (
    <div>
      <section className="section-tight container container-wide">
        <UrbanLabel>Sobre · 001</UrbanLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: 'clamp(1.5rem, 4vw, 3.5rem)', alignItems: 'center', marginTop: '1.5rem' }} className="feature-split">
          <div className="photo" style={{ aspectRatio: '1/1', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Foto do autor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="display" style={{ fontSize: 'clamp(3rem,6vw,5rem)', color: 'var(--text-faint)' }}>SP</span>
            )}
          </div>
          <div className="stack">
            <h1 className="display title-lg">{title}</h1>
            <p className="lead">{lead}</p>
            {bodyParas.map((p, i) => (
              <p className="muted" key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight container container-wide">
        <div className="grid grid-4">
          {PILLARS.map((p) => (
            <div className="mini-card" key={p.title}>
              <p.icon aria-hidden style={{ color: 'var(--accent)' }} />
              <div className="h3" style={{ fontSize: '1.3rem', marginTop: '0.5rem' }}>{p.title}</div>
              <p className="muted" style={{ fontSize: '0.92rem' }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band section">
        <div className="container container-wide">
          <UrbanLabel>O projeto em números</UrbanLabel>
          <div className="stat-row" style={{ marginTop: '1.5rem', background: 'var(--band-surface)', borderColor: 'var(--band-surface)' }}>
            <div className="stat" style={{ background: 'var(--band)' }}><div className="stat__val" style={{ color: 'var(--on-band)' }}>{stats.explorations}</div><div className="stat__key">Explorações</div></div>
            <div className="stat" style={{ background: 'var(--band)' }}><div className="stat__val" style={{ color: 'var(--on-band)' }}>{stats.places}</div><div className="stat__key">Lugares</div></div>
            <div className="stat" style={{ background: 'var(--band)' }}><div className="stat__val" style={{ color: 'var(--on-band)' }}>{stats.neighborhoods}</div><div className="stat__key">Bairros</div></div>
            <div className="stat" style={{ background: 'var(--band)' }}><div className="stat__val" style={{ color: 'var(--on-band)' }}>{stats.kmWalked}</div><div className="stat__key">km a pé</div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
