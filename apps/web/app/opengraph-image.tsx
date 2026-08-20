import { ImageResponse } from 'next/og';
import { siteConfig } from '@turistando/core';

export const runtime = 'nodejs';
export const alt = 'Turistando São Paulo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 28,
          background: '#F6EEDD',
          padding: '72px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12, background: '#B5482C' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#B5482C', fontSize: 30, letterSpacing: 8, textTransform: 'uppercase', fontFamily: 'monospace' }}>
          <div style={{ width: 46, height: 46, borderRadius: 999, background: '#B5482C' }} />
          Turistando SP
        </div>
        <div style={{ fontSize: 82, fontWeight: 700, color: '#2B2117', lineHeight: 1.03, maxWidth: 1000 }}>
          São Paulo, um lugar de cada vez.
        </div>
        <div style={{ fontSize: 32, color: '#6B5B47', maxWidth: 900 }}>{siteConfig.description}</div>
      </div>
    ),
    { ...size },
  );
}
