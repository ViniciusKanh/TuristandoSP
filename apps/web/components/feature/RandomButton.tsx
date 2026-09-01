'use client';

import { useRouter } from 'next/navigation';

/** "Surpreenda-me" — abre uma exploração aleatória. */
export function RandomButton({ slugs, className, children }: { slugs: string[]; className?: string; children?: React.ReactNode }) {
  const router = useRouter();
  function go() {
    if (!slugs.length) return;
    const s = slugs[Math.floor(Math.random() * slugs.length)]!;
    router.push(`/exploracoes/${s}`);
  }
  return (
    <button type="button" className={className || 'btn btn-ghost'} onClick={go}>
      {children || '🎲 Surpreenda-me'}
    </button>
  );
}
