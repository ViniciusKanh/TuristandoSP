'use client';

import { useMemo, useState } from 'react';

export interface ConstNode {
  slug: string;
  number: number;
  title: string;
  place: string;
  hood: string;
  hue: number;
  cats: string[];
  tags: string[];
}

const W = 920;
const H = 560;
const PAD = 74;

interface Edge { i: number; j: number; shared: number; why: string[] }

/** Layout por força (determinístico): aproxima o que se conecta, afasta o resto. */
function forceLayout(n: number, edges: Edge[]): { x: number; y: number }[] {
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) * 0.33;
  const p = Array.from({ length: n }, (_, i) => ({
    x: cx + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
    y: cy + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
    vx: 0, vy: 0,
  }));
  for (let it = 0; it < 420; it++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = p[i]!.x - p[j]!.x;
        let dy = p[i]!.y - p[j]!.y;
        const d2 = dx * dx + dy * dy || 0.01;
        const d = Math.sqrt(d2);
        const rep = 30000 / d2;
        const fx = (dx / d) * rep;
        const fy = (dy / d) * rep;
        p[i]!.vx += fx; p[i]!.vy += fy; p[j]!.vx -= fx; p[j]!.vy -= fy;
      }
    }
    for (const e of edges) {
      const a = p[e.i]!;
      const b = p[e.j]!;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const rest = 165 - Math.min(70, e.shared * 20);
      const f = (d - rest) * 0.02;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    }
    for (let i = 0; i < n; i++) {
      p[i]!.vx += (cx - p[i]!.x) * 0.006;
      p[i]!.vy += (cy - p[i]!.y) * 0.006;
      p[i]!.x += p[i]!.vx * 0.82; p[i]!.y += p[i]!.vy * 0.82;
      p[i]!.vx *= 0.55; p[i]!.vy *= 0.55;
      p[i]!.x = Math.max(PAD, Math.min(W - PAD, p[i]!.x));
      p[i]!.y = Math.max(PAD + 8, Math.min(H - PAD, p[i]!.y));
    }
  }
  return p.map((q) => ({ x: q.x, y: q.y }));
}

function edgePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const off = Math.min(40, len * 0.12);
  return `M ${a.x} ${a.y} Q ${mx + (-dy / len) * off} ${my + (dx / len) * off} ${b.x} ${b.y}`;
}

const pretty = (s: string) => s.replace(/-/g, ' ');

export function Constellation({ nodes }: { nodes: ConstNode[] }) {
  const { pos, edges, degree, legend } = useMemo(() => {
    const n = nodes.length;
    const edges: Edge[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const why: string[] = [];
        if (a.hood && a.hood === b.hood) why.push(a.hood);
        for (const c of a.cats) if (b.cats.includes(c)) why.push(pretty(c));
        for (const t of a.tags) if (b.tags.includes(t)) why.push(pretty(t));
        if (why.length) edges.push({ i, j, shared: why.length, why });
      }
    }
    const degree = nodes.map((_, k) => edges.filter((e) => e.i === k || e.j === k).length);
    const catCount = new Map<string, number>();
    nodes.forEach((nd) => nd.cats.forEach((c) => catCount.set(c, (catCount.get(c) ?? 0) + 1)));
    const legend = [...catCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([slug]) => slug);
    return { pos: forceLayout(n, edges), edges, degree, legend };
  }, [nodes]);

  const [active, setActive] = useState<number | null>(null);
  const [hlCat, setHlCat] = useState<string | null>(null);

  const rOf = (k: number) => 19 + Math.min(13, degree[k]! * 3);
  const connected = (k: number) => active === null || k === active || edges.some((e) => (e.i === active && e.j === k) || (e.j === active && e.i === k));
  const dim = (k: number) => (active !== null && !connected(k)) || (hlCat !== null && !nodes[k]!.cats.includes(hlCat));

  const activeNode = active !== null ? nodes[active]! : null;
  const activeLinks = active !== null
    ? edges.filter((e) => e.i === active || e.j === active).map((e) => ({ other: nodes[e.i === active ? e.j : e.i]!, why: e.why }))
    : [];

  return (
    <div className="constel">
      <div className="constel__stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="constel__svg" role="img" aria-label="Rede de explorações conectadas por bairro, categoria e tema">
          <g className="constel__edges">
            {edges.map((e, idx) => {
              const on = active === null ? true : e.i === active || e.j === active;
              return (
                <path
                  key={idx}
                  d={edgePath(pos[e.i]!, pos[e.j]!)}
                  className={`constel__edge ${active !== null ? (on ? 'is-on' : 'is-off') : ''}`}
                  fill="none"
                  strokeWidth={1 + e.shared * 0.8}
                />
              );
            })}
          </g>
          {nodes.map((nd, k) => {
            const p = pos[k]!;
            const r = rOf(k);
            return (
              <a key={nd.slug} href={`/exploracoes/${nd.slug}`} className="constel__anchor" aria-label={`${nd.title} — ${nd.place}`}>
                <g
                  transform={`translate(${p.x}, ${p.y})`}
                  className={`constel__node ${active === k ? 'is-active' : ''} ${dim(k) ? 'is-dim' : ''}`}
                  onMouseEnter={() => setActive(k)}
                  onFocus={() => setActive(k)}
                >
                  <circle className="constel__halo" r={r + 9} />
                  <circle className="constel__dot" r={r} style={{ ['--hue' as string]: String(nd.hue) }} />
                  <text className="constel__num" textAnchor="middle" dy="5">{nd.number}</text>
                  <text className="constel__label" textAnchor="middle" y={r + 17}>{nd.place || nd.title}</text>
                </g>
              </a>
            );
          })}
        </svg>

        {legend.length > 1 ? (
          <div className="constel__legend">
            <span className="constel__legend-h">Filtrar:</span>
            {legend.map((c) => (
              <button
                key={c}
                type="button"
                className={`constel__cat ${hlCat === c ? 'is-on' : ''}`}
                onMouseEnter={() => setHlCat(c)}
                onMouseLeave={() => setHlCat(null)}
                onClick={() => setHlCat((cur) => (cur === c ? null : c))}
              >
                {pretty(c)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="constel__panel">
        {activeNode ? (
          <>
            <span className="u-label">EXP.{String(activeNode.number).padStart(3, '0')} · {activeNode.place}</span>
            <h3 className="constel__title">{activeNode.title}</h3>
            {activeLinks.length ? (
              <div className="constel__links">
                <span className="constel__links-h">Se liga com {activeLinks.length} {activeLinks.length === 1 ? 'parada' : 'paradas'}:</span>
                {activeLinks.slice(0, 4).map((l) => (
                  <a key={l.other.slug} href={`/exploracoes/${l.other.slug}`} className="constel__chip">
                    {l.other.title} <span className="constel__why">· {l.why[0]}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="coord">Ainda sem conexões — uma ilha na cidade.</p>
            )}
            <a href={`/exploracoes/${activeNode.slug}`} className="btn btn-sm" style={{ marginTop: '0.9rem' }}>Abrir esta exploração →</a>
          </>
        ) : (
          <>
            <span className="u-label">A teia da cidade</span>
            <p className="constel__hint">Cada ponto é uma exploração; o tamanho cresce com o número de conexões. As linhas ligam as que <strong>dividem um bairro, uma categoria ou um tema</strong> — e as mais conectadas ficam mais perto. Passe o mouse pra explorar, clique pra abrir.</p>
          </>
        )}
      </div>
    </div>
  );
}
