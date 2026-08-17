import 'server-only';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * BOOTSTRAP DE CONEXÃO (única coisa fora do banco).
 * A string de conexão do Turso não pode morar no próprio banco que ela abre,
 * então fica num arquivo local mínimo (gitignored) — ou em variáveis de ambiente,
 * que têm precedência. TODO o resto (identidade, Gemini, senha, imagens) vai pro banco.
 */
export interface Connection {
  tursoUrl: string;
  tursoToken: string;
}

const connectionFile = process.env.VERCEL
  ? join(tmpdir(), 'turistando-connection.json')
  : join(process.cwd(), '.data', 'connection.json');

let cache: Partial<Connection> | null = null;

function loadFile(): Partial<Connection> {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(connectionFile, 'utf8')) as Partial<Connection>;
  } catch {
    cache = {};
  }
  return cache;
}

// Migração: versão anterior guardava tudo em config.json. Reaproveita as creds de lá.
const legacyFile = process.env.VERCEL
  ? join(tmpdir(), 'turistando-config.json')
  : join(process.cwd(), '.data', 'config.json');

function readLegacy(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(legacyFile, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

export function getConnection(): Connection {
  const f = loadFile();
  const legacy = f.tursoUrl ? {} : readLegacy();
  return {
    tursoUrl: process.env.TURSO_DATABASE_URL || f.tursoUrl || legacy.tursoUrl || '',
    tursoToken: process.env.TURSO_AUTH_TOKEN || f.tursoToken || legacy.tursoToken || '',
  };
}

/** Config antiga (config.json) para migrar as demais chaves ao banco, uma vez. */
export function readLegacySettings(): Record<string, string> {
  const l = readLegacy();
  const keys = ['geminiApiKey', 'geminiModel', 'adminPassword', 'siteName', 'tagline', 'heroHeadline', 'heroImageUrl', 'instagram', 'kmWalked'];
  const out: Record<string, string> = {};
  for (const k of keys) if (l[k]) out[k] = l[k]!;
  return out;
}

export function setConnection(partial: Partial<Connection>): void {
  const f = { ...loadFile() };
  if (partial.tursoUrl !== undefined) f.tursoUrl = partial.tursoUrl;
  // token vazio = manter o atual (não apagar por engano)
  if (partial.tursoToken) f.tursoToken = partial.tursoToken;
  try {
    mkdirSync(dirname(connectionFile), { recursive: true });
  } catch {
    /* ignore */
  }
  writeFileSync(connectionFile, JSON.stringify(f, null, 2), 'utf8');
  cache = f;
}

export function tursoConfigured(): boolean {
  return Boolean(getConnection().tursoUrl);
}

export function envTurso(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

export function maskSecret(value: string): string {
  if (!value) return '';
  return '••••••••' + value.slice(-4);
}
