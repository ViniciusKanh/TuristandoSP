# API — Turistando SP

Route Handlers do Next (`app/api/**/route.ts`), serverless na Vercel. Validação com **Zod**
em toda entrada (body, params, query, uploads). Operações de escrita exigem autenticação
do autor. Nunca confiar em entrada do cliente.

> Nesta primeira entrega a leitura é servida diretamente do `core` (SSG). Os endpoints
> abaixo são o contrato-alvo para a fase de banco — as assinaturas espelham as funções já
> existentes em `packages/core/src/data`.

## Leitura (pública)

| Método | Rota | Descrição |
|-------|------|-----------|
| GET | `/api/places` | lista lugares (filtros: `?category`, `?neighborhood`, `?region`, `?free`, `?q`, `?cursor`) |
| GET | `/api/places/:slug` | um lugar + explorações + relacionados |
| GET | `/api/explorations` | lista explorações publicadas (`?cursor`) |
| GET | `/api/explorations/:slug` | uma exploração com blocos, fotos, avaliação, gastos |
| GET | `/api/neighborhoods` | bairros com contagens |
| GET | `/api/neighborhoods/:slug` | bairro + lugares |
| GET | `/api/categories` | categorias com contagens |
| GET | `/api/search?q=` | busca global (lugares, explorações, bairros) |
| GET | `/api/stats` | estatísticas ("Minha São Paulo") |
| GET | `/api/map` | marcadores do mapa |

## Escrita (autenticada — autor)

| Método | Rota | Descrição |
|-------|------|-----------|
| POST | `/api/places` | cria lugar |
| PATCH | `/api/places/:id` | atualiza lugar |
| DELETE | `/api/places/:id` | soft delete |
| POST | `/api/explorations` | cria exploração (rascunho) |
| PATCH | `/api/explorations/:id` | atualiza / publica / agenda |
| POST | `/api/uploads` | assina upload de foto (Storage) |
| POST | `/api/ai/organize` | Gemini: sugere ordem de blocos e distribui fotos |

## Convenções

- Respostas JSON: `{ data }` em sucesso, `{ error: { code, message, issues? } }` em falha.
- Códigos: `200/201` ok, `400` validação, `401` não autenticado, `404` inexistente, `429` rate limit.
- Paginação por **cursor** (`?cursor=` + `nextCursor` na resposta).
- Revalidação: escritas chamam `revalidatePath`/`revalidateTag` das visões afetadas.

## Exemplo — publicar exploração

```http
PATCH /api/explorations/e-0043
Authorization: Bearer <sessão do autor>
Content-Type: application/json

{ "status": "publicado" }
```

Efeitos: define `published_at`, invalida Home, categorias, bairro, região, mapa, busca,
stats e a página do lugar. Retorna o resumo "aparecerá em: …".

## Segurança

Sanitização, proteção XSS no render de artigo, proteção de rotas, rate limiting nas
mutações, headers seguros, limite/typing de upload, segredos só via env.
