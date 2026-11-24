/**
 * Limpeza diária dos ficheiros (#122, ADR-003 §4, D-085). Só no servidor, com a chave secreta.
 * 1. Avisa o João dos projetos a ≤ 7 dias da limpeza (RN-08).
 * 2. Apaga do Storage os ficheiros dos projetos com a data de limpeza já passada; fica o registo
 *    (`purged_at`; o trigger de auditoria grava "purge" no activity_log).
 * 3. Apaga os uploads órfãos (sem linha em `files`) com mais de 24 h.
 * A conclusão automática do Académico (ADR-003 §4.4) chega com os pedidos de ajuste (M6).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { profile } from "@/lib/data";
import { sendEmail } from "@/lib/email/send";
import { retentionWarningEmail } from "@/lib/email/templates";
import { todayLuanda } from "@/lib/payments/model";
import { classify, isOrphan } from "./retention";
import type { Bucket } from "./rules";

if (typeof window !== "undefined") throw new Error("lib/files/cleanup.ts só pode correr no servidor.");

const BUCKETS: Bucket[] = ["project-files", "client-uploads"];

type ProjectRow = {
  id: string;
  name: string;
  files_purge_on: string | null;
  clients: { name: string } | null;
  files: { count: number }[];
};

export type CleanupReport = {
  warned: string[];
  purged: { projectId: string; files: number }[];
  orphans: number;
  errors: string[];
};

/** Lista recursiva (projeto/versão/ficheiro) de um bucket. */
async function listAll(sb: SupabaseClient, bucket: Bucket, prefix = "", depth = 0): Promise<{ path: string; createdAt: string }[]> {
  const out: { path: string; createdAt: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    for (const o of data ?? []) {
      const path = prefix ? `${prefix}/${o.name}` : o.name;
      if (o.id === null) {
        if (depth < 3) out.push(...(await listAll(sb, bucket, path, depth + 1)));
      } else out.push({ path, createdAt: o.created_at ?? new Date(0).toISOString() });
    }
    if (!data || data.length < 1000) break;
  }
  return out;
}

export async function runCleanup(sb: SupabaseClient, now = Date.now()): Promise<CleanupReport> {
  const report: CleanupReport = { warned: [], purged: [], orphans: 0, errors: [] };
  const today = todayLuanda(now);

  // 1–2. Projetos concluídos ou cancelados com ficheiros por apagar.
  const { data: projects, error } = await sb
    .from("projects")
    .select("id, name, files_purge_on, clients (name), files (count)")
    .in("status", ["entregue", "cancelado"])
    .is("files.purged_at", null)
    .returns<ProjectRow[]>();
  if (error) throw new Error(`projects: ${error.message}`);

  const { warn, purge } = classify(
    (projects ?? []).map((p) => ({ ...p, purgeOn: p.files_purge_on, hasFiles: (p.files?.[0]?.count ?? 0) > 0 })),
    today,
  );

  if (warn.length) {
    const r = await sendEmail({
      to: process.env.ADMIN_EMAIL ?? profile.email,
      ...retentionWarningEmail({
        projects: warn.map((p) => ({ id: p.id, name: p.name, clientName: p.clients?.name ?? "—", purgeOn: p.purgeOn!, days: p.days })),
      }),
    });
    if (r.sent) report.warned = warn.map((p) => p.id);
    else report.errors.push(`aviso: ${r.reason}`);
  }

  for (const p of purge) {
    const { data: files, error: fe } = await sb
      .from("files")
      .select("id, bucket, storage_path, thumb_path")
      .eq("project_id", p.id)
      .is("purged_at", null)
      .returns<{ id: string; bucket: Bucket; storage_path: string; thumb_path: string | null }[]>();
    if (fe) {
      report.errors.push(`${p.id}: ${fe.message}`);
      continue;
    }
    let ok = true;
    for (const bucket of BUCKETS) {
      const paths = (files ?? []).filter((f) => f.bucket === bucket).flatMap((f) => [f.storage_path, ...(f.thumb_path ? [f.thumb_path] : [])]);
      for (let i = 0; i < paths.length; i += 100) {
        const { error: re } = await sb.storage.from(bucket).remove(paths.slice(i, i + 100));
        if (re) {
          ok = false;
          report.errors.push(`${p.id}/${bucket}: ${re.message}`);
        }
      }
    }
    // Só marca como apagado o que saiu mesmo do Storage; se falhar, tenta outra vez amanhã.
    if (!ok) continue;
    const at = new Date(now).toISOString();
    await sb.from("files").update({ purged_at: at }).eq("project_id", p.id).is("purged_at", null);
    await sb.from("deliverables").update({ purged_at: at }).eq("project_id", p.id).is("purged_at", null);
    report.purged.push({ projectId: p.id, files: files?.length ?? 0 });
  }

  // 3. Órfãos: objetos com mais de 24 h que nenhuma linha de `files` conhece (original ou miniatura).
  const { data: known, error: ke } = await sb.from("files").select("storage_path, thumb_path").is("purged_at", null);
  if (ke) {
    report.errors.push(`files: ${ke.message}`);
    return report;
  }
  const knownPaths = new Set((known ?? []).flatMap((f) => [f.storage_path, ...(f.thumb_path ? [f.thumb_path] : [])]));
  for (const bucket of BUCKETS) {
    try {
      const orphans = (await listAll(sb, bucket)).filter((o) => isOrphan(o, knownPaths, now)).map((o) => o.path);
      for (let i = 0; i < orphans.length; i += 100) {
        const { error: re } = await sb.storage.from(bucket).remove(orphans.slice(i, i + 100));
        if (re) report.errors.push(`órfãos ${bucket}: ${re.message}`);
        else report.orphans += orphans.slice(i, i + 100).length;
      }
    } catch (e) {
      report.errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  return report;
}
