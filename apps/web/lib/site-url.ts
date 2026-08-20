/**
 * URL base do site, resolvida uma única vez.
 *
 * Ordem de prioridade:
 *   1. SITE_URL / NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL (se definidas)
 *   2. Produção → https://turistandosp.me
 *   3. Desenvolvimento (npm run dev) → http://localhost:3000
 *
 * Assim, em produção o padrão já é o domínio real; o localhost fica só
 * como fallback de desenvolvimento local.
 */
const PROD_URL = 'https://turistandosp.me';
const DEV_URL = 'http://localhost:3000';

function resolveSiteUrl(): string {
  const explicit =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (explicit && explicit.trim()) return explicit.trim().replace(/\/+$/, '');
  return process.env.NODE_ENV === 'development' ? DEV_URL : PROD_URL;
}

export const SITE_URL = resolveSiteUrl();
