import { getWikiSummary } from '@/lib/wikipedia';

/** Card com resumo da Wikipédia. Não renderiza nada se não encontrar. */
export async function WikiCard({ query, label = 'Da Wikipédia' }: { query: string; label?: string }) {
  const w = await getWikiSummary(query);
  if (!w) return null;
  return (
    <aside className="wikicard">
      {w.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="wikicard__img" src={w.thumbnail} alt={w.title} loading="lazy" />
      ) : null}
      <div className="wikicard__body">
        <span className="u-label">{label}</span>
        <p className="wikicard__text">{w.extract}</p>
        <a className="wikicard__link" href={w.url} target="_blank" rel="noopener noreferrer">Ler na Wikipédia →</a>
      </div>
    </aside>
  );
}
