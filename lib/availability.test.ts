import { describe, expect, it } from 'vitest';
import { computeSlots, pickProfessional, workRanges, type ProfessionalDay } from './availability';

const h = (hours: number, min = 0): number => hours * 60 + min;

const day = (id: string, overrides: Partial<ProfessionalDay> = {}): ProfessionalDay => ({
  professionalId: id,
  workBlocks: [{ start: h(9), end: h(21) }],
  busy: [],
  ...overrides,
});

const q = (durationMin: number, earliestStart = 0) => ({ durationMin, intervalMin: 15, earliestStart });
const find = (slots: ReturnType<typeof computeSlots>, start: number) => slots.find((s) => s.start === start);

describe('workRanges', () => {
  it('parte la jornada en dos por el descanso', () => {
    const r = workRanges([{ start: h(9), end: h(21), breakStart: h(13), breakEnd: h(14) }]);
    expect(r).toEqual([
      { start: h(9), end: h(13) },
      { start: h(14), end: h(21) },
    ]);
  });
});

describe('computeSlots', () => {
  it('no ofrece turnos que pisan el descanso', () => {
    const d = day('A', { workBlocks: [{ start: h(9), end: h(21), breakStart: h(13), breakEnd: h(14) }] });
    const s = computeSlots([d], q(45));
    expect(find(s, h(12, 15))?.available).toBe(true); // termina 13:00 justo: entra
    expect(find(s, h(12, 30))).toBeUndefined(); // 12:30-13:15 pisa el descanso
    expect(find(s, h(14))?.available).toBe(true);
  });

  it('el turno pegado al cierre entra, uno más tarde no', () => {
    const s = computeSlots([day('A')], q(45));
    expect(find(s, h(20, 15))?.available).toBe(true); // 20:15-21:00
    expect(find(s, h(20, 30))).toBeUndefined();
  });

  it('un turno de 45 min bloquea 3 tramos de 15', () => {
    const d = day('A', { busy: [{ start: h(10), end: h(10, 45) }] });
    const s = computeSlots([d], q(15));
    expect(find(s, h(10))?.available).toBe(false);
    expect(find(s, h(10, 15))?.available).toBe(false);
    expect(find(s, h(10, 30))?.available).toBe(false);
    expect(find(s, h(10, 45))?.available).toBe(true);
  });

  it('respeta bloqueos (TimeOff) como ocupado', () => {
    const d = day('A', { busy: [{ start: h(15), end: h(17) }] });
    expect(find(computeSlots([d], q(30)), h(16))?.available).toBe(false);
  });

  it('un servicio largo no arranca si el hueco libre es más corto', () => {
    const d = day('A', { busy: [{ start: h(11), end: h(12) }] });
    const s = computeSlots([d], q(60));
    expect(find(s, h(10, 30))?.available).toBe(false); // 10:30-11:30 pisa la reserva
    expect(find(s, h(10))?.available).toBe(true);
  });

  it('respeta el aviso mínimo (earliestStart)', () => {
    const s = computeSlots([day('A')], q(30, h(10, 5)));
    expect(s[0].start).toBe(h(10, 15));
  });

  it('cualquier barbero: libre si uno lo está, tachado solo si ambos están ocupados', () => {
    const a = day('A', { busy: [{ start: h(10), end: h(11) }] });
    const b = day('B');
    let s = computeSlots([a, b], q(30));
    expect(find(s, h(10))).toMatchObject({ available: true, freeProfessionalIds: ['B'] });

    const b2 = day('B', { busy: [{ start: h(10), end: h(11) }] });
    s = computeSlots([a, b2], q(30));
    expect(find(s, h(10))).toMatchObject({ available: false, freeProfessionalIds: [] });
  });

  it('horarios distintos por barbero: existe el horario si alguno trabaja', () => {
    const a = day('A', { workBlocks: [{ start: h(9), end: h(13) }] });
    const b = day('B', { workBlocks: [{ start: h(16), end: h(21) }] });
    const s = computeSlots([a, b], q(30));
    expect(find(s, h(14))).toBeUndefined();
    expect(find(s, h(17))?.freeProfessionalIds).toEqual(['B']);
  });

  it('día sin jornada: sin horarios', () => {
    expect(computeSlots([day('A', { workBlocks: [] })], q(30))).toEqual([]);
  });
});

describe('pickProfessional', () => {
  it('asigna el primer barbero libre', () => {
    const a = day('A', { busy: [{ start: h(10), end: h(11) }] });
    expect(pickProfessional([a, day('B')], { start: h(10), end: h(10, 30) })).toBe('B');
    expect(pickProfessional([a], { start: h(10), end: h(10, 30) })).toBeNull();
  });
});
