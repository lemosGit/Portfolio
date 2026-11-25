/**
 * Índice e capítulos do trabalho académico (M6-03, RF-10.40…43). Tipos e funções puras + leitura.
 * O cliente vê só o título e o estado (D-015). O progresso "X de Y" calcula-se na leitura (fichas-servico §3.2).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Phase } from "@/lib/portal/types";

export type SectionStatus = "por_iniciar" | "em_curso" | "concluido";
export type Section = { id: string; position: number; title: string; status: SectionStatus };

export const SECTION_LABEL: Record<SectionStatus, string> = {
  por_iniciar: "Por iniciar",
  em_curso: "Em curso",
  concluido: "Concluído",
};

/** Fase cujo progresso vem dos capítulos (RF-10.41). */
export const CHAPTERS_PHASE_KEY = "desenvolvimento";

export function chapterProgress(list: Pick<Section, "status">[]) {
  const total = list.length;
  const done = list.filter((s) => s.status === "concluido").length;
  return { done, total, ratio: total ? done / total : 0 };
}

/**
 * % da fase Desenvolvimento pelos capítulos, quando o trabalho tem capítulos e já há índice.
 * Sem capítulos (PER-05, D-014) ou sem índice, fica o progresso da fase definido pelo admin (RF-10.43).
 * Uma fase concluída fica a 100%.
 */
export function applyChapterProgress<P extends Pick<Phase, "key" | "progress" | "state">>(
  phases: P[],
  sections: Pick<Section, "status">[],
  usesChapters: boolean,
): P[] {
  if (!usesChapters || sections.length === 0) return phases;
  const { ratio } = chapterProgress(sections);
  return phases.map((ph) => (ph.key === CHAPTERS_PHASE_KEY && ph.state !== "concluida" ? { ...ph, progress: ratio } : ph));
}

/** Itens do índice aprovado (snapshot da aprovação) → títulos dos capítulos, sem linhas vazias nem repetidas. */
export function titlesFromIndex(items: string[]): string[] {
  const seen = new Set<string>();
  return items
    .map((t) => t.trim().slice(0, 200))
    .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
    .slice(0, 200);
}

export async function loadSections(sb: SupabaseClient, projectId: string): Promise<Section[]> {
  const { data, error } = await sb
    .from("academic_sections")
    .select("id, position, title, status")
    .eq("project_id", projectId)
    .order("position")
    .returns<Section[]>();
  if (error) {
    console.error(`[capítulos] Falha a ler os capítulos do projeto ${projectId}:`, error.message);
    return [];
  }
  return data ?? [];
}
