/**
 * Configuração central da aplicação.
 * Nome, tagline e links vivem AQUI para poderem ser trocados sem editar
 * dezenas de componentes (requisito da seção 74).
 */

export interface SocialLink {
  label: string;
  href: string;
  handle?: string;
}

export interface SiteConfig {
  siteName: string;
  siteShortName: string;
  /** Usado no logo: parte em destaque (accent). */
  logoAccent: string;
  tagline: string;
  description: string;
  authorName: string;
  authorRole: string;
  city: string;
  /** Coordenadas do marco zero de SP (Praça da Sé) — usadas no mapa/ficha. */
  origin: { lat: number; lng: number; label: string };
  locale: string;
  timezone: string;
  socialLinks: SocialLink[];
  /** Frases conceituais que guiam a direção de arte (seção 73). */
  concepts: string[];
}

export const siteConfig: SiteConfig = {
  siteName: 'Turistando São Paulo',
  siteShortName: 'Turistando SP',
  logoAccent: 'SP',
  tagline: 'São Paulo, um lugar de cada vez.',
  description:
    'Diário autoral de exploração urbana da cidade de São Paulo. Sem roteiro pronto, sem patrocínio — só o bairro, o que ele esconde e o que achei de cada parada.',
  authorName: 'Vinicius',
  authorRole: 'Anda, fotografa e escreve.',
  city: 'São Paulo',
  origin: { lat: -23.55052, lng: -46.63331, label: 'Praça da Sé · Marco Zero' },
  locale: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  socialLinks: [
    { label: 'Instagram', href: 'https://instagram.com/', handle: '@turistandosp' },
    { label: 'YouTube', href: 'https://youtube.com/' },
    { label: 'GitHub', href: 'https://github.com/' },
  ],
  concepts: [
    'São Paulo, um lugar de cada vez.',
    'Ainda tem muita cidade dentro desta cidade.',
    'Meu mapa pessoal de São Paulo.',
    'Fui. Vi. Fotografei. Escrevi.',
    'Uma cidade impossível de terminar.',
    'Cada ponto no mapa tem uma história.',
    'Explorando São Paulo além do óbvio.',
  ],
};

/** Regiões da capital — expansível no futuro (seção 34). */
export const REGIONS = [
  { slug: 'centro', name: 'Centro' },
  { slug: 'zona-norte', name: 'Zona Norte' },
  { slug: 'zona-sul', name: 'Zona Sul' },
  { slug: 'zona-leste', name: 'Zona Leste' },
  { slug: 'zona-oeste', name: 'Zona Oeste' },
] as const;
