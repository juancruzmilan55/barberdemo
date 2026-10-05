const DAY_PLURAL = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'] as const;

export const formatARS = (n: number): string =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export const parseWeekdays = (csv: string): number[] => csv.split(',').filter(Boolean).map(Number);

/** [5, 6] -> "viernes y sábados" */
export function joinDays(days: number[]): string {
  const names = [...days].sort((a, b) => a - b).map((d) => DAY_PLURAL[d]);
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
