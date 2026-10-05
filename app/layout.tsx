import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { BackToTop } from '@/components/BackToTop';
import { Header } from '@/components/Header';
import { content } from '@/lib/content';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
  openGraph: { title: content.seo.title, description: content.seo.description, locale: 'es_AR', type: 'website' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { viewportFit: 'cover', themeColor: '#0d0d0d' };

// Aplica el tema guardado antes de pintar (evita el parpadeo). Por defecto: oscuro.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:'dark'}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" data-theme="dark" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <a href="#contenido" className="skip-link">
          {content.header.skip}
        </a>
        <Header />
        <main id="contenido">{children}</main>
        <BackToTop />
      </body>
    </html>
  );
}
