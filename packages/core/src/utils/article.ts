import type { ArticleBlock, PhotoRef } from '../types/index';

/** Blocos que NÃO carregam foto (texto/estrutura). */
function isTextBlock(b: ArticleBlock): boolean {
  return b.type !== 'image' && b.type !== 'gallery';
}

/**
 * Monta o artigo para exibição usando as fotos ATUAIS como fonte da verdade.
 *
 * O texto vem dos blocos (parágrafos, títulos, citações, dicas…). As imagens
 * são sempre reconstruídas a partir de `photos`, na ordem atual — então
 * reordenar ou apagar fotos no gerenciador reflete imediatamente na página,
 * sem depender de onde o Gemini colocou as imagens quando organizou.
 *
 * A capa (photos[0]) aparece no topo (hero) e por padrão é omitida do corpo.
 */
export function composeArticle(
  article: ArticleBlock[] | undefined | null,
  photos: PhotoRef[] | undefined | null,
  opts?: { skipCover?: boolean },
): ArticleBlock[] {
  const blocks = article ?? [];
  // Sem fotos gerenciadas: preserva o artigo como está (compatível com dados antigos).
  if (!photos || photos.length === 0) return blocks;

  const text = blocks.filter(isTextBlock);
  const skipCover = opts?.skipCover ?? true;
  const body = photos.filter((p) => p && p.url).slice(skipCover ? 1 : 0);

  if (body.length === 0) return text;
  if (text.length === 0) {
    return body.length === 1 ? [{ type: 'image', photo: body[0]! }] : [{ type: 'gallery', photos: body }];
  }

  const out: ArticleBlock[] = [];
  let pi = 0;
  let paraCount = 0;
  for (const b of text) {
    out.push(b);
    if (b.type === 'paragraph') {
      paraCount += 1;
      // intercala uma foto depois dos parágrafos ímpares (1º, 3º, 5º…)
      if (paraCount % 2 === 1 && pi < body.length) {
        out.push({ type: 'image', photo: body[pi]! });
        pi += 1;
      }
    }
  }
  // fotos restantes → imagem única ou galeria ao final
  const rest = body.slice(pi);
  if (rest.length === 1) out.push({ type: 'image', photo: rest[0]! });
  else if (rest.length > 1) out.push({ type: 'gallery', photos: rest });
  return out;
}
