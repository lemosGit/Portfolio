"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { EASE } from "@/lib/utils";
import { projects, whatsappLink } from "@/lib/data";
import { Counter } from "./Counter";
import { WhatsappIcon } from "./Icons";
import { ProfilePhoto } from "./ProfilePhoto";

const lines: Array<Array<{ t: string; a?: boolean }>> = [
  [{ t: "Construo sistemas" }],
  [{ t: "que " }, { t: "transformam", a: true }],
  [{ t: "ideias", a: true }, { t: " em impacto." }],
];

export function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center pb-16 pt-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="eyebrow mb-7 flex items-center gap-3"
          >
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-accent shadow-[0_0_10px_#8b6cff]" />
            Disponível para novos desafios
          </motion.p>

          <h1 className="text-[clamp(2.6rem,6.4vw,5.2rem)] font-light leading-[1.03] tracking-tight">
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.35 + i * 0.14, ease: EASE }}
                >
                  {line.map((s, j) => (
                    <span key={j} className={s.a ? "text-accent" : undefined}>
                      {s.t}
                    </span>
                  ))}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
            className="mt-8 max-w-md text-[15px] leading-relaxed text-ink-dim"
          >
            Engenheiro de sistemas e programador focado em criar soluções digitais robustas,
            escaláveis e pensadas para o mundo real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pedir um projeto pelo WhatsApp (abre numa nova janela)"
              className="btn-primary"
            >
              <WhatsappIcon className="h-4 w-4" /> Pedir um projeto
            </a>
            <a href="#projetos" className="btn-ghost">
              Explorar projetos <ArrowRight size={14} />
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.35 }}
            className="mt-14 flex flex-wrap gap-x-10 gap-y-5"
          >
            {[
              { v: <Counter to={projects.length} />, l: "Projetos em destaque" },
              { v: "360°", l: "Visão de produto" },
              { v: "∞", l: "Aprendizagem contínua" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-3">
                <dd className="font-mono text-3xl font-light text-ink">{s.v}</dd>
                <dt className="max-w-[90px] font-mono text-[9px] uppercase leading-snug tracking-[0.18em] text-ink-faint">
                  {s.l}
                </dt>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
        >
          <ProfilePhoto />
        </motion.div>
      </div>

      <a
        href="#sobre"
        aria-label="Descer para a secção Sobre"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-ink-faint transition-colors hover:text-accent lg:flex"
      >
        Scroll to discover
        <ChevronDown size={14} className="animate-float" />
      </a>
    </section>
  );
}
