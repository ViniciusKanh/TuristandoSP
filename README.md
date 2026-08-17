# Turistando São Paulo

> São Paulo, um lugar de cada vez.

Diário autoral de exploração urbana da cidade de São Paulo (capital). Blog pessoal,
arquivo fotográfico, mapa de lugares visitados, catálogo de lugares e base de
conhecimento — tudo alimentado organicamente conforme novas experiências são publicadas.

Já funcional: front público (Home, Exploração, Lugar, Explorar, Mapa, bairros, categorias,
diário, "Minha São Paulo"), **banco de dados real** (libSQL — arquivo local no seu PC por
padrão, **Turso** em produção), **mapa interativo de verdade** (Leaflet, limitado à cidade
de São Paulo, mostrando só os lugares cadastrados) e um **painel do autor** com login,
**cadastro de lugares** (com seleção de coordenada no mapa) e **Configurações** que salvam
de verdade (identidade do site, imagem de fundo da Home, chave do Gemini, status do Turso).

## Painel do autor

Acesse `/admin` (redireciona para o login). Senha em `ADMIN_PASSWORD` no `.env.local`
— padrão de desenvolvimento: `turistando`.

- **Cadastrar lugar** (`/admin/lugares/novo`): preencha os dados e **marque a coordenada
  clicando no mapa de São Paulo**. Ao salvar, o ponto aparece na hora em `/mapa`. Coordenadas
  fora da capital são recusadas.
- **Configurações** (`/admin/configuracoes`): nome/tagline/manchete, **URL da imagem de fundo
  da Home** (é aqui que você troca aquele fundo), **chave do Google Gemini** (salvar + testar)
  e **status do Turso** (testar conexão). Nada de mockup — os botões funcionam.

## Banco de dados

Sem configurar nada, o app cria e popula um arquivo local (`.data/local.db`) — funciona no
primeiro `npm run dev`. Para produção (ou sincronizar), preencha no `.env.local`:

```bash
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=eyJ...
```

Crie o banco com a CLI do Turso: `turso db create turistando-sp`, depois
`turso db show turistando-sp --url` e `turso db tokens create turistando-sp`. O schema é
criado automaticamente na primeira execução e populado com os dados de exemplo.

## Stack

- **Monorepo** com npm workspaces: `apps/web` (Next.js) + `packages/core` (compartilhado).
- **Web:** Next.js 14 (App Router), React 18, TypeScript strict, SSG/SSR — SEO forte, indexável.
- **Core compartilhado:** tipos, config, design tokens, utilitários e dados de seed.
  O futuro app **Expo/React Native** reutiliza este mesmo `core` sem reescrever a regra.
- **Banco (próxima fase):** Turso / libSQL com Drizzle ORM e migrations.
- **Imagens (próxima fase):** camada abstrata trocável (Vercel Blob → R2/S3/Supabase).
- **Deploy:** Vercel (web + serverless) e Turso (banco).

## Princípio fundamental do modelo

`Lugar` e `Exploração` **não** são a mesma coisa:

- **Lugar** (`Place`) — entidade permanente (o MASP existe). Endereço, categorias, preço, horário…
- **Exploração** (`Exploration`) — uma experiência do autor naquele lugar, numa data. Artigo, fotos, gastos, avaliação…

Um Lugar tem **N** Explorações. Isso é respeitado em toda a arquitetura.

## Estrutura

```
turistando-sp/
├── apps/
│   └── web/                 # Next.js (App Router)
│       ├── app/             # rotas públicas + admin (noindex) + sitemap/robots
│       └── components/      # brand · cards · feature · layout
├── packages/
│   └── core/                # tipos, config, design tokens, utils, seed
│       └── src/{types,config,design,utils,data}
├── docs/                    # ARCHITECTURE · DATABASE · API · DESIGN_SYSTEM
├── .env.example
└── package.json             # workspaces
```

## Rodando localmente

Requisitos: Node 18.18+.

```bash
npm install          # instala o monorepo inteiro
cp .env.example apps/web/.env.local   # opcional nesta fase (o front usa o seed)
npm run dev          # http://localhost:3000
```

Outros scripts:

```bash
npm run build        # build de produção (SSG)
npm run start        # serve o build
npm run typecheck    # tsc --noEmit (core + web)
npm run lint         # eslint (web)
```

## Configurar Turso (próxima fase)

```bash
# instale a CLI: https://docs.turso.tech/cli
turso db create turistando-sp
turso db show turistando-sp --url          # -> TURSO_DATABASE_URL
turso db tokens create turistando-sp       # -> TURSO_AUTH_TOKEN
# rodar migrations (Drizzle) e seed: ver docs/DATABASE.md
```

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. **Root Directory:** `apps/web`. O Next detecta o monorepo e transpila `@turistando/core`.
3. Configure as variáveis de `.env.example` (Project Settings → Environment Variables).
4. Deploy. `sitemap.xml` e `robots.txt` são gerados automaticamente.

## Variáveis de ambiente

Veja `.env.example`. Nunca commite segredos — `.env*.local` está no `.gitignore`.
A integração **Gemini** (organizar texto/fotos ao publicar) e as chaves **Turso** ficam
apenas no servidor, expostas na tela **Integrações** do painel (`/admin`).

## Documentação

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — domínios, fluxo de dados, renderização, auth.
- [`docs/DATABASE.md`](docs/DATABASE.md) — schema Turso completo (DDL) e migrations.
- [`docs/API.md`](docs/API.md) — endpoints planejados.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — paleta, tipografia, componentes de marca.

## Licença

Projeto pessoal. Todos os direitos reservados ao autor.
