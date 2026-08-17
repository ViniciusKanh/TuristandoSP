import { NextResponse } from 'next/server';
import { createSession, SESSION_COOKIE } from '@/lib/auth';
import { getSetting } from '@/lib/repo';

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get('password') ?? '');
  const raw = String(form.get('next') || '/admin');
  const next = raw.startsWith('/') ? raw : '/admin';

  const expected = (await getSetting('adminPassword').catch(() => undefined)) || process.env.ADMIN_PASSWORD || 'turistando';
  if (!safeEqual(password, expected)) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('error', '1');
    url.searchParams.set('next', next);
    return NextResponse.redirect(url, 303);
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(SESSION_COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
