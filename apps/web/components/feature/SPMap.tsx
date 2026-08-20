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
  rating?: number;
  coverUrl?: string;
  coverDemo?: boolean;
  coverHue?: number;
}

// Limites da cidade de São Paulo (capital).
const SP_BOUNDS: [[number, number], [number, number]] = [
  [-24.01, -46.83],
  [-23.35, -46.36],
];
const SP_CENTER: [number, number] = [-23.5505, -46.6333];

const COLOR = { fav: '#C2502F', ret: '#C08A2E', vis: '#3F6076' };

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const themeNow = () => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

export interface SPMapProps {
  markers?: MapMarker[];
  picker?: boolean;
  initial?: { lat: number; lng: number };
  onPick?: (lat: number, lng: number) => void;
  height?: number | string;
  filters?: boolean;
  nearby?: boolean;
}

export function SPMap({ markers = [], picker = false, initial, onPick, height = 520, filters = false, nearby = false }: SPMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const countElRef = useRef<HTMLSpanElement | null>(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState('all');

  // chips de filtro com contagem
  const chips = useMemo(() => {
    const catCount = new Map<string, number>();
    markers.forEach((m) => m.categories.forEach((c) => catCount.set(c, (catCount.get(c) ?? 0) + 1)));
    const catChips = [...catCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([slug, n]) => ({ key: slug, label: categoryBySlug.get(slug)?.name ?? slug, n }));
    return [
      { key: 'all', label: 'Tudo', n: markers.length },
      { key: 'fav', label: 'Favoritos', n: markers.filter((m) => m.favorite).length },
      { key: 'ret', label: 'Quero voltar', n: markers.filter((m) => m.wantToReturn).length },
      { key: 'free', label: 'Grátis', n: markers.filter((m) => m.free).length },
      ...catChips,
    ].filter((c) => c.n > 0);
  }, [markers]);

  // ---- pino em gota, desenhado ----
  function pinIcon(L: any, color: string, size: number, opts: { fav?: boolean; count?: number } = {}) {
    const w = size;
    const h = Math.round(size * 1.32);
    const star = opts.fav
      ? `<text x="12" y="15.2" text-anchor="middle" font-size="8.5" font-weight="700" fill="${color}">★</text>`
      : `<circle cx="12" cy="11.5" r="2.4" fill="${color}"/>`;
    const badge =
      (opts.count ?? 0) > 1
        ? `<span class="sp-pin__badge">${opts.count}</span>`
        : '';
    return L.divIcon({
      className: `sp-pin${opts.fav ? ' sp-pin--fav' : ''}`,
      html: `<div class="sp-pin__wrap" style="--pin:${color};width:${w}px;height:${h}px">
        <svg viewBox="0 0 24 32" width="${w}" height="${h}" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.3 0 11.85 0 20.7 12 32 12 32s12-11.3 12-20.15C24 5.3 18.63 0 12 0z" fill="${color}"/>
          <circle cx="12" cy="11.5" r="5" fill="#FEFBF2"/>
          ${star}
        </svg>${badge}
      </div>`,
      iconSize: [w, h],
      iconAnchor: [w / 2, h],
      popupAnchor: [0, -h + 8],
    });
  }

  const pinSize = (m: MapMarker) => Math.min(46, 28 + Math.min(m.explorations, 6) * 3);
  const pinColor = (m: MapMarker) => (m.favorite ? COLOR.fav : m.wantToReturn ? COLOR.ret : COLOR.vis);

  // init do mapa (uma vez)
  useEffect(() => {
    let disposed = false;
    let themeObserver: MutationObserver | null = null;
    (async () => {
      const L = (await import('leaflet')).default;
      if (disposed || !ref.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(ref.current, {
        center: initial ? [initial.lat, initial.lng] : SP_CENTER,
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: SP_BOUNDS,
        maxBoundsViscosity: 0.9,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      tileRef.current = L.tileLayer(TILES[themeNow()], { maxZoom: 19, detectRetina: true }).addTo(map);
      L.control.attribution({ position: 'bottomright', prefix: false }).addAttribution('© OpenStreetMap · CARTO').addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);

      // troca as tiles junto com o tema do site
      themeObserver = new MutationObserver(() => {
        const url = TILES[themeNow()];
        if (tileRef.current && tileRef.current._url !== url) tileRef.current.setUrl(url);
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      if (picker) {
        const start = initial ?? { lat: SP_CENTER[0], lng: SP_CENTER[1] };
        const m = L.marker([start.lat, start.lng], { draggable: true, icon: pinIcon(L, COLOR.ret, 40) }).addTo(map);
        const emit = (lat: number, lng: number) => onPick?.(Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6);
        m.on('dragend', () => { const p = m.getLatLng(); emit(p.lat, p.lng); });
        map.on('click', (e: any) => { m.setLatLng(e.latlng); emit(e.latlng.lat, e.latlng.lng); });
      } else {
        layerRef.current = L.layerGroup().addTo(map);

        // controle: contador dinâmico (canto superior esquerdo)
        const CountCtrl = L.Control.extend({
          onAdd() {
            const el = L.DomUtil.create('div', 'sp-map__count');
            el.innerHTML = `<strong data-count>0</strong> lugares no mapa`;
            countElRef.current = el.querySelector('[data-count]');
            return el;
          },
        });
        new CountCtrl({ position: 'topleft' }).addTo(map);

        // controle: "ver tudo" (reenquadrar)
        const FitCtrl = L.Control.extend({
          onAdd() {
            const el = L.DomUtil.create('button', 'sp-map__fit');
            el.type = 'button';
            el.title = 'Ver todos os lugares';
            el.innerHTML = '⤢ Ver tudo';
            L.DomEvent.on(el, 'click', (ev: any) => {
              L.DomEvent.stop(ev);
              fitAll();
            });
            return el;
          },
        });
        new FitCtrl({ position: 'topright' }).addTo(map);

        // legenda flutuante (canto inferior esquerdo)
        const LegendCtrl = L.Control.extend({
          onAdd() {
            const el = L.DomUtil.create('div', 'sp-map__legend');
            el.innerHTML = `
              <span><i style="background:${COLOR.fav}"></i>Favorito</span>
              <span><i style="background:${COLOR.ret}"></i>Quero voltar</span>
              <span><i style="background:${COLOR.vis}"></i>Visitado</span>`;
            return el;
          },
        });
        new LegendCtrl({ position: 'bottomleft' }).addTo(map);

        // controle: "perto de mim" (geolocalização do leitor)
        if (nearby && typeof navigator !== 'undefined' && navigator.geolocation) {
          let meMarker: any = null;
          const NearbyCtrl = L.Control.extend({
            onAdd() {
              const el = L.DomUtil.create('button', 'sp-map__near');
              el.type = 'button';
              el.title = 'Ver lugares perto de mim';
              el.innerHTML = '📍 Perto de mim';
              L.DomEvent.on(el, 'click', (ev: any) => {
                L.DomEvent.stop(ev);
                el.innerHTML = 'Localizando…';
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const { latitude, longitude } = pos.coords;
                    if (meMarker) meMarker.remove();
                    meMarker = L.marker([latitude, longitude], {
                      icon: L.divIcon({ className: 'sp-me', html: '<span class="sp-me__dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }),
                    }).addTo(map);
                    meMarker.bindPopup('<b>Você está aqui</b>');
                    map.setView([latitude, longitude], 14, { animate: true });
                    el.innerHTML = '📍 Perto de mim';
                  },
                  () => { el.innerHTML = '📍 Perto de mim'; alert('Não consegui pegar sua localização. Verifique a permissão do navegador.'); },
                  { enableHighAccuracy: true, timeout: 8000 },
                );
              });
              return el;
            },
          });
          new NearbyCtrl({ position: 'bottomright' }).addTo(map);
        }

        setReady(true);
      }
    })();
    return () => {
      disposed = true;
      themeObserver?.disconnect();
      if (mapRef.current?.remove) mapRef.current.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fitAll() {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const vis = visibleMarkers();
    if (vis.length > 1) {
      map.fitBounds(L.latLngBounds(vis.map((m) => [m.geo.lat, m.geo.lng])).pad(0.25), { maxZoom: 15, animate: true });
    } else if (vis.length === 1) {
      map.setView([vis[0]!.geo.lat, vis[0]!.geo.lng], 15, { animate: true });
    } else {
      map.setView(SP_CENTER, 12, { animate: true });
    }
  }

  function visibleMarkers() {
    return markers.filter((m) => {
      if (filter === 'all') return true;
      if (filter === 'free') return m.free;
      if (filter === 'fav') return m.favorite;
      if (filter === 'ret') return m.wantToReturn;
      return m.categories.includes(filter);
    });
  }

  // (re)desenha marcadores quando filtro/markers mudam
  useEffect(() => {
    if (picker || !ready) return;
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();

    const visible = visibleMarkers();
    if (countElRef.current) countElRef.current.textContent = String(visible.length);

    for (const mk of visible) {
      const color = pinColor(mk);
      const marker = L.marker([mk.geo.lat, mk.geo.lng], {
        icon: pinIcon(L, color, pinSize(mk), { fav: mk.favorite, count: mk.explorations }),
        riseOnHover: true,
        title: mk.name,
      }).addTo(layer);

      const round = Math.round(mk.rating ?? 0);
      const stars = mk.rating
        ? `<div class="mappop__stars">${'★'.repeat(round)}<span class="off">${'★'.repeat(5 - round)}</span></div>`
        : '';
      const cover =
        mk.coverUrl && !mk.coverDemo
          ? `<div class="mappop__img" style="background-image:url('${escapeHtml(mk.coverUrl)}')"></div>`
          : `<div class="mappop__img mappop__img--demo" style="--hue:${mk.coverHue ?? 30}"></div>`;
      marker.bindPopup(
        `<div class="mappop">
          ${cover}
          <div class="mappop__body">
            <div class="mappop__hood">${escapeHtml(mk.neighborhoodName)}</div>
            <div class="mappop__name">${escapeHtml(mk.name)}</div>
            ${stars}
            <div class="mappop__meta">${mk.explorations} ${mk.explorations === 1 ? 'exploração' : 'explorações'} · ${mk.free ? 'grátis' : 'pago'}</div>
            <a class="mappop__link" href="/lugares/${mk.slug}">Abrir lugar →</a>
          </div>
        </div>`,
        { closeButton: true, className: 'mappop-wrap', maxWidth: 260, minWidth: 220 },
      );
    }

    if (visible.length > 1) {
      map.fitBounds(L.latLngBounds(visible.map((m) => [m.geo.lat, m.geo.lng])).pad(0.25), { maxZoom: 14 });
    } else if (visible.length === 1) {
      map.setView([visible[0]!.geo.lat, visible[0]!.geo.lng], 14);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, filter, markers]);

  return (
    <div>
      {filters && !picker ? (
        <div className="chips sp-map__chips">
          {chips.map((c) => (
            <button key={c.key} type="button" className="chip" aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>
              {c.label} <span className="chip__n">{c.n}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="sp-map__frame">
        <div ref={ref} className="sp-map" style={{ height, width: '100%' }} aria-label="Mapa de São Paulo" />
      </div>
    </div>
  );
}
