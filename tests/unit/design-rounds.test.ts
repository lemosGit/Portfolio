/** M7-03: rondas de revisão — rótulo, aviso antes de pedir alterações e orçamento do Design. */
import { describe, expect, it } from "vitest";
import { changesNotice, extraRequestMessage, remainingNotice, roundsLabel } from "@/lib/design/rounds";
import { proofReadyTitle } from "@/lib/design/proofs";
import { readQuote } from "@/lib/quotes/model";

describe("roundsLabel", () => {
  it("antes do primeiro pedido, quantas estão incluídas", () => {
    expect(roundsLabel({ included: 2, used: 0, remaining: 2 })).toBe("2 rondas incluídas");
    expect(roundsLabel({ included: 1, used: 0, remaining: 1 })).toBe("1 ronda incluída");
    expect(roundsLabel({ included: 0, used: 0, remaining: 0 })).toBe("Sem rondas incluídas");
  });
  it("depois, a ronda que deu a versão atual (TEL-30)", () => {
    expect(roundsLabel({ included: 2, used: 1, remaining: 1 })).toBe("Ronda 1 de 2");
    expect(roundsLabel({ included: 3, used: 3, remaining: 0 })).toBe("Ronda 3 de 3");
  });
});

describe("changesNotice (TEL-33)", () => {
  it("avisa quando é a última ronda incluída", () => {
    expect(changesNotice({ included: 2, used: 1, remaining: 1 })).toBe("Esta é a ronda 2 de 2 incluídas. Depois desta, cada nova revisão tem um custo extra.");
  });
  it("diz que ronda vai gastar; sem rondas, não há aviso (há revisão extra)", () => {
    expect(changesNotice({ included: 3, used: 0, remaining: 3 })).toBe("Vai usar a ronda 1 de 3 incluídas.");
    expect(changesNotice({ included: 2, used: 2, remaining: 0 })).toBeNull();
  });
});

it("mensagem da revisão extra para o João", () => {
  expect(extraRequestMessage("  A data é domingo. ", "V3")).toBe("Pedido de revisão extra sobre a V3: A data é domingo.");
  expect(extraRequestMessage("Mudar a cor", null)).toBe("Pedido de revisão extra: Mudar a cor");
});

describe("readQuote — rondas do Design (RN-35, Q-103)", () => {
  const read = (o: Record<string, string>) => readQuote((k) => o[k] ?? "");
  it("no Design, 2 por omissão e editável de 0 a 10", () => {
    expect(read({ design: "90000", servico: "design" })).toMatchObject({ rounds_included: 2 });
    expect(read({ design: "90000", servico: "design", rondas: "0" })).toMatchObject({ rounds_included: 0 });
    expect(read({ design: "90000", servico: "design", rondas: "11" })).toEqual({ error: "As rondas incluídas vão de 0 a 10." });
  });
  it("nos outros serviços não mexe nas rondas", () => {
    expect(read({ total: "90000", servico: "academic" })).not.toHaveProperty("rounds_included");
  });
});

describe("remainingNotice e proofReadyTitle (M7-07, wireframe TEL-30)", () => {
  it("revisões que ainda cabem no preço", () => {
    expect(remainingNotice({ included: 2, used: 1, remaining: 1 })).toBe("Ainda pode pedir 1 revisão incluída no preço.");
    expect(remainingNotice({ included: 3, used: 0, remaining: 3 })).toBe("Ainda pode pedir 3 revisões incluídas no preço.");
    expect(remainingNotice({ included: 2, used: 2, remaining: 0 })).toBe("Já usou as revisões incluídas: uma nova revisão é um extra.");
    expect(remainingNotice({ included: 0, used: 0, remaining: 0 })).toBe("Este orçamento não inclui revisões: uma revisão é um extra.");
  });
  it("título da versão pronta", () => {
    expect(proofReadyTitle("V1")).toBe("A primeira versão está pronta");
    expect(proofReadyTitle("V2")).toBe("A segunda versão está pronta");
    expect(proofReadyTitle("V7")).toBe("A versão 7 está pronta");
    expect(proofReadyTitle(null)).toBe("A nova versão está pronta");
  });
});
