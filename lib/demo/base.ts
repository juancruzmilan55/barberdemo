// En GitHub Pages el sitio vive en /nombre-repo; este prefijo se define en el build (ver workflow).
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const asset = (p: string): string => (p.startsWith('/') ? `${BASE}${p}` : p);
