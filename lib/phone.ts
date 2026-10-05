/**
 * Convierte un teléfono argentino tal como lo escribió el cliente al formato de wa.me
 * (código de país + 9 + área + número, sin 0 ni 15). Devuelve null si no se puede interpretar.
 *   "341 555 1234" -> 5493415551234 · "0341 15 555 1234" -> 5493415551234 · "+54 9 341 555 1234" -> 5493415551234
 */
export function toWhatsAppNumber(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);

  if (d.startsWith('549') && d.length === 13) return d;
  if (d.startsWith('54') && d.length === 12) return `549${d.slice(2)}`;
  if (d.startsWith('54')) return null;

  if (d.startsWith('0')) d = d.slice(1); // prefijo de discado nacional
  if (d.length === 12) {
    // área (2 a 4 dígitos) + "15" + abonado: se saca el 15
    for (const area of [2, 3, 4]) {
      if (d.slice(area, area + 2) === '15') {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }
  return d.length === 10 ? `549${d}` : null;
}
