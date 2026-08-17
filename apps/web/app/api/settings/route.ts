import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getConnection, setConnection, maskSecret } from '@/lib/config';
import { getSettings, getSetting, setSettings } from '@/lib/repo';

const Input = z.object({
  siteName: z.string().optional(),
  tagline: z.string().optional(),
  heroImageUrl: z.string().optional(),
  heroHeadline: z.string().optional(),
  instagram: z.string().optional(),
  kmWalked: z.string().optional(),
  geminiApiKey: z.string().optional(),
  geminiModel: z.string().optional(),
  adminPassword: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutLead: z.string().optional(),
  aboutBody: z.string().optional(),
  aboutPhotoUrl: z.string().optional(),
  tursoUrl: z.string().optional(),
  tursoToken: z.string().optional(),
});

const SETTING_KEYS = ['siteName', 'tagline', 'heroImageUrl', 'heroHeadline', 'instagram', 'kmWalked', 'geminiApiKey', 'geminiModel', 'adminPassword', 'aboutTitle', 'aboutLead', 'aboutBody', 'aboutPhotoUrl'] as const;

async function guard() {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  const conn = getConnection();
  const s = await getSettings();
  return NextResponse.json({
    data: {
      ...s,
      tursoUrl: conn.tursoUrl,
      tursoToken: maskSecret(conn.tursoToken),
      geminiApiKey: (await getSetting('geminiApiKey')) ? '••••••••' : '',
      adminPassword: (await getSetting('adminPassword')) ? '••••••••' : '',
    },
  });
}

export async function POST(req: Request) {
  if (!(await guard())) return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });

  const ct = req.headers.get('content-type') ?? '';
  const raw = ct.includes('application/json') ? await req.json() : Object.fromEntries((await req.formData()).entries());
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: { message: 'Validação falhou', issues: parsed.error.flatten() } }, { status: 400 });
  const v = parsed.data;

  // Conexão do Turso → arquivo local (única coisa fora do banco)
  if (v.tursoUrl !== undefined || (v.tursoToken && !v.tursoToken.startsWith('••••'))) {
    setConnection({
      tursoUrl: v.tursoUrl,
      tursoToken: v.tursoToken && !v.tursoToken.startsWith('••••') ? v.tursoToken : undefined,
    });
  }

  // Demais configurações → banco
  const entries: Record<string, string> = {};
  for (const k of SETTING_KEYS) {
    const val = v[k];
    if (val === undefined) continue;
    if (typeof val === 'string' && val.startsWith('••••')) continue; // ignora mascarado
    if (val === '' && (k === 'geminiApiKey' || k === 'adminPassword')) continue; // não apaga segredo com vazio
    entries[k] = String(val);
  }
  if (Object.keys(entries).length) await setSettings(entries);
  revalidatePath('/', 'layout');

  const accept = req.headers.get('accept') ?? '';
  if (!accept.includes('application/json')) return NextResponse.redirect(new URL('/admin/configuracoes?saved=1', req.url), 303);
  return NextResponse.json({ ok: true });
}
