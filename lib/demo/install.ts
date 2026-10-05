import { ApiError, cancel, createBooking, daySlots, lookup, monthStatus } from './api';

type Body = Record<string, unknown>;
const json = (data: unknown, status = 200): Response => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function route(path: string, q: URLSearchParams, body: Body): Response {
  const ids = (q.get('serviceIds') ?? '').split(',').filter(Boolean);
  const pro = q.get('professionalId') || undefined;
  try {
    if (path === '/api/availability/month') return json(monthStatus(q.get('month') ?? '', ids, pro));
    if (path === '/api/availability') return json(daySlots(q.get('date') ?? '', ids, pro));
    if (path === '/api/bookings') return json(createBooking(body as never), 201);
    if (path === '/api/bookings/lookup') return json(lookup(String(body.code ?? ''), String(body.phone ?? '')));
    if (path === '/api/bookings/cancel') return json(cancel(String(body.code ?? ''), String(body.phone ?? '')));
    return json({ error: 'No disponible en la demo.', code: 'DEMO' }, 404);
  } catch (e) {
    if (e instanceof ApiError) return json({ error: e.message, code: e.code }, e.status);
    return json({ error: 'Error interno. Probá de nuevo en unos segundos.', code: 'INTERNAL' }, 500);
  }
}

if (typeof window !== 'undefined' && !(window as { __demoFetch?: boolean }).__demoFetch) {
  (window as { __demoFetch?: boolean }).__demoFetch = true;
  const real = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const u = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.origin);
    if (!u.pathname.startsWith('/api/')) return real(input, init);
    return route(u.pathname, u.searchParams, init?.body ? (JSON.parse(String(init.body)) as Body) : {});
  };
}
