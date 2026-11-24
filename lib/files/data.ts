/**
 * Leitura dos ficheiros de um projeto, agrupados por série e versão (M5-09).
 * Usa a sessão de quem pede: a RLS deixa o cliente ver só o seu projeto e nunca os "internos".
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { isLocked, type FileRole } from "./rules";

export type FileItem = { id: string; name: string; mime: string; size: number; purged: boolean; /** Miniatura WebP (URL assinada de 15 min), #122. */ thumbUrl?: string };

export type FileVersion = {
  deliverableId: string;
  versionNo: number;
  label: string;
  notes: string | null;
  uploadedBy: "admin" | "client";
  createdAt: string;
  locked: boolean;
  purged: boolean;
  files: FileItem[];
};

export type FileSeries = {
  key: string;
  title: string;
  role: FileRole;
  phase: { key: string; name: string; position: number } | null;
  /** Mais recente primeiro (a "atual"). */
  versions: FileVersion[];
};

export type DeliverableRow = {
  id: string;
  role: FileRole;
  series_key: string;
  version_no: number;
  label: string;
  title: string | null;
  notes: string | null;
  uploaded_by_role: "admin" | "client";
  locked_by_payment_id: string | null;
  created_at: string;
  purged_at: string | null;
  project_phases: { key: string; name: string; position: number } | null;
  payments: { status: string } | null;
  files: { id: string; original_name: string; mime_type: string; size_bytes: number; purged_at: string | null; bucket?: string; thumb_path?: string | null }[];
};

export const DELIVERABLE_COLS =
  "id, role, series_key, version_no, label, title, notes, uploaded_by_role, locked_by_payment_id, created_at, purged_at, project_phases (key, name, position), payments (status), files (id, original_name, mime_type, size_bytes, purged_at, bucket, thumb_path)";

/** Linhas → séries com as versões por data, mais recente primeiro (critério "versões ordenadas por data"). Pura. */
export function groupSeries(rows: DeliverableRow[]): FileSeries[] {
  const map = new Map<string, FileSeries>();
  const sorted = [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at) || b.version_no - a.version_no);
  for (const r of sorted) {
    let s = map.get(r.series_key);
    if (!s) {
      s = { key: r.series_key, title: r.title ?? r.series_key, role: r.role, phase: r.project_phases, versions: [] };
      map.set(r.series_key, s);
    }
    s.versions.push({
      deliverableId: r.id,
      versionNo: r.version_no,
      label: r.label,
      notes: r.notes,
      uploadedBy: r.uploaded_by_role,
      createdAt: r.created_at,
      // Um pagamento anulado não chega ao cliente (RLS): payments = null → continua bloqueado.
      locked: isLocked(r.locked_by_payment_id, r.payments?.status),
      purged: Boolean(r.purged_at),
      files: r.files
        .map((f) => ({ id: f.id, name: f.original_name, mime: f.mime_type, size: f.size_bytes, purged: Boolean(f.purged_at) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  }
  // Séries com novidades primeiro.
  return [...map.values()].sort((a, b) => b.versions[0].createdAt.localeCompare(a.versions[0].createdAt));
}

export async function loadSeries(sb: SupabaseClient, projectId: string): Promise<FileSeries[] | { error: string }> {
  const { data, error } = await sb
    .from("deliverables")
    .select(DELIVERABLE_COLS)
    .eq("project_id", projectId)
    .returns<DeliverableRow[]>();
  if (error) {
    console.error(`[ficheiros] Falha a ler os ficheiros do projeto ${projectId}:`, error.message);
    return { error: "Não foi possível ler os ficheiros." };
  }
  const rows = data ?? [];
  const thumbs = await signThumbs(rows);
  return groupSeries(rows).map((s) => ({
    ...s,
    versions: s.versions.map((v) => ({ ...v, files: v.files.map((f) => (thumbs.has(f.id) ? { ...f, thumbUrl: thumbs.get(f.id) } : f)) })),
  }));
}

/**
 * URLs assinadas das miniaturas (#122). As linhas já passaram pela RLS de quem pede; os buckets
 * não têm políticas, por isso assina-se com a chave secreta. Uma versão bloqueada por pagamento
 * não mostra miniatura: não mostra conteúdo nenhum (RF-30.44).
 */
async function signThumbs(rows: DeliverableRow[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const wanted = rows
    .filter((r) => !r.purged_at && !isLocked(r.locked_by_payment_id, r.payments?.status))
    .flatMap((r) => r.files.filter((f) => f.thumb_path && f.bucket && !f.purged_at).map((f) => ({ id: f.id, bucket: f.bucket!, path: f.thumb_path! })));
  if (!wanted.length) return out;
  let storage;
  try {
    storage = (await import("@/lib/supabase/admin")).createSupabaseAdmin().storage;
  } catch {
    return out;
  }
  for (const bucket of new Set(wanted.map((w) => w.bucket))) {
    const list = wanted.filter((w) => w.bucket === bucket);
    const { data } = await storage.from(bucket).createSignedUrls(list.map((w) => w.path), 15 * 60);
    data?.forEach((d, i) => d.signedUrl && out.set(list[i].id, d.signedUrl));
  }
  return out;
}
