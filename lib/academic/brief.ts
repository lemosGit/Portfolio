/**
 * Ficha do trabalho académico (M6-01, RF-10.10, RF-10.11). Tipos, rótulos e leitura do formulário (puras).
 * Tabela academic_briefs (0009); o prazo de entrega é projects.due_on (D-044).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const WORK_TYPES = {
  escolar: "Trabalho escolar",
  universitario: "Trabalho universitário",
  relatorio: "Relatório",
  formatacao: "Formatação",
  revisao: "Revisão",
} as const;
export const EDUCATION_LEVELS = {
  ensino_medio: "Ensino médio",
  licenciatura: "Licenciatura",
  mestrado: "Mestrado",
  outro: "Outro",
} as const;
export const CITATION_STYLES = {
  APA: "APA",
  ABNT: "ABNT",
  "NP 405": "NP 405",
  instituicao: "Normas da instituição",
  outra: "Outra",
} as const;

export type WorkType = keyof typeof WORK_TYPES;
export type EducationLevel = keyof typeof EDUCATION_LEVELS;
export type CitationStyle = keyof typeof CITATION_STYLES;

export type AcademicBrief = {
  topic: string;
  workType: WorkType;
  educationLevel: EducationLevel;
  institution: string | null;
  discipline: string | null;
  citationStyle: CitationStyle | null;
  citationNotes: string | null;
  pagesTarget: number | null;
  usesChapters: boolean;
  adjustDays: number;
  /** Quando a entrega final foi disponibilizada (RF-10.64); começa os dias de ajustes. */
  deliveredAt: string | null;
};

export type BriefRow = {
  topic: string;
  work_type: WorkType;
  education_level: EducationLevel;
  institution: string | null;
  discipline: string | null;
  citation_style: CitationStyle | null;
  citation_notes: string | null;
  pages_target: number | null;
  uses_chapters: boolean;
  adjust_days: number;
  delivered_at?: string | null;
};

export const BRIEF_COLS =
  "topic, work_type, education_level, institution, discipline, citation_style, citation_notes, pages_target, uses_chapters, adjust_days, delivered_at";

export const mapBrief = (r: BriefRow): AcademicBrief => ({
  topic: r.topic,
  workType: r.work_type,
  educationLevel: r.education_level,
  institution: r.institution,
  discipline: r.discipline,
  citationStyle: r.citation_style,
  citationNotes: r.citation_notes,
  pagesTarget: r.pages_target,
  usesChapters: r.uses_chapters,
  adjustDays: r.adjust_days,
  deliveredAt: r.delivered_at ?? null,
});

const has = <T extends object>(o: T, k: string): k is Extract<keyof T, string> => Object.prototype.hasOwnProperty.call(o, k);

/** Formulário do admin → linha de academic_briefs (sem project_id), ou erro em português. */
export function readBrief(get: (k: string) => string): Omit<BriefRow, "delivered_at"> | { error: string } {
  const topic = get("tema");
  if (!topic) return { error: "Escreva o tema do trabalho." };
  if (topic.length > 300) return { error: "O tema tem no máximo 300 caracteres." };
  const workType = get("tipo");
  if (!has(WORK_TYPES, workType)) return { error: "Escolha o tipo de trabalho." };
  const level = get("nivel");
  if (!has(EDUCATION_LEVELS, level)) return { error: "Escolha o nível de ensino." };
  const style = get("normas");
  if (style && !has(CITATION_STYLES, style)) return { error: "Normas inválidas." };
  const institution = get("instituicao");
  const discipline = get("disciplina");
  if (institution.length > 200 || discipline.length > 200) return { error: "Instituição e disciplina têm no máximo 200 caracteres." };
  const notes = get("notas_normas");
  if (notes.length > 1000) return { error: "As indicações das normas têm no máximo 1000 caracteres." };
  const pagesRaw = get("paginas");
  let pages: number | null = null;
  if (pagesRaw) {
    pages = Number(pagesRaw);
    if (!Number.isInteger(pages) || pages < 1 || pages > 2000) return { error: "O nº de páginas vai de 1 a 2000." };
  }
  const adjustRaw = get("dias_ajustes") || "7";
  const adjust = Number(adjustRaw);
  if (!Number.isInteger(adjust) || adjust < 0 || adjust > 60) return { error: "Os dias de ajustes vão de 0 a 60." };
  return {
    topic,
    work_type: workType,
    education_level: level,
    institution: institution || null,
    discipline: discipline || null,
    citation_style: (style || null) as CitationStyle | null,
    citation_notes: notes || null,
    pages_target: pages,
    uses_chapters: get("capitulos") === "1",
    adjust_days: adjust,
  };
}

/** Ficha de um projeto (null se ainda não existe). Tolera a tabela em falta (migração por aplicar). */
export async function loadBrief(sb: SupabaseClient, projectId: string): Promise<AcademicBrief | null> {
  const { data, error } = await sb.from("academic_briefs").select(BRIEF_COLS).eq("project_id", projectId).maybeSingle<BriefRow>();
  if (error) {
    console.error(`[ficha] Falha a ler a ficha do projeto ${projectId}:`, error.message);
    return null;
  }
  return data ? mapBrief(data) : null;
}
