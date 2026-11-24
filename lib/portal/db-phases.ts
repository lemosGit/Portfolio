/**
 * Linhas de project_phases → Phase. Separado de phase-source.ts para os dados de exemplo
 * (mock-data.ts) o poderem usar sem import circular.
 */
import type { DbPhaseState, Phase } from "./types";

/** Linha de project_phases, tal como vem do Supabase. */
export type DbPhaseRow = {
  position: number;
  key: string;
  name: string;
  description: string;
  status: DbPhaseState;
  due_on: string | null;
  next_step: string | null;
  next_step_owner: "geniusfrela" | "cliente" | null;
  progress: number | null;
  client_can_upload: boolean;
};

export const DB_PHASE_COLS =
  "position, key, name, description, status, due_on, next_step, next_step_owner, progress, client_can_upload";

/** project_phases → Phase (ordenadas por position). Pura, para testar sem BD. */
export function mapDbPhases(rows: DbPhaseRow[]): Phase[] {
  return [...rows]
    .sort((a, b) => a.position - b.position)
    .map((r) => ({
      number: r.position,
      title: r.name,
      description: r.description,
      dueOn: r.due_on ?? undefined,
      closed: r.status === "concluida",
      tasks: [],
      key: r.key,
      state: r.status,
      nextStep: r.next_step ? { text: r.next_step, owner: r.next_step_owner } : undefined,
      progress: r.status === "concluida" ? 1 : r.progress != null ? r.progress / 100 : undefined,
      clientCanUpload: r.client_can_upload,
    }));
}

