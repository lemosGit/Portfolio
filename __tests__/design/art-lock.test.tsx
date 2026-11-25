// @vitest-environment jsdom
/** M7-09: depois de aprovada a arte, já não há como aprovar nem pedir alterações (RN-41, RN-43). */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesignApprovals, DesignDecision } from "@/app/cliente/_blocks/design";
import { ApprovalCard } from "@/app/cliente/_components/ApprovalCard";
import { respondToApproval } from "@/lib/approvals/actions";
import type { Approval } from "@/lib/approvals/model";
import { toView } from "@/lib/portal/data";
import { projects } from "@/lib/portal/mock-data";
import type { Phase } from "@/lib/portal/types";

vi.mock("@/app/cliente/_components/ProofGallery", () => ({ ProofGallery: () => null }));
vi.mock("@/app/cliente/_components/DesignFinalFiles", () => ({ DesignFinalFiles: () => null }));
vi.mock("@/lib/approvals/actions", () => ({ respondToApproval: vi.fn() }));
vi.mock("@/lib/design/actions", () => ({ requestExtraRound: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const respond = vi.mocked(respondToApproval);

beforeEach(() => respond.mockReset());
afterEach(cleanup);

const base = projects.find((p) => p.id === "p_convite")!;
const proof = base.approvals!.find((a) => a.subject === "prova" && a.status === "pendente")!;

/** Arte V2 aprovada: as fases até à Aprovação final concluídas, a Produção por iniciar (restante por pagar). */
function approvedProject() {
  const i = base.phases.findIndex((p) => p.key === "producao");
  const phases: Phase[] = base.phases.map((p, j) => ({ ...p, state: j < i ? "concluida" : "por_iniciar", closed: j < i }));
  const approvals: Approval[] = base.approvals!.map((a) =>
    a.id === proof.id
      ? { ...a, status: "aprovada", decidedAt: "2026-11-25T09:00:00+01:00", responses: [{ kind: "aprovar", comment: null, actorRole: "client", createdAt: "2026-11-25T09:00:00+01:00" }] }
      : a,
  );
  return { ...toView({ ...base, phases, approvals }), rounds: { included: 2, used: 1, remaining: 1 } };
}

describe("Depois de aprovar a arte", () => {
  it("o cartão não volta a mostrar os botões enquanto a página se atualiza (sem 2.º clique)", async () => {
    respond.mockResolvedValue({ ok: true, message: "Arte aprovada para produção. Obrigado!" });
    render(<ApprovalCard a={proof} rounds={{ included: 2, used: 1, remaining: 1 }} art />);
    await userEvent.click(screen.getByRole("button", { name: "Aprovar arte para produção" }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Confirmo/ }));
    await userEvent.click(screen.getByRole("button", { name: "Aprovar para produção" }));
    expect((await screen.findByRole("status")).textContent).toContain("Arte aprovada para produção");
    for (const name of ["Aprovar arte para produção", "Pedir alterações", "Aprovar para produção"]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
    expect(respond).toHaveBeenCalledTimes(1);
  });

  it("se a aprovação falhar, a confirmação fica aberta para tentar outra vez", async () => {
    respond.mockResolvedValue({ ok: false, error: "Este pedido já foi respondido." });
    render(<ApprovalCard a={proof} art />);
    await userEvent.click(screen.getByRole("button", { name: "Aprovar arte para produção" }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Confirmo/ }));
    await userEvent.click(screen.getByRole("button", { name: "Aprovar para produção" }));
    expect((await screen.findByRole("alert")).textContent).toContain("já foi respondido");
    expect(screen.getByRole("group", { name: "Aprovar para produção" })).toBeTruthy();
  });

  it("a Visão geral deixa de pedir decisão sobre a arte e passa ao pagamento que trava a produção", () => {
    render(<DesignDecision project={approvedProject()} unread={0} />);
    expect(screen.queryByRole("button", { name: "Aprovar arte para produção" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Pedir alterações" })).toBeNull();
    expect(screen.queryByRole("region", { name: /versão está pronta/ })).toBeNull();
    expect(screen.getByText(/Pagar o restante, antes da produção: 60 000 Kz/)).toBeTruthy();
  });

  it("em Aprovações, a prova fica no histórico como aprovada, sem cartão", async () => {
    render(<DesignApprovals project={approvedProject()} unread={0} />);
    expect(screen.queryByRole("article")).toBeNull();
    await userEvent.click(screen.getByText("Ver histórico"));
    const item = screen.getByText("Convite V2").closest("li")!;
    expect(within(item).getByText(/Aprovada/)).toBeTruthy();
  });
});
