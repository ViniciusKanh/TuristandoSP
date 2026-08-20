import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/repo';
import { UrbanLabel } from '@/components/brand';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale comigo e acompanhe as próximas explorações por São Paulo.',
  alternates: { canonical: '/contato' },
};
export const dynamic = 'force-dynamic';

export default async function ContatoPage() {
  const s = await getSettings();
  const instagram = s.instagram?.replace(/^@/, '');
  const channels: { label: string; value: string; href: string }[] = [];
  if (instagram) channels.push({ label: 'Instagram', value: `@${instagram}`, href: `https://instagram.com/${instagram}` });
  if (s.contactEmail) channels.push({ label: 'E-mail', value: s.contactEmail, href: `mailto:${s.contactEmail}` });
  if (s.youtube) channels.push({ label: 'YouTube', value: s.youtube, href: s.youtube.startsWith('http') ? s.youtube : `https://youtube.com/${s.youtube}` });

  return (
    <div className="section container">
      <div style={{ maxWidth: '46rem', marginInline: 'auto', textAlign: 'center' }}>
        <UrbanLabel>Vamos conversar</UrbanLabel>
        <h1 className="display title-xl" style={{ marginTop: '0.75rem' }}>Fala comigo</h1>
        <p className="lead" style={{ marginTop: '1rem', marginInline: 'auto' }}>
          Tem uma dica de lugar, quer trocar ideia sobre a cidade ou só dizer um oi? Toda semana sai uma parada nova —
          me segue por aí pra não perder as próximas explorações.
        </p>

        {channels.length ? (
          <div className="grid grid-3" style={{ marginTop: '2.5rem' }}>
            {channels.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="mini-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span className="u-label" style={{ color: 'var(--accent)' }}>{c.label}</span>
                <div className="h3" style={{ fontSize: '1.1rem', marginTop: '0.4rem', wordBreak: 'break-word' }}>{c.value}</div>
              </a>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: '2rem' }}>
            Em breve os canais de contato aparecem aqui. Configure seu Instagram e e-mail no painel, em Configurações.
          </p>
        )}

        <div style={{ marginTop: '3rem' }}>
          <Link href="/diario" className="btn">Ver as últimas explorações</Link>
        </div>
      </div>
    </div>
  );
}
