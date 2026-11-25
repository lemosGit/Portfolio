import { Braces, Gauge, Server } from "lucide-react";
import { skillGroups, techTicker } from "@/lib/data";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { SpotCard } from "./SpotCard";

const icons = { server: Server, braces: Braces, gauge: Gauge } as const;

export function Skills() {
  const loop = [...techTicker, ...techTicker];

  return (
    <section id="competencias" className="py-28 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          index="03"
          label="Competências"
          title={
            <>
              Capacidade técnica, <span className="text-accent">visão integrada.</span>
            </>
          }
          aside="Um conjunto de competências orientado para todo o ciclo de vida de sistemas digitais."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {skillGroups.map((g, i) => {
            const Icon = icons[g.icon];
            return (
              <Reveal key={g.title} delay={i * 0.1}>
                <SpotCard className="h-full p-7">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] text-ink-faint">{g.index}</span>
                    <Icon size={20} className="text-accent" aria-hidden />
                  </div>
                  <h3 className="mb-6 mt-14 text-lg font-normal">{g.title}</h3>
                  <ul className="space-y-3 text-[13px] text-ink-dim">
                    {g.items.map((it) => (
                      <li key={it} className="flex gap-3">
                        <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-accent/50" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </SpotCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2} className="mt-16">
          <div
            aria-label="Tecnologias"
            className="group relative overflow-hidden border-y border-white/5 py-5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
          >
            <ul className="flex w-max animate-marquee gap-12 group-hover:[animation-play-state:paused]">
              {loop.map((t, i) => (
                <li
                  key={i}
                  aria-hidden={i >= techTicker.length}
                  className="font-mono text-xs uppercase tracking-[0.25em] text-ink-faint"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
