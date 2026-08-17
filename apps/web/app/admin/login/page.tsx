import type { Metadata } from 'next';
import { UrbanLabel } from '@/components/brand';
import { Mark } from '@/components/brand/Icons';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  const error = searchParams.error;
  const next = searchParams.next ?? '/admin';
  return (
    <div style={{ minHeight: '80vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="brand" style={{ fontSize: '1.4rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <Mark className="brand__mark" aria-hidden />
          <span>PAINEL<span className="brand__accent">SP</span></span>
        </div>
        <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '2rem' }}>
          <UrbanLabel>Acesso do autor</UrbanLabel>
          <h1 className="heading h2" style={{ margin: '0.75rem 0 1.5rem' }}>Entrar no painel</h1>
          <form action="/api/auth/login" method="post" className="stack">
            <input type="hidden" name="next" value={next} />
            <label className="field">
              <span className="field__label">Senha</span>
              <input className="input" type="password" name="password" autoFocus required placeholder="sua senha de autor" />
            </label>
            {error ? <p style={{ color: 'var(--error)', fontSize: '0.9rem' }}>Senha incorreta. Tente de novo.</p> : null}
            <button className="btn" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Entrar</button>
          </form>
          <p className="muted" style={{ fontSize: '0.82rem', marginTop: '1.25rem' }}>
            Senha padrão: <code className="mono">turistando</code>. Depois de entrar, você troca em <strong>Configurações</strong> — sem precisar de arquivo nenhum.
          </p>
        </div>
      </div>
    </div>
  );
}
