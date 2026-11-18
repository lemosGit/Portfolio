/**
 * As seis fases da metodologia GeniusFrela e a forma como os milestones do roteiro
 * de engenharia (M0–M11) se agrupam nelas. Ver docs/especificacao_portal_cliente.md §4.
 */

export type PhaseDef = { number: number; title: string; description: string };

export const PHASES: PhaseDef[] = [
  { number: 1, title: "Descoberta & Requisitos", description: "Requisitos, personas, âmbito e arquitetura acordados." },
  { number: 2, title: "Design (UI/UX)", description: "Fluxo de telas, protótipo e sistema visual." },
  { number: 3, title: "Desenvolvimento", description: "Construção da aplicação web, da API e da app." },
  { number: 4, title: "Testes & Validação", description: "Testes de ponta a ponta, correções e homologação." },
  { number: 5, title: "Entrega & Publicação", description: "Produção, lojas de apps e manuais." },
  { number: 6, title: "Suporte & Manutenção", description: "Correções e melhorias depois da entrega." },
];

/** Milestone `Mx` → fase (1–6). Um projeto pode substituir este mapa com `projects.phase_map`. */
export const DEFAULT_PHASE_MAP: Record<string, number> = {
  M0: 1, M1: 1, M2: 1, M3: 1,
  M4: 2,
  M5: 3, M6: 3, M7: 3, M8: 3,
  M9: 4,
  M10: 5,
  M11: 6,
};

/** "M7 — Frontend-1: Telas primordiais" → "M7"; sem prefixo → undefined. */
export function milestoneCode(title: string): string | undefined {
  return /^\s*(M\d{1,2})\b/i.exec(title)?.[1].toUpperCase();
}
