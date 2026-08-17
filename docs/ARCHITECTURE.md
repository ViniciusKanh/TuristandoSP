# Arquitetura — Turistando SP

## Visão geral

Monorepo (npm workspaces) com um núcleo compartilhado e apps por plataforma:

```
┌───────────────────────────────────────────────┐
│                 @turistando/core                │
│  tipos · config · design tokens · utils · seed  │
│      (regra de negócio, sem UI, sem I/O)        │
└───────────────┬─────────────────┬───────────────┘
                │                 │
        ┌───────▼──────┐   ┌──────▼────────┐
        │  apps/web    │   │ apps/mobile   │  (fase futura)
        │  Next.js     │   │ Expo / RN     │
        │  SEO/SSR     │   │ nativo        │
        └───────┬──────┘   └───────────────┘
                │
     ┌──────────▼───────────┐
     │  API (Route Handlers) │  (fase futura)
     │  Turso · Drizzle      │
     │  Storage (Blob)       │
     └───────────────────────┘
```

**Por que Next.js para a web e Expo para o nativo?** O requisito de SEO forte
(indexação, SSR, sitemap, JSON-LD) é incompatível com o SPA client-side do Expo Web.
Next.js entrega SSG/SSR de verdade; o Expo cobre o app nativo. Ambos compartilham o
`core`, então tipos, regras e design tokens não são duplicados.

## Domínios (módulos)

`auth · places · explorations · articles · photos · categories · tags · neighborhoods ·
regions · search · maps · favorites · analytics · seo · admin`

Cada domínio é uma fatia coesa. Nesta primeira entrega eles vivem como dados + funções
no `core` (`packages/core/src/data`), com as mesmas assinaturas que a API real terá — as
páginas não mudam quando o banco entrar.

## Camada de dados

`packages/core/src/data/index.ts` é um **repositório em memória** sobre o seed. Expõe:

- Leitura: `getPlace`, `getExploration`, `getNeighborhood`, `getCategory`…
- Agregações: `getStats`, `getCategoryCounts`, `getNeighborhoodSummaries`.
- Relações: `getExplorationsForPlace`, `getRelatedPlaces`, `getMapMarkers`.
- Busca: `search(query)`.

Na fase de banco, este arquivo é substituído por consultas Drizzle → Turso **mantendo as
mesmas assinaturas**. Nenhuma página precisa ser reescrita.

## Fluxo de dados (publicar uma exploração)

```
Autor (/admin) → wizard Nova Exploração
   → valida (Zod) → cria/atualiza Place → cria Exploration (rascunho)
   → upload de fotos (Storage) → Gemini organiza blocos/fotos → preview
   → publica (published_at)
        └── invalida cache (revalidatePath/tag) das páginas afetadas:
            Home, categoria, bairro, região, mapa, busca, stats, página do lugar
```

Como as páginas públicas derivam tudo dos dados internos, publicar alimenta
automaticamente todas as visões (Home, categorias, bairro, mapa, relacionados…).

## Renderização

- Páginas públicas: **estáticas (SSG)** com `generateStaticParams`; revalidação por
  path/tag quando houver banco. Ótimo para Core Web Vitals e SEO.
- Componentes interativos (mapa, filtros do Explorar, tema): **Client Components** isolados.
- `/admin` e `/api`: dinâmicos e **noindex** (`robots` + `robots.ts`).

## Imagens

Nunca salvar binário no Turso — apenas `url`, `width`, `height`, `alt`, `caption`, `order`.
`components/brand/Photo.tsx` renderiza a foto real (quando há `url`) ou um **placeholder
urbano** gerado (silhueta + grid + coordenadas), mantendo a identidade sem fotografia.
Storage é uma camada trocável: Vercel Blob por padrão, preparada para R2/S3/Supabase.

## Autenticação (fase futura)

Autor único. `/admin` protegido por sessão segura; senha nunca em texto
(`ADMIN_PASSWORD_HASH`). Arquitetura permite múltiplos usuários depois.

## SEO

`metadataBase`, títulos por template, Open Graph, Twitter Cards, canonical por página,
JSON-LD (`WebSite`, `BlogPosting`, `TouristAttraction`, `BreadcrumbList`), `sitemap.xml`
e `robots.txt` gerados. Admin fora do índice.
