import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { insertImage } from '@/lib/repo';

const MAX_BYTES = 6 * 1024 * 1024; // 6MB (a imagem já chega reduzida do navegador)
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(req: Request) {
  if (!(await verifySession(cookies().get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: { message: 'Envio inválido' } }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { message: 'Nenhum arquivo enviado' } }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: { message: 'Formato não suportado (use JPG, PNG, WebP ou AVIF).' } }, { status: 415 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: { message: 'Imagem muito grande. Máximo 6MB.' } }, { status: 413 });
  }

  const id = crypto.randomUUID();
  const alt = String(form.get('alt') ?? '');
  const width = Number(form.get('width') ?? 0) || undefined;
  const height = Number(form.get('height') ?? 0) || undefined;

  await insertImage({ id, mime: file.type, data: buf.toString('base64'), width, height, alt, size: buf.byteLength });

  return NextResponse.json({ data: { id, url: `/api/images/${id}`, width, height, size: buf.byteLength } }, { status: 201 });
}
