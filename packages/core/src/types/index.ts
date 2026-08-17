/**
 * Modelo de domínio do Turistando SP.
 *
 * PRINCÍPIO FUNDAMENTAL (seção 2): Lugar e Exploração são entidades distintas.
 *  - Place       → entidade permanente (o Museu da Língua Portuguesa existe).
 *  - Exploration → uma experiência do autor naquele lugar, numa data.
 *  Um Place tem N Explorations.
 */

export type ID = string;
export type ISODate = string; // 'YYYY-MM-DD'
export type ISODateTime = string;

export type RegionSlug =
  | 'centro'
  | 'zona-norte'
  | 'zona-sul'
  | 'zona-leste'
  | 'zona-oeste';

export type TransportMode =
  | 'metro'
  | 'trem'
  | 'onibus'
  | 'carro'
  | 'bike'
  | 'a-pe'
  | 'outro';

export type PlaceStatus = 'ativo' | 'fechado-temporario' | 'fechado-permanente';

export type PublishStatus = 'rascunho' | 'agendado' | 'publicado';

export type WouldReturn = 'com-certeza' | 'talvez' | 'nao-prioridade';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Category {
  id: ID;
  slug: string;
  name: string;
  /** Categoria "pai" opcional para agrupar (ex.: Cultura > Museus). */
  parent?: string;
  description?: string;
}

export interface Tag {
  id: ID;
  slug: string;
  name: string;
}

export interface Neighborhood {
  id: ID;
  slug: string;
  name: string;
  region: RegionSlug;
  description: string;
  center: GeoPoint;
  coverImage?: PhotoRef;
  seo?: SeoMetadata;
}

export interface PhotoRef {
  id: ID;
  url: string;
  /** Placeholder gerado quando não há foto real (marca demo). */
  demo?: boolean;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  order: number;
  /** Tema visual do placeholder urbano. */
  hue?: number;
}

export interface OpeningHours {
  /** Texto livre legível, ex.: "Ter–Dom, 9h–17h". Fecha às segundas. */
  summary: string;
  closedOn?: string[];
}

export interface PriceRange {
  min: number;
  max: number;
  free: boolean;
  /** Nota livre: "Grátis aos sábados", etc. */
  note?: string;
}

export interface Accessibility {
  wheelchair: boolean;
  notes?: string;
}

export interface NearestStation {
  type: 'metro' | 'trem';
  line?: string;
  name: string;
  walkingMinutes: number;
}

/** LUGAR — entidade permanente. */
export interface Place {
  id: ID;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  address: {
    street: string;
    number?: string;
    complement?: string;
    zip?: string;
  };
  neighborhood: string; // slug
  neighborhoodName?: string; // nome de exibição (bairros dinâmicos)
  region: RegionSlug;
  geo: GeoPoint;
  nearestStations: NearestStation[];
  categories: string[]; // slugs
  tags: string[]; // slugs
  website?: string;
  instagram?: string;
  phone?: string;
  price: PriceRange;
  hours?: OpeningHours;
  accessibility: Accessibility;
  status: PlaceStatus;
  coverImage: PhotoRef;
  /** Marcações pessoais do autor (seções 17, 27). */
  favorite: boolean;
  wantToReturn: boolean;
  /** Nota rápida do autor para o lugar (0–5). A avaliação detalhada vive na Exploração. */
  rating?: number;
  recommendedMinutes?: number;
  seo?: SeoMetadata;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Avaliação autoral multi-dimensional (seção 22). */
export interface Rating {
  overall: number; // 1..5
  experience?: number;
  costBenefit?: number;
  infrastructure?: number;
  accessibility?: number;
  photography?: number;
  wouldReturn: WouldReturn;
}

export interface ExpenseItem {
  label: string;
  category: 'entrada' | 'transporte' | 'alimentacao' | 'estacionamento' | 'outros';
  amount: number;
}

export interface TransportLeg {
  mode: TransportMode;
  detail?: string;
}

// --- Blocos editoriais do artigo (seções 19–20, 31) ---
export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'image'; photo: PhotoRef }
  | { type: 'gallery'; photos: PhotoRef[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'tip'; title?: string; text: string }
  | { type: 'info'; title?: string; text: string }
  | { type: 'warning'; title?: string; text: string }
  | { type: 'map'; center: GeoPoint; label?: string }
  | { type: 'costs'; items: ExpenseItem[] }
  | { type: 'transport'; legs: TransportLeg[]; totalMinutes?: number }
  | { type: 'separator' }
  | { type: 'relatedPlaces'; placeSlugs: string[] };

/** EXPLORAÇÃO — a experiência do autor num lugar. */
export interface Exploration {
  id: ID;
  /** Número sequencial exibido como EXP.042. */
  number: number;
  slug: string;
  placeSlug: string;
  title: string;
  subtitle?: string;
  date: ISODate;
  durationMinutes: number;
  transport: TransportLeg[];
  expenses: ExpenseItem[];
  rating: Rating;
  article: ArticleBlock[];
  photos: PhotoRef[]; // galeria completa (a capa é photos[0])
  categories: string[]; // herdadas/derivadas
  tags: string[];
  status: PublishStatus;
  seo?: SeoMetadata;
  publishedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

/** Estatísticas derivadas (seção 26 "Minha São Paulo"). */
export interface SiteStats {
  places: number;
  explorations: number;
  neighborhoods: number;
  museums: number;
  parks: number;
  photos: number;
  totalMinutes: number;
  totalSpent: number;
  kmWalked: number;
}
