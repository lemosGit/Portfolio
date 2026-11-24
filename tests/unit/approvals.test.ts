/** Bloco Aprovações (M5-10): título, ordem, índice e leitura das linhas. */
import { describe, expect, it } from "vitest";
import { approvalTitle, mapApproval, parseItems, sortApprovals, type Approval } from "@/lib/approvals/model";

const ap = (id: string, status: Approval["status"], requestedAt: string): Approval => ({
  id, subject: "indice", versionLabel: null, snapshot: {}, status, requestedAt, decidedAt: null, phase: null, responses: [],
});

describe("approvalTitle", () => {
  it("usa o título do snapshot e a versão; sem título, o assunto", () => {
    expect(approvalTitle({ subject: "prova", versionLabel: "V3", snapshot: { title: "Convite" } })).toBe("Convite V3");
    expect(approvalTitle({ subject: "indice", versionLabel: null, snapshot: {} })).toBe("Índice");
  });
});

describe("sortApprovals (RF-30.34)", () => {
  it("pendentes primeiro, depois as mais recentes", () => {
    const out = sortApprovals([
      ap("a", "aprovada", "2026-11-10T10:00:00Z"),
      ap("b", "pendente", "2026-11-01T10:00:00Z"),
      ap("c", "alteracoes_pedidas", "2026-11-12T10:00:00Z"),
    ]);
    expect(out.map((x) => x.id)).toEqual(["b", "c", "a"]);
  });
});

describe("parseItems", () => {
  it("um item por linha, sem linhas vazias nem espaços", () => {
    expect(parseItems("1. Introdução\r\n\n  2. Métodos  \n")).toEqual(["1. Introdução", "2. Métodos"]);
  });
});

describe("mapApproval (RF-30.32)", () => {
  it("respostas por ordem de data, com autor e comentário", () => {
    const a = mapApproval({
      id: "x", subject: "indice", version_label: "V1", snapshot: { items: ["1"] }, status: "aprovada",
      requested_at: "2026-11-01T10:00:00Z", decided_at: "2026-11-03T10:00:00Z", project_phases: { position: 3, name: "Estrutura" },
      approval_responses: [
        { kind: "aprovar", comment: null, actor_role: "client", created_at: "2026-11-03T10:00:00Z" },
        { kind: "pedir_alteracoes", comment: "Falta X", actor_role: "client", created_at: "2026-11-02T10:00:00Z" },
      ],
    });
    expect(a.responses.map((r) => r.kind)).toEqual(["pedir_alteracoes", "aprovar"]);
    expect(a.phase).toEqual({ position: 3, name: "Estrutura" });
  });
});
