/** Formulário de projeto do admin (M5-07): tipo de serviço obrigatório e repositório só no Tech. */
import { describe, expect, it } from "vitest";
import { readProject, readServiceType } from "@/lib/admin/project-form";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

describe("readServiceType()", () => {
  it("aceita os três tipos", () => {
    for (const t of ["development", "academic", "design"]) expect(readServiceType(form({ servico: t }))).toBe(t);
  });
  it("é obrigatório (RF-30.01)", () => {
    expect(readServiceType(form({}))).toEqual({ error: "Escolha o tipo de serviço do projeto." });
    expect(readServiceType(form({ servico: "outro" }))).toHaveProperty("error");
  });
});

describe("readProject()", () => {
  const base = { projeto: "Convite do casamento", repo: "lemosGit/convite" };

  it("Desenvolvimento guarda o repositório", () => {
    expect(readProject(form(base), "development")).toMatchObject({ github_owner: "lemosGit", github_repo: "convite" });
  });

  it("Académico e Design ignoram o repositório (RF-30.02)", () => {
    for (const t of ["academic", "design"] as const) {
      expect(readProject(form(base), t)).toMatchObject({ github_owner: null, github_repo: null });
    }
  });

  it("um repositório inválido só dá erro no Desenvolvimento", () => {
    const bad = { projeto: "X Y", repo: "não é um repo" };
    expect(readProject(form(bad), "development")).toHaveProperty("error");
    expect(readProject(form(bad), "design")).not.toHaveProperty("error");
  });

  it("gera o slug a partir do nome", () => {
    expect(readProject(form({ projeto: "Monografia — Microcrédito" }), "academic")).toMatchObject({ slug: "monografia-microcredito" });
  });

  it("valida as datas", () => {
    expect(readProject(form({ projeto: "Ab", inicio: "2026-12-10", entrega: "2026-12-01" }), "academic")).toEqual({
      error: "A data de entrega é anterior à data de início.",
    });
  });
});
