import { asset } from '@/lib/demo/base';
import Image from 'next/image';
import { content } from '@/lib/content';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';

export interface Barber { id: string; name: string; bio: string; photoUrl: string }

export function Team({ barbers }: { barbers: Barber[] }) {
  const t = content.sections.team;
  return (
    <section id="barberos" className="section">
      <div className="wrap">
        <Reveal>
          <SectionTitle eyebrow={t.eyebrow} start={t.titleStart} accent={t.titleAccent} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-[720px]">
            {barbers.map((b, i) => (
              <article key={b.id} className="overflow-hidden rounded-[10px] border border-line bg-surface">
                <div className="relative aspect-[4/5]">
                  <Image src={asset(b.photoUrl || `/placeholders/barbero-${(i % 2) + 1}.svg`)} alt={`Foto de ${b.name}`} fill unoptimized
                    sizes="(min-width: 640px) 350px, 100vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl">{b.name}</h3>
                  <p className="mt-1 text-sm text-muted">{b.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
