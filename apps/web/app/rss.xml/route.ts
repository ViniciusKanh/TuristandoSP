import { siteConfig, placeBySlug } from '@turistando/core';
import { getPublishedExplorations } from '@/lib/repo';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

function esc(s: string) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
}

export async function GET() {
  const exps = await getPublishedExplorations();
  const items = exps
    .map((e) => {
      const place = placeBySlug.get(e.placeSlug);
      const url = `${SITE_URL}/exploracoes/${e.slug}`;
      const desc = e.subtitle || `Exploração ${e.number}${place ? ` — ${place.name}` : ''}`;
      const date = e.publishedAt ? new Date(e.publishedAt).toUTCString() : new Date(e.date).toUTCString();
      return `    <item>
      <title>${esc(e.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${esc(desc)}</description>
      ${(e.tags ?? []).map((t) => `<category>${esc(t)}</category>`).join('')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteConfig.siteName)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(siteConfig.description)}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=3600' },
  });
}
