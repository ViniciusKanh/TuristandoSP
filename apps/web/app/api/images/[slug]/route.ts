import { getImage } from '@/lib/repo';

// Serve a imagem guardada no banco. Cache agressivo (o id é único e imutável).
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const id = params.slug.replace(/\.[a-z]+$/i, ''); // aceita /api/images/<id>.jpg
  const img = await getImage(id);
  if (!img) return new Response('Não encontrado', { status: 404 });
  const bytes = Buffer.from(img.data, 'base64');
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': img.mime,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
