export default function Loading() {
  return (
    <div className="section container" style={{ display: 'grid', placeItems: 'center', minHeight: '50vh', gap: '1rem' }}>
      <div className="spinner" aria-hidden />
      <p className="coord" style={{ color: 'var(--text-faint)' }}>Carregando a próxima parada…</p>
    </div>
  );
}
