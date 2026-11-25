/** M6-01: leitura do formulário da ficha do trabalho académico. */
import { describe, expect, it } from "vitest";
import { readBrief } from "@/lib/academic/brief";

const read = (o: Record<string, string>) => readBrief((k) => o[k] ?? "");
const base = { tema: "O microcrédito em Luanda", tipo: "universitario", nivel: "licenciatura" };

describe("readBrief (RF-10.10)", () => {
  it("lê a ficha completa e os vazios ficam a null", () => {
    expect(read({ ...base, instituicao: "UAN", normas: "APA", paginas: "45", capitulos: "1" })).toEqual({
      topic: "O microcrédito em Luanda",
      work_type: "universitario",
      education_level: "licenciatura",
      institution: "UAN",
      discipline: null,
      citation_style: "APA",
      citation_notes: null,
      pages_target: 45,
      uses_chapters: true,
      adjust_days: 7,
    });
  });
  it("sem a caixa dos capítulos, o trabalho é curto (D-014)", () => {
    expect(read(base)).toMatchObject({ uses_chapters: false });
  });
  it("exige tema, tipo e nível válidos", () => {
    expect(read({ ...base, tema: "" })).toHaveProperty("error");
    expect(read({ ...base, tipo: "tese" })).toHaveProperty("error");
    expect(read({ ...base, nivel: "doutoramento" })).toHaveProperty("error");
  });
  it("recusa normas fora da lista, páginas e dias de ajustes fora dos limites (RN-33)", () => {
    expect(read({ ...base, normas: "Harvard" })).toHaveProperty("error");
    expect(read({ ...base, paginas: "0" })).toHaveProperty("error");
    expect(read({ ...base, dias_ajustes: "61" })).toHaveProperty("error");
    expect(read({ ...base, dias_ajustes: "0" })).toMatchObject({ adjust_days: 0 });
  });
  it("não aceita chaves herdadas do objeto como valores (ex.: toString)", () => {
    expect(read({ ...base, tipo: "toString" })).toHaveProperty("error");
  });
});
