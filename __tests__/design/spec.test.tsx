// @vitest-environment jsdom
/** M7-01: bloco "Ficha técnica" do Design — atrás de "Ver detalhes da peça" (RF-20.12). */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DesignSpecBlock } from "@/app/cliente/_blocks/design";
import { toView } from "@/lib/portal/data";
import { projects } from "@/lib/portal/mock-data";
import type { DesignSpec } from "@/lib/design/spec";

const base = projects.find((p) => p.id === "p_convite")!;
const show = (over: Partial<DesignSpec> | null) =>
  render(<DesignSpecBlock project={toView({ ...base, designSpec: over === null ? undefined : { ...base.designSpec!, ...over } })} unread={0} />);

afterEach(cleanup);

describe("DesignSpecBlock", () => {
  it("fechado na primeira vista, com o link 'Ver detalhes da peça'", () => {
    show({});
    const details = screen.getByText("Ver detalhes da peça").closest("details")!;
    expect(details.open).toBe(false);
  });

  it("mostra medidas, material, quantidade, acabamento, impressão e os textos pela ordem", () => {
    show({});
    const block = screen.getByRole("region", { name: "Ficha técnica" });
    expect(within(block).getByText("14,8 × 21 cm · A5 fechado; A4 aberto")).toBeTruthy();
    expect(within(block).getByText("Papel couché 300 g")).toBeTruthy();
    expect(within(block).getByText("120")).toBeTruthy();
    expect(within(block).getByText("Laminação mate e envelope kraft")).toBeTruthy();
    expect(within(block).getByText("Sim")).toBeTruthy();
    const texts = within(block).getAllByRole("listitem").map((li) => li.textContent);
    expect(texts[0]).toBe("NoivosAna & Paulo");
    expect(texts).toHaveLength(4);
  });

  it("sem impressão e sem campos opcionais: esconde as linhas vazias", () => {
    show({ pieceType: "logotipo_identidade", pieceLabel: null, widthCm: null, heightCm: null, sizeNotes: null, material: null, finish: null, hasPrint: false, eventDate: null, keyTexts: [] });
    const block = screen.getByRole("region", { name: "Ficha técnica" });
    expect(within(block).getByText("Logótipo e identidade")).toBeTruthy();
    expect(within(block).getByText("Não (só design)")).toBeTruthy();
    expect(within(block).queryByText("Medidas")).toBeNull();
    expect(within(block).queryByText("Textos da peça")).toBeNull();
  });

  it("sem ficha técnica não aparece", () => {
    const { container } = show(null);
    expect(container.innerHTML).toBe("");
  });
});
