/**
 * Fonte das fases de um projeto (ADR-001).
 * - github:   Desenvolvimento — milestones e issues do GitHub (comportamento de sempre).
 * - database: Académico e Design — project_phases no Supabase, lidas com a sessão de quem
 *             pede (RLS: o cliente só vê as do seu projeto).
 * A escolha é feita só aqui, pelo service_type. Nenhuma página escolhe a fonte.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { now } from "@/lib/clock";
import { syncPhases } from "./data";
import { DB_PHASE_COLS, mapDbPhases, type DbPhaseRow } from "./db-phases";
import type { Project, ServiceType } from "./types";

export { DB_PHASE_COLS, mapDbPhases, type DbPhaseRow };

export type PhaseSourceKind = "github" | "database";
export type PhaseLoad = Pick<Project, "phases" | "source" | "syncedAt">;

/** O mínimo do projeto que as fontes precisam. */
export type PhaseSourceInput = {
  id: string;
  serviceType: ServiceType;
  githubOwner?: string | null;
  githubRepo?: string | null;
  phaseMap?: Record<string, number> | null;
};

export interface PhaseSource {
  kind: PhaseSourceKind;
  load(project: PhaseSourceInput, sb?: SupabaseClient): Promise<PhaseLoad>;
}

export const githubSource: PhaseSource = {
  kind: "github",
  load: (p) => syncPhases(p.githubOwner, p.githubRepo, p.phaseMap ?? null),
};

export const databaseSource: PhaseSource = {
  kind: "database",
  async load(p, sb) {
    const syncedAt = now().toISOString();
    if (!sb) return { phases: [], source: "erro", syncedAt };
    const { data, error } = await sb
      .from("project_phases")
      .select(DB_PHASE_COLS)
      .eq("project_id", p.id)
      .order("position")
      .returns<DbPhaseRow[]>();
    if (error) {
      console.error(`[portal] Falha a ler as fases do projeto ${p.id}:`, error.message);
      return { phases: [], source: "erro", syncedAt };
    }
    return { phases: mapDbPhases(data ?? []), source: "bd", syncedAt };
  },
};

export const sourceFor = (serviceType: ServiceType | null | undefined): PhaseSource =>
  (serviceType ?? "development") === "development" ? githubSource : databaseSource;

/** Atalho: carrega as fases do projeto pela fonte certa. */
export const loadPhases = (p: PhaseSourceInput, sb?: SupabaseClient) => sourceFor(p.serviceType).load(p, sb);
