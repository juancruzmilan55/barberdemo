'use client';

import '@/lib/demo/install';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { periodOf } from '@/lib/availability';
import { content } from '@/lib/content';
import { addDaysStr, formatDateLong, formatDateTimeLong, formatMonth, todayBA } from '@/lib/datetime';
import { formatARS } from '@/lib/format';

const w = content.wizard;
const steps = content.booking.steps;

export interface WizardService { id: string; name: string; categoryName: string; durationMin: number; priceARS: number }
export interface WizardBarber { id: string; name: string; serviceIds: string[] }
interface Props {
  services: WizardService[];
  barbers: WizardBarber[];
  maxDaysAhead: number;
  transferAlias: string | null;
  transferHolder: string | null;
  businessName: string;
  address: string;
}

type DayStatus = 'open' | 'full' | 'walkin' | 'closed';
interface Slot { time: string; available: boolean }
interface DaySlots { walkIn: boolean; slots: Slot[] }
interface Result { id: string; code: string; startAt: string; endAt: string; professionalName: string; totalPriceARS: number; totalDurationMin: number }
type CancelStep = 'idle' | 'confirm' | 'busy' | 'done';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Error');
  return data;
}

const minutesOf = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const inputClass =
  'mt-1 h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-fg placeholder:text-muted/60';

export function BookingWizard({ services, barbers, maxDaysAhead, transferAlias, transferHolder, businessName, address }: Props) {
  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [barberId, setBarberId] = useState<string | null>(null); // 'any' = cualquier barbero
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [monthKey, setMonthKey] = useState(() => todayBA().slice(0, 7));
  const [monthStatus, setMonthStatus] = useState<Record<string, DayStatus>>({});
  const [monthLoaded, setMonthLoaded] = useState(false);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [walkIn, setWalkIn] = useState(false);
  const [availError, setAvailError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '', terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [cancelStep, setCancelStep] = useState<CancelStep>('idle');
  const [cancelMsg, setCancelMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmRef = useRef<HTMLDialogElement>(null);

  const timeRef = useRef(time);
  timeRef.current = time;

  // Cartel de confirmación previo a reservar.
  useEffect(() => {
    const d = confirmRef.current;
    if (!d) return;
    if (confirmOpen && !d.open) d.showModal();
    if (!confirmOpen && d.open) d.close();
  }, [confirmOpen]);

  const selected = useMemo(() => services.filter((s) => serviceIds.includes(s.id)), [services, serviceIds]);
  const totalPrice = selected.reduce((a, s) => a + s.priceARS, 0);
  const totalMin = selected.reduce((a, s) => a + s.durationMin, 0);
  const eligibleBarbers = useMemo(
    () => barbers.filter((b) => serviceIds.every((id) => b.serviceIds.includes(id))),
    [barbers, serviceIds],
  );
  const barberName = barberId === 'any' ? content.booking.anyBarber : (barbers.find((b) => b.id === barberId)?.name ?? '');

  const baseQuery = useMemo(() => {
    const q = new URLSearchParams({ serviceIds: serviceIds.join(',') });
    if (barberId && barberId !== 'any') q.set('professionalId', barberId);
    return q;
  }, [serviceIds, barberId]);

  const goStep = (n: number) => {
    setStep(n);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    topRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const resetSelection = () => {
    setBarberId(null);
    setDate(null);
    setTime(null);
    setSlots(null);
    setNotice('');
  };

  const toggleService = (id: string) => {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    resetSelection();
  };

  // "Reservar" en una tarjeta de servicio: preselecciona y vuelve al paso 1.
  useEffect(() => {
    const onPreselect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setResult(null);
      setCancelStep('idle');
      setCancelMsg('');
      setServiceIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      resetSelection();
      setStep(1);
    };
    window.addEventListener('preselect-service', onPreselect);
    return () => window.removeEventListener('preselect-service', onPreselect);
  }, []);

  // Disponibilidad en vivo: al entrar al paso, cada 30 s (pestaña visible) y al volver a enfocar.
  const refresh = useCallback(async () => {
    if (serviceIds.length === 0) return;
    setAvailError('');
    try {
      const mq = new URLSearchParams(baseQuery);
      mq.set('month', monthKey);
      const month = await getJson<{ days: Record<string, DayStatus> }>(`/api/availability/month?${mq}`);
      setMonthStatus(month.days);
      setMonthLoaded(true);
      if (date) {
        const dq = new URLSearchParams(baseQuery);
        dq.set('date', date);
        const day = await getJson<DaySlots>(`/api/availability?${dq}`);
        setSlots(day.slots);
        setWalkIn(day.walkIn);
        const chosen = timeRef.current;
        if (chosen && !day.slots.some((s) => s.time === chosen && s.available)) {
          setTime(null);
          setNotice(w.slotGone);
        }
      }
    } catch {
      setAvailError(w.availError);
    }
  }, [serviceIds, baseQuery, monthKey, date]);

  useEffect(() => {
    if (step !== 3) return;
    void refresh();
    const onFocus = () => {
      if (!document.hidden) void refresh();
    };
    const id = setInterval(onFocus, 30_000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [step, refresh]);

  // ---- calendario ----
  const today = todayBA();
  const currentMonth = today.slice(0, 7);
  const lastMonth = addDaysStr(today, maxDaysAhead).slice(0, 7);
  const cells = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number);
    const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // semana desde el lunes
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return [
      ...Array<string | null>(lead).fill(null),
      ...Array.from({ length: dim }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`),
    ];
  }, [monthKey]);

  const shiftMonth = (delta: number) => {
    const [y, m] = monthKey.split('-').map(Number);
    setMonthKey(new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7));
    setMonthLoaded(false);
  };

  const selectDate = (d: string) => {
    setDate(d);
    setTime(null);
    setSlots(null);
    setNotice('');
  };

  const grouped = useMemo(() => {
    const groups = new Map<string, Slot[]>(content.booking.periods.map((p) => [p, []]));
    (slots ?? []).forEach((s) => groups.get(periodOf(minutesOf(s.time)))?.push(s));
    return [...groups.entries()].filter(([, list]) => list.length > 0);
  }, [slots]);

  // ---- envío ----
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const digits = form.phone.replace(/\D/g, '');
    if (form.name.trim().length < 2) e.name = w.errors.name;
    if (!/^\+?[\d\s()-]+$/.test(form.phone.trim()) || digits.length < 8 || digits.length > 13) e.phone = w.errors.phone;
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = w.errors.email;
    if (!form.terms) e.terms = w.errors.terms;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Al apretar "Reservar turno": valida y abre el cartel de confirmación.
  const askConfirm = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting || !date || !time || !validate()) return;
    setSubmitError('');
    setConfirmOpen(true);
  };

  // Al aceptar el cartel: crea la reserva.
  const book = async () => {
    if (submitting || !date || !time) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          time,
          serviceIds,
          professionalId: barberId === 'any' ? null : barberId,
          customer: { name: form.name, phone: form.phone, email: form.email },
          notes: form.notes,
          acceptedTerms: true,
        }),
      });
      const data = (await res.json()) as Result & { error?: string; code?: string };
      if (res.status === 201) {
        setResult(data);
        setConfirmOpen(false);
        setCancelStep('idle');
        setCancelMsg('');
        topRef.current?.scrollIntoView({ block: 'start' });
      } else if (res.status === 409) {
        // Otro cliente ganó el horario: volvemos a la grilla y la refrescamos.
        setConfirmOpen(false);
        setTime(null);
        setNotice(data.error ?? w.slotGone);
        goStep(3);
      } else {
        setSubmitError(data.error ?? w.networkError);
      }
    } catch {
      setSubmitError(w.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  const doCancel = async () => {
    if (!result) return;
    setCancelStep('busy');
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: result.code, phone: form.phone }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setCancelStep('done');
        setCancelMsg(w.done.cancelled);
      } else {
        setCancelStep('idle');
        setCancelMsg(data.error ?? w.networkError);
      }
    } catch {
      setCancelStep('idle');
      setCancelMsg(w.networkError);
    }
  };

  const startAgain = () => {
    setResult(null);
    setServiceIds([]);
    resetSelection();
    setForm({ name: '', phone: '', email: '', notes: '', terms: false });
    setStep(1);
    setCancelStep('idle');
    setCancelMsg('');
  };

  const shareUrl = result
    ? `https://wa.me/?text=${encodeURIComponent(
        w.done.shareText
          .replace('{name}', businessName)
          .replace('{when}', formatDateTimeLong(result.startAt))
          .replace('{code}', result.code)
          .replace('{address}', address),
      )}`
    : '';

  // ---- pantalla de confirmación ----
  if (result) {
    const cancelled = cancelStep === 'done';
    return (
      <div ref={topRef} className="scroll-mt-[calc(var(--header-h)+16px)]">
        <div className="mx-auto max-w-[560px] rounded-[10px] border border-line bg-surface p-6 text-center md:p-8" aria-live="polite">
          <h3 className="font-serif text-3xl">{cancelled ? w.done.cancelled : w.done.title}</h3>
          {!cancelled && (
            <>
              <p className="eyebrow mt-6">{w.done.codeLabel}</p>
              <p className="mt-1 font-mono text-4xl font-semibold tracking-[0.2em] text-goldtext">{result.code}</p>
              <p className="mt-2 text-sm text-muted">{w.done.text}</p>
              <dl className="mt-6 space-y-1 text-left text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted">{w.whenLabel}</dt><dd className="text-right capitalize">{formatDateTimeLong(result.startAt)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">{w.barberLabel}</dt><dd>{result.professionalName}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">{w.total}</dt><dd>{formatARS(result.totalPriceARS)} · {result.totalDurationMin} min</dd></div>
              </dl>
              <p className="mt-4 text-sm text-muted">{content.booking.paymentNote}</p>
              <div className="mt-6 flex flex-col gap-3">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{w.done.whatsapp}</a>
                {cancelStep === 'confirm' || cancelStep === 'busy' ? (
                  <div className="rounded-md border border-line p-4 text-sm">
                    <p>{w.done.cancelConfirm}</p>
                    <div className="mt-3 flex gap-3">
                      <button type="button" onClick={doCancel} disabled={cancelStep === 'busy'} className="btn btn-secondary !h-10 flex-1">{w.done.cancelYes}</button>
                      <button type="button" onClick={() => setCancelStep('idle')} className="btn btn-secondary !h-10 flex-1">{w.done.cancelNo}</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => { setCancelMsg(''); setCancelStep('confirm'); }} className="text-sm text-muted underline underline-offset-4 hover:text-fg">
                    {w.done.cancel}
                  </button>
                )}
                {cancelMsg && <p role="alert" className="text-sm text-red-400">{cancelMsg}</p>}
              </div>
            </>
          )}
          <button type="button" onClick={startAgain} className={`btn ${cancelled ? 'btn-primary' : 'btn-secondary'} mt-6 w-full`}>{w.done.another}</button>
        </div>
      </div>
    );
  }

  // ---- resumen y acción principal (escritorio: tarjeta lateral; móvil: barra inferior) ----
  const canNext = step === 1 ? serviceIds.length > 0 : step === 2 ? barberId !== null : step === 3 ? !!date && !!time && !walkIn : true;
  const action =
    step < 4 ? (
      <button type="button" disabled={!canNext} onClick={() => goStep(step + 1)} className="btn btn-primary w-full disabled:opacity-40">
        {w.next[step - 1]}
      </button>
    ) : (
      <button type="submit" form="booking-form" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
        {submitting ? w.confirming : w.confirm}
      </button>
    );

  const summary = (
    <>
      <h3 className="font-serif text-xl">{w.summaryTitle}</h3>
      {selected.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{w.summaryEmpty}</p>
      ) : (
        <dl className="mt-3 space-y-2 text-sm">
          <ul className="space-y-1">
            {selected.map((s) => (
              <li key={s.id} className="flex justify-between gap-3"><span>{s.name}</span><span className="text-muted">{formatARS(s.priceARS)}</span></li>
            ))}
          </ul>
          {barberId && <div className="flex justify-between border-t border-line pt-2"><dt className="text-muted">{w.barberLabel}</dt><dd>{barberName}</dd></div>}
          {date && time && <div className="flex justify-between gap-3"><dt className="text-muted">{w.whenLabel}</dt><dd className="text-right capitalize">{formatDateLong(date)}, {time}</dd></div>}
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>{w.total}</dt><dd className="text-goldtext">{formatARS(totalPrice)}</dd></div>
          <div className="flex justify-between text-muted"><dt>{w.duration}</dt><dd>{totalMin} min</dd></div>
        </dl>
      )}
      <div className="mt-5">{action}</div>
    </>
  );

  const categories = [...new Set(services.map((s) => s.categoryName))];

  return (
    <div ref={topRef} className="scroll-mt-[calc(var(--header-h)+16px)]">
      {/* Stepper */}
      <ol className="flex items-center gap-2 sm:gap-4" aria-label="Pasos de la reserva">
        {steps.map((label, i) => {
          const n = i + 1;
          const active = n === step;
          const reachable = n < step;
          return (
            <li key={label} className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
              <button type="button" disabled={!reachable} onClick={() => goStep(n)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${active ? 'bg-fg text-bg' : 'border border-line bg-surface text-muted'}`}
                aria-label={`${n}. ${label}`}>
                {n}
              </button>
              <span className={`text-sm ${active ? 'text-fg' : 'hidden text-muted sm:inline'}`}>{label}</span>
              {n < steps.length && <span aria-hidden="true" className="hidden h-px w-6 bg-line sm:block" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0">
          {/* Paso 1: servicios */}
          {step === 1 && (
            <div>
              <h3 className="font-serif text-2xl">{w.servicesTitle}</h3>
              {categories.map((cat) => (
                <fieldset key={cat} className="mt-6">
                  <legend className="mb-2 text-sm text-muted">{cat}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.filter((s) => s.categoryName === cat).map((s) => {
                      const on = serviceIds.includes(s.id);
                      return (
                        <label key={s.id} className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-4 ${on ? 'border-gold bg-surface' : 'border-line bg-surface'}`}>
                          <input type="checkbox" checked={on} onChange={() => toggleService(s.id)} className="mt-1 h-4 w-4 accent-[var(--gold)]" />
                          <span className="flex-1">
                            <span className="block font-medium">{s.name}</span>
                            <span className="block text-sm text-muted">{s.durationMin} min · {formatARS(s.priceARS)}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {/* Paso 2: barbero */}
          {step === 2 && (
            <div>
              <h3 className="font-serif text-2xl">{w.barberTitle}</h3>
              {eligibleBarbers.length === 0 ? (
                <p role="alert" className="mt-4 text-muted">{w.noBarbers}</p>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[...eligibleBarbers.map((b) => ({ id: b.id, name: b.name })), { id: 'any', name: content.booking.anyBarber }].map((b) => (
                    <button key={b.id} type="button" aria-pressed={barberId === b.id}
                      onClick={() => { setBarberId(b.id); setDate(null); setTime(null); setSlots(null); setMonthLoaded(false); }}
                      className={`rounded-[10px] border p-4 text-left ${barberId === b.id ? 'border-gold bg-surface' : 'border-line bg-surface'}`}>
                      <span className="block font-medium">{b.name}</span>
                      {b.id === 'any' && <span className="block text-sm text-muted">{w.anyBarberHint}</span>}
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => goStep(1)} className="btn btn-secondary mt-6">{w.back}</button>
            </div>
          )}

          {/* Paso 3: día y hora */}
          {step === 3 && (
            <div>
              <h3 className="font-serif text-2xl">{w.dateTitle}</h3>
              {availError && <p role="alert" className="mt-3 text-sm text-red-400">{availError}</p>}
              {notice && <p role="alert" className="mt-3 rounded-md border border-gold/50 bg-surface p-3 text-sm">{notice}</p>}
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <button type="button" aria-label={w.prevMonth} disabled={monthKey <= currentMonth} onClick={() => shiftMonth(-1)} className="h-10 w-10 rounded-md border border-line disabled:opacity-30">‹</button>
                    <p className="font-medium capitalize">{formatMonth(monthKey)}</p>
                    <button type="button" aria-label={w.nextMonth} disabled={monthKey >= lastMonth} onClick={() => shiftMonth(1)} className="h-10 w-10 rounded-md border border-line disabled:opacity-30">›</button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
                    {w.weekdaysShort.map((d) => (<span key={d} className="py-1">{d}</span>))}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {cells.map((d, i) => {
                      if (!d) return <span key={`e${i}`} />;
                      const status = monthLoaded ? (monthStatus[d] ?? 'closed') : 'closed';
                      const selectable = status === 'open' || status === 'walkin';
                      const isSel = d === date;
                      return (
                        <button key={d} type="button" disabled={!selectable} aria-pressed={isSel}
                          aria-label={`${formatDateLong(d)}${selectable ? '' : `, ${content.booking.unavailableLabel}`}`}
                          onClick={() => selectDate(d)}
                          className={`h-11 rounded-md text-sm ${isSel ? 'bg-gold font-semibold text-ongold' : selectable ? (status === 'walkin' ? 'border border-dashed border-line text-muted hover:border-gold' : 'hover:bg-line') : 'text-muted/40'}`}>
                          {Number(d.slice(8))}
                        </button>
                      );
                    })}
                  </div>
                  {!monthLoaded && !availError && <p className="mt-3 text-sm text-muted">{w.loading}</p>}
                </div>

                <div aria-live="polite">
                  {!date && <p className="text-muted">{w.pickDay}</p>}
                  {date && walkIn && <p className="rounded-[10px] border border-line bg-surface p-4 text-sm">{w.walkInNotice}</p>}
                  {date && !walkIn && slots === null && <p className="text-muted">{w.loading}</p>}
                  {date && !walkIn && slots !== null && slots.length === 0 && <p className="text-muted">{w.noSlots}</p>}
                  {date && !walkIn && grouped.map(([period, list]) => (
                    <div key={period} className="mb-4">
                      <p className="mb-2 text-sm text-muted">{period}</p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {list.map((s) => s.available ? (
                          <button key={s.time} type="button" aria-pressed={time === s.time} onClick={() => { setTime(s.time); setNotice(''); }}
                            className={`h-11 rounded-md border text-sm ${time === s.time ? 'border-gold bg-gold font-semibold text-ongold' : 'border-line bg-surface hover:border-gold'}`}>
                            {s.time}
                          </button>
                        ) : (
                          <span key={s.time} aria-disabled="true" aria-label={`${s.time}, ${content.booking.unavailableLabel}`}
                            className="flex h-11 cursor-not-allowed items-center justify-center rounded-md border border-line text-sm text-muted/50 line-through">
                            {s.time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => goStep(2)} className="btn btn-secondary mt-6">{w.back}</button>
            </div>
          )}

          {/* Paso 4: datos */}
          {step === 4 && (
            <form id="booking-form" onSubmit={askConfirm} noValidate>
              <h3 className="font-serif text-2xl">{w.dataTitle}</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-name" className="text-sm">{w.fields.name}</label>
                  <input id="f-name" className={inputClass} autoComplete="name" value={form.name} aria-invalid={!!errors.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {errors.name && <p role="alert" className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="f-phone" className="text-sm">{w.fields.phone}</label>
                  <input id="f-phone" className={inputClass} type="tel" inputMode="tel" autoComplete="tel" placeholder={w.fields.phoneHint}
                    value={form.phone} aria-invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  {errors.phone && <p role="alert" className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-email" className="text-sm">{w.fields.email}</label>
                  <input id="f-email" className={inputClass} type="email" autoComplete="email" value={form.email} aria-invalid={!!errors.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {errors.email && <p role="alert" className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="f-notes" className="text-sm">{w.fields.notes}</label>
                  <textarea id="f-notes" rows={3} maxLength={300} className={`${inputClass} h-auto py-2`} value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="mt-1 h-4 w-4 accent-[var(--gold)]" />
                {w.fields.terms}
              </label>
              {errors.terms && <p role="alert" className="mt-1 text-sm text-red-400">{errors.terms}</p>}

              <p className="mt-5 text-sm text-muted">{content.booking.paymentNote}</p>
              {transferAlias && (
                <p className="mt-1 text-sm text-muted">{w.transferInfo.replace('{alias}', transferAlias).replace('{holder}', transferHolder ?? '')}</p>
              )}
              {submitError && <p role="alert" className="mt-4 text-sm text-red-400">{submitError}</p>}
              <button type="button" onClick={() => goStep(3)} className="btn btn-secondary mt-6">{w.back}</button>
            </form>
          )}
        </div>

        <aside className="sticky top-[calc(var(--header-h)+24px)] hidden rounded-[10px] border border-line bg-surface p-5 lg:block">{summary}</aside>
      </div>

      {/* Barra inferior en móvil */}
      <div className="sticky bottom-0 z-30 -mx-5 mt-6 border-t border-line bg-bg px-5 py-3 lg:hidden">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-muted">{selected.length} {selected.length === 1 ? 'servicio' : 'servicios'} · {totalMin} min</span>
          <span className="font-semibold text-goldtext">{formatARS(totalPrice)}</span>
        </div>
        {action}
      </div>

      {/* Cartel de confirmación */}
      <dialog ref={confirmRef} aria-labelledby="confirm-title" onClose={() => setConfirmOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-[440px] rounded-[10px] border border-line bg-surface p-6 text-fg backdrop:bg-black/70">
        <h3 id="confirm-title" className="font-serif text-2xl">{w.confirmDialog.title}</h3>
        <p className="mt-1 text-sm text-muted">{w.confirmDialog.text}</p>
        {date && time && (
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted">Servicios</dt><dd className="text-right">{selected.map((s) => s.name).join(', ')}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">{w.barberLabel}</dt><dd>{barberName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">{w.whenLabel}</dt><dd className="text-right capitalize">{formatDateLong(date)}, {time}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">{w.confirmDialog.customer}</dt><dd className="text-right">{form.name} · {form.phone}</dd></div>
            <div className="flex justify-between gap-4 border-t border-line pt-2 font-semibold"><dt>{w.total}</dt><dd className="text-goldtext">{formatARS(totalPrice)} · {totalMin} min</dd></div>
          </dl>
        )}
        <p className="mt-4 text-sm text-muted">{content.booking.paymentNote}</p>
        {submitError && <p role="alert" className="mt-3 text-sm text-red-400">{submitError}</p>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setConfirmOpen(false)} disabled={submitting} className="btn btn-secondary !h-11 disabled:opacity-60">{w.confirmDialog.edit}</button>
          <button type="button" onClick={book} disabled={submitting} className="btn btn-primary !h-11 disabled:opacity-60">{submitting ? w.confirming : w.confirmDialog.yes}</button>
        </div>
      </dialog>
    </div>
  );
}
