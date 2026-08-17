import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { slugify } from '@turistando/core';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getPublishedExplorations, getPlace, insertExploration, explorationSlugExists, nextExplorationNumber } from '@/lib/repo';
import { ExplorationInput, buildExploration } from '@/lib/explorationInput';

export async function GET() {
  return NextResponse.json({ data: await getPublishedExplorations() });
}

export async function POST(req: Request) {
  if (!(await verifySession(cookies().get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: { message: 'Corpo inválido' } }, { status: 400 });
  }
  const parsed = ExplorationInput.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Validação falhou', issues: parsed.error.flatten() } }, { status: 400 });
  }
  const v = parsed.data;
  const place = await getPlace(v.placeSlug);
  if (!place) {
    return NextResponse.json({ error: { message: 'Lugar não encontrado. Cadastre o lugar antes.' } }, { status: 400 });
  }

  let slug = slugify(v.title);
  if (!slug) slug = `exploracao-${Date.now()}`;
  let i = 2;
  const base = slug;
  while (await explorationSlugExists(slug)) slug = `${base}-${i++}`;

  const number = await nextExplorationNumber();
  const now = new Date().toISOString();
  const exploration = buildExploration(v, {
    slug,
    number,
    createdAt: now,
    updatedAt: now,
    placeCategories: place.categories,
  });
  await insertExploration(exploration);
  revalidatePath('/', 'layout');
  return NextResponse.json({ data: exploration }, { status: 201 });
}
