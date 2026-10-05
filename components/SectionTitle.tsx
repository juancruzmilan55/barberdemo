export function SectionTitle({ eyebrow, start, accent }: { eyebrow: string; start: string; accent: string }) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
        {start}
        <em className="accent">{accent}</em>
      </h2>
    </div>
  );
}
