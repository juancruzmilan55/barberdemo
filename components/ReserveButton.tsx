'use client';

import { scrollToSection } from '@/lib/scroll';

/** Preselecciona un servicio en el asistente y baja a #reservar. */
export function ReserveButton({ serviceId, label, className }: { serviceId: string; label: string; className?: string }) {
  return (
    <button type="button" className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent('preselect-service', { detail: serviceId }));
        scrollToSection('reservar');
      }}>
      {label}
    </button>
  );
}
