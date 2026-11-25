// @vitest-environment jsdom
/** M7-07: painel de decisão do Design (wireframe TEL-30) e Aprovações sem a prova repetida. */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignApprovals, DesignDecision } from "@/app/cliente/_blocks/design";
import { toView } from "@/lib/portal/data";
import { projects } from "@/lib/portal/mock-data";
import type { Phase } from "@/lib/portal/types";

vi.mock("@/app/cliente/_components/ProofGallery", () => ({ ProofGallery: () => null }));
vi.mock("@/app/cliente/_components/DesignFinalFiles", () => ({ DesignFinalFiles: () => null }));
vi.mock("@/lib/approvals/actions", () => ({ respondToApproval: vi.fn() }));
vi.mock("@/lib/design/actions", () => ({ requestExtraRound: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const base = projects.find((p) => p.id === "p_convite")!;
const rounds = { included: 2, used: 1, remaining: 1 };
const view = (over: Partial<typeof base> = {}) => ({ ...toView({ ...base, ...over }), rounds });

afterEach(cleanup);

describe("DesignDecision", () => {
  it("com uma prova à espera: estado, ronda, título, botões, revisões que restam e levantamento previsto", () => {
    render(<DesignDecision project={view()} unread={0} />);
    const panel = screen.getByRole("region", { name: "A segunda versão está pronta" });
    for (const t of ["Aguarda a sua resposta", "Ronda 1 de 2", "Ainda pode pedir 1 revisão incluída no preço.", "Levantamento previsto"]) {
      expect(within(panel).getByText(t)).toBeTruthy();
    }
    expect(within(panel).getByRole("button", { name: "Aprovar arte para produção" })).toBeTruthy();
    expect(within(panel).getByRole("button", { name: "Pedir alterações" })).toBeTruthy();
    expect(within(panel).getByText(/Loja GeniusFrela, Talatona/)).toBeTruthy();
    // o cartão vai "bare": sem o título "Convite V2" nem a lista de ficheiros repetidos
    expect(within(panel).queryByText("Convite V2")).toBeNull();
    expect(within(panel).queryByText(/Ficheiros:/)).toBeNull();
  });

  it("sem prova à espera: o próximo passo de sempre", () => {
    const approvals = base.approvals!.map((a) => (a.status === "pendente" ? { ...a, status: "aprovada" as const } : a));
    render(<DesignDecision project={view({ approvals })} unread={0} />);
    expect(screen.queryByRole("region", { name: /versão está pronta/ })).toBeNull();
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Revisões");
  });

  it("em produção, o levantamento previsto sai do painel (o bloco des-pickup trata dele)", () => {
    const i = base.phases.findIndex((p) => p.key === "producao");
    const phases: Phase[] = base.phases.map((p, j) => ({ ...p, state: j < i ? "concluida" : j === i ? "em_curso" : "por_iniciar", closed: j < i }));
    render(<DesignDecision project={view({ phases, designSpec: { ...base.designSpec!, productionStatus: "a_imprimir" } })} unread={0} />);
    expect(screen.queryByText("Levantamento previsto")).toBeNull();
  });
});

describe("DesignApprovals", () => {
  it("a prova à espera não se repete; fica o histórico", () => {
    render(<DesignApprovals project={view()} unread={0} />);
    expect(screen.queryByRole("article")).toBeNull();
    expect(screen.queryByText("Não há nada à espera da sua aprovação.")).toBeNull();
    expect(screen.getByText("Ver histórico")).toBeTruthy();
  });
});

describe("DesignDecision — contador de rondas e ronda extra (M7-09, RN-35, RN-36)", () => {
  const withRounds = (r: { included: number; used: number; remaining: number }) => ({ ...toView(base), rounds: r });

  it("antes do primeiro pedido: '2 rondas incluídas' e as 2 ainda no preço", () => {
    render(<DesignDecision project={withRounds({ included: 2, used: 0, remaining: 2 })} unread={0} />);
    expect(screen.getByText("2 rondas incluídas")).toBeTruthy();
    expect(screen.getByText("Ainda pode pedir 2 revisões incluídas no preço.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pedir alterações" })).toBeTruthy();
  });

  it("rondas esgotadas: 'Ronda 2 de 2', aviso do extra e 'Pedir revisão extra' em vez de 'Pedir alterações'", () => {
    render(<DesignDecision project={withRounds({ included: 2, used: 2, remaining: 0 })} unread={0} />);
    expect(screen.getByText("Ronda 2 de 2")).toBeTruthy();
    expect(screen.getByText("Já usou as revisões incluídas: uma nova revisão é um extra.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pedir revisão extra" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Pedir alterações" })).toBeNull();
  });

  it("com um extra aceite, há mais uma ronda: 'Ronda 2 de 3' e volta 'Pedir alterações'", () => {
    render(<DesignDecision project={withRounds({ included: 3, used: 2, remaining: 1 })} unread={0} />);
    expect(screen.getByText("Ronda 2 de 3")).toBeTruthy();
    expect(screen.getByText("Ainda pode pedir 1 revisão incluída no preço.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pedir alterações" })).toBeTruthy();
  });

  it("sem rondas no orçamento: o aviso diz que qualquer revisão é extra", () => {
    render(<DesignDecision project={withRounds({ included: 0, used: 0, remaining: 0 })} unread={0} />);
    expect(screen.getByText("Sem rondas incluídas")).toBeTruthy();
    expect(screen.getByText("Este orçamento não inclui revisões: uma revisão é um extra.")).toBeTruthy();
  });
});
