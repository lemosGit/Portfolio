"use server";

/**
 * Ações do painel /admin. Cada uma começa por requireAdmin().
 * Tabelas: sessão do administrador (RLS). Contas: chave secreta (createSupabaseAdmin).
 */
import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { githubTag, setIssueVisible } from "@/lib/github/phases";
import { redirect } from "next/navigation";
import { emailNote, sendEmail, type SendResult } from "@/lib/email/send";
import { accessLinkEmail, approvalRequestEmail, demoEmail, meetingEmail, paymentEmail, phaseEmail, replyEmail } from "@/lib/email/templates";
import { LINKS_PER_HOUR, LINK_TTL_MS, entryUrl, looksLikeToken, type LinkChannel } from "@/lib/access/links";
import { digest } from "@/lib/access/digest";
import { SITE_URL } from "@/lib/email/send";
import { kz, parseKz, todayLuanda, type PaymentKind } from "@/lib/payments/model";
import { postponeTo } from "@/lib/files/retention";
import { readBrief } from "@/lib/academic/brief";
import { approvalTitle, parseItems, type ApprovalSnapshot, type ApprovalSubject } from "@/lib/approvals/model";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { DbPhaseState, ServiceType } from "@/lib/portal/types";
import {
  ADMIN_PHASE_COLS,
  PHASE_LABEL,
  isTransitionAllowed,
  mapAdminPhase,
  needsNote,
  planAdvance,
  planBack,
  readPhaseDetails,
  type AdminPhaseRow,
  type Step,
} from "./phases";
import { opt, readProject, readServiceType, str } from "./project-form";
import { requireAdminStrict as requireAdmin } from "./session";

export type AdminState = {
  ok?: boolean;
  error?: string;
  message?: string;
  /** Credenciais a mostrar uma única vez (conta nova ou senha redefinida). */
  credentials?: { email: string; password: string };
  /** Link mágico acabado de gerar (M5-12): o token só existe aqui, nunca na BD. */
  link?: { url: string; expiresAt: string; clientName: string; projectName: string };
};

/* ───────────── utilitários ───────────── */


const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const isUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};


/** Senha temporária legível (sem 0/O, 1/l): o cliente troca-a no primeiro acesso. */
function tempPassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(14), (b) => alphabet[b % alphabet.length]).join("");
}

/** "2026-11-25" + "14:30" em hora de Luanda (UTC+1, sem horário de verão) → ISO */
const luanda = (date: string, time: string) => new Date(`${date}T${time}:00+01:00`).toISOString();

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/cliente", "layout");
}

const ACCOUNTS_OFF =
  "Falta a SUPABASE_SECRET_KEY no servidor. Sem ela, o painel não pode criar nem alterar contas.";

function accounts() {
  try {
    return createSupabaseAdmin();
  } catch {
    return undefined;
  }
}




/** Nome e email do cliente de um projeto, para os avisos. */
async function contactOf(sb: Awaited<ReturnType<typeof requireAdmin>>["sb"], projectId: string) {
  const { data } = await sb
    .from("projects")
    .select("name, clients (name, email)")
    .eq("id", projectId)
    .single<{ name: string; clients: { name: string; email: string } | null }>();
  return data?.clients ? { projectName: data.name, clientName: data.clients.name, email: data.clients.email } : undefined;
}

/** Envia o aviso se a caixa "Avisar o cliente" estiver marcada. Nunca faz falhar a ação. */
async function notify(
  f: FormData,
  sb: Awaited<ReturnType<typeof requireAdmin>>["sb"],
  projectId: string,
  build: (c: { projectName: string; clientName: string }) => { subject: string; html: string; text: string },
): Promise<SendResult | undefined> {
  if (str(f, "avisar") !== "1") return undefined;
  const c = await contactOf(sb, projectId);
  if (!c) return { sent: false, reason: "não encontrei o email do cliente" };
  return sendEmail({ to: c.email, ...build(c) });
}

const slugTaken = (e: { code?: string; message: string }) => e.code === "23505" && e.message.includes("slug");

/* ───────────── Capa do projeto ───────────── */

const COVER_BUCKET = "project-covers";
const COVER_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
// 4 MB: a capa passa pela Server Action e a Vercel corta pedidos acima de 4,5 MB (ADR-003, R-07).
const COVER_MAX = 4 * 1024 * 1024;

type Sb = Awaited<ReturnType<typeof requireAdmin>>["sb"];

/** Valida o ficheiro "capa" do formulário. Sem ficheiro → undefined. */
function readCover(f: FormData): File | undefined | { error: string } {
  const file = f.get("capa");
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (!COVER_TYPES[file.type]) return { error: "A imagem tem de ser JPG, PNG, WebP ou AVIF." };
  if (file.size > COVER_MAX) return { error: "A imagem passa dos 4 MB. Escolha uma mais leve." };
  return file;
}

/** Envia a capa para o Storage e devolve o URL público. */
async function uploadCover(sb: Sb, projectId: string, file: File): Promise<string | { error: string }> {
  const path = `${projectId}/${randomUUID()}.${COVER_TYPES[file.type]}`;
  const { error } = await sb.storage.from(COVER_BUCKET).upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) return { error: `Não foi possível enviar a imagem: ${error.message}` };
  return sb.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Apaga a capa antiga (se for deste bucket). Falhas não interrompem a ação. */
async function removeCover(sb: Sb, url: string | null | undefined) {
  const marker = `/object/public/${COVER_BUCKET}/`;
  const i = url?.indexOf(marker) ?? -1;
  if (!url || i < 0) return;
  await sb.storage.from(COVER_BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))]);
}

/** Capa num projeto acabado de criar. Devolve um aviso se falhar (o projeto fica criado). */
async function attachCover(sb: Sb, projectId: string, file: File | undefined): Promise<string | undefined> {
  if (!file) return undefined;
  const url = await uploadCover(sb, projectId, file);
  if (typeof url !== "string") return url.error;
  const { error } = await sb.from("projects").update({ cover_url: url }).eq("id", projectId);
  return error ? `Não foi possível guardar a imagem: ${error.message}` : undefined;
}

/* ───────────── Clientes ───────────── */

export async function createClientAccount(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const admin = accounts();
  if (!admin) return { error: ACCOUNTS_OFF };

  const name = str(f, "nome");
  const email = str(f, "email").toLowerCase();
  if (name.length < 2) return { error: "Indique o nome do cliente." };
  if (!EMAIL.test(email)) return { error: "Email inválido." };
  const serviceType = readServiceType(f);
  if (typeof serviceType !== "string") return serviceType;
  const project = readProject(f, serviceType);
  if ("error" in project) return project;
  const cover = readCover(f);
  if (cover && "error" in cover) return cover;

  const password = tempPassword();
  const { data: created, error: ue } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (ue) {
    const exists = ue.code === "email_exists" || /already/i.test(ue.message);
    return { error: exists ? "Já existe uma conta com este email." : `Não foi possível criar a conta: ${ue.message}` };
  }
  const userId = created.user.id;

  const { data: client, error: ce } = await sb
    .from("clients")
    .insert({ user_id: userId, name, company: opt(f, "empresa"), email })
    .select("id")
    .single();
  if (ce) {
    await admin.auth.admin.deleteUser(userId);
    return { error: `Não foi possível guardar o cliente: ${ce.message}` };
  }

  const { data: newProject, error: pe } = await sb
    .from("projects")
    .insert({
      ...project,
      service_type: serviceType, // o trigger da BD cria as 7 fases no Académico e no Design (B1)
      client_id: client.id,
      started_on: project.started_on ?? new Date().toISOString().slice(0, 10),
      team: [{ initials: "JP", name: "João Pereira" }],
    })
    .select("id")
    .single();
  if (pe) {
    await admin.auth.admin.deleteUser(userId); // apaga também o cliente (on delete cascade)
    return { error: slugTaken(pe) ? `Já existe um projeto com o slug "${project.slug}".` : `Não foi possível criar o projeto: ${pe.message}` };
  }

  const coverWarning = await attachCover(sb, newProject.id, cover);

  refresh();
  return {
    ok: true,
    message: `Cliente ${name} criado com o projeto ${project.name}.${coverWarning ? ` ${coverWarning}` : ""}`,
    credentials: { email, password },
  };
}

export async function updateClient(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const name = str(f, "nome");
  const email = str(f, "email").toLowerCase();
  if (name.length < 2) return { error: "Indique o nome do cliente." };
  if (!EMAIL.test(email)) return { error: "Email inválido." };

  const { data: current, error: ge } = await sb.from("clients").select("user_id, email").eq("id", id).single();
  if (ge) return { error: "Cliente não encontrado." };

  if (current.email.toLowerCase() !== email) {
    const admin = accounts();
    if (!admin) return { error: ACCOUNTS_OFF };
    const { error } = await admin.auth.admin.updateUserById(current.user_id, { email, email_confirm: true });
    if (error) return { error: `Não foi possível mudar o email de acesso: ${error.message}` };
  }

  const { error } = await sb.from("clients").update({ name, company: opt(f, "empresa"), email }).eq("id", id);
  if (error) return { error: `Não foi possível guardar: ${error.message}` };
  refresh();
  return { ok: true, message: "Dados do cliente guardados." };
}

export async function resetClientPassword(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const admin = accounts();
  if (!admin) return { error: ACCOUNTS_OFF };

  const { data: c, error: ge } = await sb.from("clients").select("user_id, email").eq("id", str(f, "id")).single();
  if (ge) return { error: "Cliente não encontrado." };

  const password = tempPassword();
  const { error } = await admin.auth.admin.updateUserById(c.user_id, { password });
  if (error) return { error: `Não foi possível redefinir a senha: ${error.message}` };
  const { error: ue } = await sb.from("clients").update({ must_change_password: true }).eq("user_id", c.user_id);
  if (ue) return { error: `A senha mudou, mas não foi possível pedir a troca no próximo acesso: ${ue.message}` };

  refresh();
  return {
    ok: true,
    message: "Senha temporária nova criada. A anterior deixou de funcionar.",
    credentials: { email: c.email, password },
  };
}

export async function setClientSuspended(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const admin = accounts();
  if (!admin) return { error: ACCOUNTS_OFF };

  const suspend = str(f, "suspender") === "1";
  const { data: c, error: ge } = await sb.from("clients").select("user_id").eq("id", str(f, "id")).single();
  if (ge) return { error: "Cliente não encontrado." };

  // ~100 anos = suspenso até ser reativado. "none" levanta a suspensão.
  const { error } = await admin.auth.admin.updateUserById(c.user_id, { ban_duration: suspend ? "876000h" : "none" });
  if (error) return { error: `Não foi possível ${suspend ? "suspender" : "reativar"}: ${error.message}` };

  refresh();
  return {
    ok: true,
    message: suspend
      ? "Acesso suspenso. O cliente deixa de conseguir entrar; os dados mantêm-se."
      : "Acesso reativado.",
  };
}

export async function deleteClient(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const admin = accounts();
  if (!admin) return { error: ACCOUNTS_OFF };

  const { data: c, error: ge } = await sb.from("clients").select("user_id, email").eq("id", str(f, "id")).single();
  if (ge) return { error: "Cliente não encontrado." };
  if (str(f, "confirmar").toLowerCase() !== c.email.toLowerCase()) {
    return { error: "Escreva o email do cliente para confirmar." };
  }

  // Apaga a conta; cliente, projetos, demos, reuniões e mensagens caem em cascata.
  const { error } = await admin.auth.admin.deleteUser(c.user_id);
  if (error) return { error: `Não foi possível apagar: ${error.message}` };
  refresh();
  redirect("/admin/clientes");
}

/* ───────────── Projetos ───────────── */

export async function createProject(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const serviceType = readServiceType(f);
  if (typeof serviceType !== "string") return serviceType;
  const project = readProject(f, serviceType);
  if ("error" in project) return project;
  const cover = readCover(f);
  if (cover && "error" in cover) return cover;

  const { data, error } = await sb
    .from("projects")
    .insert({
      ...project,
      service_type: serviceType, // o trigger da BD cria as 7 fases no Académico e no Design (B1)
      client_id: str(f, "cliente"),
      started_on: project.started_on ?? new Date().toISOString().slice(0, 10),
      team: [{ initials: "JP", name: "João Pereira" }],
    })
    .select("id")
    .single();
  if (error) {
    return { error: slugTaken(error) ? `Já existe um projeto com o slug "${project.slug}".` : `Não foi possível criar: ${error.message}` };
  }
  // Se a imagem falhar, o projeto fica criado; a capa pode ser enviada depois na página do projeto.
  await attachCover(sb, data.id, cover);
  refresh();
  redirect(`/admin/projetos/${data.id}`);
}

export async function updateProject(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const { data: before } = await sb
    .from("projects")
    .select("status, service_type")
    .eq("id", id)
    .single<{ status: string; service_type: ServiceType }>();
  if (!before) return { error: "Projeto não encontrado." };
  // O tipo de serviço não muda depois de criado (RN-02): vem sempre da BD, nunca do formulário.
  const project = readProject(f, before.service_type);
  if ("error" in project) return project;

  const status = str(f, "estado");
  if (!["ativo", "entregue", "pausado", "cancelado"].includes(status)) return { error: "Estado inválido." };

  let phaseMap: Record<string, number> | null = null;
  const rawMap = before.service_type === "development" ? str(f, "mapa") : "";
  if (rawMap) {
    try {
      const parsed = JSON.parse(rawMap);
      const valid =
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        Object.entries(parsed).every(([k, v]) => /^M\d{1,2}$/.test(k) && Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 6);
      if (!valid) throw new Error();
      phaseMap = parsed;
    } catch {
      return { error: 'Mapa de fases inválido. Exemplo: {"M3": 3} (milestone → fase de 1 a 6).' };
    }
  }

  const cover = readCover(f);
  if (cover && "error" in cover) return cover;
  const dropCover = str(f, "remover_capa") === "1";

  let coverPatch: { cover_url: string | null } | undefined;
  let oldCover: string | null = null;
  if (cover || dropCover) {
    const { data: current } = await sb.from("projects").select("cover_url").eq("id", id).single<{ cover_url: string | null }>();
    oldCover = current?.cover_url ?? null;
    if (cover) {
      const url = await uploadCover(sb, id, cover);
      if (typeof url !== "string") return url;
      coverPatch = { cover_url: url };
    } else {
      coverPatch = { cover_url: null };
    }
  }

  const { error } = await sb
    .from("projects")
    .update({ ...project, phase_map: phaseMap, ...coverPatch })
    .eq("id", id);
  if (error) {
    if (coverPatch?.cover_url) await removeCover(sb, coverPatch.cover_url);
    return { error: slugTaken(error) ? `Já existe um projeto com o slug "${project.slug}".` : `Não foi possível guardar: ${error.message}` };
  }
  if (coverPatch && oldCover) await removeCover(sb, oldCover);

  // Desde a migração 0006 o estado só muda pelas transições permitidas, com motivo e histórico
  // (estados.md §2): a BD exige o motivo para pausar, cancelar ou reabrir um projeto entregue.
  if (before && before.status !== status) {
    const { error: se } = await sb.rpc("admin_set_project_status", {
      p_project: id,
      p_status: status,
      p_note: str(f, "motivo") || null,
    });
    if (se) {
      refresh();
      return { error: `Os dados foram guardados, mas o estado não mudou: ${se.message}` };
    }
  }
  refresh();
  return { ok: true, message: "Projeto guardado." };
}

export async function deleteProject(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const { data: p, error: ge } = await sb.from("projects").select("slug, client_id, cover_url").eq("id", id).single();
  if (ge) return { error: "Projeto não encontrado." };
  if (str(f, "confirmar") !== p.slug) return { error: "Escreva o slug do projeto para confirmar." };

  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) return { error: `Não foi possível apagar: ${error.message}` };
  await removeCover(sb, p.cover_url);
  refresh();
  redirect(`/admin/clientes/${p.client_id}`);
}

/* ───────────── Demos ───────────── */

export async function addDemo(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const kind = str(f, "tipo");
  const url = str(f, "url");
  const version = str(f, "versao");
  if (!["web", "android", "ios"].includes(kind)) return { error: "Escolha o tipo de demo." };
  if (!isUrl(url)) return { error: "Link inválido. Deve começar por https://" };
  if (!/^\d+\.\d+\.\d+([-.+][\w.]+)?$/.test(version)) return { error: "Versão inválida. Use o formato 1.2.3." };

  const projectId = str(f, "projeto");
  const notes = str(f, "notas");
  const { error } = await sb.from("demo_links").insert({ project_id: projectId, kind, url, version, notes });
  if (error) return { error: `Não foi possível registar: ${error.message}` };
  refresh();
  const mail = await notify(f, sb, projectId, (c) =>
    demoEmail({ ...c, kind: kind as "web" | "android" | "ios", version, notes }),
  );
  return { ok: true, message: `Demo ${kind} v${version} registada.${emailNote(mail)}` };
}

export async function deleteDemo(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("demo_links").delete().eq("id", str(f, "id"));
  if (error) return { error: `Não foi possível remover: ${error.message}` };
  refresh();
  return { ok: true, message: "Demo removida." };
}

/* ───────────── Reuniões ───────────── */

function readMeeting(f: FormData) {
  const title = str(f, "titulo");
  const date = str(f, "data");
  const start = str(f, "inicio");
  const end = str(f, "fim");
  const link = str(f, "link");
  if (title.length < 2) return { error: "Indique o título da reunião." };
  if (!DATE.test(date) || !TIME.test(start) || !TIME.test(end)) return { error: "Indique a data e as horas." };
  if (end <= start) return { error: "A hora de fim tem de ser depois da hora de início." };
  if (!isUrl(link)) return { error: "Link da chamada inválido. Deve começar por https://" };
  return {
    title,
    starts_at: luanda(date, start),
    ends_at: luanda(date, end),
    call_url: link,
    agenda: str(f, "pauta")
      .split(/\n|;/)
      .map((s) => s.trim())
      .filter(Boolean),
    notes: opt(f, "notas"),
  };
}

export async function saveMeeting(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const m = readMeeting(f);
  if ("error" in m) return { error: m.error };

  const id = str(f, "id");
  const projectId = str(f, "projeto");
  const { error } = id
    ? await sb.from("meetings").update(m).eq("id", id)
    : await sb.from("meetings").insert({ ...m, project_id: projectId });
  if (error) return { error: `Não foi possível guardar: ${error.message}` };
  refresh();
  const mail = await notify(f, sb, projectId, (c) =>
    meetingEmail({
      ...c,
      title: m.title,
      startsAt: m.starts_at,
      endsAt: m.ends_at,
      callUrl: m.call_url,
      agenda: m.agenda,
      updated: Boolean(id),
    }),
  );
  return { ok: true, message: `${id ? "Reunião atualizada." : "Reunião marcada."}${emailNote(mail)}` };
}

export async function deleteMeeting(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("meetings").delete().eq("id", str(f, "id"));
  if (error) return { error: `Não foi possível remover: ${error.message}` };
  refresh();
  return { ok: true, message: "Reunião removida." };
}

/* ───────────── Mensagens ───────────── */

export async function replyToClient(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const body = str(f, "mensagem");
  if (body.length < 2) return { error: "Escreva a resposta antes de enviar." };
  if (body.length > 2000) return { error: "A resposta tem mais de 2000 caracteres. Divida-a em duas." };

  // author_id fica com auth.uid() (o administrador), por defeito na tabela.
  const projectId = str(f, "projeto");
  const { error } = await sb.from("feedback").insert({ project_id: projectId, author_role: "admin", body });
  if (error) return { error: `A resposta não foi enviada: ${error.message}` };
  refresh();
  const mail = await notify(f, sb, projectId, (c) => replyEmail({ ...c, body }));
  return { ok: true, message: `Resposta enviada.${emailNote(mail)}` };
}

/* ───────────── Tarefas visíveis (label no GitHub) ───────────── */

export async function setTasksVisible(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const numbers = str(f, "issues")
    .split(",")
    .map((n) => Number(n))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (numbers.length === 0) return { error: "Nenhuma issue selecionada." };
  const visible = str(f, "visivel") === "1";

  const { data: p, error: pe } = await sb.from("projects").select("github_owner, github_repo").eq("id", str(f, "projeto")).single();
  if (pe || !p.github_owner || !p.github_repo) return { error: "Este projeto não tem repositório GitHub associado." };

  try {
    await setIssueVisible(p.github_owner, p.github_repo, numbers, visible);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível alterar a label no GitHub." };
  } finally {
    // Mesmo com falha a meio, algumas issues podem ter mudado.
    revalidateTag(githubTag(p.github_owner, p.github_repo));
    refresh();
  }
  const many = numbers.length > 1;
  return {
    ok: true,
    message: visible
      ? `${many ? `${numbers.length} tarefas passaram` : "A tarefa passou"} a estar visíve${many ? "is" : "l"} para o cliente.`
      : `${many ? `${numbers.length} tarefas deixaram` : "A tarefa deixou"} de estar visíve${many ? "is" : "l"} para o cliente.`,
  };
}

/* ───────────── Fases (M5-08, Académico e Design) ───────────── */

async function projectPhases(sb: Sb, projectId: string) {
  const { data, error } = await sb
    .from("project_phases")
    .select(ADMIN_PHASE_COLS)
    .eq("project_id", projectId)
    .order("position")
    .returns<AdminPhaseRow[]>();
  return error ? undefined : (data ?? []).map(mapAdminPhase);
}

/**
 * Aplica os passos pela ordem, com admin_set_phase_status (a BD valida a transição, o travão
 * de pagamento D-052 e grava o histórico). Não é atómico: se um passo falhar, os anteriores
 * ficam e a mensagem diz o que ficou feito.
 */
async function applySteps(sb: Sb, steps: Step[], note: string | null) {
  const done: Step[] = [];
  for (const s of steps) {
    const { error } = await sb.rpc("admin_set_phase_status", { p_phase: s.id, p_status: s.to, p_note: note });
    if (error) return { done, error: error.message };
    done.push(s);
  }
  return { done };
}

/** Resumo para o admin e aviso ao cliente (só das mudanças visíveis: os passos intermédios contam uma vez). */
async function finishPhaseChange(
  f: FormData,
  sb: Sb,
  projectId: string,
  done: Step[],
  failed: string | undefined,
  note: string | null,
): Promise<AdminState> {
  const last = new Map<string, Step>();
  for (const s of done) last.set(s.id, s);
  const changes = [...last.values()].map((s) => ({ name: s.name, to: s.to }));
  if (changes.length) refresh();
  const summary = changes.map((c) => `“${c.name}”: ${PHASE_LABEL[c.to as DbPhaseState].toLowerCase()}`).join("; ");
  if (failed) {
    return { error: changes.length ? `Feito: ${summary}. Depois falhou: ${failed}` : failed };
  }
  const phases = await projectPhases(sb, projectId);
  const nextStep = phases?.find((p) => p.id === done[done.length - 1]?.id)?.nextStep;
  const mail = changes.length
    ? await notify(f, sb, projectId, (c) => phaseEmail({ ...c, changes, nextStep, note }))
    : undefined;
  return { ok: true, message: `${summary}.${emailNote(mail)}` };
}

/** Muda o estado de uma fase para um estado permitido. */
export async function setPhaseStatus(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const projectId = str(f, "projeto");
  const to = str(f, "estado") as DbPhaseState;
  const note = opt(f, "motivo");
  const phases = await projectPhases(sb, projectId);
  const ph = phases?.find((p) => p.id === str(f, "fase"));
  if (!ph) return { error: "Fase não encontrada." };
  if (!isTransitionAllowed(ph, to)) {
    return { error: `Não é possível passar de “${PHASE_LABEL[ph.status]}” para “${PHASE_LABEL[to] ?? to}”.` };
  }
  if (needsNote(ph.status) && !note) return { error: "Indique o motivo para reabrir a fase." };
  const step: Step = { id: ph.id, name: ph.name, from: ph.status, to };
  const r = await applySteps(sb, [step], note);
  return finishPhaseChange(f, sb, projectId, r.done, r.error, note);
}

/** Avançar: conclui a fase e inicia a seguinte por iniciar (Q-083). */
export async function advancePhase(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const projectId = str(f, "projeto");
  const phases = await projectPhases(sb, projectId);
  if (!phases) return { error: "Não foi possível ler as fases." };
  const plan = planAdvance(phases, str(f, "fase"));
  if ("error" in plan) return plan;
  const r = await applySteps(sb, plan, null);
  return finishPhaseChange(f, sb, projectId, r.done, r.error, null);
}

/** Recuar: reabre a última fase concluída antes da atual, com motivo (D-062). */
export async function reopenPreviousPhase(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const projectId = str(f, "projeto");
  const note = opt(f, "motivo");
  if (!note) return { error: "Indique o motivo para reabrir a fase anterior." };
  const phases = await projectPhases(sb, projectId);
  if (!phases) return { error: "Não foi possível ler as fases." };
  const step = planBack(phases);
  if ("error" in step) return step;
  const r = await applySteps(sb, [step], note);
  return finishPhaseChange(f, sb, projectId, r.done, r.error, note);
}

/** Prazo, próximo passo (visível ao cliente) e progresso de uma fase. */
export async function updatePhaseDetails(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const projectId = str(f, "projeto");
  const d = readPhaseDetails((k) => str(f, k));
  if ("error" in d) return d;
  const { data, error } = await sb
    .from("project_phases")
    .update(d)
    .eq("id", str(f, "fase"))
    .eq("project_id", projectId)
    .select("name")
    .single<{ name: string }>();
  if (error || !data) return { error: `Não foi possível guardar: ${error?.message ?? "fase não encontrada"}` };
  refresh();
  const mail = await notify(f, sb, projectId, (c) =>
    phaseEmail({ ...c, changes: [{ name: data.name, to: "atualizada" }], nextStep: d.next_step }),
  );
  return { ok: true, message: `Fase “${data.name}” guardada.${emailNote(mail)}` };
}

/* ───────────── Aprovações (M5-10) ───────────── */
// Orçamento e extra nascem dos orçamentos e pagamentos (0007, M5-11). Aqui: índice, prova e entrega.

/** Pede uma aprovação ao cliente. A BD grava o snapshot, põe a fase "a aguardar o cliente" e garante 1 pendente por alvo. */
export async function createApproval(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const projectId = str(f, "projeto");
  const subject = str(f, "assunto") as ApprovalSubject;
  const phaseId = opt(f, "fase");
  const message = opt(f, "mensagem");
  if (message && message.length > 1000) return { error: "A mensagem tem no máximo 1000 caracteres." };

  let row: Record<string, unknown>;
  let snapshot: ApprovalSnapshot;
  if (subject === "indice") {
    const items = parseItems(str(f, "itens"));
    if (items.length === 0) return { error: "Escreva o índice: um capítulo ou secção por linha." };
    const label = opt(f, "versao");
    if (label && label.length > 10) return { error: "A versão tem no máximo 10 caracteres (ex.: V2)." };
    snapshot = { title: "Índice", items, ...(message && { message }) };
    row = { subject, version_label: label };
  } else if (subject === "prova" || subject === "entrega") {
    const { data: d } = await sb
      .from("deliverables")
      .select("id, label, title, role, project_phase_id, files (original_name)")
      .eq("id", str(f, "versao_ficheiro"))
      .eq("project_id", projectId)
      .maybeSingle<{ id: string; label: string; title: string | null; role: string; project_phase_id: string | null; files: { original_name: string }[] }>();
    if (!d) return { error: "Escolha a versão do ficheiro a aprovar." };
    if (d.role === "interno" || d.role === "referencia") return { error: "Só se pedem aprovações de entregáveis e provas." };
    snapshot = { title: d.title ?? (subject === "prova" ? "Prova" : "Entrega"), files: d.files.map((x) => x.original_name), ...(message && { message }) };
    row = { subject, deliverable_id: d.id, version_label: d.label };
    if (!phaseId && d.project_phase_id) row.project_phase_id = d.project_phase_id;
  } else {
    return { error: "Escolha o que o cliente vai aprovar." };
  }

  const { error } = await sb.from("approvals").insert({ project_id: projectId, project_phase_id: phaseId, ...row, snapshot });
  if (error) {
    return {
      error: error.code === "23505" ? "Já há um pedido pendente para isto. Cancele-o antes de pedir outro." : `Não foi possível pedir: ${error.message}`,
    };
  }
  refresh();
  const title = approvalTitle({ subject, versionLabel: (row.version_label as string | null) ?? null, snapshot });
  const mail = await notify(f, sb, projectId, (c) => approvalRequestEmail({ ...c, title, message }));
  return { ok: true, message: `Pedido “${title}” enviado ao cliente.${emailNote(mail)}` };
}

/** Cancela um pedido pendente (pendente → cancelada; a fase não muda sozinha). */
export async function cancelApproval(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const { data, error } = await sb
    .from("approvals")
    .update({ status: "cancelada", decided_at: new Date().toISOString() })
    .eq("id", str(f, "id"))
    .eq("status", "pendente")
    .select("id");
  if (error) return { error: `Não foi possível cancelar: ${error.message}` };
  if (!data?.length) return { error: "Este pedido já não está pendente." };
  refresh();
  return { ok: true, message: "Pedido cancelado." };
}

/** Reabre uma aprovação dada, com motivo (RF-30.33, D-022). A BD recusa reabrir a arte com a produção iniciada (RN-43). */
export async function reopenApproval(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb, userId } = await requireAdmin();
  const reason = opt(f, "motivo");
  if (!reason) return { error: "Indique o motivo para reabrir." };
  if (reason.length > 2000) return { error: "O motivo tem no máximo 2000 caracteres." };
  const { error } = await sb
    .from("approval_responses")
    .insert({ approval_id: str(f, "id"), kind: "reabrir", comment: reason, actor_role: "admin", actor_id: userId });
  if (error) return { error: `Não foi possível reabrir: ${error.message}` };
  refresh();
  return { ok: true, message: "Aprovação reaberta: volta a aguardar o cliente." };
}

/* ───────────── Pagamentos (M5-11) ───────────── */
// Registo manual, sem pagamento online (D-009). Sinal e restante nascem também do orçamento aceite (0007).

const KINDS: PaymentKind[] = ["sinal", "restante", "extra"];

/** Regista um pagamento. Um extra fica "por aceitar" e pede a aprovação do cliente (RN-07, RF-30.25). */
export async function createPayment(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const projectId = str(f, "projeto");
  const kind = str(f, "tipo") as PaymentKind;
  if (!KINDS.includes(kind)) return { error: "Escolha o tipo: sinal, restante ou extra." };
  const description = str(f, "descricao") || (kind === "sinal" ? "Sinal" : kind === "restante" ? "Restante" : "");
  if (!description) return { error: "Descreva o extra (ex.: ronda de revisão adicional)." };
  if (description.length > 200) return { error: "A descrição tem no máximo 200 caracteres." };
  const amount = parseKz(str(f, "valor"));
  if (!amount) return { error: "Indique o valor em Kz (ex.: 25 000)." };
  if (amount >= 1e10) return { error: "Valor demasiado alto." };
  const dueOn = opt(f, "prazo");
  if (dueOn && !DATE.test(dueOn)) return { error: "Data limite inválida." };
  const rounds = kind === "extra" ? Number(str(f, "rondas") || 0) : 0;
  if (!Number.isInteger(rounds) || rounds < 0 || rounds > 20) return { error: "As rondas extra vão de 0 a 20." };

  const { data: pay, error } = await sb
    .from("payments")
    .insert({
      project_id: projectId,
      kind,
      description,
      amount_kz: amount,
      due_on: dueOn,
      extra_rounds: rounds,
      gates_phase_id: opt(f, "fase"),
    })
    .select("id, status")
    .single<{ id: string; status: string }>();
  if (error || !pay) return { error: `Não foi possível registar: ${error?.message ?? "erro"}` };

  if (pay.status === "por_aceitar") {
    const { error: ae } = await sb.from("approvals").insert({
      project_id: projectId,
      subject: "extra",
      payment_id: pay.id,
      snapshot: { title: description, amount_kz: amount, extra_rounds: rounds, message: `Valor: ${kz(amount)}. Só conta depois de o aceitar.` },
    });
    if (ae) {
      // Sem o pedido de aprovação o extra nunca seria aceite: anula-o e explica.
      await sb.from("payments").update({ status: "anulado" }).eq("id", pay.id);
      return { error: `Não foi possível pedir a aprovação do extra: ${ae.message}` };
    }
  }
  refresh();
  const mail = await notify(f, sb, projectId, (c) =>
    pay.status === "por_aceitar"
      ? approvalRequestEmail({ ...c, title: `Extra: ${description}`, message: `Valor: ${kz(amount)}.` })
      : paymentEmail({ ...c, description, amount: kz(amount), paid: false, dueOn }),
  );
  return {
    ok: true,
    message: `${description} (${kz(amount)}) registado${pay.status === "por_aceitar" ? ": aguarda a aceitação do cliente" : ""}.${emailNote(mail)}`,
  };
}

/** Marca como pago, com a data do pagamento (RF-30.22). A BD liberta a fase travada e os ficheiros bloqueados. */
export async function markPaymentPaid(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const paidOn = str(f, "data") || todayLuanda();
  if (!DATE.test(paidOn)) return { error: "Data do pagamento inválida." };
  if (paidOn > todayLuanda()) return { error: "A data do pagamento não pode ser no futuro." };
  const { data, error } = await sb
    .from("payments")
    .update({ status: "pago", paid_on: paidOn })
    .eq("id", str(f, "id"))
    .eq("status", "pendente")
    .select("project_id, description, amount_kz")
    .maybeSingle<{ project_id: string; description: string; amount_kz: number | string }>();
  if (error) return { error: `Não foi possível marcar como pago: ${error.message}` };
  if (!data) return { error: "Só um pagamento pendente pode ser marcado como pago." };
  refresh();
  const amount = kz(Number(data.amount_kz));
  const mail = await notify(f, sb, data.project_id, (c) => paymentEmail({ ...c, description: data.description, amount, paid: true }));
  return { ok: true, message: `${data.description} marcado como pago.${emailNote(mail)}` };
}

/** Desfaz um "pago" registado por engano (pago → pendente). Fica na auditoria (activity_log). */
export async function undoPaymentPaid(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const { data, error } = await sb
    .from("payments")
    .update({ status: "pendente" })
    .eq("id", str(f, "id"))
    .eq("status", "pago")
    .select("description")
    .maybeSingle<{ description: string }>();
  if (error) return { error: `Não foi possível desfazer: ${error.message}` };
  if (!data) return { error: "Este pagamento já não está marcado como pago." };
  refresh();
  return { ok: true, message: `${data.description} voltou a pendente.` };
}

/** Anula um pagamento por pagar (pendente ou por aceitar). Um extra por aceitar perde também o pedido de aprovação. */
export async function cancelPayment(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const { data, error } = await sb
    .from("payments")
    .update({ status: "anulado" })
    .eq("id", id)
    .in("status", ["pendente", "por_aceitar"])
    .select("description")
    .maybeSingle<{ description: string }>();
  if (error) return { error: `Não foi possível anular: ${error.message}` };
  if (!data) return { error: "Só se anula um pagamento por pagar." };
  await sb.from("approvals").update({ status: "cancelada", decided_at: new Date().toISOString() }).eq("payment_id", id).eq("status", "pendente");
  refresh();
  return { ok: true, message: `${data.description} anulado.` };
}

/* ───────────── Link mágico (M5-12, ADR-002) ───────────── */
// access_links só tem política de leitura para o admin: escreve-se com a chave secreta,
// depois de requireAdminStrict (seguranca.md §4).

/** Gera o link de uso único (24 h) para o cliente de um projeto. Os anteriores ficam "substituídos" (L4). */
export async function generateAccessLink(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb, userId } = await requireAdmin();
  const admin = accounts();
  if (!admin) return { error: ACCOUNTS_OFF };
  const projectId = str(f, "projeto");
  const { data: p } = await sb
    .from("projects")
    .select("id, name, client_id, clients (id, name, email, user_id)")
    .eq("id", projectId)
    .single<{ id: string; name: string; client_id: string; clients: { id: string; name: string; email: string; user_id: string } | null }>();
  if (!p?.clients) return { error: "Projeto ou cliente não encontrado." };
  const c = p.clients;

  // L5 / D-032: no máximo 5 links por cliente por hora.
  const { count } = await sb
    .from("access_links")
    .select("id", { count: "exact", head: true })
    .eq("client_id", c.id)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
  if ((count ?? 0) >= LINKS_PER_HOUR) return { error: `Já gerou ${LINKS_PER_HOUR} links para este cliente na última hora. Tente mais tarde.` };

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: c.email });
  if (error || !data?.properties) return { error: `O Supabase não gerou o link: ${error?.message ?? "sem resposta"}` };
  // D-077: uma conta com o email por confirmar recebe um link "signup". Nunca o enviamos.
  if (data.properties.verification_type !== "magiclink") {
    return { error: "A conta deste cliente tem o email por confirmar. Confirme-o (Clientes → editar o email) antes de gerar o link." };
  }
  const token = data.properties.hashed_token;
  if (!looksLikeToken(token)) return { error: "O Supabase devolveu um token inesperado." };

  const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString();
  await admin.from("access_links").update({ status: "substituido" }).eq("client_id", c.id).eq("status", "ativo");
  const { error: ie } = await admin.from("access_links").insert({
    client_id: c.id,
    project_id: p.id,
    token_digest: digest(token),
    channel: "copiar",
    expires_at: expiresAt,
    created_by: userId, // evento: quem gerou e quando (created_at)
  });
  if (ie) return { error: `Não foi possível registar o link: ${ie.message}` };

  revalidatePath(`/admin/projetos/${p.id}`);
  return {
    ok: true,
    message: "Link gerado. Envie-o ao cliente: funciona uma vez e vale 24 horas.",
    link: { url: entryUrl(SITE_URL, token), expiresAt, clientName: c.name, projectName: p.name },
  };
}

/** Lê o link que o painel tem na mão e confirma que é o ativo deste projeto (o token não está na BD). */
async function activeLinkFor(url: string, projectId: string) {
  const admin = accounts();
  if (!admin) return undefined;
  let token: string | null = null;
  try {
    token = new URL(url).searchParams.get("t");
  } catch {
    return undefined;
  }
  if (!looksLikeToken(token ?? undefined)) return undefined;
  const { data } = await admin
    .from("access_links")
    .select("id, project_id, status, expires_at, clients (name, email), projects (name)")
    .eq("token_digest", digest(token!))
    .maybeSingle<{ id: string; project_id: string; status: string; expires_at: string; clients: { name: string; email: string } | null; projects: { name: string } | null }>();
  if (!data || data.project_id !== projectId || data.status !== "ativo" || Date.parse(data.expires_at) <= Date.now()) return undefined;
  return { admin, row: data };
}

/** Envia o link por email (Resend, RF-30.52 — Should, D-039). */
export async function emailAccessLink(url: string, projectId: string): Promise<AdminState> {
  await requireAdmin();
  const found = await activeLinkFor(String(url ?? ""), String(projectId ?? ""));
  if (!found?.row.clients) return { error: "Este link já não é o ativo. Gere um novo." };
  const { row, admin } = found;
  const r = await sendEmail({
    to: row.clients!.email,
    ...accessLinkEmail({ clientName: row.clients!.name, projectName: row.projects?.name ?? "o seu projeto", url }),
  });
  if (!r.sent) return { error: `Email não enviado: ${r.reason}.` };
  await admin.from("access_links").update({ channel: "email" }).eq("id", row.id);
  revalidatePath(`/admin/projetos/${projectId}`);
  return { ok: true, message: `Link enviado para ${row.clients!.email}.` };
}

/** Regista o último canal usado (Copiar / WhatsApp). Não falha a interface se não conseguir. */
export async function setAccessLinkChannel(url: string, projectId: string, channel: LinkChannel): Promise<void> {
  await requireAdmin();
  if (channel !== "copiar" && channel !== "whatsapp") return;
  const found = await activeLinkFor(String(url ?? ""), String(projectId ?? ""));
  if (found) await found.admin.from("access_links").update({ channel }).eq("id", found.row.id);
}

/* ───────────── Retenção dos ficheiros (#122, RN-08) ───────────── */

/** Adia a limpeza dos ficheiros 30 dias (Q-091); pode repetir-se. */
export async function postponeFilesPurge(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const id = str(f, "projeto");
  const { data: p } = await sb.from("projects").select("files_purge_on").eq("id", id).single<{ files_purge_on: string | null }>();
  if (!p?.files_purge_on) return { error: "Este projeto não tem limpeza marcada (só os entregues ou cancelados)." };
  const until = postponeTo(p.files_purge_on, todayLuanda());
  const { error } = await sb.from("projects").update({ files_keep_until: until }).eq("id", id);
  if (error) return { error: `Não foi possível adiar: ${error.message}` };
  refresh();
  return { ok: true, message: `Limpeza adiada: os ficheiros ficam até ${until.split("-").reverse().join("/")}.` };
}

/* ───────────── Ficha do trabalho académico (M6-01, RF-10.10) ───────────── */

export async function saveAcademicBrief(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const projectId = str(f, "projeto");
  const brief = readBrief((k) => str(f, k));
  if ("error" in brief) return brief;
  // A BD recusa fichas fora de projetos Académico (F1) e valida os domínios.
  const { error } = await sb.from("academic_briefs").upsert({ project_id: projectId, ...brief }, { onConflict: "project_id" });
  if (error) return { error: `Não foi possível guardar a ficha: ${error.message}` };
  refresh();
  return { ok: true, message: "Ficha do trabalho guardada." };
}
