import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getPlace, updatePlace, deletePlace } from '@/lib/repo';
import { PlaceInput, normalizeBody, buildPlace } from '@/lib/placeInput';

async function authed() {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const place = await getPlace(params.slug);
  if (!place) return NextResponse.json({ error: { message: 'Não encontrado' } }, { status: 404 });
  return NextResponse.json({ data: place });
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  if (!(await authed())) return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  const existing = await getPlace(params.slug);
  if (!existing) return NextResponse.json({ error: { message: 'Não encontrado' } }, { status: 404 });

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
  const place = buildPlace(parsed.data, {
    slug: existing.slug,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  // preserva dados que não vêm do formulário
  place.nearestStations = existing.nearestStations;
  await updatePlace(existing.slug, place);
  revalidatePath('/', 'layout');
  return NextResponse.json({ data: place });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  if (!(await authed())) return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  const existing = await getPlace(params.slug);
  if (!existing) return NextResponse.json({ error: { message: 'Não encontrado' } }, { status: 404 });
  await deletePlace(params.slug);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
