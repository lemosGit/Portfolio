/** M7-02: galeria de provas — séries "prova", versões mais recentes primeiro, pedido que levou a cada versão. */
import { describe, expect, it } from "vitest";
import type { Approval } from "@/lib/approvals/model";
import { coverOf, defaultPair, proofsFrom } from "@/lib/design/proofs";
import type { FileSeries, FileVersion } from "@/lib/files/data";

const ver = (n: number, day: string, files: FileVersion["files"] = [{ id: `f${n}`, name: `convite-v${n}-frente.jpg`, mime: "image/jpeg", size: 1000, purged: false, thumbUrl: `/t${n}.webp` }]): FileVersion => ({
  deliverableId: `d${n}`, versionNo: n, label: `V${n}`, notes: null, uploadedBy: "admin", createdAt: `2026-11-${day}T10:00:00+01:00`, locked: false, purged: false, files,
});
const series = (key: string, role: FileSeries["role"], versions: FileVersion[]): FileSeries => ({ key, title: key === "convite" ? "Convite" : key, role, phase: null, versions });
const approval = (label: string, comment: string): Approval => ({
  id: `ap${label}`, subject: "prova", versionLabel: label, snapshot: { title: "Convite" }, status: "alteracoes_pedidas", requestedAt: "", decidedAt: "", phase: null,
  responses: [{ kind: "pedir_alteracoes", comment, actorRole: "client", createdAt: "" }],
});

describe("proofsFrom", () => {
  it("só as séries 'prova', a versão mais recente primeiro", () => {
    const out = proofsFrom([series("refs", "referencia", [ver(1, "10")]), series("convite", "prova", [ver(1, "20"), ver(3, "24"), ver(2, "22")])]);
    expect(out).toHaveLength(1);
    expect(out[0].versions.map((v) => v.label)).toEqual(["V3", "V2", "V1"]);
  });

  it("cada versão traz o pedido do cliente à versão anterior (RF-20.82)", () => {
    const out = proofsFrom([series("convite", "prova", [ver(1, "20"), ver(2, "22")])], [approval("V1", "Os nomes podem ser maiores?")]);
    expect(out[0].versions[0].request).toBe("Os nomes podem ser maiores?");
    expect(out[0].versions[1].request).toBeNull();
    // M7-03: o comentário fica ligado à versão comentada (V1)
    expect(out[0].versions[1].comments).toEqual([{ by: "client", kind: "pedir_alteracoes", text: "Os nomes podem ser maiores?", at: "" }]);
    expect(out[0].versions[0].comments).toEqual([]);
  });

  it("a série com a versão mais recente vem primeiro", () => {
    const out = proofsFrom([series("logo", "prova", [ver(1, "10")]), series("convite", "prova", [ver(1, "20")])]);
    expect(out.map((s) => s.key)).toEqual(["convite", "logo"]);
  });

  it("par para comparar: anterior e atual; com uma só versão, nenhum", () => {
    const [s] = proofsFrom([series("convite", "prova", [ver(1, "20"), ver(2, "22")])]);
    expect(defaultPair(s)!.map((v) => v.label)).toEqual(["V1", "V2"]);
    expect(defaultPair(proofsFrom([series("convite", "prova", [ver(1, "20")])])[0])).toBeNull();
  });

  it("capa: a primeira com miniatura; um PDF sem miniatura não é capa", () => {
    const pdf = { id: "p", name: "prova.pdf", mime: "application/pdf", size: 1, purged: false };
    expect(coverOf({ files: [pdf, ...ver(2, "22").files] })?.id).toBe("f2");
    expect(coverOf({ files: [pdf] })).toBeUndefined();
  });
});
