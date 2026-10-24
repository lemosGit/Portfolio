import { Reveal } from "./Reveal";

type Props = {
  index: string;
  label: string;
  title: React.ReactNode;
  aside?: string;
};

export function SectionHeader({ index, label, title, aside }: Props) {
  return (
    <div className="mb-14 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
      <Reveal>
        <p className="eyebrow mb-5">
          <span className="mr-3 text-ink-faint">{index}</span>
          {label}
        </p>
        <h2 className="max-w-xl text-[clamp(2rem,4.6vw,3.4rem)] font-light leading-[1.08] tracking-tight">
          {title}
        </h2>
      </Reveal>
      {aside && (
        <Reveal delay={0.15} className="max-w-xs">
          <p className="text-sm leading-relaxed text-ink-dim">{aside}</p>
        </Reveal>
      )}
    </div>
  );
}
