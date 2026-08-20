import { ImageResponse } from 'next/og';
import { formatExplorationNumber } from '@turistando/core';
import { getExploration, getPlace } from '@/lib/repo';

export const runtime = 'nodejs';
export const alt = 'Turistando São Paulo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const exp = await getExploration(params.slug).catch(() => null);
  const place = exp ? await getPlace(exp.placeSlug).catch(() => null) : null;
  const title = exp?.title ?? 'Turistando São Paulo';
  const kicker = exp ? `${formatExplorationNumber(exp.number)}` : 'Diário de bordo';
  const where = place ? [place.name, place.neighborhoodName, 'São Paulo'].filter(Boolean).join(' · ') : 'São Paulo, um lugar de cada vez';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F6EEDD',
          padding: '64px 72px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12, background: '#B5482C' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#B5482C', fontSize: 26, letterSpacing: 6, textTransform: 'uppercase', fontFamily: 'monospace' }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: '#B5482C' }} />
          Turistando SP
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 24, color: '#9C8A6F', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 18 }}>{kicker}</div>
          <div style={{ fontSize: title.length > 60 ? 62 : 76, fontWeight: 700, color: '#2B2117', lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 28, color: '#6B5B47' }}>
          <div style={{ maxWidth: 820 }}>{where}</div>
          <div style={{ color: '#B0812C', fontFamily: 'monospace', fontSize: 22 }}>leitura autoral</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
