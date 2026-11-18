import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { setTasksVisible } from "@/lib/admin/actions";
import { getProjectById } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { loadRepoIssues, type AdminIssue } from "@/lib/github/phases";
import { PHASES } from "@/lib/portal/phases";
import { cn } from "@/lib/utils";
import { ActionForm } from "../../../_components/forms";
import { AdminHeader, Badge, Empty, Section } from "../../../_components/ui";

export const metadata = { title: "Tarefas visíveis" };

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "visiveis", label: "Visíveis ao cliente" },
  { key: "abertas", label: "Abertas" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filtro?: string }>;
}) {
  const [{ id }, { filtro }] = await Promise.all([params, searchParams]);
  const filter: Filter = FILTERS.some((f) => f.key === filtro) ? (filtro as Filter) : "todas";
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();

  const trail = [
    { href: "/admin/clientes", label: "Clientes" },
    { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
    { href: `/admin/projetos/${p.id}`, label: p.name },
    { href: `/admin/projetos/${p.id}/tarefas`, label: "Tarefas" },
  ];

  if (!p.githubOwner || !p.githubRepo) {
    return (
      <div className="space-y-6">
        <AdminHeader trail={trail} title="Tarefas visíveis ao cliente" />
        <Empty>Este projeto não tem repositório GitHub. Indique-o em “Dados do projeto”.</Empty>
      </div>
    );
  }
  const repo = `${p.githubOwner}/${p.githubRepo}`;

  let data: Awaited<ReturnType<typeof loadRepoIssues>>;
  try {
    data = await loadRepoIssues(p.githubOwner, p.githubRepo, p.phaseMap);
  } catch (e) {
    return (
      <div className="space-y-6">
        <AdminHeader trail={trail} title="Tarefas visíveis ao cliente" />
        <Empty>Não foi possível ler {repo}: {e instanceof Error ? e.message : "erro desconhecido"}</Empty>
      </div>
    );
  }

  const { issues, visibleRule } = data;
  const visibleCount = issues.filter((i) => i.visible).length;
  const shown = issues.filter((i) => (filter === "visiveis" ? i.visible : filter === "abertas" ? i.state === "open" : true));
  const groups = [...PHASES.map((ph) => ({ number: ph.number as number | null, title: `${ph.number}. ${ph.title}` })), { number: null, title: "Sem fase (sem milestone M0–M11)" }]
    .map((g) => ({ ...g, items: shown.filter((i) => i.phase === g.number) }))
    .filter((g) => g.items.length > 0);
  const fallbackVisible = issues.filter((i) => i.visible && !i.labelled).map((i) => i.number);

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={trail}
        title="Tarefas visíveis ao cliente"
        subtitle={
          <>
            {visibleCount} de {issues.length} issues aparecem no portal (todas contam para a percentagem). Clique em Visível ou Oculta para trocar.
          </>
        }
        actions={
          <a href={`https://github.com/${repo}/issues`} target="_blank" rel="noreferrer" className="btn-quiet h-11 py-0">
            {repo} <ExternalLink size={14} aria-hidden />
          </a>
        }
      />

      {visibleRule === "fallback" && (
        <div className="panel border-amber-400/25 p-5">
          <p className="text-sm font-semibold text-amber-200">Regra provisória ativa</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-dim">
            Nenhuma issue tem a label <code className="font-mono">cliente: visível</code>, por isso o cliente vê as{" "}
            {fallbackVisible.length} issues <code className="font-mono">tipo: feature</code> e <code className="font-mono">tipo: bug</code>. Assim que
            marcar a primeira, o cliente passa a ver <strong>só</strong> as marcadas.
          </p>
          {fallbackVisible.length > 0 && (
            <ActionForm action={setTasksVisible} submit={`Manter as ${fallbackVisible.length} atuais visíveis (marcar com a label)`} pendingLabel="A marcar no GitHub…" className="mt-4">
              <input type="hidden" name="projeto" value={p.id} />
              <input type="hidden" name="issues" value={fallbackVisible.join(",")} />
              <input type="hidden" name="visivel" value="1" />
            </ActionForm>
          )}
        </div>
      )}

      <nav aria-label="Filtro" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/projetos/${p.id}/tarefas${f.key === "todas" ? "" : `?filtro=${f.key}`}`}
            aria-current={filter === f.key ? "page" : undefined}
            className={cn(
              "rounded-xl border px-3.5 py-2 text-[13px] transition-colors",
              filter === f.key ? "border-accent/40 bg-accent/15 text-ink" : "border-line text-ink-dim hover:text-ink",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {groups.length === 0 ? (
        <Empty>Nenhuma issue com este filtro.</Empty>
      ) : (
        groups.map((g) => {
          const notLabelled = g.items.filter((i) => !i.labelled).map((i) => i.number);
          const labelled = g.items.filter((i) => i.labelled).map((i) => i.number);
          return (
            <Section
              key={g.title}
              title={g.title}
              description={`${g.items.filter((i) => i.visible).length} de ${g.items.length} visíveis`}
              actions={
                <div className="flex flex-wrap gap-2">
                  {notLabelled.length > 0 && (
                    <ActionForm action={setTasksVisible} inline variant="quiet" submit={<><Eye size={14} aria-hidden /> Mostrar todas</>} pendingLabel="A marcar…">
                      <input type="hidden" name="projeto" value={p.id} />
                      <input type="hidden" name="issues" value={notLabelled.join(",")} />
                      <input type="hidden" name="visivel" value="1" />
                    </ActionForm>
                  )}
                  {labelled.length > 0 && (
                    <ActionForm action={setTasksVisible} inline variant="quiet" submit={<><EyeOff size={14} aria-hidden /> Ocultar todas</>} pendingLabel="A remover…">
                      <input type="hidden" name="projeto" value={p.id} />
                      <input type="hidden" name="issues" value={labelled.join(",")} />
                      <input type="hidden" name="visivel" value="0" />
                    </ActionForm>
                  )}
                </div>
              }
            >
              <ul className="divide-y divide-line">
                {g.items.map((i) => (
                  <IssueRow key={i.number} i={i} repo={repo} projectId={p.id} />
                ))}
              </ul>
            </Section>
          );
        })
      )}
    </div>
  );
}

function IssueRow({ i, repo, projectId }: { i: AdminIssue; repo: string; projectId: string }) {
  const extra = i.labels.filter((l) => /^(tipo|estado|area):/i.test(l));
  return (
    <li className={cn("flex flex-wrap items-center gap-3 py-3", !i.visible && "opacity-70")}>
      <a href={`https://github.com/${repo}/issues/${i.number}`} target="_blank" rel="noreferrer" className="w-12 shrink-0 font-mono text-xs text-ink-faint hover:text-accent-soft">
        #{i.number}
      </a>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm text-ink", i.state === "closed" && "text-ink-dim line-through decoration-ink-faint/50")}>{i.title}</p>
        <p className="mt-1 flex flex-wrap gap-1.5">
          {i.state === "closed" && <Badge tone="ok">Fechada</Badge>}
          {extra.map((l) => (
            <Badge key={l}>{l}</Badge>
          ))}
          {i.visible && !i.labelled && <Badge tone="warn">visível pela regra provisória</Badge>}
        </p>
      </div>
      <ActionForm
        action={setTasksVisible}
        inline
        variant={i.labelled ? "primary" : "quiet"}
        submit={
          i.labelled ? (
            <>
              <Eye size={14} aria-hidden /> Visível
            </>
          ) : (
            <>
              <EyeOff size={14} aria-hidden /> Oculta
            </>
          )
        }
        pendingLabel="…"
      >
        <input type="hidden" name="projeto" value={projectId} />
        <input type="hidden" name="issues" value={String(i.number)} />
        <input type="hidden" name="visivel" value={i.labelled ? "0" : "1"} />
      </ActionForm>
    </li>
  );
}
