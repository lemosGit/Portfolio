import { describe, expect, it } from "vitest";
import { allowedTargets, currentPhase, planAdvance, planBack, readPhaseDetails, type AdminPhase } from "@/lib/admin/phases";
import type { DbPhaseState } from "@/lib/portal/types";

const ph = (position: number, status: DbPhaseState, canBeSkipped = false): AdminPhase => ({
  id: `f${position}`,
  position,
  key: `k${position}`,
  name: `Fase ${position}`,
  description: "",
  status,
  canBeSkipped,
  dueOn: null,
  nextStep: null,
  nextStepOwner: null,
  progress: null,
  startedAt: null,
  completedAt: null,
});

describe("allowedTargets (estados.md §1)", () => {
  it("só oferece 'não aplicável' às fases que o permitem (B4)", () => {
    expect(allowedTargets(ph(1, "por_iniciar"))).toEqual(["em_curso"]);
    expect(allowedTargets(ph(3, "por_iniciar", true))).toEqual(["em_curso", "nao_aplicavel"]);
  });
  it("em curso pode aguardar, atrasar ou concluir; concluída só reabre", () => {
    expect(allowedTargets(ph(1, "em_curso"))).toEqual(["aguarda_cliente", "atrasada", "concluida"]);
    expect(allowedTargets(ph(1, "concluida"))).toEqual(["em_curso"]);
  });
});

describe("currentPhase (D-063)", () => {
  it("é a primeira que não está concluída nem é não aplicável", () => {
    expect(currentPhase([ph(1, "concluida"), ph(2, "nao_aplicavel", true), ph(3, "em_curso")])?.id).toBe("f3");
    expect(currentPhase([ph(1, "concluida")])).toBeUndefined();
  });
});

describe("planAdvance (Q-083)", () => {
  it("conclui a fase e inicia a seguinte por iniciar", () => {
    const r = planAdvance([ph(1, "em_curso"), ph(2, "por_iniciar")], "f1");
    expect(r).toEqual([
      { id: "f1", name: "Fase 1", from: "em_curso", to: "concluida" },
      { id: "f2", name: "Fase 2", from: "por_iniciar", to: "em_curso" },
    ]);
  });
  it("salta as fases não aplicáveis e põe em curso antes de concluir uma por iniciar", () => {
    const r = planAdvance([ph(1, "por_iniciar"), ph(2, "nao_aplicavel", true), ph(3, "por_iniciar")], "f1");
    expect(Array.isArray(r) && r.map((s) => `${s.id}:${s.to}`)).toEqual(["f1:em_curso", "f1:concluida", "f3:em_curso"]);
  });
  it("na última fase só conclui; numa fase fechada dá erro", () => {
    expect(planAdvance([ph(1, "concluida"), ph(2, "aguarda_cliente")], "f2")).toEqual([
      { id: "f2", name: "Fase 2", from: "aguarda_cliente", to: "concluida" },
    ]);
    expect(planAdvance([ph(1, "concluida")], "f1")).toHaveProperty("error");
  });
});

describe("planBack (D-062)", () => {
  it("reabre a última concluída antes da fase atual", () => {
    expect(planBack([ph(1, "concluida"), ph(2, "concluida"), ph(3, "em_curso")])).toEqual({
      id: "f2",
      name: "Fase 2",
      from: "concluida",
      to: "em_curso",
    });
  });
  it("com tudo fechado reabre a última; sem concluídas dá erro", () => {
    expect(planBack([ph(1, "concluida"), ph(2, "concluida")])).toMatchObject({ id: "f2" });
    expect(planBack([ph(1, "em_curso")])).toHaveProperty("error");
  });
});

describe("readPhaseDetails", () => {
  const read = (o: Record<string, string>) => readPhaseDetails((k) => o[k] ?? "");
  it("campos vazios ficam a null e o dono só existe com próximo passo", () => {
    expect(read({ dono: "cliente" })).toEqual({ due_on: null, next_step: null, next_step_owner: null, progress: null });
    expect(read({ proximo: "Aprovar o índice", dono: "cliente", prazo: "2026-12-01", progresso: "40" })).toEqual({
      due_on: "2026-12-01",
      next_step: "Aprovar o índice",
      next_step_owner: "cliente",
      progress: 40,
    });
  });
  it("recusa progresso fora de 0–100 e datas inválidas", () => {
    expect(read({ progresso: "120" })).toHaveProperty("error");
    expect(read({ prazo: "01/12/2026" })).toHaveProperty("error");
  });
});
