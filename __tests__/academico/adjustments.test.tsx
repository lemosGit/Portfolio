// @vitest-environment jsdom
/**
 * M6-09: pedidos de ajuste (RF-10.71…73, RN-33). Fora do prazo o formulário não aparece
 * (a BD também recusa: supabase/tests/0012_ajustes.sql). O formulário exige 10 caracteres.
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AcademicAdjustments } from "@/app/cliente/_blocks/academic";
import { AdjustmentForm } from "@/app/cliente/_components/AdjustmentForm";
import { requestAdjustment } from "@/lib/academic/actions";
import type { AdjustmentRequest } from "@/lib/academic/adjustments";
import { LUANDA, academicView } from "./fixture";

const refresh = vi.fn();
vi.mock("@/lib/academic/actions", () => ({ requestAdjustment: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const request = vi.mocked(requestAdjustment);

// entregue a 18/11 às 15h com 7 dias → pode pedir até 25/11 às 23:59:59 (Q-098)
const delivered = { deliveredAt: LUANDA("2026-11-18T15:00:00"), adjustDays: 7 };
const show = (now: string, adjustments: AdjustmentRequest[] = [], brief = delivered) => {
  vi.stubEnv("PORTAL_FIXED_NOW", LUANDA(now));
  return render(<AcademicAdjustments project={academicView({ adjustments }, brief)} unread={0} />);
};

beforeEach(() => {
  request.mockReset();
  refresh.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("Bloco Ajustes — prazo", () => {
  it("antes da entrega final não aparece", () => {
    const { container } = show("2026-11-25T10:00:00", [], { deliveredAt: null as unknown as string, adjustDays: 7 });
    expect(container.innerHTML).toBe("");
  });

  it("dentro do prazo, no último minuto: formulário disponível", () => {
    show("2026-11-25T23:59:00");
    expect(screen.getByRole("textbox", { name: "O que quer ajustar?" })).toBeTruthy();
    expect(screen.queryByText(/Prazo de ajustes terminado/)).toBeNull();
  });

  it("fora do prazo (00:00 do dia seguinte): sem formulário, só 'fale connosco'", () => {
    show("2026-11-26T00:00:00");
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Pedir ajuste" })).toBeNull();
    expect(screen.getByText(/Prazo de ajustes terminado/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "fale connosco" }).getAttribute("href")).toBe("/cliente/mensagens");
  });

  it("o prazo conta pelo dia de Luanda: 23:30 UTC de 18/11 já é 19/11 em Luanda → pode pedir até 26/11", () => {
    show("2026-11-26T10:00:00", [], { deliveredAt: "2026-11-18T23:30:00Z", adjustDays: 7 });
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("fora do prazo, o histórico dos pedidos continua à vista", () => {
    show("2026-11-30T10:00:00", [
      { id: "a1", description: "Corrigir a bibliografia na página 12", status: "resolvido", adminNote: null, createdAt: LUANDA("2026-11-20T10:00:00"), resolvedAt: LUANDA("2026-11-21T10:00:00"), resolvedByLabel: "Monografia V4" },
      { id: "a2", description: "Mudar o tema para outro", status: "recusado", adminNote: "Mudar o tema é trabalho novo.", createdAt: LUANDA("2026-11-22T10:00:00"), resolvedAt: LUANDA("2026-11-22T12:00:00"), resolvedByLabel: null },
    ]);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Resolvido")).toBeTruthy();
    expect(items[0].textContent).toContain("resolvido em Monografia V4");
    expect(items[1].textContent).toContain("Mudar o tema é trabalho novo.");
  });
});

describe("Formulário do pedido", () => {
  it("só envia com pelo menos 10 caracteres (sem contar espaços)", async () => {
    const user = userEvent.setup();
    render(<AdjustmentForm projectId="p_mono" />);
    const button = screen.getByRole("button", { name: "Pedir ajuste" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    await user.type(screen.getByRole("textbox"), "   curto   ");
    expect(button.disabled).toBe(true);
    await user.type(screen.getByRole("textbox"), "e já chega");
    expect(button.disabled).toBe(false);
  });

  it("pedido aceite: mensagem de sucesso, campo limpo e a página atualiza", async () => {
    request.mockResolvedValue({ ok: true, message: "Pedido enviado." });
    const user = userEvent.setup();
    render(<AdjustmentForm projectId="p_mono" />);
    await user.type(screen.getByRole("textbox"), "A bibliografia não segue a APA");
    await user.click(screen.getByRole("button", { name: "Pedir ajuste" }));
    expect(request).toHaveBeenCalledWith("p_mono", "A bibliografia não segue a APA");
    expect((await screen.findByRole("status")).textContent).toContain("Pedido enviado.");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("recusado pelo servidor (ex.: o prazo acabou entretanto): mostra o erro e mantém o texto", async () => {
    request.mockResolvedValue({ ok: false, error: "O prazo de ajustes terminou. Fale connosco pelas mensagens." });
    const user = userEvent.setup();
    render(<AdjustmentForm projectId="p_mono" />);
    await user.type(screen.getByRole("textbox"), "A bibliografia não segue a APA");
    await user.click(screen.getByRole("button", { name: "Pedir ajuste" }));
    expect((await screen.findByRole("alert")).textContent).toContain("O prazo de ajustes terminou");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("A bibliografia não segue a APA");
    expect(refresh).not.toHaveBeenCalled();
  });
});
