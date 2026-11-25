/** M9-08: horário de atendimento (RN-51, RN-52, D-036), em hora de Luanda (UTC+1). */
import { describe, expect, it } from "vitest";
import { HOURS_LABEL, isOpen } from "@/lib/portal/hours";

const at = (iso: string) => new Date(iso).getTime();

describe("isOpen (08h00–20h00, todos os dias, Luanda)", () => {
  it("abre às 08h00 e fecha às 20h00 de Luanda", () => {
    expect(isOpen(at("2026-11-25T07:59:00+01:00"))).toBe(false);
    expect(isOpen(at("2026-11-25T08:00:00+01:00"))).toBe(true);
    expect(isOpen(at("2026-11-25T19:59:00+01:00"))).toBe(true);
    expect(isOpen(at("2026-11-25T20:00:00+01:00"))).toBe(false);
    expect(isOpen(at("2026-11-25T23:30:00+01:00"))).toBe(false);
  });
  it("conta a hora de Luanda, não a do servidor (07:30 UTC = 08:30 em Luanda)", () => {
    expect(isOpen(at("2026-11-25T07:30:00Z"))).toBe(true);
    expect(isOpen(at("2026-11-25T19:30:00Z"))).toBe(false);
  });
  it("fins de semana também (RN-51)", () => {
    expect(isOpen(at("2026-11-28T10:00:00+01:00"))).toBe(true); // sábado
    expect(isOpen(at("2026-11-29T21:00:00+01:00"))).toBe(false); // domingo à noite
  });
  it("texto das páginas públicas", () => {
    expect(HOURS_LABEL).toBe("todos os dias, das 8h às 20h");
  });
});
