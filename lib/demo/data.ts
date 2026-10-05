// Datos de ejemplo de la demo. Editá acá nombres, precios, barberos y horarios.
export const branch = {
  slotIntervalMin: 30,
  minNoticeMin: 60,
  maxDaysAhead: 30,
  cancelLimitHours: 2,
  walkInOnlyWeekdays: [5, 6], // viernes y sábados: por orden de llegada
  transferAlias: 'barberia.demo',
  transferHolder: 'Titular de ejemplo',
};

export interface Svc { id: string; name: string; description: string; durationMin: number; priceARS: number }
export const categories: { id: string; name: string; services: Svc[] }[] = [
  { id: 'c1', name: 'Cortes', services: [
    { id: 'clasico', name: 'Corte clásico', description: 'Tijera y máquina, terminación a navaja.', durationMin: 45, priceARS: 12000 },
    { id: 'degrade', name: 'Degradé', description: 'Fade a elección con terminación prolija.', durationMin: 45, priceARS: 14000 },
    { id: 'ninos', name: 'Corte niños', description: 'Hasta 12 años.', durationMin: 30, priceARS: 9000 } ] },
  { id: 'c2', name: 'Barba', services: [
    { id: 'cejas', name: 'Perfilado de cejas', description: 'Rápido y sin dolor.', durationMin: 15, priceARS: 3000 },
    { id: 'barba', name: 'Arreglo de barba', description: 'Perfilado y recorte.', durationMin: 30, priceARS: 8000 },
    { id: 'toalla', name: 'Barba con toalla caliente', description: 'Ritual clásico con navaja y toalla caliente.', durationMin: 45, priceARS: 10000 } ] },
  { id: 'c3', name: 'Combos', services: [
    { id: 'combo', name: 'Corte + barba', description: 'El clásico completo.', durationMin: 75, priceARS: 19000 },
    { id: 'combo-full', name: 'Corte + barba + cejas', description: 'Todo en un solo turno.', durationMin: 90, priceARS: 21000 } ] },
];

const all = categories.flatMap((c) => c.services.map((s) => s.id));
export const barbers = [
  { id: 'b1', name: 'barber1', bio: 'Especialista en cortes clásicos y barba.', photoUrl: '/placeholders/barbero-1.svg', serviceIds: all },
  { id: 'b2', name: 'barber2', bio: 'Degradés y estilos modernos.', photoUrl: '/placeholders/barbero-2.svg', serviceIds: all.filter((i) => i !== 'toalla') },
];

// Martes (2) a sábado (6). Descanso al mediodía.
export const hours: Record<string, { start: string; end: string; breakStart: string; breakEnd: string }> = {
  b1: { start: '09:00', end: '21:00', breakStart: '13:00', breakEnd: '14:00' },
  b2: { start: '10:00', end: '21:00', breakStart: '14:00', breakEnd: '15:00' },
};
export const workDays = [2, 3, 4, 5, 6];
