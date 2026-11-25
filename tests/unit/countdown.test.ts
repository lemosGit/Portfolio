/** M6-02: contagem do prazo (RF-10.80…82, RN-21), em hora de Luanda. */
import { describe, expect, it } from "vitest";
import { countdown, luandaDate } from "@/lib/academic/countdown";

const at = (iso: string) => Date.parse(iso);

describe("countdown", () => {
  it("dias de calendário até ao prazo, sem etiqueta acima de 3 dias", () => {
    expect(countdown("2026-12-07", null, at("2026-11-25T10:00:00+01:00"))).toMatchObject({ mode: "days", value: 12, unit: "dias", label: null });
  });
  it("a ≤ 3 dias mostra 'Prazo próximo' (RF-10.82)", () => {
    expect(countdown("2026-11-28", null, at("2026-11-25T10:00:00+01:00"))).toMatchObject({ mode: "days", value: 3, label: "Prazo próximo" });
  });
  it("com menos de 2 dias passa a horas (RF-10.81)", () => {
    // fim do dia 26 em Luanda = 23:59:59; às 10h do dia 25 faltam ~38 h
    expect(countdown("2026-11-26", null, at("2026-11-25T10:00:00+01:00"))).toMatchObject({ mode: "hours", value: 38, unit: "horas", label: "Prazo próximo" });
    expect(countdown("2026-11-25", null, at("2026-11-25T23:30:00+01:00"))).toMatchObject({ mode: "hours", value: 1, unit: "hora" });
  });
  it("depois do prazo: 'Atrasada' com os dias de atraso", () => {
    expect(countdown("2026-11-24", null, at("2026-11-25T00:30:00+01:00"))).toMatchObject({ mode: "late", value: 1, unit: "dia de atraso", label: "Atrasada" });
    expect(countdown("2026-11-20", null, at("2026-11-25T10:00:00+01:00"))).toMatchObject({ mode: "late", value: 5 });
  });
  it("usa a hora de Luanda: 23:30 UTC do dia 24 já é dia 25 em Luanda", () => {
    expect(luandaDate("2026-11-24T23:30:00Z")).toBe("2026-11-25");
    expect(countdown("2026-11-24", null, at("2026-11-24T23:30:00Z")).mode).toBe("late");
  });
  it("o prazo ajustado (RN-21) ganha e diz quantos dias se acrescentaram", () => {
    expect(countdown("2026-12-07", "2026-12-10", at("2026-11-25T10:00:00+01:00"))).toMatchObject({ value: 15, due: "2026-12-10", extraDays: 3 });
    // um ajustado igual ou anterior ao original é ignorado
    expect(countdown("2026-12-07", "2026-12-07", at("2026-11-25T10:00:00+01:00"))).toMatchObject({ due: "2026-12-07", extraDays: 0 });
  });
});
