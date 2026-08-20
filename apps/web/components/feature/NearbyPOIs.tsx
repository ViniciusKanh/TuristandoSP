import { getNearbyPOIs } from '@/lib/overpass';
import { UrbanLabel } from '@/components/brand';

/** Lista "o que tem por perto" (OpenStreetMap). Some se não achar nada. */
export async function NearbyPOIs({ lat, lng }: { lat: number; lng: number }) {
  const pois = await getNearbyPOIs(lat, lng);
  if (pois.length === 0) return null;
  return (
    <section className="section-tight container container-wide">
      <div className="section-head"><div><UrbanLabel>Ali do lado</UrbanLabel><h2 className="heading h2" style={{ marginTop: '0.6rem' }}>O que tem por perto</h2></div></div>
      <div className="poi-grid">
        {pois.map((p, i) => (
          <div className="poi" key={`${p.name}-${i}`}>
            <span className="poi__emoji" aria-hidden>{p.emoji}</span>
            <div>
              <div className="poi__name">{p.name}</div>
              <div className="poi__kind">{p.kind}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="coord" style={{ marginTop: '1rem', color: 'var(--text-faint)' }}>Dados do OpenStreetMap · a pé daqui</p>
    </section>
  );
}
