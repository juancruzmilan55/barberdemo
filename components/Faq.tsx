'use client';

import { useState } from 'react';
import { content } from '@/lib/content';
import { ChevronIcon } from './icons';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';

export function Faq() {
  const t = content.sections.faq;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="preguntas" className="section">
      <div className="wrap">
        <Reveal>
          <SectionTitle eyebrow={t.eyebrow} start={t.titleStart} accent={t.titleAccent} />
          <div className="mt-10 max-w-[760px] divide-y divide-line border-y border-line">
            {content.faq.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} id={`faq-btn-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium">
                      {item.q}
                      <span className={`shrink-0 text-goldtext transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronIcon />
                      </span>
                    </button>
                  </h3>
                  <div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} hidden={!isOpen}>
                    <p className="max-w-[62ch] pb-5 text-muted">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
