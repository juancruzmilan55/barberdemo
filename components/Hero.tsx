import { asset } from '@/lib/demo/base';
import Image from 'next/image';
import { content } from '@/lib/content';
import { ClockIcon, PhoneIcon, PinIcon } from './icons';

export function Hero() {
  const { hero, brand } = content;
  const facts = [
    { icon: <ClockIcon />, text: hero.hours },
    { icon: <PinIcon />, text: brand.address },
    { icon: <PhoneIcon />, text: brand.phone },
  ];

  return (
    <section id="inicio" className="pb-16 pt-6 md:py-24">
      <div className="wrap grid items-center gap-8 md:grid-cols-[3fr_2fr] md:gap-12">
        <div>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            {hero.titleStart}
            <em className="accent">{hero.titleAccent}</em>
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-muted">{hero.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#reservar" className="btn btn-primary">{hero.primaryCta}</a>
            <a href="#servicios" className="btn btn-secondary">{hero.secondaryCta}</a>
          </div>
          <ul className="mt-10 space-y-3 text-sm text-muted">
            {facts.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <span className="text-goldtext">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-first aspect-[4/5] overflow-hidden rounded-[10px] border border-line md:order-last">
          <Image src={asset(hero.imageUrl)} alt="" fill priority unoptimized sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent md:from-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgb(229_184_77/0.28),transparent_60%)]" />
        </div>
      </div>
    </section>
  );
}
