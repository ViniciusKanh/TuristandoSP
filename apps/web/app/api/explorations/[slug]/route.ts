import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { getExploration, getPlace, updateExploration, deleteExploration } from '@/lib/repo';
import { ExplorationInput, buildExploration } from '@/lib/explorationInput';

async function authed() {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  if (!(await authed())) return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  const existing = await getExploration(params.slug);
  if (!existing) return NextResponse.json({ error: { message: 'Não encontrado' } }, { status: 404 });

  const raw = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Ação simples: só mudar status (publicar / despublicar / agendar)
  if (raw.title === undefined && typeof raw.status === 'string') {
    const status = raw.status as 'publicado' | 'rascunho' | 'agendado';
    const now = new Date().toISOString();
    const updated = {
      ...existing,
      status,
      publishedAt: status === 'publicado' ? existing.publishedAt ?? now : undefined,
      updatedAt: now,
    };
    await updateExploration(existing.slug, updated);
    revalidatePath('/', 'layout');
    return NextResponse.json({ data: updated });
  }

  // Edição completa
  const parsed = ExplorationInput.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: { message: 'Validação falhou', issues: parsed.error.flatten() } }, { status: 400 });
  const place = await getPlace(parsed.data.placeSlug);
  if (!place) return NextResponse.json({ error: { message: 'Lugar não encontrado.' } }, { status: 400 });

  const updated = buildExploration(parsed.data, {
    slug: existing.slug,
    number: existing.number,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    placeCategories: place.categories,
  });
  await updateExploration(existing.slug, updated);
  revalidatePath('/', 'layout');
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  if (!(await authed())) return NextResponse.json({ error: { message: 'Não autenticado' } }, { status: 401 });
  const existing = await getExploration(params.slug);
  if (!existing) return NextResponse.json({ error: { message: 'Não encontrado' } }, { status: 404 });
  await deleteExploration(params.slug);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
