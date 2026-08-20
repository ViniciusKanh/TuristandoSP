import type { Place } from '@turistando/core';
import { getAllPlaces } from './repo';

export interface RoteiroDef {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  match: (p: Place) => boolean;
}

/** Coleções curadas, montadas automaticamente a partir dos lugares cadastrados. */
export const ROTEIROS: RoteiroDef[] = [
  { slug: 'sp-de-graca', title: 'São Paulo de graça', emoji: '🎟️', description: 'Lugares que não custam nada — arte, parques e história sem gastar.', match: (p) => p.price.free },
  { slug: 'museus-imperdiveis', title: 'Museus imperdíveis', emoji: '🏛️', description: 'Os museus que valem a visita na capital.', match: (p) => p.categories.includes('museus') },
  { slug: 'ao-ar-livre', title: 'Ao ar livre', emoji: '🌳', description: 'Parques e espaços abertos pra respirar no meio da cidade.', match: (p) => p.categories.includes('parques') },
  { slug: 'perto-do-metro', title: 'Fácil de metrô', emoji: '🚇', description: 'Lugares com estação de metrô ou trem logo ali.', match: (p) => (p.nearestStations?.length ?? 0) > 0 },
  { slug: 'favoritos', title: 'Meus favoritos', emoji: '⭐', description: 'Os lugares que eu mais amei — voltaria amanhã.', match: (p) => p.favorite },
  { slug: 'quero-voltar', title: 'Quero voltar', emoji: '🔁', description: 'Ficou gostinho de quero mais — a lista de retorno.', match: (p) => p.wantToReturn },
];

export interface RoteiroSummary extends RoteiroDef {
  count: number;
  sample: Place[];
}

export async function listRoteiros(): Promise<RoteiroSummary[]> {
  const places = await getAllPlaces();
  return ROTEIROS.map((r) => {
    const matched = places.filter(r.match);
    return { ...r, count: matched.length, sample: matched.slice(0, 3) };
  }).filter((r) => r.count > 0);
}

export async function getRoteiro(slug: string): Promise<{ def: RoteiroDef; places: Place[] } | null> {
  const def = ROTEIROS.find((r) => r.slug === slug);
  if (!def) return null;
  const places = (await getAllPlaces()).filter(def.match);
  return { def, places };
}
