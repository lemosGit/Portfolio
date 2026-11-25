// @vitest-environment jsdom
/** M7-05: bloco "des-pickup" — previsto, em produção, pronto para levantar (TEL-30 C) e entregue. */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DesignPickup } from "@/app/cliente/_blocks/design";
import { toView } from "@/lib/portal/data";
import { projects } from "@/lib/portal/mock-data";
import type { DesignSpec } from "@/lib/design/spec";
import type { Phase } from "@/lib/portal/types";

vi.mock("@/app/cliente/_components/ProofGallery", () => ({ ProofGallery: () => null }));
vi.mock("@/app/cliente/_components/DesignFinalFiles", () => ({ DesignFinalFiles: () => <p>ficheiros digitais</p> }));

const base = projects.find((p) => p.id === "p_convite")!;
/** Põe a fase `key` em curso (as anteriores concluídas, as seguintes por iniciar). */
const at = (key: string, spec: Partial<DesignSpec> = {}) => {
  const i = base.phases.findIndex((p) => p.key === key);
  const phases: Phase[] = base.phases.map((p, j) => ({ ...p, state: j < i ? "concluida" : j === i ? "em_curso" : "por_iniciar", closed: j < i }));
  return render(<DesignPickup project={toView({ ...base, phases, designSpec: { ...base.designSpec!, ...spec } })} unread={0} />);
};

afterEach(cleanup);

describe("DesignPickup", () => {
  it("antes da produção: só a linha do levantamento previsto (TEL-30 A)", () => {
    at("revisoes");
    expect(screen.getByText(/Levantamento previsto:/).textContent).toContain("Loja GeniusFrela, Talatona");
    expect(screen.queryByText("Pronto para levantar")).toBeNull();
  });

  it("sem data de levantamento antes da produção, não aparece", () => {
    const { container } = at("revisoes", { pickupAt: null });
    expect(container.innerHTML).toBe("");
  });

  it("em produção: o estado com uma frase curta", () => {
    at("producao", { productionStatus: "a_imprimir" });
    expect(screen.getByText("Em produção")).toBeTruthy();
    expect(screen.getByText("Estamos a imprimir as 120 peças.")).toBeTruthy();
  });

  it("pronto: data e local em destaque, mapa, ficheiros digitais e a folga até ao evento (TEL-30 C)", () => {
    at("entrega-levantamento", { productionStatus: "pronto" });
    expect(screen.getByText("Pronto para levantar")).toBeTruthy();
    expect(screen.getByText(/Loja GeniusFrela, Talatona/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Abrir no mapa" }).getAttribute("href")).toContain("google.com/maps/search");
    expect(screen.getByText("ficheiros digitais")).toBeTruthy();
    expect(screen.getByText(/tem 4 dias de folga/)).toBeTruthy();
  });

  it("entregue: a data da entrega", () => {
    at("entrega-levantamento", { deliveredAt: "2026-12-15T11:00:00+01:00" });
    expect(screen.getByText("Peça entregue a 15 de dezembro")).toBeTruthy();
  });
});
