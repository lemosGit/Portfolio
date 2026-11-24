/**
 * toView() — linha de base do comportamento atual do Tech (fonte GitHub), antes do
 * PhaseSource do ADR-001. Estes testes têm de continuar verdes depois da M5-04 (RNF-701).
 */
import { describe, expect, it } from "vitest";
import { toView } from "@/lib/portal/data";
import { projects } from "@/lib/portal/mock-data";
import type { Phase, Project } from "@/lib/portal/types";

const phase = (number: number, closed: boolean, total: number, done: number, extra: Partial<Phase> = {}): Phase => ({
  number,
  title: `Fase ${number}`,
  description: "",
  closed,
  tasks: [],
  counts: { total, closedAt: Array.from({ length: done }, () => "2026-11-20T10:00:00+01:00") },
  ...extra,
});

const withPhases = (phases: Phase[]): Project => ({ ...projects[0], phases });

describe("toView() — fonte GitHub", () => {
  it("% do projeto = issues fechadas / total", () => {
    const v = toView(withPhases([phase(1, true, 10, 10), phase(2, false, 10, 5), phase(3, false, 20, 0)]));
    expect(v.total).toBe(40);
    expect(v.closedCount).toBe(15);
    expect(v.percent).toBe(38);
  });

  it("fase atual = a primeira com atividade e por fechar", () => {
    const v = toView(withPhases([phase(1, true, 4, 4), phase(2, false, 6, 3), phase(3, false, 5, 1)]));
    expect(v.currentPhase.number).toBe(2);
    expect(v.phaseViews.map((p) => p.status)).toEqual(["done", "current", "current"]);
  });

  it("sem atividade, a fase atual é a primeira por concluir", () => {
    const v = toView(withPhases([phase(1, true, 4, 4), phase(2, false, 6, 0), phase(3, false, 5, 0)]));
    expect(v.currentPhase.number).toBe(2);
    expect(v.phaseViews[2].status).toBe("pending");
  });

  it("% de cada fase", () => {
    const v = toView(withPhases([phase(1, false, 8, 2)]));
    expect(v.phaseViews[0].percent).toBe(25);
  });

  it("projeto sem issues fica a 0%", () => {
    const v = toView(withPhases([phase(1, false, 0, 0)]));
    expect(v.percent).toBe(0);
  });

  it("os dados de demonstração dão sempre o mesmo resultado com o relógio fixo", () => {
    const a = toView(projects[0]);
    const b = toView(projects[0]);
    expect(a.percent).toBe(b.percent);
    expect(a.weekly).toEqual(b.weekly);
  });
});
