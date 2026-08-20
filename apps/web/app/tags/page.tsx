import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Navegue pelas explorações por tema.',
  alternates: { canonical: '/tags' },
};
export const dynamic = 'force-dynamic';

export default async function TagsPage() {
  const tags = await getAllTags();
  const max = Math.max(1, ...tags.map((t) => t.count));
  return (
    <div className="section container container-wide">
      <UrbanLabel>Explorar por tema</UrbanLabel>
      <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>Tags</h1>
      <p className="lead" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
        Cada tag reúne as explorações que compartilham um tema. Quanto maior, mais aparece no diário.
      </p>
      {tags.length === 0 ? (
        <div className="empty-state">Ainda não há tags — elas aparecem conforme eu publico.</div>
      ) : (
        <div className="tag-cloud">
          {tags.map((t) => {
            const scale = 0.9 + (t.count / max) * 1.1;
            return (
              <Link key={t.tag} href={`/tags/${t.tag}`} className="tag-cloud__item" style={{ fontSize: `${scale}rem` }}>
                {t.tag.replace(/-/g, ' ')} <span className="tag-cloud__n">{t.count}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
