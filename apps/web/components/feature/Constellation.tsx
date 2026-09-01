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

const W = 900;
const H = 520;

export function Constellation({ nodes }: { nodes: ConstNode[] }) {
  const { pos, edges } = useMemo(() => {
    const cx = W / 2;
    const cy = H / 2;
    const rx = W * 0.4;
    const ry = H * 0.37;
    const n = nodes.length;
    const pos = nodes.map((_, k) => {
      const ang = -Math.PI / 2 + (k / Math.max(1, n)) * Math.PI * 2;
      return { x: cx + rx * Math.cos(ang), y: cy + ry * Math.sin(ang) };
    });
    const edges: { i: number; j: number; shared: number; why: string[] }[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const why: string[] = [];
        if (a.hood && a.hood === b.hood) why.push(a.hood);
        const sharedCats = a.cats.filter((c) => b.cats.includes(c));
        const sharedTags = a.tags.filter((t) => b.tags.includes(t));
        const shared = (a.hood === b.hood ? 1 : 0) + sharedCats.length + sharedTags.length;
        if (shared > 0) edges.push({ i, j, shared, why: [...why, ...sharedCats, ...sharedTags] });
      }
    }
    return { pos, edges };
  }, [nodes]);

  const [active, setActive] = useState<number | null>(null);

  const connectedTo = (k: number) =>
    active === null || k === active || edges.some((e) => (e.i === active && e.j === k) || (e.j === active && e.i === k));

  const activeNode = active !== null ? nodes[active] : null;
  const activeLinks =
    active !== null
      ? edges
          .filter((e) => e.i === active || e.j === active)
          .map((e) => ({ other: nodes[e.i === active ? e.j : e.i]!, why: e.why }))
      : [];

  return (
    <div className="constel">
      <div className="constel__stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="constel__svg" role="img" aria-label="Rede de explorações conectadas por bairro, categoria e tema">
          {edges.map((e, idx) => {
            const p = pos[e.i]!;
            const q = pos[e.j]!;
            const on = active === null || e.i === active || e.j === active;
            return (
              <line
                key={idx}
                x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                className={`constel__edge ${on ? 'is-on' : 'is-off'}`}
                strokeWidth={Math.min(3.2, 1 + e.shared * 0.7)}
              />
            );
          })}
          {nodes.map((nd, k) => {
            const p = pos[k]!;
            return (
              <g
                key={nd.slug}
                transform={`translate(${p.x}, ${p.y})`}
                className={`constel__node ${active === k ? 'is-active' : ''} ${!connectedTo(k) ? 'is-dim' : ''}`}
                onMouseEnter={() => setActive(k)}
                onClick={() => setActive(k)}
                tabIndex={0}
                onFocus={() => setActive(k)}
                role="button"
                aria-label={`${nd.title} — ${nd.place}`}
              >
                <circle className="constel__halo" r={30} />
                <circle className="constel__dot" r={22} style={{ ['--hue' as string]: String(nd.hue) }} />
                <text className="constel__num" textAnchor="middle" dy="5">{nd.number}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={`constel__panel ${activeNode ? 'is-on' : ''}`}>
        {activeNode ? (
          <>
            <span className="u-label">EXP.{String(activeNode.number).padStart(3, '0')} · {activeNode.place}</span>
            <h3 className="constel__title">{activeNode.title}</h3>
            {activeLinks.length ? (
              <div className="constel__links">
                <span className="constel__links-h">Conecta com {activeLinks.length} {activeLinks.length === 1 ? 'parada' : 'paradas'}:</span>
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
            <span className="u-label">Passe o mouse ou toque</span>
            <p className="constel__hint">Cada ponto é uma exploração. As linhas ligam as que <strong>compartilham um bairro, uma categoria ou um tema</strong>. É a teia da minha São Paulo se formando.</p>
          </>
        )}
      </div>
    </div>
  );
}
