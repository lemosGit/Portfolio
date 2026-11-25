/**
 * Galeria de provas do Design (M7-02, RF-20.80…84). Funções puras sobre as séries de ficheiros
 * (lib/files/data) e as aprovações (lib/approvals/model): as provas são os entregáveis com o papel
 * "prova"; cada versão (V1, V2…) pode ter várias imagens (ex.: frente e verso).
 */
import type { Approval } from "@/lib/approvals/model";
import type { FileItem, FileSeries } from "@/lib/files/data";

export type ProofVersion = {
  deliverableId: string;
  label: string;
  versionNo: number;
  createdAt: string;
  /** Nota do João ao carregar a versão. */
  notes: string | null;
  locked: boolean;
  purged: boolean;
  files: FileItem[];
  /** O pedido do cliente que levou a esta versão (RF-20.82): comentário de "pedir alterações" na anterior. */
  request: string | null;
  /** Comentários sobre esta versão (M7-03): as respostas com texto à aprovação desta prova, pela ordem. */
  comments: ProofComment[];
  /** A arte desta versão foi aprovada para produção (M7-04, RF-20.52). */
  approved: boolean;
};

export type ProofComment = { by: "client" | "admin"; kind: "aprovar" | "pedir_alteracoes" | string; text: string; at: string };

export type ProofSeries = {
  key: string;
  title: string;
  /** Mais recente primeiro: versions[0] é a "atual" (RF-20.80). */
  versions: ProofVersion[];
};

const isImage = (f: FileItem) => f.mime.startsWith("image/");

/** A imagem de capa de uma versão: a primeira com miniatura; senão a primeira imagem; senão nenhuma. */
export const coverOf = (v: Pick<ProofVersion, "files">): FileItem | undefined =>
  v.files.find((f) => f.thumbUrl && !f.purged) ?? v.files.find((f) => isImage(f) && !f.purged);

/** Aprovações da prova `label` desta série (pelo título do snapshot e a versão). */
const approvalsFor = (approvals: Approval[], title: string, label: string) =>
  approvals.filter((a) => a.subject === "prova" && a.versionLabel === label && (a.snapshot.title ?? "").toLowerCase() === title.toLowerCase());

/** Comentário de "pedir alterações" do cliente à versão `label` desta série. */
function requestFor(approvals: Approval[], title: string, label: string): string | null {
  const r = approvalsFor(approvals, title, label)
    .flatMap((a) => a.responses)
    .filter((x) => x.kind === "pedir_alteracoes" && x.actorRole === "client" && x.comment)
    .at(-1);
  return r?.comment ?? null;
}

/** Comentários (com texto) à versão `label`, do mais antigo ao mais recente (M7-03, "comentário ligado à versão"). */
function commentsFor(approvals: Approval[], title: string, label: string): ProofComment[] {
  return approvalsFor(approvals, title, label)
    .flatMap((a) => a.responses)
    .filter((x) => x.comment)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((x) => ({ by: x.actorRole, kind: x.kind, text: x.comment!, at: x.createdAt }));
}

/** Séries com o papel "prova" → galeria. A série com a versão mais recente vem primeiro. */
export function proofsFrom(series: FileSeries[], approvals: Approval[] = []): ProofSeries[] {
  return series
    .filter((s) => s.role === "prova" && s.versions.length > 0)
    .map((s) => {
      const versions = [...s.versions].sort((a, b) => b.versionNo - a.versionNo || b.createdAt.localeCompare(a.createdAt));
      return {
        key: s.key,
        title: s.title,
        versions: versions.map((v, i) => {
          const prev = versions[i + 1];
          return {
            deliverableId: v.deliverableId,
            label: v.label,
            versionNo: v.versionNo,
            createdAt: v.createdAt,
            notes: v.notes,
            locked: v.locked,
            purged: v.purged,
            files: v.files,
            request: prev ? requestFor(approvals, s.title, prev.label) : null,
            comments: commentsFor(approvals, s.title, v.label),
            approved: approvalsFor(approvals, s.title, v.label).some((a) => a.status === "aprovada"),
          };
        }),
      };
    })
    .sort((a, b) => b.versions[0].createdAt.localeCompare(a.versions[0].createdAt));
}

/** Par para comparar por omissão: a anterior e a atual (TEL-32). */
export function defaultPair(s: ProofSeries): [ProofVersion, ProofVersion] | null {
  return s.versions.length >= 2 ? [s.versions[1], s.versions[0]] : null;
}

const ORDINAL = ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta"];

/** Título do painel de decisão (wireframe TEL-30): "V2" → "A segunda versão está pronta". */
export function proofReadyTitle(label: string | null | undefined): string {
  const n = Number(/^V(\d+)$/i.exec(label ?? "")?.[1]);
  if (!n) return "A nova versão está pronta";
  return n <= ORDINAL.length ? `A ${ORDINAL[n - 1]} versão está pronta` : `A versão ${n} está pronta`;
}
