'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from '../brand/Icons';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = (localStorage.getItem('tsp-theme') as Theme | null) ?? null;
    const initial: Theme =
      stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('tsp-theme', next);
  }

  return (
    <button className="icon-btn" onClick={toggle} aria-label="Alternar tema claro/escuro" type="button">
      {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </button>
  );
}
