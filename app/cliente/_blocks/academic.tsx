/**
 * Bloco "aca-brief" (layout-blocos §4, RF-10.11): a ficha do trabalho fica atrás de "Ver detalhes",
 * para a primeira vista ter pouco texto (RF-30.12). Sem ficha, não aparece.
 */
import { CITATION_STYLES, EDUCATION_LEVELS, WORK_TYPES } from "@/lib/academic/brief";
import { longDate } from "@/lib/portal/format";
import { Details } from "../_components/Details";
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
