/** M6-04: leitura do formulário do orçamento e cálculo do sinal (RN-12). */
import { describe, expect, it } from "vitest";
import { depositFromPct, readQuote } from "@/lib/quotes/model";

const read = (o: Record<string, string>) => readQuote((k) => o[k] ?? "");

describe("depositFromPct", () => {
  it("arredonda ao cêntimo, como a BD", () => {
    expect(depositFromPct(90000, 50)).toBe(45000);
    expect(depositFromPct(1000.5, 50)).toBe(500.25);
    expect(depositFromPct(99999, 33)).toBe(32999.67);
  });
});

describe("readQuote", () => {
  it("sinal de 50% por omissão (RN-12)", () => {
    expect(read({ total: "90 000", prazo: "2026-12-20" })).toEqual({ total_kz: 90000, deposit_pct: 50, deposit_kz: 45000, delivery_due_on: "2026-12-20" });
  });
  it("o sinal em Kz ganha à percentagem e não pode passar do total", () => {
    expect(read({ total: "90 000", sinal_pct: "50", sinal_kz: "30 000" })).toMatchObject({ deposit_kz: 30000 });
    expect(read({ total: "90 000", sinal_kz: "100 000" })).toHaveProperty("error");
  });
  it("recusa total em falta, % fora de 1–100 e datas inválidas", () => {
    expect(read({ total: "" })).toHaveProperty("error");
    expect(read({ total: "1000", sinal_pct: "0" })).toHaveProperty("error");
    expect(read({ total: "1000", prazo: "20/12/2026" })).toHaveProperty("error");
  });
});
