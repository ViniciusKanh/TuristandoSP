import Link from 'next/link';
import { UrbanLabel } from '@/components/brand';

export default function NotFound() {
  return (
    <div className="section container container-wide" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div>
        <UrbanLabel>Erro · 404 · Rua sem saída</UrbanLabel>
        <h1 className="display title-xl" style={{ margin: '1rem 0' }}>Essa esquina eu ainda não mapeei.</h1>
        <p className="lead" style={{ margin: '0 auto 2rem' }}>A cidade é grande demais para conhecer de uma vez — e essa página não existe (ainda).</p>
        <Link href="/" className="btn">Voltar ao início</Link>
      </div>
    </div>
  );
}
