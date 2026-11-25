/**
 * Leitura do portal a partir do Supabase. As regras RLS garantem que cada cliente
 * só recebe as linhas do seu projeto, mesmo que a consulta peça mais.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { toView } from "./data";
import { loadApprovals } from "@/lib/approvals/model";
import { loadPayments } from "@/lib/payments/model";
import { loadBrief } from "@/lib/academic/brief";
import { applyChapterProgress, loadSections } from "@/lib/academic/chapters";
import { loadAdjustments } from "@/lib/academic/adjustments";
import { loadPhases } from "./phase-source";
import type { Client, DemoLink, Feedback, Meeting, Project, ProjectView, ServiceType } from "./types";

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  must_change_password: boolean;
};

type ProjectRow = {
  id: string;
  slug: string;
  client_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_url: string | null;
  service_type: ServiceType;
  github_owner: string | null;
  github_repo: string | null;
  started_on: string | null;
  due_on: string | null;
  team: { initials: string; name: string }[] | null;
  phase_map: Record<string, number> | null;
  demo_links: { id: string; kind: DemoLink["kind"]; url: string; version: string; notes: string; created_at: string }[];
  meetings: {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    call_url: string;
    agenda: string[];
    notes: string | null;
  }[];
};

type FeedbackRow = {
  id: string;
  author_role: "client" | "admin";
  body: string;
  target_kind: "geral" | "fase" | "tarefa";
  target_ref: number | null;
  created_at: string;
};

export type ProjectOption = { id: string; name: string; status: "ativo" | "entregue" | "pausado" };

export type PortalData = {
  client: Client;
  mustChangePassword: boolean;
  project?: ProjectView;
  /** Todos os projetos do cliente (para o seletor), do mais recente para o mais antigo. */
  projects: ProjectOption[];
  feedback: Feedback[];
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export async function loadPortal(
  sb: SupabaseClient,
  userId: string,
  preferredProjectId?: string,
): Promise<PortalData | undefined> {
  // 1.º pedido: cliente + lista de projetos (para o seletor), juntos.
  const { data: c, error: ce } = await sb
    .from("clients")
    .select("id, name, company, email, must_change_password, projects (id, name, status, created_at)")
    .eq("user_id", userId)
    .order("created_at", { referencedTable: "projects", ascending: false })
    .maybeSingle<ClientRow & { projects: (ProjectOption & { created_at: string })[] }>();
  if (ce) throw new Error(`Supabase (clients): ${ce.message}`);
  if (!c) return undefined;

  const client: Client = {
    id: c.id,
    name: c.name,
    company: c.company ?? "",
    email: c.email,
    initials: initials(c.name),
  };

  const projects: ProjectOption[] = (c.projects ?? []).map(({ id, name, status }) => ({ id, name, status }));
  // Escolha guardada pelo cliente; senão, o projeto ativo mais recente; senão, o mais recente.
  const chosen =
    projects.find((x) => x.id === preferredProjectId) ?? projects.find((x) => x.status === "ativo") ?? projects[0];
  if (!chosen) return { client, mustChangePassword: c.must_change_password, projects, feedback: [] };

  // 2.º pedido (em paralelo): detalhe do projeto e mensagens.
  const [detail, feedbackResult] = await Promise.all([
    sb
      .from("projects")
      .select(
        "id, slug, client_id, name, tagline, description, cover_url, service_type, github_owner, github_repo, started_on, due_on, team, phase_map, demo_links (id, kind, url, version, notes, created_at), meetings (id, title, starts_at, ends_at, call_url, agenda, notes)",
      )
      .eq("id", chosen.id)
      .maybeSingle<ProjectRow>(),
    sb
      .from("feedback")
      .select("id, author_role, body, target_kind, target_ref, created_at")
      .eq("project_id", chosen.id)
      .order("created_at", { ascending: true })
      .returns<FeedbackRow[]>(),
  ]);
  const { data: p, error: pe } = detail;
  if (pe) throw new Error(`Supabase (projects): ${pe.message}`);
  if (!p) return { client, mustChangePassword: c.must_change_password, projects, feedback: [] };

  const now = new Date().toISOString();
  // Fases: GitHub no Desenvolvimento (em cache; o webhook invalida-a), BD no Académico e no Design (ADR-001).
  const blocks = p.service_type !== "development";
  const [loaded, approvals, payments, filesPurgeOn, academicBrief, adjustedDueOn, sections, adjustments] = await Promise.all([
    loadPhases(
      { id: p.id, serviceType: p.service_type, githubOwner: p.github_owner, githubRepo: p.github_repo, phaseMap: p.phase_map },
      sb,
    ),
    // Aprovações só no Académico e no Design (M5-10); uma falha não deita a página abaixo.
    blocks ? loadApprovals(sb, p.id).then((r) => ("error" in r ? [] : r)) : Promise.resolve([]),
    blocks ? loadPayments(sb, p.id).then((r) => ("error" in r ? [] : r)) : Promise.resolve([]),
    // #122: à parte e tolerante a erro, para a página não cair se a migração 0008 ainda não estiver aplicada.
    sb
      .from("projects")
      .select("files_purge_on")
      .eq("id", p.id)
      .maybeSingle<{ files_purge_on: string | null }>()
      .then(({ data }) => data?.files_purge_on ?? undefined),
    // M6-01: a ficha só existe no Académico; loadBrief tolera a tabela em falta.
    p.service_type === "academic" ? loadBrief(sb, p.id) : Promise.resolve(null),
    // M6-02: prazo ajustado (RN-21). Se falhar, a contagem usa o due_on.
    p.service_type === "academic" && p.due_on
      ? sb.rpc("project_adjusted_due", { p_project: p.id }).then(({ data }) => (typeof data === "string" ? data : undefined))
      : Promise.resolve(undefined),
    // M6-03: capítulos (só título e estado).
    p.service_type === "academic" ? loadSections(sb, p.id) : Promise.resolve([]),
    // M6-06: pedidos de ajuste.
    p.service_type === "academic" ? loadAdjustments(sb, p.id) : Promise.resolve([]),
  ]);
  // A % da fase Desenvolvimento vem dos capítulos quando o trabalho os tem (RF-10.41, RF-10.43).
  const sync = { ...loaded, phases: applyChapterProgress(loaded.phases, sections, academicBrief?.usesChapters ?? true) };

  const project: Project = {
    id: p.id,
    slug: p.slug,
    clientId: p.client_id,
    name: p.name,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    coverUrl: p.cover_url ?? undefined,
    serviceType: p.service_type,
    approvals,
    payments,
    filesPurgeOn,
    academicBrief: academicBrief ?? undefined,
    adjustedDueOn,
    sections: p.service_type === "academic" ? sections : undefined,
    adjustments: p.service_type === "academic" ? adjustments : undefined,
    repo: { owner: p.github_owner ?? "", name: p.github_repo ?? "" },
    startedOn: p.started_on ?? now,
    dueOn: p.due_on ?? now,
    dueOnSet: Boolean(p.due_on),
    team: p.team ?? [],
    demos: p.demo_links.map((d) => ({
      id: d.id,
      kind: d.kind,
      url: d.url,
      version: d.version,
      notes: d.notes,
      createdAt: d.created_at,
    })),
    meetings: p.meetings.map(
      (m): Meeting => ({
        id: m.id,
        title: m.title,
        startsAt: m.starts_at,
        endsAt: m.ends_at,
        callUrl: m.call_url,
        agenda: m.agenda,
        notes: m.notes ?? undefined,
      }),
    ),
    ...sync,
  };

  const { data: f, error: fe } = feedbackResult;
  if (fe) throw new Error(`Supabase (feedback): ${fe.message}`);

  const feedback: Feedback[] = (f ?? []).map((r) => ({
    id: r.id,
    author: r.author_role,
    body: r.body,
    target: r.target_kind === "geral" || r.target_ref == null ? { kind: "geral" } : { kind: r.target_kind, ref: r.target_ref },
    createdAt: r.created_at,
  }));

  return { client, mustChangePassword: c.must_change_password, project: toView(project), projects, feedback };
}
