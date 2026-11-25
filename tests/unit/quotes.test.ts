/** M6-04: leitura do formulário do orçamento e cálculo do sinal (RN-12). */
import { describe, expect, it } from "vitest";
import { depositFromPct, quoteTotalLine, readQuote, splitRows } from "@/lib/quotes/model";
import { kz } from "@/lib/payments/model";

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

describe("readQuote — Design: design + impressão (RF-20.20, M7-06)", () => {
  const read = (o: Record<string, string>) => readQuote((k) => o[k] ?? "");
  it("o total é design + impressão e o sinal sai do total", () => {
    expect(read({ servico: "design", design: "45 000", impressao: "75 000" })).toMatchObject({
      total_kz: 120000, design_kz: 45000, print_kz: 75000, deposit_kz: 60000, rounds_included: 2,
    });
  });
  it("impressão vazia ou 0 = sem impressão", () => {
    expect(read({ servico: "design", design: "40000" })).toMatchObject({ total_kz: 40000, print_kz: 0 });
    expect(read({ servico: "design", design: "40000", impressao: "0" })).toMatchObject({ total_kz: 40000, print_kz: 0 });
  });
  it("arredonda a soma ao cêntimo", () => {
    expect(read({ servico: "design", design: "0,10", impressao: "0,20" })).toMatchObject({ total_kz: 0.3 });
  });
  it("erros: sem design, impressão inválida", () => {
    expect(read({ servico: "design", total: "90000" })).toEqual({ error: "Indique o valor do design em Kz (ex.: 45 000)." });
    expect(read({ servico: "design", design: "40000", impressao: "abc" })).toHaveProperty("error");
  });
  it("o Académico continua só com o total", () => {
    const q = read({ servico: "academic", total: "90000" });
    expect(q).not.toHaveProperty("design_kz");
    expect(q).not.toHaveProperty("print_kz");
  });
});

describe("splitRows e quoteTotalLine", () => {
  it("linhas Design e Impressão só com a divisão", () => {
    expect(splitRows(45000, 75000, kz)).toEqual([["Design", "45 000 Kz"], ["Impressão", "75 000 Kz"]]);
    expect(splitRows(40000, 0, kz)).toEqual([["Design", "40 000 Kz"], ["Impressão", "Sem impressão"]]);
    expect(splitRows(null, null, kz)).toEqual([]);
    expect(splitRows(undefined, 5, kz)).toEqual([]);
  });
  it("linha do valor (email e histórico)", () => {
    expect(quoteTotalLine(120000, 45000, 75000, kz)).toBe("Valor total: 120 000 Kz (design 45 000 Kz + impressão 75 000 Kz).");
    expect(quoteTotalLine("40000", "40000", "0", kz)).toBe("Valor total: 40 000 Kz (só design, sem impressão).");
    expect(quoteTotalLine(90000, null, null, kz)).toBe("Valor total: 90 000 Kz.");
  });
});
