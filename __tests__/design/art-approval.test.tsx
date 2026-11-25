// @vitest-environment jsdom
/** M7-04: aprovar a arte para produção (TEL-34) — aviso, textos-chave do snapshot e "Confirmo" (RN-42, D-071). */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApprovalCard } from "@/app/cliente/_components/ApprovalCard";
import { respondToApproval } from "@/lib/approvals/actions";
import type { Approval } from "@/lib/approvals/model";

vi.mock("@/lib/approvals/actions", () => ({ respondToApproval: vi.fn() }));
vi.mock("@/lib/design/actions", () => ({ requestExtraRound: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const respond = vi.mocked(respondToApproval);

const proof: Approval = {
  id: "ap3", subject: "prova", versionLabel: "V3", status: "pendente", requestedAt: "2026-11-24T15:00:00+01:00", decidedAt: null,
  phase: { position: 4, name: "Revisões" }, responses: [],
  snapshot: {
    title: "Convite", key_texts: [{ label: "Noivos", value: "Ana & Paulo" }, { label: "Local", value: "Igreja da Sagrada Família" }],
    quantity: 120, width_cm: 14.8, height_cm: 21, event_date: "2026-12-19", has_print: true,
  },
};

beforeEach(() => respond.mockReset());
afterEach(cleanup);

describe("ApprovalCard — arte para produção", () => {
  it("o botão diz 'Aprovar arte para produção' e a confirmação repete o que fica fixo", async () => {
    render(<ApprovalCard a={proof} rounds={{ included: 2, used: 2, remaining: 0 }} art />);
    await userEvent.click(screen.getByRole("button", { name: "Aprovar arte para produção" }));
    const box = screen.getByRole("group", { name: "Aprovar para produção" });
    expect(within(box).getByText(/a peça vai para impressão e já não pode ser alterada/)).toBeTruthy();
    for (const t of ["Ana & Paulo", "Igreja da Sagrada Família", "120", "14,8 × 21 cm", "19 de dezembro de 2026", "V3"]) {
      expect(within(box).getByText(t)).toBeTruthy();
    }
  });

  it("'Aprovar para produção' só fica ativo com 'Confirmo' (D-071) e envia 'aprovar'", async () => {
    respond.mockResolvedValue({ ok: true, message: "Arte aprovada para produção. Obrigado!" });
    render(<ApprovalCard a={proof} art />);
    await userEvent.click(screen.getByRole("button", { name: "Aprovar arte para produção" }));
    const go = screen.getByRole("button", { name: "Aprovar para produção" }) as HTMLButtonElement;
    expect(go.disabled).toBe(true);
    await userEvent.click(screen.getByRole("checkbox", { name: /Confirmo que os nomes, a data e a quantidade estão certos/ }));
    expect(go.disabled).toBe(false);
    await userEvent.click(go);
    expect(respond).toHaveBeenCalledWith("ap3", "aprovar", "");
    expect((await screen.findByRole("status")).textContent).toContain("Arte aprovada para produção");
  });

  it("sem impressão, o aviso fala da arte final", async () => {
    render(<ApprovalCard a={{ ...proof, snapshot: { ...proof.snapshot, has_print: false } }} art />);
    await userEvent.click(screen.getByRole("button", { name: "Aprovar arte para produção" }));
    expect(screen.getByText(/esta é a arte final e já não pode ser alterada/)).toBeTruthy();
  });

  it("fora do Design (ex.: índice), aprova como antes", async () => {
    render(<ApprovalCard a={{ ...proof, subject: "indice" }} art />);
    await userEvent.click(screen.getByRole("button", { name: "Aprovar" }));
    expect(screen.getByRole("button", { name: "Confirmar aprovação" })).toBeTruthy();
  });
});
