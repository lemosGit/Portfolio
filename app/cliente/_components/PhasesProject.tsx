/**
 * Página "Projeto" dos serviços com fases na BD (Académico; Design até à M7) — TEL-11 do wireframe
 * (M6-07, D-155): as 7 fases na vertical, com a data em que se concluíram, a fase em curso em
 * destaque e, no Académico, os capítulos dentro da fase Desenvolvimento (só título e estado, D-015).
 */
import { Check } from "lucide-react";
import { CHAPTERS_PHASE_KEY } from "@/lib/academic/chapters";
import { shortDate } from "@/lib/portal/format";
import type { PhaseView, ProjectView } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { AcademicBrief } from "../_blocks/academic";
import { StateChip } from "../_blocks/common";

const CHAPTER_TEXT = { concluido: "Pronto", em_curso: "A escrever", por_iniciar: "Por começar" } as const;

function Marker({ ph }: { ph: PhaseView }) {
  if (ph.status === "done") {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ok" aria-hidden>
        <Check size={15} strokeWidth={3} className="text-[#0b0f17]" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "h-7 w-7 shrink-0 rounded-full border-2",
        ph.status === "current" && (ph.state === "aguarda_cliente" ? "border-action" : "border-accent"),
        ph.status === "pending" && "border-line",
        ph.status === "skipped" && "border-dashed border-ink-faint/50",
      )}
    />
  );
}

export function PhasesProject({ project }: { project: ProjectView }) {
  const academic = project.serviceType === "academic";
  const sections = academic && project.academicBrief?.usesChapters !== false ? (project.sections ?? []) : [];
  return (
    <div className="space-y-6">
      <section aria-labelledby="fases-lista" className="panel p-5 sm:p-7">
        <h2 id="fases-lista" className="font-display text-[22px] text-ink">
          {academic ? "O seu trabalho" : "O seu projeto"}
        </h2>
        <ol className="mt-5 divide-y divide-line">
          {project.phaseViews.map((ph) => {
            const waiting = ph.state === "aguarda_cliente";
            return (
              <li key={ph.number} className="py-3.5">
                <div className="flex items-center gap-3">
                  <Marker ph={ph} />
                  <span className={cn("min-w-0 flex-1 text-[15px]", ph.status === "pending" || ph.status === "skipped" ? "text-ink-dim" : "font-medium text-ink")}>
                    {ph.title}
                  </span>
                  {ph.status === "current" ? (
                    <StateChip tone={waiting ? "action" : "now"}>{waiting ? "Aguarda a sua resposta" : ph.late ? "Atrasada" : "Em curso"}</StateChip>
                  ) : ph.status === "done" && ph.completedAt ? (
                    <span className="text-xs text-ink-faint">{shortDate(ph.completedAt)}</span>
                  ) : ph.status === "skipped" ? (
                    <span className="text-xs text-ink-faint">Não se aplica</span>
                  ) : ph.key === "ajustes" && project.academicBrief ? (
                    <span className="text-xs text-ink-faint">{project.academicBrief.adjustDays} dias</span>
                  ) : null}
                </div>
                {ph.key === CHAPTERS_PHASE_KEY && ph.status === "current" && sections.length > 0 && (
                  <ol className="ml-10 mt-3 space-y-1.5" aria-label="Capítulos">
                    {sections.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 text-[13px]">
                        <span className={s.status === "concluido" ? "text-ink-dim" : "text-ink"}>{s.title}</span>
                        <span className={cn("shrink-0", s.status === "concluido" ? "text-ok" : s.status === "em_curso" ? "text-accent" : "text-ink-faint")}>
                          {CHAPTER_TEXT[s.status]}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      </section>
      {academic && <AcademicBrief project={project} unread={0} />}
    </div>
  );
}
