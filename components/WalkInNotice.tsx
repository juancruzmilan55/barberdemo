import { content } from '@/lib/content';
import { capitalize, joinDays } from '@/lib/format';

export function WalkInNotice({ days }: { days: number[] }) {
  if (days.length === 0) return null;
  const list = joinDays(days);
  return (
    <div className="wrap pb-16 md:pb-24">
      <div className="rounded-[10px] border border-line bg-surface p-6 md:p-8">
        <p className="eyebrow">{content.walkIn.eyebrow}</p>
        <h2 className="mt-3 font-serif text-2xl md:text-3xl">{content.walkIn.title.replace('{Days}', capitalize(list))}</h2>
        <p className="mt-3 max-w-[60ch] text-muted">{content.walkIn.text.replace('{days}', list)}</p>
      </div>
    </div>
  );
}
