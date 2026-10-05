/**
 * Motor de disponibilidad: funciones puras, sin fechas ni zonas horarias.
 * Todo se expresa en minutos sobre una misma referencia (ej.: minutos desde la
 * medianoche local del día consultado). La capa que llama convierte Date <-> minutos.
 */

export interface Range {
  start: number;
  end: number;
}

export interface WorkBlock {
  start: number;
  end: number;
  breakStart?: number;
  breakEnd?: number;
}

export interface ProfessionalDay {
  professionalId: string;
  workBlocks: WorkBlock[];
  /** Reservas activas (no canceladas) + TimeOff propio + TimeOff de sucursal. */
  busy: Range[];
}

export interface SlotQuery {
  durationMin: number;
  intervalMin: number;
  /** Primer minuto reservable (ahora + minNoticeMin, en la misma referencia). */
  earliestStart: number;
}

export interface Slot {
  start: number;
  available: boolean;
  /** Barberos libres en este horario; el primero es el que se asigna. */
  freeProfessionalIds: string[];
}

export const overlaps = (a: Range, b: Range): boolean => a.start < b.end && b.start < a.end;

const fits = (inner: Range, outer: Range): boolean => inner.start >= outer.start && inner.end <= outer.end;

/** Quita el descanso de cada bloque; devuelve los tramos efectivamente trabajados. */
export function workRanges(blocks: WorkBlock[]): Range[] {
  const out: Range[] = [];
  for (const b of blocks) {
    if (b.end <= b.start) continue;
    const hasBreak =
      b.breakStart !== undefined && b.breakEnd !== undefined && b.breakEnd > b.breakStart;
    if (!hasBreak) {
      out.push({ start: b.start, end: b.end });
      continue;
    }
    const bs = Math.max(b.start, b.breakStart as number);
    const be = Math.min(b.end, b.breakEnd as number);
    if (be <= bs) {
      out.push({ start: b.start, end: b.end });
      continue;
    }
    if (bs > b.start) out.push({ start: b.start, end: bs });
    if (be < b.end) out.push({ start: be, end: b.end });
  }
  return out.sort((x, y) => x.start - y.start);
}

/** La duración TOTAL debe entrar completa en un mismo tramo trabajado. */
export function fitsInWorkday(slot: Range, ranges: Range[]): boolean {
  return ranges.some((r) => fits(slot, r));
}

export function isFree(slot: Range, day: ProfessionalDay): boolean {
  return fitsInWorkday(slot, workRanges(day.workBlocks)) && !day.busy.some((b) => overlaps(slot, b));
}

/**
 * Devuelve los horarios del día. Un horario "existe" si algún barbero lo trabaja
 * (entra en su jornada); si está ocupado para todos, sale con available=false
 * (la UI lo muestra tachado). Con varios barberos ("cualquier barbero") está libre
 * si al menos uno lo está.
 */
export function computeSlots(days: ProfessionalDay[], q: SlotQuery): Slot[] {
  if (q.durationMin <= 0 || q.intervalMin <= 0 || days.length === 0) return [];

  const ranges = days.map((d) => workRanges(d.workBlocks));
  const first = Math.min(...ranges.flat().map((r) => r.start), Infinity);
  const last = Math.max(...ranges.flat().map((r) => r.end), -Infinity);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return [];

  const slots: Slot[] = [];
  const firstAligned = first + Math.ceil(Math.max(0, q.earliestStart - first) / q.intervalMin) * q.intervalMin;

  for (let t = firstAligned; t + q.durationMin <= last; t += q.intervalMin) {
    const slot: Range = { start: t, end: t + q.durationMin };
    const works = days.filter((_, i) => fitsInWorkday(slot, ranges[i]));
    if (works.length === 0) continue;
    const free = works.filter((d) => !d.busy.some((b) => overlaps(slot, b)));
    slots.push({
      start: t,
      available: free.length > 0,
      freeProfessionalIds: free.map((d) => d.professionalId),
    });
  }
  return slots;
}

/** Elige el primer barbero libre (asignación de "cualquier barbero"); null si ya no hay. */
export function pickProfessional(days: ProfessionalDay[], slot: Range): string | null {
  return days.find((d) => isFree(slot, d))?.professionalId ?? null;
}

/** Agrupa horarios (minutos desde medianoche local) en Mañana / Tarde / Noche. */
export function periodOf(minuteOfDay: number): 'Mañana' | 'Tarde' | 'Noche' {
  if (minuteOfDay < 12 * 60) return 'Mañana';
  if (minuteOfDay < 19 * 60) return 'Tarde';
  return 'Noche';
}
