import { createClient, type Client } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { places as seedPlaces, explorations as seedExplorations } from '@turistando/core';
import { getConnection, tursoConfigured, readLegacySettings } from './config';

export { tursoConfigured };

// Em serverless (Vercel) o FS é read-only, exceto /tmp.
const localFile = process.env.VERCEL ? join(tmpdir(), 'turistando-sp.db') : join('.data', 'local.db');

let _client: Client | null = null;
let _builtWith = '';
let _readyFor = '';
let _ready: Promise<void> | null = null;

/** Cliente do banco. Reconstruído automaticamente quando as credenciais mudam no painel. */
export function db(): Client {
  const cfg = getConnection();
  const useTurso = Boolean(cfg.tursoUrl);
  const url = useTurso ? cfg.tursoUrl : `file:${localFile}`;
  const token = useTurso ? cfg.tursoToken : undefined;
  const key = `${url}|${token ?? ''}`;

  if (_client && _builtWith === key) return _client;

  if (_client) {
    try {
      (_client as unknown as { close?: () => void }).close?.();
    } catch {
      /* ignore */
    }
  }
  if (!useTurso) {
    try {
      mkdirSync(dirname(localFile), { recursive: true });
    } catch {
      /* ignore */
    }
  }
  _client = createClient(token ? { url, authToken: token } : { url });
  _builtWith = key;
  _ready = null; // novo cliente → re-garante schema/seed
  return _client;
}

const DDL = [
  `CREATE TABLE IF NOT EXISTS places (
    slug TEXT PRIMARY KEY, name TEXT NOT NULL, short_desc TEXT NOT NULL DEFAULT '',
    neighborhood TEXT NOT NULL, region TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL,
    is_free INTEGER NOT NULL DEFAULT 0, price_max REAL NOT NULL DEFAULT 0,
    favorite INTEGER NOT NULL DEFAULT 0, want_to_return INTEGER NOT NULL DEFAULT 0,
    recommended_minutes INTEGER, status TEXT NOT NULL DEFAULT 'ativo',
    categories TEXT NOT NULL DEFAULT '[]', data TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS explorations (
    slug TEXT PRIMARY KEY, number INTEGER NOT NULL, place_slug TEXT NOT NULL,
    title TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'rascunho',
    published_at TEXT, categories TEXT NOT NULL DEFAULT '[]', data TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    mime TEXT NOT NULL,
    data TEXT NOT NULL,          -- base64 (imagem reduzida no cliente)
    width INTEGER, height INTEGER,
    alt TEXT, size INTEGER,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_exp_place ON explorations(place_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_places_region ON places(region)`,
];

async function migrateLegacySettings(client: Client) {
  const cnt = await client.execute('SELECT COUNT(*) AS n FROM settings');
  if (Number(cnt.rows[0]?.n ?? 0) > 0) return;
  const legacy = readLegacySettings();
  const entries = Object.entries(legacy);
  if (!entries.length) return;
  await client.batch(
    entries.map(([key, value]) => ({
      sql: 'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      args: [key, value] as never,
    })),
    'write',
  );
}

async function seedIfEmpty(client: Client) {
  const res = await client.execute('SELECT COUNT(*) AS n FROM places');
  if (Number(res.rows[0]?.n ?? 0) > 0) return;
  const now = new Date().toISOString();
  const stmts = [];
  for (const p of seedPlaces) {
    stmts.push({
      sql: `INSERT INTO places (slug,name,short_desc,neighborhood,region,lat,lng,is_free,price_max,favorite,want_to_return,recommended_minutes,status,categories,data,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [p.slug, p.name, p.shortDescription, p.neighborhood, p.region, p.geo.lat, p.geo.lng, p.price.free ? 1 : 0, p.price.max, p.favorite ? 1 : 0, p.wantToReturn ? 1 : 0, p.recommendedMinutes ?? null, p.status, JSON.stringify(p.categories), JSON.stringify(p), p.createdAt ?? now, p.updatedAt ?? now],
    });
  }
  for (const e of seedExplorations) {
    stmts.push({
      sql: `INSERT INTO explorations (slug,number,place_slug,title,date,status,published_at,categories,data,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [e.slug, e.number, e.placeSlug, e.title, e.date, e.status, e.publishedAt ?? null, JSON.stringify(e.categories), JSON.stringify(e), e.createdAt ?? now, e.updatedAt ?? now],
    });
  }
  await client.batch(stmts, 'write');
}

/** Garante schema + seed inicial para o cliente atual (idempotente por conexão). */
export function ensureDb(): Promise<void> {
  const client = db();
  if (_ready && _readyFor === _builtWith) return _ready;
  _readyFor = _builtWith;
  _ready = (async () => {
    for (const stmt of DDL) await client.execute(stmt);
    await migrateLegacySettings(client);
    await seedIfEmpty(client);
  })().catch((err) => {
    _ready = null;
    throw err;
  });
  return _ready;
}
