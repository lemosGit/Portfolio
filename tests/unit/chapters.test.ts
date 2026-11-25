/** M6-03: progresso por capítulos (RF-10.41, RF-10.43) e índice → capítulos. */
import { describe, expect, it } from "vitest";
import { applyChapterProgress, chapterProgress, titlesFromIndex } from "@/lib/academic/chapters";

const phases = [
  { key: "estrutura", progress: undefined, state: "concluida" as const },
  { key: "desenvolvimento", progress: 0.1, state: "em_curso" as const },
];
const secs = (...st: ("por_iniciar" | "em_curso" | "concluido")[]) => st.map((status) => ({ status }));

describe("chapterProgress", () => {
  it("X de Y concluídos", () => {
    expect(chapterProgress(secs("concluido", "concluido", "em_curso", "por_iniciar", "por_iniciar"))).toEqual({ done: 2, total: 5, ratio: 0.4 });
    expect(chapterProgress([])).toEqual({ done: 0, total: 0, ratio: 0 });
  });
});

describe("applyChapterProgress", () => {
  it("a % da fase Desenvolvimento vem dos capítulos", () => {
    const out = applyChapterProgress(phases, secs("concluido", "por_iniciar"), true);
    expect(out[1].progress).toBe(0.5);
    expect(out[0]).toBe(phases[0]);
  });
  it("sem capítulos (trabalho curto) ou sem índice fica o progresso da fase (RF-10.43)", () => {
    expect(applyChapterProgress(phases, secs("concluido"), false)[1].progress).toBe(0.1);
    expect(applyChapterProgress(phases, [], true)[1].progress).toBe(0.1);
  });
  it("uma fase Desenvolvimento já concluída não muda", () => {
    const done = [{ key: "desenvolvimento", progress: 1, state: "concluida" as const }];
    expect(applyChapterProgress(done, secs("por_iniciar"), true)[0].progress).toBe(1);
  });
});

describe("titlesFromIndex", () => {
  it("limpa linhas vazias, espaços e repetidos (sem distinguir maiúsculas)", () => {
    expect(titlesFromIndex([" 1. Introdução ", "", "1. introdução", "2. Métodos"])).toEqual(["1. Introdução", "2. Métodos"]);
  });
});
