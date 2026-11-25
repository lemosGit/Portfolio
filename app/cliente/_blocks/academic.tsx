/**
 * Bloco "aca-brief" (layout-blocos §4, RF-10.11): a ficha do trabalho fica atrás de "Ver detalhes",
 * para a primeira vista ter pouco texto (RF-30.12). Sem ficha, não aparece.
 */
import { CITATION_STYLES, EDUCATION_LEVELS, WORK_TYPES } from "@/lib/academic/brief";
import { SECTION_LABEL, chapterProgress } from "@/lib/academic/chapters";
import { countdown } from "@/lib/academic/countdown";
import { nowMs } from "@/lib/clock";
import { longDate } from "@/lib/portal/format";
import { Details } from "../_components/Details";
import { StateChip } from "./common";
import type { BlockProps } from "./types";

export function AcademicBrief({ project }: BlockProps) {
  const b = project.academicBrief;
  if (!b) return null;
  const rows: [string, string | null][] = [
    ["Tema", b.topic],
    ["Tipo", WORK_TYPES[b.workType]],
    ["Nível", EDUCATION_LEVELS[b.educationLevel]],
    ["Instituição", b.institution],
    ["Disciplina", b.discipline],
    ["Normas", b.citationStyle ? CITATION_STYLES[b.citationStyle] : null],
    ["Indicações", b.citationNotes],
    ["Páginas", b.pagesTarget ? `${b.pagesTarget}` : null],
    ["Prazo de entrega", project.dueOn ? longDate(project.dueOn) : null],
    ["Ajustes", `${b.adjustDays} dia${b.adjustDays === 1 ? "" : "s"} depois da entrega`],
  ];
  return (
    <section aria-labelledby="ficha-title" className="panel p-6 sm:p-7">
      <h2 id="ficha-title" className="text-base font-medium text-ink">
        Ficha do trabalho
      </h2>
      <Details className="mt-2">
        <dl className="grid gap-x-6 gap-y-2.5 text-[14px] sm:grid-cols-[160px_1fr]">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
        </dl>
      </Details>
    </section>
  );
}

/**
 * Bloco "aca-countdown" (M6-02, RF-10.80…82): o prazo é o elemento principal da primeira vista
 * (wireframe Académico, D-107): número grande na cor do módulo; "Prazo próximo" a ≤ 3 dias e
 * "Atrasada" depois do prazo, nunca no coral "Ação sua" (D-088). Fuso Africa/Luanda.
 */
export function AcademicCountdown({ project }: BlockProps) {
  if (!project.dueOn || project.dueOnSet === false) {
    return (
      <section aria-labelledby="prazo-title" className="panel p-6 sm:p-7">
        <h2 id="prazo-title" className="text-base font-medium text-ink">
          Prazo por definir
        </h2>
        <p className="mt-2 text-[14px] text-ink-dim">A data de entrega fica marcada quando aceitar o orçamento.</p>
      </section>
    );
  }
  const c = countdown(project.dueOn, project.adjustedDueOn, nowMs());
  return (
    <section aria-labelledby="prazo-title" className="panel p-6 sm:p-7">
      <h2 id="prazo-title" className="sr-only">
        Prazo de entrega
      </h2>
      <p className="flex flex-wrap items-baseline gap-x-3">
        <b className="font-display text-[96px] font-semibold leading-none tracking-[-0.04em] text-accent sm:text-[120px]">{c.value}</b>
        <span className="text-lg text-ink-dim">{c.unit}</span>
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[15px] text-ink-dim">
        <span>
          {c.mode === "late" ? "O prazo era" : "até"} <b className="font-semibold text-ink">{longDate(c.due)}</b>
        </span>
        {c.label && <StateChip tone="now">{c.label}</StateChip>}
      </p>
      {c.extraDays > 0 && (
        <p className="mt-2 text-[13px] text-ink-faint">
          Prazo ajustado: mais {c.extraDays} dia{c.extraDays === 1 ? "" : "s"} pelo tempo em que esperámos pela sua resposta.
        </p>
      )}
      {c.mode === "late" && <p className="mt-2 text-[13px] text-ink-faint">O João indica a nova data no próximo passo.</p>}
    </section>
  );
}

/**
 * Bloco "aca-chapters" (M6-03, RF-10.41, RF-10.42): "X de Y capítulos" e o estado de cada um.
 * Só o título e o estado, nunca o texto (D-015). Sem capítulos (trabalho curto) ou sem índice, não aparece:
 * o progresso é o da fase (RF-10.43).
 */
export function AcademicChapters({ project }: BlockProps) {
  const list = project.sections ?? [];
  if (list.length === 0 || project.academicBrief?.usesChapters === false) return null;
  const { done, total, ratio } = chapterProgress(list);
  return (
    <section aria-labelledby="capitulos-title" className="panel p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="capitulos-title" className="text-base font-medium text-ink">
          Capítulos
        </h2>
        <p className="text-[14px] text-ink-dim">
          <b className="font-semibold text-ink">{done} de {total}</b> concluídos
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <i className="block h-full rounded-full bg-accent" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <Details label="Ver capítulos" className="mt-3">
        <ol className="divide-y divide-line border-t border-line">
          {list.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
              <span className={s.status === "concluido" ? "text-ink-dim" : "text-ink"}>{s.title}</span>
              <StateChip tone={s.status === "concluido" ? "done" : s.status === "em_curso" ? "now" : "planned"}>{SECTION_LABEL[s.status]}</StateChip>
            </li>
          ))}
        </ol>
      </Details>
    </section>
  );
}
