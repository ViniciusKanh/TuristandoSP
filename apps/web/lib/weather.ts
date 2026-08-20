
// Centro de São Paulo
const LAT = -23.5505;
const LNG = -46.6333;

export interface Weather {
  temp: number;
  code: number;
  label: string;
  emoji: string;
  sunrise: string; // HH:MM
  sunset: string; // HH:MM
}

// WMO weather codes → PT + emoji
function describe(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Céu limpo', emoji: '☀️' };
  if (code <= 2) return { label: 'Parcialmente nublado', emoji: '🌤️' };
  if (code === 3) return { label: 'Nublado', emoji: '☁️' };
  if (code === 45 || code === 48) return { label: 'Névoa', emoji: '🌫️' };
  if (code >= 51 && code <= 57) return { label: 'Garoa', emoji: '🌦️' };
  if (code >= 61 && code <= 67) return { label: 'Chuva', emoji: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Neve', emoji: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Pancadas de chuva', emoji: '🌧️' };
  if (code >= 95) return { label: 'Tempestade', emoji: '⛈️' };
  return { label: 'Tempo firme', emoji: '🌡️' };
}

const hhmm = (iso?: string) => (iso && iso.includes('T') ? iso.split('T')[1]!.slice(0, 5) : '');

/** Clima atual de SP via Open-Meteo (grátis, sem chave). Retorna null se falhar. */
export async function getWeather(): Promise<Weather | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=America%2FSao_Paulo&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
      daily?: { sunrise?: string[]; sunset?: string[] };
    };
    const code = j.current?.weather_code ?? 0;
    const d = describe(code);
    return {
      temp: Math.round(j.current?.temperature_2m ?? 0),
      code,
      label: d.label,
      emoji: d.emoji,
      sunrise: hhmm(j.daily?.sunrise?.[0]),
      sunset: hhmm(j.daily?.sunset?.[0]),
    };
  } catch {
    return null;
  }
}
