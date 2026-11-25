/**
 * Formulário da ficha do trabalho académico (M6-01, RF-10.10). Server Component: as opções
 * vêm de lib/academic/brief e as classes de styles.ts (nunca de um ficheiro "use client", D-148).
 */
import { saveAcademicBrief } from "@/lib/admin/actions";
import { CITATION_STYLES, EDUCATION_LEVELS, WORK_TYPES, type AcademicBrief } from "@/lib/academic/brief";
import { longDate } from "@/lib/portal/format";
import { ActionForm, Field } from "./forms";
import { inputCls, textareaCls } from "./styles";

export function AcademicBriefForm({ projectId, brief, dueOn }: { projectId: string; brief: AcademicBrief | null; dueOn: string | null }) {
  return (
    <ActionForm action={saveAcademicBrief} submit={brief ? "Guardar ficha" : "Criar ficha"}>
      <input type="hidden" name="projeto" value={projectId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tema" className="sm:col-span-2">
          <input name="tema" required maxLength={300} defaultValue={brief?.topic} className={inputCls} placeholder="Ex.: O microcrédito e as zungueiras de Luanda" />
        </Field>
        <Field label="Tipo de trabalho">
          <select name="tipo" defaultValue={brief?.workType ?? "universitario"} className={inputCls}>
            {Object.entries(WORK_TYPES).map(([v, l]) => (
              <option key={v} value={v} className="bg-raised">{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Nível de ensino">
          <select name="nivel" defaultValue={brief?.educationLevel ?? "licenciatura"} className={inputCls}>
            {Object.entries(EDUCATION_LEVELS).map(([v, l]) => (
              <option key={v} value={v} className="bg-raised">{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Instituição (opcional)">
          <input name="instituicao" maxLength={200} defaultValue={brief?.institution ?? ""} className={inputCls} placeholder="Ex.: Universidade Agostinho Neto" />
        </Field>
        <Field label="Disciplina / curso (opcional)">
          <input name="disciplina" maxLength={200} defaultValue={brief?.discipline ?? ""} className={inputCls} placeholder="Ex.: Economia" />
        </Field>
        <Field label="Normas">
          <select name="normas" defaultValue={brief?.citationStyle ?? ""} className={inputCls}>
            <option value="" className="bg-raised">Por definir</option>
            {Object.entries(CITATION_STYLES).map(([v, l]) => (
              <option key={v} value={v} className="bg-raised">{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Nº de páginas (opcional)">
          <input name="paginas" type="number" min={1} max={2000} defaultValue={brief?.pagesTarget ?? ""} className={inputCls} placeholder="45" />
        </Field>
        <Field label="Indicações das normas (opcional)" hint="Ex.: margens, letra, citações exigidas pelo orientador." className="sm:col-span-2">
          <textarea name="notas_normas" rows={3} maxLength={1000} defaultValue={brief?.citationNotes ?? ""} className={textareaCls} />
        </Field>
        <Field label="Dias para ajustes depois da entrega" hint="RN-33: o cliente pede ajustes até este número de dias depois da entrega final.">
          <input name="dias_ajustes" type="number" min={0} max={60} defaultValue={brief?.adjustDays ?? 7} className={inputCls} />
        </Field>
        <Field label="Prazo de entrega" hint="Vem do orçamento aceite ou de “Dados do projeto”.">
          <p className={`${inputCls} flex items-center text-ink-dim`}>{dueOn ? longDate(dueOn) : "Por definir"}</p>
        </Field>
      </div>
      <label className="flex items-center gap-2.5 text-[13px] text-ink-dim">
        <input type="checkbox" name="capitulos" value="1" defaultChecked={brief?.usesChapters ?? true} className="h-4 w-4 rounded border-line accent-[#8863e6]" />
        O trabalho tem capítulos (sem capítulos, o progresso vem da fase — trabalhos curtos)
      </label>
    </ActionForm>
  );
}
