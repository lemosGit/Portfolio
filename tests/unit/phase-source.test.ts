/** Fonte BD das fases (ADR-001): mapeamento, % do projeto, fase atual, atrasos. */
import { describe, expect, it } from "vitest";
import { toView } from "@/lib/portal/data";
import { projects } from "@/lib/portal/mock-data";
import { mapDbPhases, sourceFor, type DbPhaseRow } from "@/lib/portal/phase-source";
import type { DbPhaseState, Project, ServiceType } from "@/lib/portal/types";

const row = (position: number, key: string, status: DbPhaseState, extra: Partial<DbPhaseRow> = {}): DbPhaseRow => ({
  position, key, name: key, description: "", status,
  due_on: null, next_step: null, next_step_owner: null, progress: null, client_can_upload: false,
  ...extra,
});

const project = (serviceType: ServiceType, rows: DbPhaseRow[]): Project => ({
  ...projects[0], serviceType, source: "bd", phases: mapDbPhases(rows),
});

describe("sourceFor()", () => {
  it("Desenvolvimento lê do GitHub; Académico e Design da BD", () => {
    expect(sourceFor("development").kind).toBe("github");
    expect(sourceFor(undefined).kind).toBe("github");
    expect(sourceFor("academic").kind).toBe("database");
    expect(sourceFor("design").kind).toBe("database");
  });
});

describe("mapDbPhases()", () => {
  it("ordena por posição e traduz os campos", () => {
    const ph = mapDbPhases([
      row(2, "orcamento-sinal", "em_curso", { next_step: "Aceitar o orçamento", next_step_owner: "cliente", progress: 40 }),
      row(1, "briefing", "concluida"),
    ]);
    expect(ph.map((p) => p.number)).toEqual([1, 2]);
    expect(ph[0]).toMatchObject({ closed: true, progress: 1, state: "concluida", tasks: [] });
    expect(ph[1]).toMatchObject({ closed: false, progress: 0.4, nextStep: { text: "Aceitar o orçamento", owner: "cliente" } });
  });
});

describe("toView() — fonte BD", () => {
  it("Design: 3 de 6 aplicáveis concluídas, produção não se aplica → 50% (ADR-001)", () => {
    const v = toView(project("design", [
      row(1, "briefing", "concluida"), row(2, "orcamento-sinal", "concluida"), row(3, "conceito", "concluida"),
      row(4, "revisoes", "aguarda_cliente"), row(5, "aprovacao-arte", "por_iniciar"),
      row(6, "producao", "nao_aplicavel"), row(7, "entrega-levantamento", "por_iniciar"),
    ]));
    expect(v.percent).toBe(50);
    expect(v.total).toBe(6);
    expect(v.closedCount).toBe(3);
    expect(v.currentPhase.key).toBe("revisoes");
    expect(v.phaseViews[5].status).toBe("skipped");
    expect(v.weekly).toEqual([]);
  });

  it("Académico: 3 de 7 + 2 de 5 capítulos (40%) na fase em curso → 49% (ADR-001)", () => {
    const v = toView(project("academic", [
      row(1, "pedido-briefing", "concluida"), row(2, "orcamento-aceite", "concluida"), row(3, "estrutura", "concluida"),
      row(4, "desenvolvimento", "em_curso", { progress: 40 }), row(5, "revisao-formatacao", "por_iniciar"),
      row(6, "entrega-final", "por_iniciar"), row(7, "ajustes", "por_iniciar"),
    ]));
    expect(v.percent).toBe(49);
    expect(v.currentPhase.key).toBe("desenvolvimento");
    expect(v.phaseViews[3].percent).toBe(40);
  });

  it("sequência flexível: a fase atual é a primeira por concluir (D-063)", () => {
    const v = toView(project("design", [
      row(1, "briefing", "concluida"), row(2, "orcamento-sinal", "por_iniciar"), row(3, "conceito", "em_curso"),
    ]));
    expect(v.currentPhase.key).toBe("orcamento-sinal");
  });

  it("atrasada: marcada pelo admin ou com a data ultrapassada (D-046)", () => {
    const v = toView(project("academic", [
      row(1, "pedido-briefing", "atrasada"),
      row(2, "orcamento-aceite", "em_curso", { due_on: "2026-11-20" }),   // relógio fixo: 2026-11-25
      row(3, "estrutura", "por_iniciar", { due_on: "2026-12-20" }),
    ]));
    expect(v.phaseViews.map((p) => p.late)).toEqual([true, true, false]);
  });

  it("tudo concluído → 100% e a fase atual é a última", () => {
    const v = toView(project("design", [row(1, "briefing", "concluida"), row(2, "orcamento-sinal", "concluida")]));
    expect(v.percent).toBe(100);
    expect(v.currentPhase.key).toBe("orcamento-sinal");
  });
});
