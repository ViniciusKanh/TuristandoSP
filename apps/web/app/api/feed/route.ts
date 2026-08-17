import { NextResponse } from 'next/server';
import { getFeed } from '@/lib/repo';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? 0) || 0);
  const limit = Math.min(24, Math.max(1, Number(url.searchParams.get('limit') ?? 12) || 12));
  const { items, total } = await getFeed(offset, limit);
  return NextResponse.json({ data: items, total });
}
