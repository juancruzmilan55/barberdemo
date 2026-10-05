'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { content } from '@/lib/content';
import { ArrowUpIcon } from './icons';

export function BackToTop() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show || pathname.startsWith('/admin')) return null;
  return (
    <button type="button" aria-label={content.header.backToTop}
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        history.replaceState(null, '', window.location.pathname);
      }}
      className="fixed bottom-24 right-5 lg:bottom-5 z-40 rounded-full border border-line bg-surface p-3 text-goldtext shadow-lg transition-transform hover:-translate-y-0.5">
      <ArrowUpIcon />
    </button>
  );
}
