// @vitest-environment jsdom
/** M7-06: o cliente vê o orçamento do Design com o detalhe design + impressão (RF-20.21) e a regra do sinal. */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApprovalCard } from "@/app/cliente/_components/ApprovalCard";
import type { Approval } from "@/lib/approvals/model";

vi.mock("@/lib/approvals/actions", () => ({ respondToApproval: vi.fn() }));
vi.mock("@/lib/design/actions", () => ({ requestExtraRound: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const quote = (snap: Record<string, unknown>): Approval => ({
  id: "ap_orc", subject: "orcamento", versionLabel: "v1", status: "pendente", requestedAt: "2026-11-24T15:00:00+01:00", decidedAt: null,
  phase: { position: 2, name: "Orçamento e sinal" }, responses: [],
  snapshot: {
    total_kz: 120000, deposit_pct: 50, deposit_kz: 60000, remaining_kz: 60000, rounds_included: 2, delivery_due_on: "2026-12-15",
    deposit_rule: "O sinal não é devolvido se desistir depois de pagar, porque cobre o trabalho já começado.",
    ...snap,
  },
});

const value = (label: string) => screen.getByText(label, { selector: "dt" }).nextElementSibling?.textContent;

afterEach(cleanup);

describe("ApprovalCard — orçamento do Design", () => {
  it("mostra design, impressão, total, sinal, rondas e o botão Aceitar", () => {
    render(<ApprovalCard a={quote({ design_kz: 45000, print_kz: 75000 })} art />);
    expect(value("Design")).toBe("45 000 Kz");
    expect(value("Impressão")).toBe("75 000 Kz");
    expect(value("Total")).toBe("120 000 Kz");
    expect(value("Sinal (50%)")).toBe("60 000 Kz");
    expect(value("Rondas incluídas")).toBe("2");
    expect(screen.getByText(/O sinal não é devolvido/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Aceitar" })).toBeTruthy();
  });

  it("peça sem impressão: 'Sem impressão'", () => {
    render(<ApprovalCard a={quote({ total_kz: 40000, design_kz: 40000, print_kz: 0 })} art />);
    expect(value("Impressão")).toBe("Sem impressão");
  });

  it("orçamento sem a divisão (Académico): sem linhas Design e Impressão", () => {
    render(<ApprovalCard a={quote({})} />);
    expect(screen.queryByText("Design", { selector: "dt" })).toBeNull();
    expect(screen.queryByText("Impressão", { selector: "dt" })).toBeNull();
  });
});
