// @vitest-environment jsdom
/** M7-09: galeria de provas (ProofViewer) com 1 e com N versões; a versão aprovada fica marcada (M7-04). */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ProofViewer } from "@/app/cliente/_components/ProofViewer";
import type { ProofSeries, ProofVersion } from "@/lib/design/proofs";

vi.mock("@/lib/files/actions", () => ({ fileDownloadUrl: vi.fn() }));

// O jsdom não implementa o <dialog> modal nem o scrollIntoView.
beforeAll(() => {
  Element.prototype.scrollIntoView ??= () => {};
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});
afterEach(cleanup);

const v = (n: number, o: Partial<ProofVersion> = {}): ProofVersion => ({
  deliverableId: `d${n}`,
  label: `V${n}`,
  versionNo: n,
  createdAt: `2026-11-${10 + n}T10:00:00+01:00`,
  notes: null,
  locked: false,
  purged: false,
  files: [
    { id: `f${n}a`, name: `convite-v${n}-frente.jpg`, mime: "image/jpeg", size: 1000, purged: false, thumbUrl: `/t${n}a.webp` },
    { id: `f${n}b`, name: `convite-v${n}-verso.jpg`, mime: "image/jpeg", size: 1000, purged: false, thumbUrl: `/t${n}b.webp` },
  ],
  request: null,
  comments: [],
  approved: false,
  ...o,
});
/** Mais recente primeiro, como proofsFrom. */
const series = (...versions: ProofVersion[]): ProofSeries => ({ key: "convite", title: "Convite", versions });

describe("ProofViewer — 1 versão", () => {
  const one = series(v(1));

  it("Visão geral: a V1 atual em grande, sem 'Outras versões'", () => {
    render(
      <>
        <ProofViewer series={one} view="current" />
        <ProofViewer series={one} view="versions" />
      </>,
    );
    expect(screen.getByText(/V1, atual/)).toBeTruthy();
    expect(screen.getByRole("img", { name: "Convite V1: convite-v1-frente.jpg" })).toBeTruthy();
    expect(screen.queryByText("Outras versões")).toBeNull();
    expect(screen.queryByRole("button", { name: /Comparar/ })).toBeNull();
  });

  it("Projeto (galeria): uma miniatura, marcada como atual, e sem 'Comparar'", () => {
    render(<ProofViewer series={one} view="gallery" />);
    const list = screen.getByRole("list", { name: "Versões" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByText("V1, atual")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Comparar/ })).toBeNull();
  });
});

describe("ProofViewer — N versões", () => {
  const three = series(v(3, { request: "A data é sábado." }), v(2, { request: "Nomes maiores." }), v(1));

  it("Visão geral: a mais recente em grande; as outras pela ordem, cada uma com 'Comparar com a V3'", () => {
    render(
      <>
        <ProofViewer series={three} view="current" />
        <ProofViewer series={three} view="versions" />
      </>,
    );
    expect(screen.getByText(/V3, atual/)).toBeTruthy();
    const others = screen.getByRole("region", { name: "Outras versões" });
    expect(within(others).getAllByRole("listitem").map((li) => li.querySelector("p")?.textContent)).toEqual(["V2", "V1"]);
    expect(within(others).getAllByRole("button", { name: "Comparar com a V3" })).toHaveLength(2);
  });

  it("frente e verso: troca a imagem em grande", async () => {
    render(<ProofViewer series={three} view="current" />);
    await userEvent.click(screen.getByRole("button", { name: "Verso" }));
    expect(screen.getByRole("img", { name: "Convite V3: convite-v3-verso.jpg" })).toBeTruthy();
  });

  it("comparar: abre as duas versões com o pedido que levou à mais recente; com 3+ versões escolhe-se o par", async () => {
    render(<ProofViewer series={three} view="versions" />);
    await userEvent.click(screen.getAllByRole("button", { name: "Comparar com a V3" })[0]);
    const cmp = screen.getByRole("dialog", { name: "Comparar V2 e V3" });
    expect(within(cmp).getByText(/A data é sábado\./)).toBeTruthy();
    expect(within(cmp).getByRole("combobox", { name: "Primeira versão" })).toBeTruthy();
  });

  it("Projeto (galeria): todas lado a lado, a atual marcada, e 'Comparar V2 e V3'", () => {
    render(<ProofViewer series={three} view="gallery" />);
    const list = screen.getByRole("list", { name: "Versões" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("V3, atual")).toBeTruthy();
    expect(within(list).queryByText("V2, atual")).toBeNull();
    expect(screen.getByRole("button", { name: "Comparar V2 e V3" })).toBeTruthy();
  });

  it("ampliar abre a versão escolhida", async () => {
    render(<ProofViewer series={three} view="current" />);
    await userEvent.click(screen.getByRole("button", { name: "Ampliar Convite V3" }));
    expect(screen.getByRole("dialog", { name: "Convite V3" })).toBeTruthy();
  });
});

describe("ProofViewer — arte aprovada (M7-04)", () => {
  const approved = series(v(2, { approved: true }), v(1));

  it("a versão aprovada fica marcada em vez de 'atual', na Visão geral e no Projeto", () => {
    render(
      <>
        <ProofViewer series={approved} view="current" />
        <ProofViewer series={approved} view="gallery" />
      </>,
    );
    expect(screen.getByText(/V2, aprovada para produção/)).toBeTruthy();
    expect(screen.getByText("V2, aprovada")).toBeTruthy();
    expect(screen.queryByText(/V2, atual/)).toBeNull();
  });

  it("uma versão bloqueada (por pagar) não mostra a imagem nem 'Ampliar'", () => {
    render(<ProofViewer series={series(v(1, { locked: true }))} view="current" />);
    expect(screen.queryByRole("img", { name: /Convite V1/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Ampliar/ })).toBeNull();
  });
});

describe("ProofViewer — sem pré-visualização (M7-99)", () => {
  const svg = (n: number): ProofVersion =>
    v(n, { files: [{ id: `s${n}`, name: `convite-v${n}-frente.svg`, mime: "image/svg+xml", size: 1500, purged: false }] });

  it("na miniatura, só o ícone e o tipo, com o nome completo para leitores de ecrã e em title", () => {
    render(<ProofViewer series={series(v(2), svg(1))} view="versions" />);
    const others = screen.getByRole("region", { name: "Outras versões" });
    expect(within(others).getByText("SVG")).toBeTruthy();
    const name = within(others).getByText("convite-v1-frente.svg");
    expect(name.className).toContain("sr-only");
    expect(name.parentElement?.getAttribute("title")).toBe("convite-v1-frente.svg");
  });

  it("na prova grande, o nome inteiro à vista", () => {
    render(<ProofViewer series={series(svg(1))} view="current" />);
    expect(screen.getByText("convite-v1-frente.svg").className).not.toContain("sr-only");
  });
});
