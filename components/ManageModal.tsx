'use client';

import '@/lib/demo/install';
import { useEffect, useRef, useState } from 'react';
import { content } from '@/lib/content';
import { formatDateTimeLong } from '@/lib/datetime';
import { formatARS } from '@/lib/format';

const m = content.manage;

interface Lookup {
  code: string;
  status: keyof typeof m.statuses;
  startAt: string;
  professionalName: string;
  services: string[];
  totalPriceARS: number;
  totalDurationMin: number;
  canCancel: boolean;
  cancelLimitHours: number;
}
type CancelStep = 'idle' | 'confirm' | 'busy';

const inputClass = 'mt-1 h-12 w-full rounded-md border border-line bg-bg px-3 text-base text-fg placeholder:text-muted/60';

export function ManageModal() {
  const ref = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<Lookup | null>(null);
  const [cancelStep, setCancelStep] = useState<CancelStep>('idle');
  const [cancelledMsg, setCancelledMsg] = useState('');

  const reset = () => {
    setCode('');
    setPhone('');
    setError('');
    setBooking(null);
    setCancelStep('idle');
    setCancelledMsg('');
  };

  // Lo abren el botón "Mi turno" del header y el link del footer.
  useEffect(() => {
    const open = () => {
      reset();
      if (ref.current && !ref.current.open) ref.current.showModal();
    };
    window.addEventListener('open-manage', open);
    return () => window.removeEventListener('open-manage', open);
  }, []);

  const post = async <T,>(url: string): Promise<{ ok: boolean; data: T & { error?: string } }> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, phone }),
    });
    return { ok: res.ok, data: (await res.json()) as T & { error?: string } };
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await post<Lookup>('/api/bookings/lookup');
      if (ok) setBooking(data);
      else setError(data.error ?? content.wizard.networkError);
    } catch {
      setError(content.wizard.networkError);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setCancelStep('busy');
    setError('');
    try {
      const { ok, data } = await post<{ ok: boolean }>('/api/bookings/cancel');
      if (ok) {
        setBooking((b) => (b ? { ...b, status: 'CANCELLED', canCancel: false } : b));
        setCancelledMsg(m.cancelled);
      } else {
        setError(data.error ?? content.wizard.networkError);
      }
    } catch {
      setError(content.wizard.networkError);
    } finally {
      setCancelStep('idle');
    }
  };

  const close = () => ref.current?.close();
  const waUrl = `https://wa.me/${content.brand.whatsapp}`;
  const cancellable = booking && (booking.status === 'PENDING' || booking.status === 'CONFIRMED');

  return (
    <dialog
      ref={ref}
      aria-labelledby="manage-title"
      onClick={(e) => e.target === ref.current && close()} // clic en el fondo cierra
      className="m-auto w-[calc(100%-2rem)] max-w-[460px] rounded-[10px] border border-line bg-surface p-6 text-fg backdrop:bg-black/70"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="manage-title" className="font-serif text-2xl">{m.title}</h2>
        <button type="button" onClick={close} aria-label={m.close} className="-mr-2 -mt-1 rounded-md p-2 text-muted hover:text-fg">✕</button>
      </div>

      {!booking ? (
        <form onSubmit={search} noValidate className="mt-4">
          <p className="text-sm text-muted">{m.text}</p>
          <label htmlFor="m-code" className="mt-4 block text-sm">{m.codeLabel}</label>
          <input id="m-code" className={`${inputClass} font-mono uppercase tracking-[0.2em]`} maxLength={6} autoComplete="off"
            placeholder={m.codeHint} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <label htmlFor="m-phone" className="mt-4 block text-sm">{m.phoneLabel}</label>
          <input id="m-phone" className={inputClass} type="tel" inputMode="tel" autoComplete="tel"
            placeholder={content.wizard.fields.phoneHint} value={phone} onChange={(e) => setPhone(e.target.value)} />
          {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading || code.trim().length < 4 || phone.trim().length < 6} className="btn btn-primary mt-5 w-full disabled:opacity-50">
            {loading ? m.searching : m.search}
          </button>
        </form>
      ) : (
        <div className="mt-4" aria-live="polite">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted">{m.codeLabel}</dt><dd className="font-mono tracking-[0.15em] text-goldtext">{booking.code}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">{m.statusLabel}</dt><dd>{m.statuses[booking.status] ?? booking.status}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">{content.wizard.whenLabel}</dt><dd className="text-right capitalize">{formatDateTimeLong(booking.startAt)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">{content.wizard.barberLabel}</dt><dd>{booking.professionalName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Servicios</dt><dd className="text-right">{booking.services.join(', ')}</dd></div>
            <div className="flex justify-between gap-4 border-t border-line pt-2 font-semibold"><dt>{content.wizard.total}</dt><dd>{formatARS(booking.totalPriceARS)} · {booking.totalDurationMin} min</dd></div>
          </dl>

          {cancelledMsg && <p className="mt-4 rounded-md border border-line p-3 text-sm">{cancelledMsg}</p>}
          {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}

          {booking.canCancel && cancelStep === 'idle' && (
            <button type="button" onClick={() => setCancelStep('confirm')} className="btn btn-secondary mt-5 w-full">{m.cancel}</button>
          )}
          {booking.canCancel && cancelStep !== 'idle' && (
            <div className="mt-5 rounded-md border border-line p-4 text-sm">
              <p>{m.cancelConfirm}</p>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={cancel} disabled={cancelStep === 'busy'} className="btn btn-secondary !h-10 flex-1">{m.cancelYes}</button>
                <button type="button" onClick={() => setCancelStep('idle')} className="btn btn-secondary !h-10 flex-1">{m.cancelNo}</button>
              </div>
            </div>
          )}
          {cancellable && !booking.canCancel && (
            <div className="mt-5 text-sm">
              <p className="text-muted">{m.tooLate.replace('{hours}', String(booking.cancelLimitHours))}</p>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-3 w-full">{m.whatsapp}</a>
            </div>
          )}

          <button type="button" onClick={reset} className="mt-5 text-sm text-muted underline underline-offset-4 hover:text-fg">{m.another}</button>
        </div>
      )}
    </dialog>
  );
}
