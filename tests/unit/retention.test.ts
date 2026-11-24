/** #122 (M5-09b): limpeza dos 90 dias, adiamento, órfãos e validação das miniaturas WebP. */
import { describe, expect, it } from "vitest";
import { classify, daysUntil, isOrphan, postponeTo } from "@/lib/files/retention";
import { PREVIEW, previewOk, previewPath, webpSize } from "@/lib/files/rules";

describe("retenção (RN-08)", () => {
  it("daysUntil conta dias de calendário", () => {
    expect(daysUntil("2026-12-01", "2026-11-24")).toBe(7);
    expect(daysUntil("2026-11-24", "2026-11-24")).toBe(0);
  });
  it("avisa a ≤ 7 dias, apaga no dia, ignora projetos sem ficheiros ou sem data", () => {
    const { warn, purge } = classify(
      [
        { id: "a", purgeOn: "2026-12-01", hasFiles: true },  // 7 dias → aviso
        { id: "b", purgeOn: "2026-12-02", hasFiles: true },  // 8 dias → nada
        { id: "c", purgeOn: "2026-11-24", hasFiles: true },  // hoje → apaga
        { id: "d", purgeOn: "2026-10-01", hasFiles: false }, // já apagado
        { id: "e", purgeOn: null, hasFiles: true },          // projeto ativo
      ],
      "2026-11-24",
    );
    expect(warn.map((p) => [p.id, p.days])).toEqual([["a", 7]]);
    expect(purge.map((p) => p.id)).toEqual(["c"]);
  });
  it("Adiar 30 dias conta a partir da data de limpeza (ou de hoje, se já passou)", () => {
    expect(postponeTo("2026-12-01", "2026-11-24")).toBe("2026-12-31");
    expect(postponeTo("2026-11-01", "2026-11-24")).toBe("2026-12-24");
  });
  it("órfão = objeto desconhecido com mais de 24 h", () => {
    const now = Date.parse("2026-11-24T12:00:00Z");
    const known = new Set(["p/d/f.pdf"]);
    expect(isOrphan({ path: "p/d/x.pdf", createdAt: "2026-11-23T11:00:00Z" }, known, now)).toBe(true);
    expect(isOrphan({ path: "p/d/x.pdf", createdAt: "2026-11-24T01:00:00Z" }, known, now)).toBe(false); // upload a decorrer
    expect(isOrphan({ path: "p/d/f.pdf", createdAt: "2026-11-01T00:00:00Z" }, known, now)).toBe(false);
  });
});

/** Cabeçalho WebP mínimo (VP8L ou VP8X) com as dimensões pedidas. */
function webp(kind: "VP8L" | "VP8X", w: number, h: number): Uint8Array {
  const b = new Uint8Array(40);
  const put = (at: number, s: string) => [...s].forEach((c, i) => (b[at + i] = c.charCodeAt(0)));
  put(0, "RIFF");
  put(8, "WEBP");
  put(12, kind);
  if (kind === "VP8L") {
    b[20] = 0x2f;
    const bits = (w - 1) | ((h - 1) << 14);
    b[21] = bits & 0xff;
    b[22] = (bits >> 8) & 0xff;
    b[23] = (bits >> 16) & 0xff;
    b[24] = (bits >>> 24) & 0xff;
  } else {
    [w - 1, h - 1].forEach((v, k) => {
      b[24 + k * 3] = v & 0xff;
      b[25 + k * 3] = (v >> 8) & 0xff;
      b[26 + k * 3] = (v >> 16) & 0xff;
    });
  }
  return b;
}

describe("miniaturas WebP (D-082, ADR-003 §3)", () => {
  it("lê as dimensões de VP8L e VP8X", () => {
    expect(webpSize(webp("VP8L", 1600, 1067))).toEqual({ width: 1600, height: 1067 });
    expect(webpSize(webp("VP8X", 900, 1600))).toEqual({ width: 900, height: 1600 });
    expect(webpSize(new TextEncoder().encode("%PDF-1.7 não é webp nenhum, de todo"))).toBeUndefined();
  });
  it("aceita ≤ 1600 px e ≤ 150 KB; recusa maior ou que não seja WebP", () => {
    expect(previewOk(webp("VP8L", 1600, 1200), 120_000)).toBe(true);
    expect(previewOk(webp("VP8L", 2000, 1200), 120_000)).toBe(false);
    expect(previewOk(webp("VP8X", 800, 600), PREVIEW.maxBytes + 1)).toBe(false);
    expect(previewOk(new Uint8Array(40), 1000)).toBe(false);
  });
  it("a miniatura fica ao lado do original", () => {
    expect(previewPath("p/d/f.jpg")).toBe("p/d/f.preview.webp");
  });
});
