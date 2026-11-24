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
import { demoEmail, meetingEmail, phaseEmail, replyEmail } from "@/lib/email/templates";
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
