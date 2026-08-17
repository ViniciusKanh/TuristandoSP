/**
 * Autenticação simples do autor único (Web Crypto → funciona em edge e node).
 * Senha em ADMIN_PASSWORD; sessão é um cookie assinado (HMAC-SHA256) com AUTH_SECRET.
 */
export const SESSION_COOKIE = 'tsp_session';

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(data: string): Promise<string> {
  const secret = process.env.AUTH_SECRET || 'dev-inseguro-troque-em-producao';
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64url(sig);
}

export async function createSession(): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ sub: 'author', iat: Date.now() })));
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  // comparação em tempo ~constante
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'turistando';
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
