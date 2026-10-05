import type { NextConfig } from 'next';

// Sitio 100% estático para GitHub Pages: se genera la carpeta /out.
// NEXT_PUBLIC_BASE_PATH lo define el workflow (ej.: /nombre-del-repo).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ['*.trycloudflare.com'],
};

export default nextConfig;
