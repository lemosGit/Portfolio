/** Bloco Pagamentos (M5-11): Kz, em atraso em hora de Luanda, totais e pagamento que trava a fase. */
import { describe, expect, it } from "vitest";
import { blockingPayment, kz, parseKz, payLabel, paymentView, todayLuanda, totals, type Payment } from "@/lib/payments/model";

const pay = (o: Partial<Payment>): Payment => ({
  id: "p", kind: "sinal", description: "Sinal (50%)", amountKz: 1000, dueOn: null, status: "pendente", paidOn: null,
  extraRounds: 0, gatesPhase: null, createdAt: "2026-11-01T10:00:00Z", ...o,
});

describe("kz e parseKz", () => {
  it("agrupa os milhares com espaço e só mostra cêntimos quando existem", () => {
    expect(kz(125000)).toBe("125 000 Kz");
    expect(kz(1250.5)).toBe("1 250,50 Kz");
    expect(kz(900)).toBe("900 Kz");
  });
  it("lê os formatos escritos no admin e recusa texto", () => {
    expect(parseKz("125 000")).toBe(125000);
    expect(parseKz("125.000 Kz")).toBe(125000);
    expect(parseKz("1.250,5")).toBe(1250.5);
    expect(parseKz("abc")).toBeUndefined();
    expect(parseKz("0")).toBeUndefined();
  });
});

describe("paymentView (RF-30.21)", () => {
  it("fica em atraso só a partir do dia seguinte à data limite", () => {
    expect(paymentView({ status: "pendente", dueOn: "2026-11-24" }, "2026-11-24")).toBe("pendente");
    expect(paymentView({ status: "pendente", dueOn: "2026-11-24" }, "2026-11-25")).toBe("atrasado");
    expect(paymentView({ status: "pago", dueOn: "2026-11-01" }, "2026-11-25")).toBe("pago");
  });
  it("usa a data de Luanda (UTC+1): 23h30 UTC já é o dia seguinte", () => {
    expect(todayLuanda(Date.parse("2026-11-24T23:30:00Z"))).toBe("2026-11-25");
  });
});

describe("totals (RF-30.23, RN-07)", () => {
  it("extras por aceitar e anulados não contam", () => {
    expect(
      totals([
        pay({ amountKz: 100, status: "pago" }),
        pay({ amountKz: 50, status: "pendente" }),
        pay({ amountKz: 30, status: "por_aceitar" }),
        pay({ amountKz: 20, status: "anulado" }),
      ]),
    ).toEqual({ total: 150, paid: 100, missing: 50 });
  });
});

describe("blockingPayment (RF-30.24)", () => {
  const gate = (key: string, position: number) => ({ key, name: key, position });
  it("o pendente que trava uma fase por começar; pela ordem das fases", () => {
    const list = [pay({ id: "r", kind: "restante", gatesPhase: gate("producao", 6) }), pay({ id: "s", gatesPhase: gate("conceito", 3) })];
    expect(blockingPayment(list, { conceito: "por_iniciar", producao: "por_iniciar" })?.id).toBe("s");
    expect(blockingPayment(list, { conceito: "em_curso", producao: "por_iniciar" })?.id).toBe("r");
    expect(blockingPayment([pay({ status: "pago", gatesPhase: gate("conceito", 3) })], { conceito: "por_iniciar" })).toBeUndefined();
  });
  it("frase do próximo passo", () => {
    expect(payLabel({ kind: "sinal", description: "Sinal (50%)" })).toBe("Pagar o sinal (50%)");
    expect(payLabel({ kind: "extra", description: "Ronda extra" })).toBe("Pagar: Ronda extra");
  });
});
