import type { Metadata } from 'next';
import Link from 'next/link';
import { getStats, getAllPlaces, getSetting } from '@/lib/repo';
import { tursoConfigured } from '@/lib/config';
import { UrbanLabel } from '@/components/brand';
import { ArrowRight } from '@/components/brand/Icons';

export const metadata: Metadata = { title: 'Painel', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const [stats, places, geminiKey] = await Promise.all([getStats(), getAllPlaces(), getSetting('geminiApiKey')]);
  const recent = places.slice(0, 5);
  const tursoOn = tursoConfigured();
  const geminiOn = Boolean(geminiKey);

  return (
    <div className="section container container-wide">
      <UrbanLabel>Painel do autor</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.6rem' }}>Onde você foi hoje?</h1>

      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', margin: '1.5rem 0 2.5rem' }}>
        <Link href="/admin/exploracoes/nova" className="btn" style={{ fontSize: '0.85rem', padding: '1.1rem 1.6rem' }}>
          + Nova exploração <ArrowRight aria-hidden />
        </Link>
        <Link href="/admin/lugares/novo" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '1.1rem 1.6rem' }}>
          + Cadastrar lugar
        </Link>
      </div>

      <div className="stat-row" style={{ marginBottom: '3rem' }}>
        <div className="stat"><div className="stat__val">{stats.places}</div><div className="stat__key">Lugares</div></div>
        <div className="stat"><div className="stat__val">{stats.explorations}</div><div className="stat__key">Explorações</div></div>
        <div className="stat"><div className="stat__val">{stats.neighborhoods}</div><div className="stat__key">Bairros</div></div>
        <div className="stat"><div className="stat__val">{stats.photos}</div><div className="stat__key">Fotos</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 'clamp(1.5rem,4vw,3rem)', alignItems: 'start' }} className="feature-split">
        <div>
          <div className="section-head"><h2 className="heading h2">Últimos lugares</h2><Link href="/admin/lugares" className="tag">ver todos</Link></div>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {recent.map((p) => (
              <div key={p.slug} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div className="h3" style={{ fontSize: '1.1rem' }}>{p.name}</div>
                  <span className="coord">{p.geo.lat.toFixed(4)}, {p.geo.lng.toFixed(4)} · {p.neighborhood}</span>
                </div>
                <Link href={`/lugares/${p.slug}`} className="tag" target="_blank">abrir ↗</Link>
              </div>
            ))}
          </div>
        </div>

        <aside className="mini-card" style={{ gap: '0.85rem' }}>
          <UrbanLabel>Integrações</UrbanLabel>
          <StatusRow label="Banco Turso" ok={tursoOn} okText="Conectado" offText="Banco local (arquivo)" />
          <StatusRow label="Google Gemini" ok={geminiOn} okText="Chave salva" offText="Não configurado" />
          <Link href="/admin/configuracoes" className="btn btn-sm" style={{ marginTop: '0.5rem' }}>Configurar integrações <ArrowRight aria-hidden /></Link>
        </aside>
      </div>
    </div>
  );
}

function StatusRow({ label, ok, okText, offText }: { label: string; ok: boolean; okText: string; offText: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', padding: '0.7rem 0.9rem' }}>
      <span className="u-label" style={{ color: 'var(--text)' }}>{label}</span>
      <span className="tag" style={{ borderColor: ok ? 'var(--green)' : 'var(--border-strong)', color: ok ? 'var(--green)' : 'var(--text-faint)' }}>
        {ok ? okText : offText}
      </span>
    </div>
  );
}
