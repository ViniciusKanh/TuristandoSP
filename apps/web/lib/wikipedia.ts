
export interface WikiSummary {
  title: string;
  extract: string;
  url: string;
  thumbnail?: string;
}

/** Resumo da Wikipédia em PT (REST v1, grátis). Retorna null se não achar. */
export async function getWikiSummary(query: string): Promise<WikiSummary | null> {
  const title = query.trim();
  if (!title) return null;
  try {
    const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`;
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'TuristandoSP/1.0 (blog pessoal)' },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      type?: string;
      title?: string;
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
      thumbnail?: { source?: string };
    };
    if (j.type === 'disambiguation' || !j.extract) return null;
    return {
      title: j.title ?? title,
      extract: j.extract,
      url: j.content_urls?.desktop?.page ?? `https://pt.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      thumbnail: j.thumbnail?.source,
    };
  } catch {
    return null;
  }
}
