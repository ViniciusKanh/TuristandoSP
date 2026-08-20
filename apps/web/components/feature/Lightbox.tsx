'use client';

import { useCallback, useEffect, useState } from 'react';

const SELECTOR = '.article figure .photo img';

/** Amplia as fotos do artigo em tela cheia. Monta uma vez e usa delegação de eventos. */
export function Lightbox() {
  const [items, setItems] = useState<string[]>([]);
  const [idx, setIdx] = useState(-1);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target.closest?.(SELECTOR) as HTMLImageElement | null;
      if (!img) return;
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(SELECTOR));
      const i = imgs.indexOf(img);
      if (i >= 0) {
        e.preventDefault();
        setItems(imgs.map((im) => im.currentSrc || im.src));
        setIdx(i);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const close = useCallback(() => setIdx(-1), []);
  const move = useCallback(
    (d: number) => setIdx((i) => (items.length ? (i + d + items.length) % items.length : -1)),
    [items.length],
  );

  useEffect(() => {
    if (idx < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [idx, close, move]);

  if (idx < 0) return null;
  return (
    <div className="lightbox" onClick={close} role="dialog" aria-modal="true" aria-label="Foto ampliada">
      <button className="lightbox__close" onClick={close} type="button" aria-label="Fechar">✕</button>
      {items.length > 1 ? (
        <button className="lightbox__nav lightbox__nav--prev" type="button" onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Anterior">‹</button>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lightbox__img" src={items[idx]} alt="" onClick={(e) => e.stopPropagation()} />
      {items.length > 1 ? (
        <button className="lightbox__nav lightbox__nav--next" type="button" onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Próxima">›</button>
      ) : null}
      {items.length > 1 ? <span className="lightbox__count">{idx + 1} / {items.length}</span> : null}
    </div>
  );
}
