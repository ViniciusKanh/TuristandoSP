import { getNextHoliday } from '@/lib/holidays';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function fmt(d: string) {
  const [, m, dd] = d.split('-');
  return `${dd}/${MESES[Number(m) - 1] ?? ''}`;
}

/** Aviso do próximo feriado (Nager.Date). Some se a API falhar. */
export async function HolidayNote() {
  const h = await getNextHoliday();
  if (!h) return null;
  return (
    <p className="holiday-note">
      🗓️ Próximo feriado nacional: <strong>{h.localName}</strong> ({fmt(h.date)}) — confira os horários antes de ir, museus e parques costumam mudar.
    </p>
  );
}
