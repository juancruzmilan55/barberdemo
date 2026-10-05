// Utilidades de fecha para el navegador (Intl, sin dependencias). Zona: Buenos Aires.
const TZ = 'America/Argentina/Buenos_Aires';

/** "YYYY-MM-DD" de hoy en Buenos Aires. */
export const todayBA = (): string => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

export function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export const formatDateLong = (dateStr: string): string =>
  new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    new Date(`${dateStr}T12:00:00Z`),
  );

export const formatMonth = (monthKey: string): string =>
  new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${monthKey}-01T12:00:00Z`));

export const formatDateTimeLong = (iso: string): string =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ,
  }).format(new Date(iso));
