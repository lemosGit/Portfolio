import type { ProjectView } from "@/lib/portal/types";

/** O que cada bloco recebe. Os blocos não fazem consultas: os dados chegam já carregados (D-095). */
export type BlockProps = { project: ProjectView; unread: number };
