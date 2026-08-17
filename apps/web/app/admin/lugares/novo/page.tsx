import type { Metadata } from 'next';
import { UrbanLabel } from '@/components/brand';
import { PlaceForm } from '@/components/feature/NovoLugarForm';

export const metadata: Metadata = { title: 'Novo lugar', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function NovoLugarPage() {
  return (
    <div className="section container container-wide">
      <UrbanLabel>Cadastro · lugar permanente</UrbanLabel>
      <h1 className="display title-lg" style={{ marginTop: '0.6rem' }}>Cadastrar um lugar</h1>
      <p className="lead" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
        O bairro vem da lista completa de distritos de São Paulo (você pode buscar por CEP). Marque a coordenada no mapa — o ponto aparece no seu mapa na hora.
      </p>
      <PlaceForm />
    </div>
  );
}
