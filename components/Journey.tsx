"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { journey } from "@/lib/data";
import { EASE } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Journey() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 26 });

  return (
    <section id="percurso" className="py-28 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <p className="eyebrow mb-5">
            <span className="mr-3 text-ink-faint">04</span>Percurso
          </p>
          <h2 className="text-[clamp(2rem,4.6vw,3.4rem)] font-light leading-[1.08] tracking-tight">
            Conhecimento que se constrói <span className="text-accent">em movimento.</span>
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-dim">
            Formação académica e aprendizagem prática unidas pela curiosidade e disciplina.
          </p>
        </Reveal>

        <ol ref={ref} className="relative pl-8">
          <span aria-hidden className="absolute bottom-1 left-[5px] top-1 w-px bg-white/10" />
          <motion.span
            aria-hidden
            style={{ scaleY }}
            className="absolute bottom-1 left-[5px] top-1 w-px origin-top bg-gradient-to-b from-accent to-accent-deep shadow-[0_0_10px_#4db8ff]"
          />
          {journey.map((j, i) => {
            const last = i === journey.length - 1;
            return (
              <motion.li
                key={j.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
                className="relative pb-12 last:pb-0"
              >
                <span
                  aria-hidden
                  className={`absolute -left-8 top-1.5 h-[11px] w-[11px] border ${
                    last
                      ? "animate-pulse-glow border-accent bg-accent shadow-[0_0_14px_#4db8ff]"
                      : "border-accent/50 bg-bg"
                  }`}
                />
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint">{j.label}</p>
                <h3 className="mt-2 text-lg font-normal">{j.title}</h3>
                <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-dim">{j.detail}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
