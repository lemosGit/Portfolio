"use server";

/**
 * Bloco Ficheiros (M5-09, ADR-003 §2 e §4, seguranca.md §4).
 * 1. startUpload    — valida, decide os caminhos e devolve URLs de upload assinados + bilhete.
 * 2. o browser envia direto para o Storage (não passa pela Vercel, sem o limite de 4,5 MB).
 * 3. confirmUpload  — lê os primeiros bytes e o tamanho real; só então grava deliverables + files.
 * O download é sempre por URL assinada de 15 minutos (D-083), gerada depois de verificar a RLS.
 *
 * Os buckets não têm políticas para "authenticated" (0007 §8): o Storage só se usa com a chave
 * secreta, e só depois das verificações feitas com a sessão de quem pede.
 */
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/admin/role";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  CLIENT_FILES_PER_PHASE,
  FILES_PER_VERSION,
  LIMITS,
  checkFile,
  isLocked,
  nextVersion,
  seriesKey,
  signatureMatches,
  storagePath,
  versionLabel,
  type Bucket,
  type FileMeta,
  type FileRole,
  PREVIEW,
  hasPreview,
  previewOk,
  previewPath,
  uploadOpen,
} from "./rules";
import { readTicket, signTicket, type TicketFile } from "./ticket";

export type StartInput = {
  projectId: string;
  /** Admin: id da fase (ou vazio). Cliente: obrigatório, e a fase tem de aceitar uploads. */
  phaseId?: string;
  /** Cliente: chave da fase (o portal conhece a chave, não o id). */
  phaseKey?: string;
  /** Admin: entregavel | prova | interno. O cliente envia sempre "referencia" (RN-09). */
  role?: FileRole;
  /** Nova série com este título, ou nova versão da série existente (Q-084). */
  title?: string;
  series?: string;
  notes?: string;
  files: FileMeta[];
};

export type StartResult =
  | { ok: true; ticket: string; uploads: { name: string; url: string; mime: string; previewUrl?: string }[] }
  | { ok: false; error: string };

export type DoneResult = { ok: true; message: string } | { ok: false; error: string };

const OFF = "Os ficheiros precisam do Supabase configurado (modo de demonstração).";

async function session() {
  if (!supabaseEnabled) return undefined;
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user ? { sb, user, admin: isAdminUser(user) } : undefined;
}

function storage() {
  try {
    return createSupabaseAdmin().storage;
  } catch {
    return undefined;
  }
}

/* ───────────── 1. Pedir upload ───────────── */

export async function startUpload(input: StartInput): Promise<StartResult> {
  const s = await session();
  if (!s) return { ok: false, error: supabaseEnabled ? "A sessão terminou. Entre outra vez." : OFF };
  const st = storage();
  if (!st) return { ok: false, error: "Falta a SUPABASE_SECRET_KEY no servidor." };
  const by = s.admin ? "admin" : "client";
  const bucket: Bucket = by === "admin" ? "project-files" : "client-uploads";

  const files = Array.isArray(input.files) ? input.files : [];
  if (files.length === 0) return { ok: false, error: "Escolha pelo menos um ficheiro." };
  if (files.length > FILES_PER_VERSION) return { ok: false, error: `No máximo ${FILES_PER_VERSION} ficheiros de cada vez.` };
  const checked: (TicketFile & { ext: string })[] = [];
  for (const f of files) {
    const c = checkFile(bucket, f);
    if ("error" in c) return { ok: false, error: c.error };
    // A pré-visualização só se pede para imagens e dentro do limite (o servidor volta a validar no passo 3).
    const wantsPreview = hasPreview(c.mime) && Number(f.preview) > 0 && Number(f.preview) <= PREVIEW.maxBytes;
    checked.push({ id: randomUUID(), path: "", name: f.name.trim(), mime: c.mime, size: f.size, ext: c.ext, ...(wantsPreview && { previewPath: "" }) });
  }

  // O projeto tem de ser visível com a sessão de quem pede (RLS: dono ou admin).
  const { data: project } = await s.sb
    .from("projects")
    .select("id, service_type")
    .eq("id", String(input.projectId ?? ""))
    .maybeSingle<{ id: string; service_type: string }>();
  if (!project) return { ok: false, error: "Projeto não encontrado." };

  let phaseId: string | null = null;
  let role: FileRole;
  if (by === "client") {
    role = "referencia";
    const { data: phase } = await s.sb
      .from("project_phases")
      .select("id, name, status, client_can_upload")
      .eq("project_id", project.id)
      .eq("key", String(input.phaseKey ?? ""))
      .maybeSingle<{ id: string; name: string; status: string; client_can_upload: boolean }>();
    // RF-30.41 + D-132: só nas fases com upload, e enquanto a fase não está fechada.
    if (!phase || !phase.client_can_upload || !uploadOpen(phase.status)) {
      return { ok: false, error: "Nesta fase não é possível enviar ficheiros." };
    }
    phaseId = phase.id;
    // RN-09: 10 por fase (o trigger da BD volta a contar no passo 3).
    const { count } = await s.sb
      .from("files")
      .select("id, deliverables!inner (project_phase_id, uploaded_by_role)", { count: "exact", head: true })
      .eq("project_id", project.id)
      .is("purged_at", null)
      .eq("deliverables.project_phase_id", phaseId)
      .eq("deliverables.uploaded_by_role", "client");
    const left = CLIENT_FILES_PER_PHASE - (count ?? 0);
    if (files.length > left) {
      return {
        ok: false,
        error: left <= 0 ? "Já enviou 10 ficheiros nesta fase." : `Nesta fase só pode enviar mais ${left} ficheiro${left === 1 ? "" : "s"}.`,
      };
    }
  } else {
    role = input.role ?? "entregavel";
    if (!["entregavel", "prova", "interno"].includes(role)) return { ok: false, error: "Papel do ficheiro inválido." };
    if (input.phaseId) {
      const { data: phase } = await s.sb
        .from("project_phases")
        .select("id")
        .eq("id", input.phaseId)
        .eq("project_id", project.id)
        .maybeSingle<{ id: string }>();
      if (!phase) return { ok: false, error: "Fase não encontrada." };
      phaseId = phase.id;
    }
  }

  // Série: nova (título) ou nova versão de uma existente (Q-084).
  let key: string;
  let title: string | null;
  if (by === "client") {
    // O cliente junta sempre à sua série de referências da fase; não escolhe séries do admin.
    key = seriesKey(`ref-${input.phaseKey}`);
    title = "Referências";
  } else if (input.series) {
    const { data: prev } = await s.sb
      .from("deliverables")
      .select("title")
      .eq("project_id", project.id)
      .eq("series_key", input.series)
      .limit(1)
      .maybeSingle<{ title: string | null }>();
    if (!prev) return { ok: false, error: "Série não encontrada." };
    key = input.series;
    title = prev.title;
  } else {
    title = (input.title ?? "").trim();
    if (!title) return { ok: false, error: "Dê um título ao ficheiro (ex.: Convite, Entrega final)." };
    if (title.length > 120) return { ok: false, error: "O título tem no máximo 120 caracteres." };
    key = seriesKey(title);
    const { count } = await s.sb
      .from("deliverables")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id)
      .eq("series_key", key);
    if (count) return { ok: false, error: `Já existe “${title}”. Escolha “Nova versão de: ${title}”.` };
  }
  const notes = (input.notes ?? "").trim() || null;
  if (notes && notes.length > 1000) return { ok: false, error: "As notas têm no máximo 1000 caracteres." };

  const deliverableId = randomUUID();
  const uploads: { name: string; url: string; mime: string; previewUrl?: string }[] = [];
  for (const f of checked) {
    f.path = storagePath(project.id, deliverableId, f.id, f.ext);
    const { data, error } = await st.from(bucket).createSignedUploadUrl(f.path);
    if (error || !data) return { ok: false, error: `Não foi possível preparar o envio: ${error?.message ?? "erro"}` };
    let previewUrl: string | undefined;
    if (f.previewPath !== undefined) {
      f.previewPath = previewPath(f.path);
      const pv = await st.from(bucket).createSignedUploadUrl(f.previewPath);
      if (pv.data) previewUrl = pv.data.signedUrl;
      else delete f.previewPath; // sem pré-visualização: segue só com o original
    }
    uploads.push({ name: f.name, url: data.signedUrl, mime: f.mime, ...(previewUrl && { previewUrl }) });
  }

  const ticket = signTicket({
    uid: s.user.id,
    by,
    projectId: project.id,
    phaseId,
    role,
    bucket,
    deliverableId,
    seriesKey: key,
    title,
    notes,
    files: checked.map(({ ext: _ext, ...f }) => f),
  });
  return { ok: true, ticket, uploads };
}

/* ───────────── 3. Confirmar ───────────── */

const HEAD_BYTES = 4096;

/** Primeiros bytes e tamanho real do objeto (pedido com Range a um URL assinado curto). */
async function probe(st: NonNullable<ReturnType<typeof storage>>, bucket: Bucket, path: string) {
  const { data } = await st.from(bucket).createSignedUrl(path, 60);
  if (!data) return undefined;
  const res = await fetch(data.signedUrl, { headers: { Range: `bytes=0-${HEAD_BYTES - 1}` }, cache: "no-store" });
  if (!res.ok) return undefined;
  const total = res.headers.get("content-range")?.split("/")[1];
  const size = Number(total ?? res.headers.get("content-length") ?? NaN);
  const head = new Uint8Array((await res.arrayBuffer()).slice(0, HEAD_BYTES));
  return { size, head };
}

export async function confirmUpload(token: string): Promise<DoneResult> {
  const s = await session();
  if (!s) return { ok: false, error: supabaseEnabled ? "A sessão terminou. Entre outra vez." : OFF };
  const t = readTicket(String(token ?? ""), s.user.id);
  if ("error" in t) return { ok: false, error: t.error };
  const st = storage();
  if (!st) return { ok: false, error: "Falta a SUPABASE_SECRET_KEY no servidor." };
  const paths = t.files.flatMap((f) => (f.previewPath ? [f.path, f.previewPath] : [f.path]));
  const discard = async (error: string): Promise<DoneResult> => {
    await st.from(t.bucket).remove(paths);
    return { ok: false, error };
  };

  const real: number[] = [];
  for (const f of t.files) {
    const p = await probe(st, t.bucket, f.path);
    if (!p) return discard(`“${f.name}” não chegou ao armazenamento. Tente outra vez.`);
    if (!(p.size > 0) || p.size > LIMITS[t.bucket].maxBytes) return discard(`“${f.name}” tem um tamanho inválido.`);
    if (!signatureMatches(f.mime, p.head)) {
      return discard(`“${f.name}” não parece ser um ficheiro ${f.name.split(".").pop()?.toUpperCase() ?? ""} válido.`); // D-084
    }
    real.push(p.size);
  }

  // Pré-visualizações (ADR-003 §3): RIFF…WEBP, ≤ 150 KB, ≤ 1600 px. Uma inválida apaga-se e a versão fica sem ela.
  const thumbs: (string | null)[] = [];
  for (const f of t.files) {
    if (!f.previewPath) {
      thumbs.push(null);
      continue;
    }
    const pv = await probe(st, t.bucket, f.previewPath);
    if (pv && previewOk(pv.head, pv.size)) thumbs.push(f.previewPath);
    else {
      if (pv) await st.from(t.bucket).remove([f.previewPath]);
      thumbs.push(null);
    }
  }

  // Admin grava com a sua sessão (RLS); o cliente não tem política de insert: chave secreta,
  // com created_by = o cliente (seguranca.md §4). Os triggers (bloqueio RN-14, limite RN-09) correm na mesma.
  const db = t.by === "admin" ? s.sb : createSupabaseAdmin();
  const { data: prev } = await db
    .from("deliverables")
    .select("version_no")
    .eq("project_id", t.projectId)
    .eq("series_key", t.seriesKey)
    .returns<{ version_no: number }[]>();
  const n = nextVersion((prev ?? []).map((r) => r.version_no));

  const { error: de } = await db.from("deliverables").insert({
    id: t.deliverableId,
    project_id: t.projectId,
    project_phase_id: t.phaseId,
    role: t.role,
    series_key: t.seriesKey,
    version_no: n,
    label: versionLabel(n),
    title: t.title,
    notes: t.notes,
    uploaded_by_role: t.by,
    created_by: s.user.id,
  });
  if (de) return discard(de.code === "23505" ? "Outra versão foi enviada ao mesmo tempo. Tente outra vez." : `Não foi possível registar: ${de.message}`);

  const { error: fe } = await db.from("files").insert(
    t.files.map((f, i) => ({
      id: f.id,
      deliverable_id: t.deliverableId,
      project_id: t.projectId,
      bucket: t.bucket,
      storage_path: f.path,
      original_name: f.name,
      mime_type: f.mime,
      size_bytes: real[i],
      thumb_path: thumbs[i],
    })),
  );
  if (fe) {
    // Ninguém tem política de delete em deliverables: desfazer com a chave secreta.
    await createSupabaseAdmin().from("deliverables").delete().eq("id", t.deliverableId);
    return discard(fe.message.includes("10 ficheiros") ? "Já enviou 10 ficheiros nesta fase." : `Não foi possível registar: ${fe.message}`);
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/cliente", "layout");
  const what = t.files.length === 1 ? "Ficheiro enviado" : `${t.files.length} ficheiros enviados`;
  return { ok: true, message: `${what} (${versionLabel(n)}${t.title ? ` de “${t.title}”` : ""}).` };
}

/* ───────────── Download ───────────── */

export async function fileDownloadUrl(fileId: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const s = await session();
  if (!s) return { ok: false, error: supabaseEnabled ? "A sessão terminou. Entre outra vez." : "Ficheiro de exemplo: no modo de demonstração não há download." };
  // Lido com a sessão de quem pede: a RLS só devolve ficheiros do seu projeto e nunca os internos.
  const { data: f } = await s.sb
    .from("files")
    .select("bucket, storage_path, original_name, purged_at, deliverables (locked_by_payment_id, payments (status))")
    .eq("id", String(fileId ?? ""))
    .maybeSingle<{
      bucket: Bucket;
      storage_path: string;
      original_name: string;
      purged_at: string | null;
      deliverables: { locked_by_payment_id: string | null; payments: { status: string } | null } | null;
    }>();
  if (!f) return { ok: false, error: "Ficheiro não encontrado." };
  if (f.purged_at) return { ok: false, error: "Este ficheiro já foi apagado do armazenamento (90 dias depois da conclusão)." };
  if (!s.admin && isLocked(f.deliverables?.locked_by_payment_id ?? null, f.deliverables?.payments?.status)) {
    return { ok: false, error: "Este ficheiro fica disponível depois de o pagamento estar registado." }; // RF-30.44
  }
  const st = storage();
  if (!st) return { ok: false, error: "Falta a SUPABASE_SECRET_KEY no servidor." };
  const { data, error } = await st.from(f.bucket).createSignedUrl(f.storage_path, 15 * 60, { download: f.original_name });
  if (error || !data) return { ok: false, error: "Não foi possível gerar o link. Tente outra vez." };
  return { ok: true, url: data.signedUrl };
}
