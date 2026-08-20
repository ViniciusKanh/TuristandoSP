import type { Metadata } from 'next';
import { UrbanLabel } from '@/components/brand';
import { SavedList } from '@/components/feature/SavedList';

export const metadata: Metadata = {
  title: 'Salvos',
  description: 'As explorações que você guardou para ler depois.',
  robots: { index: false },
  alternates: { canonical: '/salvos' },
};

export default function SalvosPage() {
  return (
    <div className="section container container-wide">
      <UrbanLabel>Sua lista</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>Ler depois</h1>
      <p className="lead" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
        O que você salvou fica aqui — guardado só neste navegador, sem precisar de login.
      </p>
      <SavedList />
    </div>
  );
}
