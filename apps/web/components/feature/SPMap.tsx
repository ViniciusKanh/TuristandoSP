'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { categoryBySlug } from '@turistando/core';

export interface MapMarker {
  slug: string;
  name: string;
  neighborhoodName: string;
  geo: { lat: number; lng: number };
  categories: string[];
  free: boolean;
  favorite: boolean;
  wantToReturn: boolean;
  explorations: number;
}

// Limites da cidade de São Paulo (capital).
const SP_BOUNDS: [[number, number], [number, number]] = [
  [-24.01, -46.83],
  [-23.35, -46.36],
];
const SP_CENTER: [number, number] = [-23.5505, -46.6333];

const COLOR = { fav: '#B5482C', ret: '#B0812C', vis: '#3F5D75' };

export interface SPMapProps {
  markers?: MapMarker[];
  picker?: boolean;
  initial?: { lat: number; lng: number };
  onPick?: (lat: number, lng: number) => void;
  height?: number | string;
  filters?: boolean;
}

export function SPMap({ markers = [], picker = false, initial, onPick, height = 520, filters = false }: SPMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState('all');

  // categorias presentes nos marcadores → vira chips
  const chips = useMemo(() => {
    const cats = new Set<string>();
    markers.forEach((m) => m.categories.forEach((c) => cats.add(c)));
    const catChips = [...cats].map((slug) => ({ key: slug, label: categoryBySlug.get(slug)?.name ?? slug }));
    return [{ key: 'all', label: 'Tudo' }, ...catChips, { key: 'free', label: 'Grátis' }, { key: 'fav', label: 'Favoritos' }, { key: 'ret', label: 'Quero voltar' }];
  }, [markers]);

  // init do mapa (uma vez)
  useEffect(() => {
    let disposed = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (disposed || !ref.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(ref.current, {
        center: initial ? [initial.lat, initial.lng] : SP_CENTER,
        zoom: 12, minZoom: 10, maxZoom: 18,
        maxBounds: SP_BOUNDS, maxBoundsViscosity: 0.9, scrollWheelZoom: false,
      });
      mapRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19,
      }).addTo(map);

      const dot = (color: string, size = 16) =>
        L.divIcon({ className: 'sp-pin', html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #2A1E13;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

      if (picker) {
        const start = initial ?? { lat: SP_CENTER[0], lng: SP_CENTER[1] };
        const m = L.marker([start.lat, start.lng], { draggable: true, icon: dot(COLOR.ret, 20) }).addTo(map);
        const emit = (lat: number, lng: number) => onPick?.(Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6);
        m.on('dragend', () => { const p = m.getLatLng(); emit(p.lat, p.lng); });
        map.on('click', (e: any) => { m.setLatLng(e.latlng); emit(e.latlng.lat, e.latlng.lng); });
      } else {
        layerRef.current = L.layerGroup().addTo(map);
        setReady(true);
      }
    })();
    return () => {
      disposed = true;
      if (mapRef.current?.remove) mapRef.current.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (re)desenha marcadores quando filtro/markers mudam
  useEffect(() => {
    if (picker || !ready) return;
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();

    const dot = (color: string, size = 16) =>
      L.divIcon({ className: 'sp-pin', html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #2A1E13;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

    const visible = markers.filter((m) => {
      if (filter === 'all') return true;
      if (filter === 'free') return m.free;
      if (filter === 'fav') return m.favorite;
      if (filter === 'ret') return m.wantToReturn;
      return m.categories.includes(filter);
    });

    for (const mk of visible) {
      const color = mk.favorite ? COLOR.fav : mk.wantToReturn ? COLOR.ret : COLOR.vis;
      const marker = L.marker([mk.geo.lat, mk.geo.lng], { icon: dot(color) }).addTo(layer);
      marker.bindPopup(
        `<div style="font-family:system-ui;min-width:180px">
           <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8a8172">${mk.neighborhoodName}</div>
           <div style="font-weight:700;font-size:15px;margin:2px 0 4px">${mk.name}</div>
           <div style="font-size:12px;color:#5c554a;margin-bottom:6px">${mk.explorations} ${mk.explorations === 1 ? 'exploração' : 'explorações'} · ${mk.free ? 'grátis' : 'pago'}</div>
           <a href="/lugares/${mk.slug}" style="font-size:12px;font-weight:700;color:#2A1E13;border-bottom:2px solid #B0812C">Abrir lugar →</a>
         </div>`,
      );
    }
    if (visible.length > 1) {
      const b = L.latLngBounds(visible.map((m) => [m.geo.lat, m.geo.lng]));
      map.fitBounds(b.pad(0.2), { maxZoom: 14 });
    } else if (visible.length === 1) {
      map.setView([visible[0]!.geo.lat, visible[0]!.geo.lng], 14);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, filter, markers]);

  return (
    <div>
      {filters && !picker ? (
        <div className="chips" style={{ marginBottom: '1rem' }}>
          {chips.map((c) => (
            <button key={c.key} type="button" className="chip" aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>{c.label}</button>
          ))}
        </div>
      ) : null}
      <div ref={ref} className="sp-map" style={{ height, width: '100%' }} aria-label="Mapa de São Paulo" />
    </div>
  );
}
