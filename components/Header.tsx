'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { content } from '@/lib/content';
import { scrollToSection } from '@/lib/scroll';
import { CloseIcon, MenuIcon, MoonIcon, ScissorsIcon, SunIcon } from './icons';

const SECTION_IDS = ['inicio', ...content.nav.map((n) => n.id)];

export function Header() {
  const pathname = usePathname();
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  // Scrollspy: resalta el link de la sección visible.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(id);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* sin almacenamiento: el tema vale solo para esta visita */
    }
    setTheme(next);
  };

  const openManage = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('open-manage'));
  };

  const linkClass = (id: string, highlight?: boolean) =>
    `rounded-md px-3 py-2 text-sm transition-colors ${
      highlight ? 'font-semibold text-goldtext' : active === id ? 'text-fg' : 'text-muted hover:text-fg'
    } ${active === id ? 'underline decoration-gold underline-offset-8' : ''}`;

  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md">
      <div className="wrap flex h-[var(--header-h)] items-center justify-between">
        <a href="#inicio" onClick={(e) => go(e, 'inicio')} className="flex items-center gap-2 font-serif text-lg">
          <span className="text-goldtext"><ScissorsIcon /></span>
          {content.brand.name}
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {content.nav.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={(e) => go(e, item.id)}
              aria-current={active === item.id ? 'true' : undefined}
              className={linkClass(item.id, 'highlight' in item ? item.highlight : false)}>
              {item.label}
            </a>
          ))}
          <button type="button" onClick={openManage} className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-fg">
            {content.header.manageShort}
          </button>
          <button type="button" onClick={toggleTheme} aria-label={content.header.theme}
            className="ml-1 rounded-md p-2 text-muted transition-colors hover:text-fg">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <button type="button" onClick={toggleTheme} aria-label={content.header.theme} className="rounded-md p-2 text-muted">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu-movil"
            aria-label={content.header.menu} className="rounded-md p-2">
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-movil" aria-label="Principal móvil" className="border-t border-line bg-bg md:hidden">
          <div className="wrap flex flex-col py-3">
            {content.nav.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={(e) => go(e, item.id)}
                className={`${linkClass(item.id, 'highlight' in item ? item.highlight : false)} py-3 text-base`}>
                {item.label}
              </a>
            ))}
            <button type="button" onClick={openManage} className="rounded-md px-3 py-3 text-left text-base text-muted">
              {content.footer.manageBooking}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
