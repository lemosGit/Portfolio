import { describe, expect, it } from "vitest";
import { greeting, relative, shortDate } from "@/lib/portal/format";

const NOW = Date.parse("2026-11-25T10:00:00+01:00");

describe("relative()", () => {
  it("menos de um minuto", () => expect(relative("2026-11-25T09:59:40+01:00", NOW)).toBe("agora mesmo"));
  it("minutos, no singular e no plural", () => {
    expect(relative("2026-11-25T09:59:00+01:00", NOW)).toBe("há 1 minuto");
    expect(relative("2026-11-25T09:48:00+01:00", NOW)).toBe("há 12 minutos");
  });
  it("horas", () => expect(relative("2026-11-25T07:00:00+01:00", NOW)).toBe("há 3 horas"));
  it("ontem e dias", () => {
    expect(relative("2026-11-24T10:00:00+01:00", NOW)).toBe("ontem");
    expect(relative("2026-11-20T10:00:00+01:00", NOW)).toBe("há 5 dias");
  });
  it("mais de 30 dias passa a data curta", () =>
    expect(relative("2026-09-01T10:00:00+01:00", NOW)).toBe(shortDate("2026-09-01T10:00:00+01:00")));
  it("usa o relógio fixo por omissão (PORTAL_FIXED_NOW)", () =>
    expect(relative("2026-11-25T09:00:00+01:00")).toBe("há 1 hora"));
});

describe("greeting()", () => {
  it("bom dia, boa tarde, boa noite (hora de Luanda)", () => {
    expect(greeting(new Date("2026-11-25T08:00:00+01:00"))).toBe("Bom dia");
    expect(greeting(new Date("2026-11-25T15:00:00+01:00"))).toBe("Boa tarde");
    expect(greeting(new Date("2026-11-25T21:00:00+01:00"))).toBe("Boa noite");
  });
});
