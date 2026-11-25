/** M6-06: janela de ajustes (até ao fim do último dia em Luanda, Q-098) e descrição do pedido. */
import { describe, expect, it } from "vitest";
import { adjustWindow, checkDescription } from "@/lib/academic/adjustments";

const at = (iso: string) => Date.parse(iso);

describe("adjustWindow (RN-33, igual a adjust_until da 0012)", () => {
  const delivered = "2026-12-01T15:00:00+01:00";
  it("7 dias: o último dia é 8/12 e acaba às 00:00 de 9/12 em Luanda", () => {
    const w = adjustWindow(delivered, 7, at("2026-12-02T10:00:00+01:00"));
    expect(w.lastDay).toBe("2026-12-08");
    expect(w.untilMs).toBe(at("2026-12-09T00:00:00+01:00"));
    expect(w).toMatchObject({ open: true, daysLeft: 7 });
  });
  it("no último dia ainda está aberto (falta 1 dia); à meia-noite fecha", () => {
    expect(adjustWindow(delivered, 7, at("2026-12-08T23:59:00+01:00"))).toMatchObject({ open: true, daysLeft: 1 });
    expect(adjustWindow(delivered, 7, at("2026-12-09T00:00:00+01:00"))).toMatchObject({ open: false, daysLeft: 0 });
  });
  it("0 dias de ajustes: só o próprio dia da entrega", () => {
    expect(adjustWindow(delivered, 0, at("2026-12-01T20:00:00+01:00"))).toMatchObject({ lastDay: "2026-12-01", open: true, daysLeft: 1 });
  });
  it("usa a data de Luanda: entregue às 23:30 UTC de 30/11 = 1/12 em Luanda", () => {
    expect(adjustWindow("2026-11-30T23:30:00Z", 7, at("2026-12-01T12:00:00+01:00")).lastDay).toBe("2026-12-08");
  });
});

describe("checkDescription", () => {
  it("10 a 2000 caracteres, sem espaços à volta", () => {
    expect(checkDescription("  Corrigir a página 3  ")).toBe("Corrigir a página 3");
    expect(checkDescription("curto")).toHaveProperty("error");
    expect(checkDescription("x".repeat(2001))).toHaveProperty("error");
  });
});
