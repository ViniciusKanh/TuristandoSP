import type { PhotoRef } from '@turistando/core';

/**
 * Foto real (quando há URL) ou um placeholder urbano sóbrio — duotone com
 * linhas cartográficas e um marcador, mantendo a identidade sem poluir.
 * Ao publicar, troca-se por a imagem real do storage.
 */
export function Photo({
  photo,
  className,
  showCaption = false,
  priority = false,
}: {
  photo: PhotoRef;
  className?: string;
  showCaption?: boolean;
  priority?: boolean;
}) {
  const isReal = photo.url && !photo.demo;
  return (
    <figure className={className} style={{ margin: 0 }}>
      <div className="photo" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        {isReal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={photo.alt} loading={priority ? 'eager' : 'lazy'} />
        ) : (
          <MapPlaceholder hue={photo.hue ?? 30} seed={photo.id} alt={photo.alt} />
        )}
      </div>
      {showCaption && photo.caption ? <figcaption className="photo__cap">{photo.caption}</figcaption> : null}
    </figure>
  );
}

function MapPlaceholder({ hue, seed, alt }: { hue: number; seed: string; alt: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };
  const c1 = `hsl(${hue} 34% 30%)`;
  const c2 = `hsl(${(hue + 18) % 360} 30% 20%)`;
  // algumas "vias" diagonais sutis
  const roads = Array.from({ length: 4 }, () => ({ y: 8 + rand() * 50, w: 0.4 + rand() * 0.6 }));
  const px = 20 + rand() * 60;
  const py = 22 + rand() * 26;

  return (
    <svg className="photo__demo" viewBox="0 0 100 66" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt}>
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <pattern id={`grid-${seed}`} width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M7 0H0V7" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.25" />
        </pattern>
      </defs>
      <rect width="100" height="66" fill={`url(#g-${seed})`} />
      <rect width="100" height="66" fill={`url(#grid-${seed})`} />
      {roads.map((r, i) => (
        <line key={i} x1="-5" y1={r.y} x2="105" y2={r.y + (rand() - 0.5) * 20} stroke="rgba(255,255,255,0.09)" strokeWidth={r.w} />
      ))}
      {/* marcador urbano */}
      <circle cx={px} cy={py} r="2.4" fill="none" stroke={`hsl(${hue} 70% 66%)`} strokeWidth="0.7" />
      <circle cx={px} cy={py} r="0.8" fill={`hsl(${hue} 70% 66%)`} />
      <line x1={px} y1={py + 2.4} x2={px} y2={py + 6} stroke={`hsl(${hue} 70% 66%)`} strokeWidth="0.5" />
      <text x="4" y="62" fill="rgba(255,255,255,0.35)" fontSize="2.4" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}>SÃO PAULO · SP</text>
    </svg>
  );
}
