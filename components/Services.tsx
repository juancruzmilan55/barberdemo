import { content } from '@/lib/content';
import { formatARS } from '@/lib/format';
import { Reveal } from './Reveal';
import { ReserveButton } from './ReserveButton';
import { SectionTitle } from './SectionTitle';

export interface ServiceItem { id: string; name: string; description: string; durationMin: number; priceARS: number }
export interface CategoryItem { id: string; name: string; services: ServiceItem[] }

export function Services({ categories }: { categories: CategoryItem[] }) {
  const t = content.sections.services;
  return (
    <section id="servicios" className="section">
      <div className="wrap">
        <Reveal>
          <SectionTitle eyebrow={t.eyebrow} start={t.titleStart} accent={t.titleAccent} />
          {categories.filter((c) => c.services.length > 0).map((cat) => (
            <div key={cat.id} className="mt-12">
              <h3 className="font-serif text-2xl">{cat.name}</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.services.map((s) => (
                  <article key={s.id} className="flex flex-col rounded-[10px] border border-line bg-surface p-5">
                    <h4 className="text-lg font-semibold">{s.name}</h4>
                    <p className="mt-1 flex-1 text-sm text-muted">{s.description}</p>
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-sm text-muted">{s.durationMin} min</span>
                      <span className="font-serif text-xl text-goldtext">{formatARS(s.priceARS)}</span>
                    </div>
                    <ReserveButton serviceId={s.id} label={content.booking.reserveCta} className="btn btn-secondary mt-4 !h-10 w-full" />
                  </article>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
