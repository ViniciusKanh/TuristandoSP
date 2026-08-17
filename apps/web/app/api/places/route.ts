import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { slugify } from '@turistando/core';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getAllPlaces, insertPlace, slugExists } from '@/lib/repo';
import { PlaceInput, normalizeBody, buildPlace } from '@/lib/placeInput';

export async function GET() {
  return NextResponse.json({ data: await getAllPlaces() });
}

export async function POST(req: Request) {
  if (!(await verifySession(cookies().get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  }
  let raw: unknown;
  try {
    const ct = req.headers.get('content-type') ?? '';
    raw = ct.includes('application/json') ? await req.json() : Object.fromEntries((await req.formData()).entries());
  } catch {
    return NextResponse.json({ error: { message: 'Corpo inválido' } }, { status: 400 });
  }

  const parsed = PlaceInput.safeParse(normalizeBody(raw));
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Validação falhou', issues: parsed.error.flatten() } }, { status: 400 });
  }
  const v = parsed.data;
  let slug = slugify(v.name);
  let i = 2;
  while (await slugExists(slug)) slug = `${slugify(v.name)}-${i++}`;

  const now = new Date().toISOString();
  const place = buildPlace(v, { slug, id: `p-${slug}`, createdAt: now, updatedAt: now });
  await insertPlace(place);
  revalidatePath('/', 'layout');
  return NextResponse.json({ data: place }, { status: 201 });
}
