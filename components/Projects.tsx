"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects, requestMessageFor, services, whatsappWith, type ServiceId } from "@/lib/data";
import { cn } from "@/lib/utils";
import { WhatsappIcon } from "./Icons";
import { ProjectCard } from "./ProjectCard";
import { SectionHeader } from "./SectionHeader";

type Filter = "all" | ServiceId;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  ...services.map((s) => ({ id: s.id, label: s.short })),
];

const isFilter = (v: string | null): v is Filter => !!v && FILTERS.some((f) => f.id === v);

/** Portfólio filtrado por serviço (GeniusFrela_Projeto_e_Layouts §3, M6-08). `/?servico=academic#projetos` abre já filtrado. */
export function Projects() {
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("servico");
    if (isFilter(v)) setFilter(v);
  }, []);

  const shown = filter === "all" ? projects : projects.filter((p) => p.service === filter);
  const service = services.find((s) => s.id === filter);

  return (
    <section id="projetos" className="py-28 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          index="04"
          label="Portfólio"
          title={
            <>
              Engenharia aplicada a <span className="text-accent">desafios reais.</span>
            </>
          }
          aside="Cada projeto: o problema, a arquitetura, a stack e o que foi alcançado."
        />

        <div role="group" aria-label="Filtrar por serviço" className="mb-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                filter === f.id
                  ? "border-accent bg-accent/10 text-ink"
                  : "border-white/10 text-ink-dim hover:border-accent/50 hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {shown.length > 0 ? (
          <div className="space-y-6">
            {shown.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/15 px-6 py-12 text-center">
            <p className="text-lg font-light">Em breve, trabalhos {service?.id === "academic" ? "académicos" : "de design"}.</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-dim">
              Ainda não publicámos trabalhos deste serviço. Fale connosco para saber o que podemos fazer por si.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href={whatsappWith(requestMessageFor(filter))} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <WhatsappIcon className="h-4 w-4" /> Fale connosco
              </a>
              {service?.href && !service.href.startsWith("#") && (
                <Link href={service.href} className="btn-ghost">
                  Conhecer o serviço <ArrowRight size={14} aria-hidden />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
