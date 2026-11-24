/** Bloco Ficheiros (M5-09): tipos e limites, assinatura dos bytes, versões, bloqueio e bilhete. */
import { beforeAll, describe, expect, it } from "vitest";
import { groupSeries, type DeliverableRow } from "@/lib/files/data";
import { checkFile, clientMayUpload, isLocked, nextVersion, seriesKey, signatureMatches } from "@/lib/files/rules";

const bytes = (...xs: (number | string)[]) =>
  new Uint8Array(xs.flatMap((x) => (typeof x === "string" ? [...x].map((c) => c.charCodeAt(0)) : [x])));

describe("checkFile (RF-30.42, D-024, D-054)", () => {
  it("o cliente envia PDF até 10 MB, mas não ZIP nem 11 MB", () => {
    expect(checkFile("client-uploads", { name: "normas.pdf", type: "application/pdf", size: 1000 })).toEqual({ mime: "application/pdf", ext: "pdf" });
    expect(checkFile("client-uploads", { name: "x.zip", type: "application/zip", size: 1000 })).toHaveProperty("error");
    expect(checkFile("client-uploads", { name: "x.pdf", type: "application/pdf", size: 11 * 1024 * 1024 })).toHaveProperty("error");
  });
  it("o admin envia ZIP até 50 MB; HEIC sem tipo é reconhecido pela extensão", () => {
    expect(checkFile("project-files", { name: "finais.zip", type: "application/zip", size: 40 * 1024 * 1024 })).toHaveProperty("ext", "zip");
    expect(checkFile("client-uploads", { name: "foto.HEIC", type: "", size: 2000 })).toHaveProperty("mime", "image/heic");
  });
  it("recusa ficheiros vazios", () => {
    expect(checkFile("client-uploads", { name: "a.png", type: "image/png", size: 0 })).toHaveProperty("error");
  });
});

describe("signatureMatches (D-084)", () => {
  it("reconhece PDF, PNG, JPEG, WebP, HEIC e DOCX pelos bytes", () => {
    expect(signatureMatches("application/pdf", bytes("%PDF-1.7"))).toBe(true);
    expect(signatureMatches("image/png", bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a))).toBe(true);
    expect(signatureMatches("image/jpeg", bytes(0xff, 0xd8, 0xff, 0xe0))).toBe(true);
    expect(signatureMatches("image/webp", bytes("RIFF", 0, 0, 0, 0, "WEBP"))).toBe(true);
    expect(signatureMatches("image/heic", bytes(0, 0, 0, 0x18, "ftypheic"))).toBe(true);
    expect(signatureMatches("application/vnd.openxmlformats-officedocument.wordprocessingml.document", bytes("PK", 3, 4, "....[Content_Types].xml"))).toBe(true);
  });
  it("um executável com extensão .pdf não passa; um ZIP qualquer não é DOCX", () => {
    expect(signatureMatches("application/pdf", bytes("MZ", 0x90, 0))).toBe(false);
    expect(signatureMatches("application/vnd.openxmlformats-officedocument.wordprocessingml.document", bytes("PK", 3, 4, "outro.txt"))).toBe(false);
  });
});

describe("séries, versões e bloqueio", () => {
  it("seriesKey tira acentos e limita a 40", () => {
    expect(seriesKey("Convite de Casamento — Ação")).toBe("convite-de-casamento-acao");
    expect(seriesKey("a".repeat(60))).toHaveLength(40);
    expect(seriesKey("!!!")).toBe("ficheiro");
  });
  it("nextVersion continua a partir da maior (RF-30.43)", () => {
    expect(nextVersion([])).toBe(1);
    expect(nextVersion([1, 3, 2])).toBe(4);
  });
  it("bloqueado até o pagamento estar pago; anulado/invisível continua bloqueado (RF-30.44)", () => {
    expect(isLocked(null, undefined)).toBe(false);
    expect(isLocked("p1", "pendente")).toBe(true);
    expect(isLocked("p1", null)).toBe(true);
    expect(isLocked("p1", "pago")).toBe(false);
  });
  it("o cliente só envia em fases com upload e a decorrer (RF-30.41, D-132)", () => {
    expect(clientMayUpload({ clientCanUpload: true, state: "em_curso" })).toBe(true);
    expect(clientMayUpload({ clientCanUpload: true, state: "concluida" })).toBe(false);
    expect(clientMayUpload({ clientCanUpload: true, state: "por_iniciar" })).toBe(false);
    expect(clientMayUpload({ clientCanUpload: false, state: "em_curso" })).toBe(false);
  });
});

describe("groupSeries", () => {
  const row = (id: string, series: string, v: number, created: string, extra: Partial<DeliverableRow> = {}): DeliverableRow => ({
    id, role: "prova", series_key: series, version_no: v, label: `V${v}`, title: series, notes: null, uploaded_by_role: "admin",
    locked_by_payment_id: null, created_at: created, purged_at: null, project_phases: null, payments: null, files: [], ...extra,
  });
  it("agrupa por série, versões por data (mais recente primeiro) e séries com novidades primeiro", () => {
    const s = groupSeries([
      row("a1", "convite", 1, "2026-11-01T10:00:00Z"),
      row("b1", "lona", 1, "2026-11-05T10:00:00Z"),
      row("a2", "convite", 2, "2026-11-10T10:00:00Z"),
    ]);
    expect(s.map((x) => x.key)).toEqual(["convite", "lona"]);
    expect(s[0].versions.map((v) => v.label)).toEqual(["V2", "V1"]);
  });
  it("marca a versão bloqueada por um pagamento por pagar", () => {
    const [s] = groupSeries([row("f", "final", 1, "2026-11-01T10:00:00Z", { locked_by_payment_id: "p", payments: { status: "pendente" } })]);
    expect(s.versions[0].locked).toBe(true);
  });
});

describe("bilhete de upload (D-131)", () => {
  beforeAll(() => {
    process.env.SUPABASE_SECRET_KEY = "sb_secret_teste";
  });
  const base = {
    uid: "u1", by: "client" as const, projectId: "p", phaseId: "f", role: "referencia" as const, bucket: "client-uploads" as const,
    deliverableId: "d", seriesKey: "ref", title: "Referências", notes: null, files: [{ id: "x", path: "p/d/x.pdf", name: "a.pdf", mime: "application/pdf", size: 10 }],
  };
  it("lê o bilhete assinado pelo mesmo utilizador", async () => {
    const { readTicket, signTicket } = await import("@/lib/files/ticket");
    expect(readTicket(signTicket(base), "u1")).toMatchObject({ projectId: "p", files: base.files });
  });
  it("recusa outro utilizador, alterações e bilhetes expirados", async () => {
    const { readTicket, signTicket } = await import("@/lib/files/ticket");
    const t = signTicket(base);
    expect(readTicket(t, "u2")).toHaveProperty("error");
    const [body, mac] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, "base64url").toString()), projectId: "outro" })).toString("base64url");
    expect(readTicket(`${forged}.${mac}`, "u1")).toHaveProperty("error");
    expect(readTicket(signTicket(base, 0), "u1", Date.now())).toHaveProperty("error");
  });
});
