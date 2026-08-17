# Banco de dados — Turso / libSQL

SQLite relacional via Turso. ORM: **Drizzle**. Migrations versionadas. Este documento
descreve o schema-alvo; nesta primeira entrega os dados vivem no seed do `core` com as
mesmas formas (`packages/core/src/types`).

## Princípios

- `Place` (permanente) e `Exploration` (experiência) são tabelas separadas — 1:N.
- Chaves primárias `TEXT` (ids estáveis, amigáveis a sync futuro).
- `created_at` / `updated_at` em tudo; `published_at` no que publica; `deleted_at` (soft delete) onde faz sentido.
- Relações N:N via tabelas de junção. Índices em toda FK e em colunas de filtro/slug.
- `slug` único por entidade (seção 36).

## DDL (resumo)

```sql
-- Regiões e bairros ------------------------------------------------------
CREATE TABLE regions (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE neighborhoods (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  region       TEXT NOT NULL REFERENCES regions(slug),
  description   TEXT NOT NULL DEFAULT '',
  lat          REAL, lng REAL,
  cover_url    TEXT,
  seo_json     TEXT,
  created_at   TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX idx_neigh_region ON neighborhoods(region);

-- Lugares ----------------------------------------------------------------
CREATE TABLE places (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  short_desc     TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  street TEXT, number TEXT, complement TEXT, zip TEXT,
  neighborhood   TEXT NOT NULL REFERENCES neighborhoods(slug),
  region         TEXT NOT NULL REFERENCES regions(slug),
  lat REAL NOT NULL, lng REAL NOT NULL,
  website TEXT, instagram TEXT, phone TEXT,
  price_min REAL NOT NULL DEFAULT 0,
  price_max REAL NOT NULL DEFAULT 0,
  is_free INTEGER NOT NULL DEFAULT 0,          -- boolean
  price_note TEXT,
  hours_summary TEXT,
  wheelchair INTEGER NOT NULL DEFAULT 0,
  accessibility_notes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',         -- ativo|fechado-temporario|fechado-permanente
  cover_photo_id TEXT REFERENCES photos(id),
  favorite INTEGER NOT NULL DEFAULT 0,
  want_to_return INTEGER NOT NULL DEFAULT 0,
  recommended_minutes INTEGER,
  seo_json TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);
CREATE INDEX idx_places_neigh ON places(neighborhood);
CREATE INDEX idx_places_region ON places(region);
CREATE INDEX idx_places_status ON places(status);

CREATE TABLE nearest_stations (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  type TEXT NOT NULL,             -- metro|trem
  line TEXT, name TEXT NOT NULL,
  walking_minutes INTEGER NOT NULL
);
CREATE INDEX idx_station_place ON nearest_stations(place_id);

-- Explorações ------------------------------------------------------------
CREATE TABLE explorations (
  id             TEXT PRIMARY KEY,
  number         INTEGER NOT NULL UNIQUE,       -- EXP.042
  slug           TEXT NOT NULL UNIQUE,
  place_id       TEXT NOT NULL REFERENCES places(id),
  title          TEXT NOT NULL,
  subtitle       TEXT,
  date           TEXT NOT NULL,                 -- YYYY-MM-DD
  duration_min   INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'rascunho', -- rascunho|agendado|publicado
  seo_json       TEXT,
  published_at   TEXT,
  created_at     TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
);
CREATE INDEX idx_exp_place ON explorations(place_id);
CREATE INDEX idx_exp_status_date ON explorations(status, date);

-- Blocos do artigo (ordenados) ------------------------------------------
CREATE TABLE article_blocks (
  id             TEXT PRIMARY KEY,
  exploration_id TEXT NOT NULL REFERENCES explorations(id) ON DELETE CASCADE,
  position       INTEGER NOT NULL,
  type           TEXT NOT NULL,                 -- paragraph|heading|image|gallery|tip|...
  data_json      TEXT NOT NULL                  -- payload do bloco
);
CREATE INDEX idx_block_exp ON article_blocks(exploration_id, position);

-- Fotos ------------------------------------------------------------------
CREATE TABLE photos (
  id        TEXT PRIMARY KEY,
  url       TEXT NOT NULL,
  width INTEGER NOT NULL, height INTEGER NOT NULL,
  alt TEXT NOT NULL, caption TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE exploration_photos (
  exploration_id TEXT NOT NULL REFERENCES explorations(id) ON DELETE CASCADE,
  photo_id       TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  position       INTEGER NOT NULL,
  PRIMARY KEY (exploration_id, photo_id)
);

-- Categorias, tags e junções --------------------------------------------
CREATE TABLE categories (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, parent TEXT, description TEXT
);
CREATE TABLE tags (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL);

CREATE TABLE place_categories (place_id TEXT, category_id TEXT, PRIMARY KEY(place_id, category_id));
CREATE TABLE exploration_categories (exploration_id TEXT, category_id TEXT, PRIMARY KEY(exploration_id, category_id));
CREATE TABLE place_tags (place_id TEXT, tag_id TEXT, PRIMARY KEY(place_id, tag_id));
CREATE TABLE exploration_tags (exploration_id TEXT, tag_id TEXT, PRIMARY KEY(exploration_id, tag_id));

-- Avaliação, gastos, transporte -----------------------------------------
CREATE TABLE ratings (
  exploration_id TEXT PRIMARY KEY REFERENCES explorations(id) ON DELETE CASCADE,
  overall INTEGER NOT NULL,
  experience INTEGER, cost_benefit INTEGER, infrastructure INTEGER,
  accessibility INTEGER, photography INTEGER,
  would_return TEXT NOT NULL          -- com-certeza|talvez|nao-prioridade
);
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  exploration_id TEXT NOT NULL REFERENCES explorations(id) ON DELETE CASCADE,
  label TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL
);
CREATE TABLE transport_methods (
  id TEXT PRIMARY KEY,
  exploration_id TEXT NOT NULL REFERENCES explorations(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, detail TEXT, position INTEGER NOT NULL DEFAULT 0
);

-- Diversos ---------------------------------------------------------------
CREATE TABLE favorites (          -- favoritos do autor / do visitante (futuro)
  id TEXT PRIMARY KEY, place_id TEXT NOT NULL, owner TEXT NOT NULL DEFAULT 'author', created_at TEXT NOT NULL
);
CREATE TABLE seo_metadata (
  id TEXT PRIMARY KEY, entity TEXT NOT NULL, entity_id TEXT NOT NULL,
  title TEXT, description TEXT, og_image TEXT, canonical TEXT, noindex INTEGER DEFAULT 0
);
CREATE TABLE site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'author', created_at TEXT NOT NULL
);
```

## Migrations & seed

- Migrations com `drizzle-kit generate` a partir do schema em `packages/core` (ou `apps/web/db`).
- Seed: reaproveitar `packages/core/src/data/*` (lugares, explorações, bairros, categorias)
  para popular o banco em desenvolvimento. Dados demo são claramente marcados
  (`PhotoRef.demo = true`, sem `url`).

## Escala (10 anos)

Índices em FKs, slugs e colunas de filtro suportam milhares de lugares/explorações e
dezenas de milhares de fotos. Paginação por cursor nas listagens. Busca começa tradicional
(LIKE + índices) e evolui para FTS5 / semântica sem mudar as assinaturas do repositório.
