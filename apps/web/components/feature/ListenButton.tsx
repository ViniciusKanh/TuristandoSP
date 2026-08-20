'use client';

import { useEffect, useState } from 'react';

/** Lê a matéria em voz alta com a Web Speech API (nativa, grátis). */
export function ListenButton() {
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    };
  }, []);

  function collect(): string {
    const a = document.querySelector('.article');
    if (!a) return '';
    return Array.from(a.querySelectorAll('p, h2, h3, blockquote'))
      .map((e) => e.textContent?.trim())
      .filter(Boolean)
      .join('. ');
  }

  function toggle() {
    const synth = window.speechSynthesis;
    if (state === 'playing') { synth.pause(); setState('paused'); return; }
    if (state === 'paused') { synth.resume(); setState('playing'); return; }
    const text = collect();
    if (!text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 1;
    u.onend = () => setState('idle');
    u.onerror = () => setState('idle');
    synth.speak(u);
    setState('playing');
  }

  function stop() {
    window.speechSynthesis.cancel();
    setState('idle');
  }

  if (!supported) return null;
  return (
    <span className="listen">
      <button type="button" className="listen__btn" onClick={toggle}>
        {state === 'playing' ? '⏸ Pausar' : state === 'paused' ? '▶ Continuar' : '🔊 Ouvir a matéria'}
      </button>
      {state !== 'idle' ? <button type="button" className="listen__stop" onClick={stop} aria-label="Parar leitura">■</button> : null}
    </span>
  );
}
