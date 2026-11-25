// @vitest-environment jsdom
/** M7-03: cartão da prova com rondas — "Ronda X de Y", aviso da última ronda e revisão extra (TEL-33). */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApprovalCard } from "@/app/cliente/_components/ApprovalCard";
import type { Approval } from "@/lib/approvals/model";
import { requestExtraRound } from "@/lib/design/actions";

vi.mock("@/lib/approvals/actions", () => ({ respondToApproval: vi.fn() }));
vi.mock("@/lib/design/actions", () => ({ requestExtraRound: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const extra = vi.mocked(requestExtraRound);

const proof: Approval = {
  id: "ap2", subject: "prova", versionLabel: "V2", snapshot: { title: "Convite", files: ["convite-v2-frente.jpg"] }, status: "pendente",
  requestedAt: "2026-11-24T15:00:00+01:00", decidedAt: null, phase: { position: 4, name: "Revisões" }, responses: [],
};

beforeEach(() => extra.mockReset());
afterEach(cleanup);

describe("ApprovalCard com rondas", () => {
  it("mostra a ronda e avisa que o próximo pedido é o último incluído", async () => {
    render(<ApprovalCard a={proof} rounds={{ included: 2, used: 1, remaining: 1 }} />);
    expect(screen.getByText("Ronda 1 de 2")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Pedir alterações" }));
    expect(screen.getByText(/Esta é a ronda 2 de 2 incluídas/)).toBeTruthy();
  });

  it("sem rondas: 'Pedir revisão extra' em vez de 'Pedir alterações', e envia o pedido ao João", async () => {
    extra.mockResolvedValue({ ok: true, message: "Pedido enviado." });
    render(<ApprovalCard a={proof} rounds={{ included: 2, used: 2, remaining: 0 }} />);
    expect(screen.queryByRole("button", { name: "Pedir alterações" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Pedir revisão extra" }));
    expect(screen.getByText("Já usou as 2 revisões incluídas")).toBeTruthy();
    await userEvent.type(screen.getByRole("textbox"), "A data é domingo");
    await userEvent.click(screen.getAllByRole("button", { name: "Pedir revisão extra" }).at(-1)!);
    expect(extra).toHaveBeenCalledWith("V2", "A data é domingo");
    expect((await screen.findByRole("status")).textContent).toContain("Pedido enviado.");
  });

  it("'Voltar e aprovar' leva à confirmação da aprovação", async () => {
    render(<ApprovalCard a={proof} rounds={{ included: 2, used: 2, remaining: 0 }} />);
    await userEvent.click(screen.getByRole("button", { name: "Pedir revisão extra" }));
    await userEvent.click(screen.getByRole("button", { name: "Voltar e aprovar" }));
    expect(screen.getByRole("button", { name: "Confirmar aprovação" })).toBeTruthy();
  });

  it("noutros pedidos (ex.: índice) não há rondas", () => {
    render(<ApprovalCard a={{ ...proof, subject: "indice" }} rounds={{ included: 2, used: 1, remaining: 1 }} />);
    expect(screen.queryByText("Ronda 1 de 2")).toBeNull();
  });
});
