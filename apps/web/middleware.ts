import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // login e endpoints de auth ficam livres
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  const ok = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
