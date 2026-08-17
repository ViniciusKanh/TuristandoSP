import Link from 'next/link';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { Mark } from '@/components/brand/Icons';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/exploracoes/nova', label: '+ Exploração' },
  { href: '/admin/exploracoes', label: 'Explorações' },
  { href: '/admin/lugares/novo', label: '+ Lugar' },
  { href: '/admin/lugares', label: 'Lugares' },
  { href: '/admin/configuracoes', label: 'Configurações' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!authed) return <>{children}</>; // tela de login sem o chrome do painel

  return (
    <div>
      <div className="admin-bar">
        <div className="container container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', height: '58px' }}>
          <Link href="/admin" className="brand" style={{ fontSize: '1.05rem' }}>
            <Mark className="brand__mark" aria-hidden />
            <span>PAINEL<span className="brand__accent">SP</span></span>
          </Link>
          <nav className="nav" style={{ display: 'flex', gap: '1.2rem' }}>
            {NAV.map((i) => (
              <Link key={i.href} href={i.href}>{i.label}</Link>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <Link href="/" className="tag" target="_blank">Ver site ↗</Link>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-ghost btn-sm" type="submit">Sair</button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
