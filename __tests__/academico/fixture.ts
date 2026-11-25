/** Projeto Académico de exemplo (p_mono, mock-data) já como ProjectView, com alterações por teste. */
import { applyChapterProgress } from "@/lib/academic/chapters";
import { toView } from "@/lib/portal/data";
import { projects } from "@/lib/portal/mock-data";
import type { AcademicBrief } from "@/lib/academic/brief";
import type { Project, ProjectView } from "@/lib/portal/types";

const base = projects.find((p) => p.id === "p_mono")!;

/** Como o repositório (supabase-repo.ts): o % da fase Desenvolvimento vem dos capítulos. */
export function academicView(over: Partial<Project> = {}, brief: Partial<AcademicBrief> = {}): ProjectView {
  const p: Project = { ...base, ...over, academicBrief: { ...base.academicBrief!, ...brief } };
  return toView({ ...p, phases: applyChapterProgress(p.phases, p.sections ?? [], p.academicBrief!.usesChapters) });
}

/** Fixa o relógio do portal (lib/clock.ts) num instante de Luanda. */
export const LUANDA = (local: string) => `${local}+01:00`;
