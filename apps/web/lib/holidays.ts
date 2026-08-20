
export interface Holiday {
  date: string; // YYYY-MM-DD
  localName: string;
}

/** Próximo feriado nacional (Nager.Date, grátis, sem chave). Null se falhar. */
export async function getNextHoliday(): Promise<Holiday | null> {
  try {
    const year = new Date().getFullYear();
    const today = new Date().toISOString().slice(0, 10);
    const all: Holiday[] = [];
    for (const y of [year, year + 1]) {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/BR`, { next: { revalidate: 60 * 60 * 24 } });
      if (res.ok) {
        const j = (await res.json()) as { date: string; localName: string }[];
        all.push(...j.map((h) => ({ date: h.date, localName: h.localName })));
      }
    }
    const next = all.filter((h) => h.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    return next ?? null;
  } catch {
    return null;
  }
}
