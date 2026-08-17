import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { db, ensureDb, tursoConfigured } from '@/lib/db';
import { getSetting } from '@/lib/repo';

export async function POST(req: Request) {
  if (!(await verifySession(cookies().get(SESSION_COOKIE)?.value)))
    return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });

  const { target, key } = (await req.json().catch(() => ({}))) as { target?: string; key?: string };

  if (target === 'turso') {
    try {
      await ensureDb();
      await db().execute('SELECT 1');
      const onTurso = tursoConfigured();
      return NextResponse.json({
        ok: true,
        mode: onTurso ? 'turso' : 'arquivo-local',
        message: onTurso
          ? 'Conectado ao Turso com sucesso.'
          : 'Usando banco local (arquivo). Preencha a URL e o token do Turso acima para usar o Turso.',
      });
    } catch (e) {
      return NextResponse.json({ ok: false, message: `Falha ao conectar: ${(e as Error).message}` }, { status: 200 });
    }
  }

  if (target === 'gemini') {
    const apiKey = key && !key.startsWith('••••') ? key : await getSetting('geminiApiKey');
    if (!apiKey) return NextResponse.json({ ok: false, message: 'Nenhuma chave do Gemini salva.' });
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
      if (!r.ok) {
        const t = await r.text();
        return NextResponse.json({ ok: false, message: `Gemini respondeu ${r.status}. Verifique a chave.`, detail: t.slice(0, 200) });
      }
      const data = (await r.json()) as { models?: { name: string }[] };
      return NextResponse.json({ ok: true, message: `Chave válida. ${data.models?.length ?? 0} modelos disponíveis.` });
    } catch (e) {
      return NextResponse.json({ ok: false, message: `Falha ao chamar o Gemini: ${(e as Error).message}` }, { status: 200 });
    }
  }

  return NextResponse.json({ error: { message: 'Alvo inválido' } }, { status: 400 });
}
