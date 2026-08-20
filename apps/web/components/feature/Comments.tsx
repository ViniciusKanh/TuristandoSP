'use client';

import { useEffect, useRef } from 'react';

/**
 * Comentários via Giscus (GitHub Discussions, grátis).
 * Configure em .env com NEXT_PUBLIC_GISCUS_REPO, _REPO_ID, _CATEGORY, _CATEGORY_ID.
 * Sem config, não renderiza nada.
 */
export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    const el = ref.current;
    if (!el || !repo || !repoId || !categoryId) return;
    el.innerHTML = '';
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', repo);
    s.setAttribute('data-repo-id', repoId);
    s.setAttribute('data-category', category || 'General');
    s.setAttribute('data-category-id', categoryId);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', document.documentElement.dataset.theme === 'dark' ? 'dark_dimmed' : 'light');
    s.setAttribute('data-lang', 'pt');
    el.appendChild(s);
  }, [repo, repoId, category, categoryId]);

  if (!repo || !repoId || !categoryId) return null;
  return (
    <section className="section-tight container container-wide">
      <div className="section-head"><h2 className="heading h2">Comentários</h2></div>
      <div ref={ref} className="comments" />
    </section>
  );
}
