"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import type { Project } from "@/lib/data";
import { EASE } from "@/lib/utils";
import { SpotCard } from "./SpotCard";

/** Placeholder geométrico até existir uma captura real em /public/projects. */
function Placeholder({ id }: { id: string }) {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(43,127,255,0.14),transparent_70%)]">
      <svg viewBox="0 0 200 200" aria-hidden className="h-[78%] w-[78%] animate-spin-slower">
        {[84, 62, 40, 20].map((s, i) => (
          <rect
            key={s}
            x={100 - s / 2}
            y={100 - s / 2}
            width={s}
            height={s}
            transform={`rotate(45 100 100)`}
            fill={i === 3 ? "rgba(77,184,255,0.25)" : "none"}
            stroke="#4db8ff"
            strokeOpacity={0.55 - i * 0.08}
            strokeWidth="0.8"
          />
        ))}
      </svg>
      <p className="absolute inset-x-3 bottom-3 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-ink-faint">
        Captura real · public/projects/{id}.png
      </p>
    </div>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [failed, setFailed] = useState(!project.screenshot);

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <SpotCard className="p-5 md:p-7">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
          <div className="relative aspect-[16/11] overflow-hidden border border-white/10 bg-surface/60 md:aspect-auto md:min-h-[300px]">
            <div className="absolute inset-x-0 top-0 z-10 flex h-6 items-center gap-1.5 border-b border-white/5 bg-bg/60 px-3">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 rounded-full bg-white/15" />
              ))}
            </div>
            <div className="absolute inset-0 pt-6">
              {failed ? (
                <Placeholder id={project.id} />
              ) : (
                <Image
                  src={project.screenshot!}
                  alt={`Captura da aplicação ${project.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-top"
                  onError={() => setFailed(true)}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <p className="eyebrow">{project.kind}</p>
              <span className="font-mono text-[10px] text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-light tracking-tight md:text-[1.75rem]">
              {project.title}
            </h3>

            <div className="mt-5 border-l border-accent/40 pl-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint">Desafio</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{project.problem}</p>
            </div>

            <div className="mt-6">
              <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint">
                Arquitetura
              </p>
              <ol className="flex flex-wrap items-center gap-y-2">
                {project.architecture.map((node, i) => (
                  <motion.li
                    key={node}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease: EASE }}
                    className="flex items-center"
                  >
                    <span className="border border-accent/25 bg-accent/[0.05] px-2.5 py-1 font-mono text-[10px] text-ink">
                      {node}
                    </span>
                    {i < project.architecture.length - 1 && (
                      <span aria-hidden className="mx-1.5 text-accent/60">
                        →
                      </span>
                    )}
                  </motion.li>
                ))}
              </ol>
            </div>

            <ul className="mt-6 space-y-2.5">
              {project.results.map((r) => (
                <li key={r} className="flex gap-3 text-[13px] leading-relaxed text-ink-dim">
                  <Check size={14} aria-hidden className="mt-[3px] shrink-0 text-accent" />
                  {r}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-1">
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent hover:underline"
                >
                  Ver projeto <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </SpotCard>
    </motion.article>
  );
}
