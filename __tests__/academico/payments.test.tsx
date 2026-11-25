// @vitest-environment jsdom
/** M6-99: pagamentos compactos — o total em falta não se confunde com o próximo pagamento. */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PaymentsCompact } from "@/app/cliente/_blocks/payments";
import type { Payment } from "@/lib/payments/model";
import { academicView } from "./fixture";

vi.mock("@/lib/academic/actions", () => ({ requestAdjustment: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const pay = (kind: Payment["kind"], description: string, status: Payment["status"]): Payment => ({
  id: kind, kind, description, amountKz: 30000, dueOn: null, status, paidOn: null, extraRounds: 0, gatesPhase: null, createdAt: "2026-11-25T10:00:00+01:00",
});
const show = (payments: Payment[]) => render(<PaymentsCompact project={academicView({ payments })} unread={0} />);
const line = () => screen.getByRole("region", { name: "Pagamentos" }).querySelector("p")!.textContent;

afterEach(cleanup);

describe("PaymentsCompact", () => {
  it("sinal e restante por pagar: total e o próximo com o seu valor", () => {
    show([pay("sinal", "Sinal (50%)", "pendente"), pay("restante", "Restante, antes da entrega", "pendente")]);
    expect(line()).toMatch(/^Falta 60\s000 Kz no total\. Próximo: sinal \(50%\), 30\s000 Kz\.$/);
  });

  it("só o restante por pagar: uma linha, com a etiqueta do sinal pago", () => {
    show([pay("sinal", "Sinal (50%)", "pago"), pay("restante", "Restante, antes da entrega", "pendente")]);
    expect(line()).toMatch(/^Falta 30\s000 Kz, restante, antes da entrega\.$/);
    expect(screen.getByText("Sinal pago")).toBeTruthy();
  });

  it("tudo pago", () => {
    show([pay("sinal", "Sinal (50%)", "pago"), pay("restante", "Restante, antes da entrega", "pago")]);
    expect(line()).toBe("Não há nada por pagar.");
    expect(screen.getByText("Tudo pago")).toBeTruthy();
  });
});
