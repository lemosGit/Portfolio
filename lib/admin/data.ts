/**
 * Leituras do painel /admin. Usa a sessão do administrador (RLS: public.is_admin()),
 * e a chave secreta apenas para o estado das contas (último acesso, suspensão).
 */
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { accountsEnabled, createSupabaseAdmin } from "@/lib/supabase/admin";
import { syncPhases, toView } from "@/lib/portal/data";
import type { DemoLink, Meeting, ProjectView } from "@/lib/portal/types";

export type ProjectStatus = "ativo" | "entregue" | "pausado";

export type AccountInfo = { lastSignInAt: string | null; suspended: boolean };

export type AdminClient = {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  mustChangePassword: boolean;
  createdAt: string;
  projects: { id: string; slug: string; name: string; status: ProjectStatus; dueOn: string | null }[];
  account?: AccountInfo;
};

export type AdminProject = {
  id: string;
  slug: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  name: string;
  tagline: string;
  description: string;
  coverUrl: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  startedOn: string | null;
  dueOn: string | null;
  status: ProjectStatus;
  phaseMap: Record<string, number> | null;
  createdAt: string;
  demos: DemoLink[];
  meetings: Meeting[];
};

export type Conversation = {
  projectId: string;
  projectName: string;
  clientName: string;
  last: { author: "client" | "admin"; body: string; createdAt: string };
  count: number;
  /** A última mensagem é do cliente: está à espera de resposta. */
  awaiting: boolean;
};

export type ThreadMessage = {
  id: string;
  author: "client" | "admin";
  body: string;
  target: { kind: "geral" | "fase" | "tarefa"; ref: number | null };
  createdAt: string;
};

const fail = (what: string, e: { message: string }) => new Error(`Supabase (${what}): ${e.message}`);

/* ───────────── Contas (chave secreta) ───────────── */

async function loadAccountsUncached(): Promise<Map<string, AccountInfo> | undefined> {
  if (!accountsEnabled) return undefined;
  const admin = createSupabaseAdmin();
  const out = new Map<string, AccountInfo>();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw fail("auth.users", error);
    for (const u of data.users) {
      const bannedUntil = (u as { banned_until?: string | null }).banned_until;
      out.set(u.id, {
        lastSignInAt: u.last_sign_in_at ?? null,
        suspended: Boolean(bannedUntil && new Date(bannedUntil).getTime() > Date.now()),
      });
    }
    if (data.users.length < 200) break;
  }
  return out;
}

/* ───────────── Clientes ───────────── */

type ClientRow = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string;
  must_change_password: boolean;
  created_at: string;
  projects: { id: string; slug: string; name: string; status: ProjectStatus; due_on: string | null; created_at: string }[];
};

const CLIENT_COLS =
  "id, user_id, name, company, email, must_change_password, created_at, projects (id, slug, name, status, due_on, created_at)";

function toClient(r: ClientRow, accounts?: Map<string, AccountInfo>): AdminClient {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    company: r.company ?? "",
    email: r.email,
    mustChangePassword: r.must_change_password,
    createdAt: r.created_at,
    projects: [...r.projects]
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .map((p) => ({ id: p.id, slug: p.slug, name: p.name, status: p.status, dueOn: p.due_on })),
    account: accounts?.get(r.user_id),
  };
}

export async function listClients(sb: SupabaseClient): Promise<AdminClient[]> {
  const [{ data, error }, accounts] = await Promise.all([
    sb.from("clients").select(CLIENT_COLS).order("created_at", { ascending: false }).returns<ClientRow[]>(),
    loadAccounts().catch(() => undefined),
  ]);
  if (error) throw fail("clients", error);
  return (data ?? []).map((r) => toClient(r, accounts));
}

export async function getClientById(sb: SupabaseClient, id: string): Promise<AdminClient | undefined> {
  const { data, error } = await sb.from("clients").select(CLIENT_COLS).eq("id", id).maybeSingle<ClientRow>();
  if (error) throw fail("clients", error);
  if (!data) return undefined;
  const accounts = await loadAccounts().catch(() => undefined);
  return toClient(data, accounts);
}

/* ───────────── Projetos ───────────── */

type ProjectRow = {
  id: string;
  slug: string;
  client_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_url: string | null;
  github_owner: string | null;
  github_repo: string | null;
  started_on: string | null;
  due_on: string | null;
  status: ProjectStatus;
  phase_map: Record<string, number> | null;
  created_at: string;
  clients: { name: string; company: string | null } | null;
  demo_links: { id: string; kind: DemoLink["kind"]; url: string; version: string; notes: string; created_at: string }[];
  meetings: { id: string; title: string; starts_at: string; ends_at: string; call_url: string; agenda: string[]; notes: string | null }[];
};

const PROJECT_COLS =
  "id, slug, client_id, name, tagline, description, cover_url, github_owner, github_repo, started_on, due_on, status, phase_map, created_at, clients (name, company), demo_links (id, kind, url, version, notes, created_at), meetings (id, title, starts_at, ends_at, call_url, agenda, notes)";

function toProject(r: ProjectRow): AdminProject {
  return {
    id: r.id,
    slug: r.slug,
    clientId: r.client_id,
    clientName: r.clients?.name ?? "—",
    clientCompany: r.clients?.company ?? "",
    name: r.name,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    coverUrl: r.cover_url,
    githubOwner: r.github_owner,
    githubRepo: r.github_repo,
    startedOn: r.started_on,
    dueOn: r.due_on,
    status: r.status,
    phaseMap: r.phase_map,
    createdAt: r.created_at,
    demos: r.demo_links
      .map((d) => ({ id: d.id, kind: d.kind, url: d.url, version: d.version, notes: d.notes, createdAt: d.created_at }))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    meetings: r.meetings
      .map((m) => ({
        id: m.id,
        title: m.title,
        startsAt: m.starts_at,
        endsAt: m.ends_at,
        callUrl: m.call_url,
        agenda: m.agenda,
        notes: m.notes ?? undefined,
      }))
      .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt)),
  };
}

export async function listProjects(sb: SupabaseClient): Promise<AdminProject[]> {
  const { data, error } = await sb
    .from("projects")
    .select(PROJECT_COLS)
    .order("created_at", { ascending: false })
    .returns<ProjectRow[]>();
  if (error) throw fail("projects", error);
  return (data ?? []).map(toProject);
}

export async function getProjectById(sb: SupabaseClient, id: string): Promise<AdminProject | undefined> {
  const { data, error } = await sb.from("projects").select(PROJECT_COLS).eq("id", id).maybeSingle<ProjectRow>();
  if (error) throw fail("projects", error);
  return data ? toProject(data) : undefined;
}

/** Progresso calculado a partir do GitHub, igual ao que o cliente vê. */
export async function withProgress(p: AdminProject): Promise<ProjectView> {
  const now = new Date().toISOString();
  const sync = await syncPhases(p.githubOwner, p.githubRepo, p.phaseMap);
  return toView({
    id: p.id,
    slug: p.slug,
    clientId: p.clientId,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    coverUrl: p.coverUrl ?? undefined,
    repo: { owner: p.githubOwner ?? "", name: p.githubRepo ?? "" },
    startedOn: p.startedOn ?? now,
    dueOn: p.dueOn ?? now,
    team: [],
    demos: p.demos,
    meetings: p.meetings,
    ...sync,
  });
}

/* ───────────── Mensagens ───────────── */

async function listConversationsUncached(sb: SupabaseClient): Promise<Conversation[]> {
  const { data, error } = await sb
    .from("feedback")
    .select("project_id, author_role, body, created_at, projects (name, clients (name))")
    .order("created_at", { ascending: false })
    .limit(1000)
    .returns<
      {
        project_id: string;
        author_role: "client" | "admin";
        body: string;
        created_at: string;
        projects: { name: string; clients: { name: string } | null } | null;
      }[]
    >();
  if (error) throw fail("feedback", error);

  const byProject = new Map<string, Conversation>();
  for (const r of data ?? []) {
    const c = byProject.get(r.project_id);
    if (c) {
      c.count++;
      continue;
    }
    byProject.set(r.project_id, {
      projectId: r.project_id,
      projectName: r.projects?.name ?? "Projeto",
      clientName: r.projects?.clients?.name ?? "Cliente",
      last: { author: r.author_role, body: r.body, createdAt: r.created_at },
      count: 1,
      awaiting: r.author_role === "client",
    });
  }
  // Por responder primeiro; depois as mais recentes.
  return [...byProject.values()].sort(
    (a, b) => Number(b.awaiting) - Number(a.awaiting) || +new Date(b.last.createdAt) - +new Date(a.last.createdAt),
  );
}

export async function listThread(sb: SupabaseClient, projectId: string): Promise<ThreadMessage[]> {
  const { data, error } = await sb
    .from("feedback")
    .select("id, author_role, body, target_kind, target_ref, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .returns<
      {
        id: string;
        author_role: "client" | "admin";
        body: string;
        target_kind: "geral" | "fase" | "tarefa";
        target_ref: number | null;
        created_at: string;
      }[]
    >();
  if (error) throw fail("feedback", error);
  return (data ?? []).map((r) => ({
    id: r.id,
    author: r.author_role,
    body: r.body,
    target: { kind: r.target_kind, ref: r.target_ref },
    createdAt: r.created_at,
  }));
}

/** Número de conversas cuja última mensagem é do cliente. */
export async function countAwaiting(sb: SupabaseClient) {
  return (await listConversations(sb)).filter((c) => c.awaiting).length;
}

/* ───────────── Reuniões ───────────── */

export async function upcomingMeetings(sb: SupabaseClient, limit = 5) {
  const { data, error } = await sb
    .from("meetings")
    .select("id, title, starts_at, ends_at, call_url, project_id, projects (name, clients (name))")
    .gt("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit)
    .returns<
      {
        id: string;
        title: string;
        starts_at: string;
        ends_at: string;
        call_url: string;
        project_id: string;
        projects: { name: string; clients: { name: string } | null } | null;
      }[]
    >();
  if (error) throw fail("meetings", error);
  return (data ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    startsAt: m.starts_at,
    endsAt: m.ends_at,
    callUrl: m.call_url,
    projectId: m.project_id,
    projectName: m.projects?.name ?? "Projeto",
    clientName: m.projects?.clients?.name ?? "Cliente",
  }));
}

/** Uma só leitura por pedido (a barra lateral e a página partilham o resultado). */
export const loadAccounts = cache(loadAccountsUncached);

/** Uma só leitura por pedido (a barra lateral e a página partilham o resultado). */
export const listConversations = cache(listConversationsUncached);
