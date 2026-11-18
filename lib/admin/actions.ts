"use server";

/**
 * Ações do painel /admin. Cada uma começa por requireAdmin().
 * Tabelas: sessão do administrador (RLS). Contas: chave secreta (createSupabaseAdmin).
 */
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "./session";

export type AdminState = {
  ok?: boolean;
  error?: string;
  message?: string;
  /** Credenciais a mostrar uma única vez (conta nova ou senha redefinida). */
  credentials?: { email: string; password: string };
};

/* ───────────── utilitários ───────────── */

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const REPO = /^[\w.-]+\/[\w.-]+$/;
const isUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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

function parseRepo(raw: string): { owner: string | null; repo: string | null } | { error: string } {
  const v = raw.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "");
  if (!v) return { owner: null, repo: null };
  if (!REPO.test(v)) return { error: "Repositório inválido. Use o formato dono/repositorio (ex.: lemosGit/candongueiro_pay)." };
  const [owner, repo] = v.split("/");
  return { owner, repo };
}

type ProjectFields = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  github_owner: string | null;
  github_repo: string | null;
  started_on: string | null;
  due_on: string | null;
};

function readProject(f: FormData, nameKey = "projeto"): ProjectFields | { error: string } {
  const name = str(f, nameKey);
  if (name.length < 2) return { error: "Indique o nome do projeto." };
  const slug = slugify(str(f, "slug") || name);
  if (!slug) return { error: "O identificador (slug) do projeto ficou vazio. Escreva um nome com letras ou números." };
  const repo = parseRepo(str(f, "repo"));
  if ("error" in repo) return repo;
  const started = opt(f, "inicio");
  const due = opt(f, "entrega");
  if ((started && !DATE.test(started)) || (due && !DATE.test(due))) return { error: "Datas inválidas." };
  if (started && due && due < started) return { error: "A data de entrega é anterior à data de início." };
  return {
    name,
    slug,
    tagline: opt(f, "resumo"),
    description: opt(f, "descricao"),
    github_owner: repo.owner,
    github_repo: repo.repo,
    started_on: started,
    due_on: due,
  };
}

const slugTaken = (e: { code?: string; message: string }) => e.code === "23505" && e.message.includes("slug");

/* ───────────── Clientes ───────────── */

export async function createClientAccount(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const admin = accounts();
  if (!admin) return { error: ACCOUNTS_OFF };

  const name = str(f, "nome");
  const email = str(f, "email").toLowerCase();
  if (name.length < 2) return { error: "Indique o nome do cliente." };
  if (!EMAIL.test(email)) return { error: "Email inválido." };
  const project = readProject(f);
  if ("error" in project) return project;

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

  const { error: pe } = await sb.from("projects").insert({
    ...project,
    client_id: client.id,
    started_on: project.started_on ?? new Date().toISOString().slice(0, 10),
    team: [{ initials: "JP", name: "João Pereira" }],
  });
  if (pe) {
    await admin.auth.admin.deleteUser(userId); // apaga também o cliente (on delete cascade)
    return { error: slugTaken(pe) ? `Já existe um projeto com o slug "${project.slug}".` : `Não foi possível criar o projeto: ${pe.message}` };
  }

  refresh();
  return {
    ok: true,
    message: `Cliente ${name} criado com o projeto ${project.name}.`,
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
  const project = readProject(f);
  if ("error" in project) return project;

  const { data, error } = await sb
    .from("projects")
    .insert({
      ...project,
      client_id: str(f, "cliente"),
      started_on: project.started_on ?? new Date().toISOString().slice(0, 10),
      team: [{ initials: "JP", name: "João Pereira" }],
    })
    .select("id")
    .single();
  if (error) {
    return { error: slugTaken(error) ? `Já existe um projeto com o slug "${project.slug}".` : `Não foi possível criar: ${error.message}` };
  }
  refresh();
  redirect(`/admin/projetos/${data.id}`);
}

export async function updateProject(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const project = readProject(f);
  if ("error" in project) return project;

  const status = str(f, "estado");
  if (!["ativo", "entregue", "pausado"].includes(status)) return { error: "Estado inválido." };

  let phaseMap: Record<string, number> | null = null;
  const rawMap = str(f, "mapa");
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

  const { error } = await sb
    .from("projects")
    .update({ ...project, status, phase_map: phaseMap })
    .eq("id", str(f, "id"));
  if (error) {
    return { error: slugTaken(error) ? `Já existe um projeto com o slug "${project.slug}".` : `Não foi possível guardar: ${error.message}` };
  }
  refresh();
  return { ok: true, message: "Projeto guardado." };
}

export async function deleteProject(_p: AdminState, f: FormData): Promise<AdminState> {
  const { sb } = await requireAdmin();
  const id = str(f, "id");
  const { data: p, error: ge } = await sb.from("projects").select("slug, client_id").eq("id", id).single();
  if (ge) return { error: "Projeto não encontrado." };
  if (str(f, "confirmar") !== p.slug) return { error: "Escreva o slug do projeto para confirmar." };

  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) return { error: `Não foi possível apagar: ${error.message}` };
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

  const { error } = await sb
    .from("demo_links")
    .insert({ project_id: str(f, "projeto"), kind, url, version, notes: str(f, "notas") });
  if (error) return { error: `Não foi possível registar: ${error.message}` };
  refresh();
  return { ok: true, message: `Demo ${kind} v${version} registada.` };
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
  const { error } = id
    ? await sb.from("meetings").update(m).eq("id", id)
    : await sb.from("meetings").insert({ ...m, project_id: str(f, "projeto") });
  if (error) return { error: `Não foi possível guardar: ${error.message}` };
  refresh();
  return { ok: true, message: id ? "Reunião atualizada." : "Reunião marcada." };
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
  const { error } = await sb.from("feedback").insert({ project_id: str(f, "projeto"), author_role: "admin", body });
  if (error) return { error: `A resposta não foi enviada: ${error.message}` };
  refresh();
  return { ok: true, message: "Resposta enviada." };
}
