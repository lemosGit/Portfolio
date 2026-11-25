// @vitest-environment jsdom
/** M6-09: bloco "aca-countdown" (RF-10.80…83), limites em hora de Luanda. Relógio: lib/clock.ts. */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AcademicCountdown } from "@/app/cliente/_blocks/academic";
import { LUANDA, academicView } from "./fixture";

// A Server Action (só servidor) e o router do Next não existem no jsdom.
vi.mock("@/lib/academic/actions", () => ({ requestAdjustment: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const show = (over: Parameters<typeof academicView>[0], brief: Parameters<typeof academicView>[1] = {}) =>
  render(<AcademicCountdown project={academicView(over, brief)} unread={0} />);
const big = () => screen.getByRole("region").querySelector("b")!.textContent;

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("AcademicCountdown — prazo de entrega", () => {
  it("4 dias: só o número, sem etiqueta", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-25T10:00:00"));
    show({ dueOn: "2026-11-29" });
    expect(big()).toBe("4");
    expect(screen.getByText("dias")).toBeTruthy();
    expect(screen.queryByText("Prazo próximo")).toBeNull();
  });

  it("3 dias: aparece 'Prazo próximo' (limite RF-10.82)", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-25T10:00:00"));
    show({ dueOn: "2026-11-28" });
    expect(big()).toBe("3");
    expect(screen.getByText("Prazo próximo")).toBeTruthy();
  });

  it("menos de 2 dias: passa a horas, até às 23:59 do dia do prazo (RF-10.81)", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-25T10:00:00"));
    show({ dueOn: "2026-11-26" });
    expect(big()).toBe("38");
    expect(screen.getByText("horas")).toBeTruthy();
  });

  it("no próprio dia às 23:30 ainda falta 1 hora (singular)", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-25T23:30:00"));
    show({ dueOn: "2026-11-25" });
    expect(big()).toBe("1");
    expect(screen.getByText("hora")).toBeTruthy();
    expect(screen.queryByText("Atrasada")).toBeNull();
  });

  it("à meia-noite do dia seguinte fica 'Atrasada', com o prazo que era", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-26T00:00:00"));
    show({ dueOn: "2026-11-25" });
    expect(screen.getByText("Atrasada")).toBeTruthy();
    expect(screen.getByText("dia de atraso")).toBeTruthy();
    expect(screen.getByText(/O prazo era/)).toBeTruthy();
    expect(screen.getByText(/O João indica a nova data/)).toBeTruthy();
  });

  it("prazo ajustado (RN-21): conta até ao novo e explica os dias a mais", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-25T10:00:00"));
    show({ dueOn: "2026-12-07", adjustedDueOn: "2026-12-10" });
    expect(big()).toBe("15");
    expect(screen.getByText(/mais 3 dias pelo tempo em que esperámos/)).toBeTruthy();
  });

  it("sem prazo marcado: 'Prazo por definir' até aceitar o orçamento", () => {
    show({ dueOnSet: false });
    expect(screen.getByRole("heading", { name: "Prazo por definir" })).toBeTruthy();
  });
});

describe("AcademicCountdown — depois da entrega final (RF-10.83)", () => {
  // entregue a 18/11 às 15h com 7 dias → pode pedir até 25/11 (inclusive)
  const delivered = { deliveredAt: LUANDA("2026-11-18T15:00:00"), adjustDays: 7 };

  it("conta os dias para pedir ajustes, com o último dia a valer 1", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-25T23:59:00"));
    show({}, delivered);
    expect(big()).toBe("1");
    expect(screen.getByText("dia para pedir ajustes")).toBeTruthy();
  });

  it("no dia seguinte ao último: 'Trabalho entregue'", () => {
    vi.stubEnv("PORTAL_FIXED_NOW", LUANDA("2026-11-26T00:00:00"));
    show({}, delivered);
    expect(screen.getByText("Trabalho entregue")).toBeTruthy();
    expect(screen.getByText(/O prazo de ajustes terminou a/)).toBeTruthy();
  });
});
