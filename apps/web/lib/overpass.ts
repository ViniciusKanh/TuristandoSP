export interface POI {
  name: string;
  kind: string;
  emoji: string;
}

const KIND: Record<string, { label: string; emoji: string }> = {
  cafe: { label: 'Café', emoji: '☕' },
  restaurant: { label: 'Restaurante', emoji: '🍽️' },
  bar: { label: 'Bar', emoji: '🍺' },
  bakery: { label: 'Padaria', emoji: '🥐' },
  station: { label: 'Estação', emoji: '🚇' },
  park: { label: 'Praça/Parque', emoji: '🌳' },
};

/** POIs a pé de um ponto, via Overpass (OpenStreetMap, grátis). Timeout curto + fallback. */
export async function getNearbyPOIs(lat: number, lng: number): Promise<POI[]> {
  const query = `[out:json][timeout:6];
(
  node(around:450,${lat},${lng})[amenity~"^(cafe|restaurant|bar)$"][name];
  node(around:450,${lat},${lng})[shop=bakery][name];
  node(around:700,${lat},${lng})[railway=station][name];
  node(around:700,${lat},${lng})[station=subway][name];
  node(around:500,${lat},${lng})[leisure=park][name];
);
out body 24;`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6500);
  try {
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      signal: ctrl.signal,
      headers: { accept: 'application/json' },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return [];
    const j = (await res.json()) as { elements?: { tags?: Record<string, string> }[] };
    const seen = new Set<string>();
    const out: POI[] = [];
    for (const el of j.elements ?? []) {
      const t = el.tags ?? {};
      const name = t.name;
      if (!name || seen.has(name)) continue;
      let key = '';
      if (t.amenity && KIND[t.amenity]) key = t.amenity;
      else if (t.shop === 'bakery') key = 'bakery';
      else if (t.railway === 'station' || t.station === 'subway') key = 'station';
      else if (t.leisure === 'park') key = 'park';
      if (!key) continue;
      seen.add(name);
      out.push({ name, kind: KIND[key]!.label, emoji: KIND[key]!.emoji });
      if (out.length >= 10) break;
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
