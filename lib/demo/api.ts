import { computeSlots, pickProfessional, type ProfessionalDay, type Range } from '../availability';
import { addDaysStr, todayBA } from '../datetime';
import { barbers, branch, categories, hours, workDays } from './data';

const KEY = 'demo-bookings-v1';
const TZ = 'America/Argentina/Buenos_Aires';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

interface Stored { id: string; code: string; date: string; startMin: number; endMin: number; professionalId: string; status: 'CONFIRMED' | 'CANCELLED'; phone: string; serviceIds: string[]; price: number; duration: number }
export class ApiError extends Error { constructor(public status: number, message: string, public code: string) { super(message); } }

const services = categories.flatMap((c) => c.services);
const toMin = (hhmm: string): number => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const toHHmm = (min: number): string => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const weekdayOf = (d: string): number => new Date(`${d}T12:00:00Z`).getUTCDay();
const valid = (d: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime()) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
const nowMin = (): number => { const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number); return h * 60 + m; };
const iso = (date: string, min: number): string => new Date(new Date(`${date}T00:00:00-03:00`).getTime() + min * 60000).toISOString(); // Argentina no tiene horario de verano

const load = (): Stored[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Stored[]; } catch { return []; } };
const save = (b: Stored[]): void => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch { /* sin storage: la demo sigue, pero no guarda */ } };

// Turnos "ya ocupados" de ejemplo para que el calendario se vea vivo (se ven tachados).
function sampleBusy(date: string, proId: string): Range[] {
  const day = Number(date.slice(8));
  if (proId === 'b1') return [{ start: 600, end: 690 }, { start: 1020, end: 1080 }];
  return day % 2 === 0 ? [{ start: 660, end: 720 }] : [{ start: 900, end: 960 }, { start: 1080, end: 1140 }];
}

function context(date: string, serviceIds: string[], professionalId?: string) {
  if (!valid(date)) throw new ApiError(400, 'Fecha inválida.', 'BAD_DATE');
  const today = todayBA();
  if (date < today || date > addDaysStr(today, branch.maxDaysAhead)) throw new ApiError(400, 'Esa fecha no está disponible para reservar.', 'DATE_OUT_OF_RANGE');
  const ids = [...new Set(serviceIds)];
  const rows = services.filter((s) => ids.includes(s.id));
  if (ids.length === 0 || rows.length !== ids.length) throw new ApiError(400, 'Los servicios elegidos no son válidos.', 'BAD_SERVICES');
  const durationMin = rows.reduce((a, s) => a + s.durationMin, 0);
  const priceARS = rows.reduce((a, s) => a + s.priceARS, 0);
  const wd = weekdayOf(date);
  if (branch.walkInOnlyWeekdays.includes(wd)) return { walkIn: true, durationMin, priceARS, days: [] as ProfessionalDay[], earliestStart: 0 };
  const stored = load().filter((b) => b.date === date && b.status !== 'CANCELLED');
  const days: ProfessionalDay[] = barbers
    .filter((b) => (!professionalId || b.id === professionalId) && ids.every((i) => b.serviceIds.includes(i)))
    .map((b) => {
      const h = hours[b.id];
      return {
        professionalId: b.id,
        workBlocks: workDays.includes(wd) ? [{ start: toMin(h.start), end: toMin(h.end), breakStart: toMin(h.breakStart), breakEnd: toMin(h.breakEnd) }] : [],
        busy: [...sampleBusy(date, b.id), ...stored.filter((s) => s.professionalId === b.id).map((s) => ({ start: s.startMin, end: s.endMin }))],
      };
    });
  return { walkIn: false, durationMin, priceARS, days, earliestStart: date === today ? nowMin() + branch.minNoticeMin : 0 };
}

export function daySlots(date: string, serviceIds: string[], professionalId?: string) {
  const c = context(date, serviceIds, professionalId);
  if (c.walkIn) return { walkIn: true, durationMin: c.durationMin, priceARS: c.priceARS, slots: [] };
  const slots = computeSlots(c.days, { durationMin: c.durationMin, intervalMin: branch.slotIntervalMin, earliestStart: c.earliestStart })
    .map((s) => ({ time: toHHmm(s.start), available: s.available, professionalIds: s.freeProfessionalIds }));
  return { walkIn: false, durationMin: c.durationMin, priceARS: c.priceARS, slots };
}

export function monthStatus(month: string, serviceIds: string[], professionalId?: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new ApiError(400, 'Mes inválido.', 'BAD_MONTH');
  const [y, m] = month.split('-').map(Number);
  const days: Record<string, 'open' | 'full' | 'walkin' | 'closed'> = {};
  for (let d = 1; d <= new Date(Date.UTC(y, m, 0)).getUTCDate(); d++) {
    const date = `${month}-${String(d).padStart(2, '0')}`;
    try {
      const r = daySlots(date, serviceIds, professionalId);
      days[date] = r.walkIn ? 'walkin' : r.slots.length === 0 ? 'closed' : r.slots.some((s) => s.available) ? 'open' : 'full';
    } catch (e) { if (e instanceof ApiError && e.code === 'DATE_OUT_OF_RANGE') days[date] = 'closed'; else throw e; }
  }
  return { days };
}

interface BookInput { date: string; time: string; serviceIds: string[]; professionalId?: string | null; customer: { name: string; phone: string }; acceptedTerms?: boolean }
export function createBooking(i: BookInput) {
  if (!i.customer?.name || i.customer.name.trim().length < 2) throw new ApiError(400, 'Ingresá tu nombre.', 'VALIDATION');
  const phone = (i.customer.phone ?? '').replace(/\D/g, '');
  if (phone.length < 8 || phone.length > 13) throw new ApiError(400, 'Ingresá un teléfono válido (ej.: 341 680 1035).', 'VALIDATION');
  const c = context(i.date, i.serviceIds, i.professionalId ?? undefined);
  if (c.walkIn) throw new ApiError(400, 'Ese día se atiende por orden de llegada, sin reserva.', 'WALK_IN');
  if (c.days.length === 0) throw new ApiError(400, 'Ese barbero no realiza los servicios elegidos.', 'BAD_PROFESSIONAL');
  const start = toMin(i.time);
  const slot = { start, end: start + c.durationMin };
  const proId = start % branch.slotIntervalMin !== 0 || start < c.earliestStart ? null : pickProfessional(c.days, slot);
  if (!proId) throw new ApiError(409, 'Ese horario se acaba de ocupar, elegí otro.', 'SLOT_TAKEN');
  const all = load();
  let code = '';
  do { code = Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join(''); } while (all.some((b) => b.code === code));
  const b: Stored = { id: code, code, date: i.date, startMin: slot.start, endMin: slot.end, professionalId: proId, status: 'CONFIRMED', phone, serviceIds: [...new Set(i.serviceIds)], price: c.priceARS, duration: c.durationMin };
  save([...all, b]);
  return { id: b.id, code, startAt: iso(i.date, slot.start), endAt: iso(i.date, slot.end), professionalId: proId, professionalName: barbers.find((x) => x.id === proId)?.name ?? '', totalPriceARS: c.priceARS, totalDurationMin: c.duration };
}

const find = (code: string, phone: string): Stored => {
  const b = load().find((x) => x.code === code.trim().toUpperCase());
  if (!b || b.phone !== phone.replace(/\D/g, '')) throw new ApiError(404, 'No encontramos un turno con ese código y teléfono.', 'NOT_FOUND');
  return b;
};
const startMs = (b: Stored): number => new Date(iso(b.date, b.startMin)).getTime();

export function lookup(code: string, phone: string) {
  const b = find(code, phone);
  return {
    code: b.code, status: b.status, startAt: iso(b.date, b.startMin), endAt: iso(b.date, b.endMin),
    professionalName: barbers.find((x) => x.id === b.professionalId)?.name ?? '',
    services: services.filter((s) => b.serviceIds.includes(s.id)).map((s) => s.name),
    totalPriceARS: b.price, totalDurationMin: b.duration,
    canCancel: b.status === 'CONFIRMED' && startMs(b) - Date.now() >= branch.cancelLimitHours * 3_600_000,
    cancelLimitHours: branch.cancelLimitHours,
  };
}

export function cancel(code: string, phone: string) {
  const b = find(code, phone);
  if (b.status === 'CANCELLED') throw new ApiError(409, 'Ese turno ya estaba cancelado.', 'ALREADY_CANCELLED');
  if (startMs(b) - Date.now() < branch.cancelLimitHours * 3_600_000) throw new ApiError(403, `Ya no se puede cancelar online (falta menos de ${branch.cancelLimitHours} hs).`, 'TOO_LATE');
  save(load().map((x) => (x.id === b.id ? { ...x, status: 'CANCELLED' as const } : x)));
  return { ok: true, id: b.id };
}
