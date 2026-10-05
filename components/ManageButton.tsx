'use client';

/** Abre el modal "Consultar o cancelar mi turno" (se conecta en la parte 2). */
export function ManageButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent('open-manage'))}>
      {label}
    </button>
  );
}
