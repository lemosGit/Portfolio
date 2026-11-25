/** M7-01: ficha técnica da peça — leitura do formulário, textos, medidas e o topo (RF-20.02, RF-20.10). */
import { describe, expect, it } from "vitest";
import { keyTextsToLines, parseKeyTexts, readSpec, sizeLabel, specHeadline } from "@/lib/design/spec";

const form = (v: Record<string, string>) => (k: string) => v[k] ?? "";
const base = { tipo: "convite_impresso", quantidade: "120", impressao: "1", digitais: "1" };

describe("parseKeyTexts", () => {
  it("'Rótulo: texto' por linha, pela ordem, sem linhas vazias", () => {
    expect(parseKeyTexts("Noivos: Ana & Paulo\n\n  Local: Igreja: Sagrada Família  \nObrigado!")).toEqual([
      { label: "Noivos", value: "Ana & Paulo" },
      { label: "Local", value: "Igreja: Sagrada Família" },
      { label: "", value: "Obrigado!" },
    ]);
  });
  it("no máximo 20 textos (D-057)", () => {
    expect(parseKeyTexts(Array.from({ length: 21 }, (_, i) => `L${i}: v`).join("\n"))).toHaveProperty("error");
  });
  it("rótulo sem texto é erro", () => {
    expect(parseKeyTexts("Noivos:")).toEqual({ error: 'Falta o texto depois de "Noivos:".' });
  });
  it("volta a linhas para editar", () => {
    expect(keyTextsToLines([{ label: "Noivos", value: "Ana & Paulo" }, { label: "", value: "Obrigado!" }])).toBe("Noivos: Ana & Paulo\nObrigado!");
  });
});

describe("readSpec", () => {
  it("campos completos → linha da BD, medidas com vírgula", () => {
    const r = readSpec(form({ ...base, largura: "14,8", altura: "21", material: "Couché 300 g", evento: "2026-12-26", textos: "Noivos: Ana & Paulo" }));
    expect(r).toMatchObject({ piece_type: "convite_impresso", width_cm: 14.8, height_cm: 21, quantity: 120, has_print: true, has_digital_files: true, event_date: "2026-12-26", key_texts: [{ label: "Noivos", value: "Ana & Paulo" }] });
  });
  it("opcionais vazios ficam null e sem impressão vem false", () => {
    expect(readSpec(form({ tipo: "logotipo_identidade" }))).toMatchObject({ width_cm: null, material: null, quantity: 1, has_print: false, has_digital_files: false, event_date: null, key_texts: [] });
  });
  it("recusa tipo fora da lista, quantidade 0 e medidas negativas", () => {
    expect(readSpec(form({ tipo: "caneca" }))).toEqual({ error: "Escolha o tipo de peça." });
    expect(readSpec(form({ ...base, quantidade: "0" }))).toHaveProperty("error");
    expect(readSpec(form({ ...base, largura: "-3" }))).toHaveProperty("error");
  });
});

describe("rótulos", () => {
  it("medidas", () => {
    expect(sizeLabel({ widthCm: 14.8, heightCm: 21 })).toBe("14,8 × 21 cm");
    expect(sizeLabel({ widthCm: 300, heightCm: null })).toBe("300 cm de largura");
    expect(sizeLabel({ widthCm: null, heightCm: null })).toBeNull();
  });
  it("topo: tipo de peça e data do evento (RF-20.02)", () => {
    expect(specHeadline({ pieceType: "convite_impresso", eventDate: "2026-12-26" })).toBe("Convite impresso · evento a 26 de dezembro de 2026");
    expect(specHeadline({ pieceType: "lona", eventDate: null })).toBe("Lona");
  });
});
