// @vitest-environment jsdom
/** M6-09: progresso por capítulos (RF-10.41…43) no próximo passo, no bloco e na página Projeto (TEL-11). */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AcademicChapters } from "@/app/cliente/_blocks/academic";
import { NextStep } from "@/app/cliente/_blocks/common";
import { PhasesProject } from "@/app/cliente/_components/PhasesProject";
import type { Section, SectionStatus } from "@/lib/academic/chapters";
import { academicView } from "./fixture";

vi.mock("@/app/cliente/_components/ProofGallery", () => ({ ProofGallery: () => null })); // lê ficheiros no servidor
vi.mock("@/app/cliente/_components/DesignFinalFiles", () => ({ DesignFinalFiles: () => null }));

vi.mock("@/lib/academic/actions", () => ({ requestAdjustment: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const sections = (...st: SectionStatus[]): Section[] =>
  st.map((status, i) => ({ id: `s${i + 1}`, position: i + 1, title: `${i + 1}. Capítulo ${i + 1}`, status }));

afterEach(cleanup);

describe("Próximo passo na fase Desenvolvimento", () => {
  it("dados de exemplo: '2 de 5 capítulos' e 40%", () => {
    render(<NextStep project={academicView()} unread={0} />);
    expect(screen.getByText("2 de 5 capítulos")).toBeTruthy();
    expect(screen.getByText("40%")).toBeTruthy();
  });

  it("o % acompanha os capítulos: 3 de 4 → 75%", () => {
    render(<NextStep project={academicView({ sections: sections("concluido", "concluido", "concluido", "em_curso") })} unread={0} />);
    expect(screen.getByText("3 de 4 capítulos")).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();
  });

  it("nenhum capítulo pronto: 0% e a barra não aparece", () => {
    render(<NextStep project={academicView({ sections: sections("em_curso", "por_iniciar") })} unread={0} />);
    expect(screen.queryByText(/capítulos/)).toBeNull();
    expect(screen.queryByText("0%")).toBeNull();
  });

  it("trabalho sem capítulos (RF-10.43): fica o progresso da fase", () => {
    render(<NextStep project={academicView({}, { usesChapters: false })} unread={0} />);
    expect(screen.queryByText(/de 5 capítulos/)).toBeNull();
    expect(screen.getByText("Progresso da fase")).toBeTruthy();
  });

  it("sem índice aprovado (sem capítulos): fica o progresso da fase", () => {
    render(<NextStep project={academicView({ sections: [] })} unread={0} />);
    expect(screen.queryByText(/capítulos/)).toBeNull();
  });
});

describe("Bloco Capítulos", () => {
  it("'X de Y concluídos' e o estado de cada um, só o título (D-015)", () => {
    render(<AcademicChapters project={academicView()} unread={0} />);
    const block = screen.getByRole("region", { name: "Capítulos" });
    expect(within(block).getByText("2 de 5")).toBeTruthy();
    const items = within(block).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items[2].textContent).toContain("3. Metodologia");
    expect(items[2].textContent).toContain("Em curso");
  });

  it("não aparece sem capítulos nem num trabalho sem capítulos", () => {
    const a = render(<AcademicChapters project={academicView({ sections: [] })} unread={0} />);
    expect(a.container.innerHTML).toBe("");
    cleanup();
    const b = render(<AcademicChapters project={academicView({}, { usesChapters: false })} unread={0} />);
    expect(b.container.innerHTML).toBe("");
  });
});

describe("Página Projeto (TEL-11)", () => {
  it("os capítulos aparecem dentro da fase Desenvolvimento, por ordem", () => {
    render(<PhasesProject project={academicView()} />);
    const list = screen.getByRole("list", { name: "Capítulos" });
    const items = within(list).getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toHaveLength(5);
    expect(items[0]).toContain("1. Introdução");
    expect(items[0]).toContain("Pronto");
    expect(items[2]).toContain("A escrever");
    expect(items[4]).toContain("Por começar");
  });

  it("todos prontos: 5 de 5 e 100% no próximo passo", () => {
    const v = academicView({ sections: sections("concluido", "concluido", "concluido", "concluido", "concluido") });
    render(<NextStep project={v} unread={0} />);
    expect(screen.getByText("5 de 5 capítulos")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });
});
