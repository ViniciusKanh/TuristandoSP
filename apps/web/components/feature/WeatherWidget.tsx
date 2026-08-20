import { getWeather } from '@/lib/weather';

/** Pílula de clima de SP (Open-Meteo). Não renderiza nada se a API falhar. */
export async function WeatherWidget({ onBand = false }: { onBand?: boolean }) {
  const w = await getWeather();
  if (!w) return null;
  return (
    <div className={`weather ${onBand ? 'weather--band' : ''}`}>
      <span className="weather__now">{w.emoji} {w.temp}°</span>
      <span className="weather__label">{w.label} em São Paulo</span>
      {w.sunset ? <span className="weather__sun">☀ nascer {w.sunrise} · pôr do sol {w.sunset}</span> : null}
    </div>
  );
}
