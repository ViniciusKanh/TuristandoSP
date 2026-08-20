import type { Metadata } from 'next';
import { getMapMarkers, getStats } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';
import { SPMap } from '@/components/feature/SPMap';
import { WeatherWidget } from '@/components/feature/WeatherWidget';

export const metadata: Metadata = {
  title: 'Meu mapa de São Paulo',
  description: 'Cada ponto no mapa tem uma história. Os lugares que já explorei pela cidade de São Paulo.',
  alternates: { canonical: '/mapa' },
};
export const dynamic = 'force-dynamic';

export default async function MapaPage() {
  const [markers, stats] = await Promise.all([getMapMarkers(), getStats()]);

  return (
    <div className="section container container-wide">
      <div className="section-head">
        <div>
          <UrbanLabel>Mapa · Rotas pela cidade</UrbanLabel>
          <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>Meu mapa de São Paulo</h1>
          <p className="lead" style={{ marginTop: '1rem' }}>
            {markers.length} {markers.length === 1 ? 'lugar' : 'lugares'} já explorados pela capital. Cada ponto é um lugar onde eu fui.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="big-number" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>{stats.places}</div>
          <div className="u-label">lugares no mapa</div>
        </div>
      </div>

      <div style={{ margin: '0 0 1.25rem' }}><WeatherWidget /></div>

      <SPMap markers={markers} height={600} filters nearby />

      <p className="coord" style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-faint)' }}>
        Clique num ponto para ver o lugar · o mapa é limitado à cidade de São Paulo
      </p>
    </div>
  );
}
