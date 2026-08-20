'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="section container" style={{ display: 'grid', placeItems: 'center', minHeight: '55vh', textAlign: 'center', gap: '1rem' }}>
      <span className="u-label" style={{ justifyContent: 'center' }}>Ops · deu um nó na rota</span>
      <h1 className="display title-lg" style={{ maxWidth: '18ch' }}>Algo saiu do rumo por aqui</h1>
      <p className="lead" style={{ marginInline: 'auto' }}>Não consegui carregar esta página agora. Tente de novo — normalmente é passageiro.</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn" type="button" onClick={reset}>Tentar de novo</button>
        <a className="btn btn-ghost" href="/">Voltar ao início</a>
      </div>
    </div>
  );
}
