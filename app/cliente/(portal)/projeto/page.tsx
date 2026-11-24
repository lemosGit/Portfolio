import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronDown,
  Circle,
  ExternalLink,
  Eye,
  Globe,
  Hand,
  LoaderCircle,
  PauseCircle,
  Smartphone,
} from "lucide-react";
import { relative, shortDate } from "@/lib/portal/format";
import { requirePortal } from "@/lib/portal/session";
import type { PhaseView, ProjectView, Task } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { CoverBackdrop, Details } from "../../_components/Details";
import { PageHeader } from "../../_components/PageHeader";

export const metadata = { title: "Meu projeto" };

const VIEWS = [
  { id: "etapas", label: "Etapas" },
  { id: "tarefas", label: "Tarefas" },
  { id: "demonstracao", label: "Demonstração" },
] as const;
type ViewId = (typeof VIEWS)[number]["id"];

export default async function ProjectPage({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const [{ project, unread }, { vista }] = await Promise.all([requirePortal(), searchParams]);
  const view: ViewId = VIEWS.some((v) => v.id === vista) ? (vista as ViewId) : "etapas";

  return (
    <div className="space-y-8">
      <PageHeader section="Meu projeto" eyebrow="Vamos construir algo bom" title="O meu projeto" unread={unread} source={project.source} />

      <Summary project={project} />

      <div>
        <nav aria-label="Vistas do projeto" className="flex gap-7 border-b border-line">
          {VIEWS.map((v) => {
            const active = v.id === view;
            return (
              <Link
                key={v.id}
                href={v.id === "etapas" ? "/cliente/projeto" : `/cliente/projeto?vista=${v.id}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px border-b-2 pb-3 text-sm transition-colors duration-200",
                  active ? "border-accent text-ink" : "border-transparent text-ink-faint hover:text-ink",
                )}
              >
                {v.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          {view === "etapas" && <Stages phases={project.phaseViews} />}
          {view === "tarefas" && <Tasks phases={project.phaseViews} />}
          {view === "demonstracao" && <Demo project={project} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- resumo ---------- */

function Summary({ project }: { project: ProjectView }) {
  return (
    <section aria-label="Resumo do projeto" className="panel panel-glow">
      <CoverBackdrop src={project.coverUrl} />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              {project.percent >= 100 ? "Concluído" : `Em ${project.currentPhase.title.toLowerCase()}`}
            </span>
            <h2 className="mt-4 font-display text-[26px] font-normal leading-tight tracking-[-0.03em] text-ink md:text-[30px]">
              {project.name}
            </h2>
          </div>
          <p className="aurora shrink-0 font-display text-[44px] font-normal leading-none tracking-[-0.04em]">
            {project.percent}
            <span className="ml-0.5 text-lg text-ink-dim">%</span>
          </p>
        </div>

        <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
          <div
            className="bar-sheen h-full rounded-full"
            style={{ width: `${project.percent}%`, background: "rgb(var(--c-accent))" }}
          />
        </div>

        <Details className="mt-4">
          {project.tagline && <p className="max-w-xl text-sm leading-relaxed text-ink-dim">{project.tagline}</p>}
          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[12px] text-ink-faint">
            <div className="flex items-center gap-1.5">
              <CalendarCheck size={14} aria-hidden />
              <dt>Início</dt>
              <dd className="text-ink-dim">{shortDate(project.startedOn)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarClock size={14} aria-hidden />
              <dt>Entrega prevista</dt>
              <dd className="text-ink-dim">{shortDate(project.dueOn)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Tarefas concluídas</dt>
              <dd className="text-ink-dim">
                {project.closedCount} de {project.total} tarefas
              </dd>
            </div>
          </dl>
        </Details>
      </div>
    </section>
  );
}

/* ---------- etapas ---------- */

const STATUS_LABEL = { done: "Concluída", current: "Em curso", pending: "Por iniciar", skipped: "Não se aplica" } as const;

function Stages({ phases }: { phases: PhaseView[] }) {
  return (
    <section aria-label="Etapas do projeto" className="panel px-3 py-2 sm:px-6">
      <ol className="divide-y divide-line">
        {phases.map((ph) => (
          <li key={ph.number}>
            <StageRow phase={ph} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function StageRow({ phase }: { phase: PhaseView }) {
  const when =
    phase.status === "done"
      ? "Concluída"
      : phase.dueOn
        ? `Até ${shortDate(phase.dueOn)}`
        : STATUS_LABEL[phase.status];
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded-xl px-3 py-5 transition-colors hover:bg-white/[0.02] [&::-webkit-details-marker]:hidden">
        <StageDot status={phase.status} n={phase.number} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">{phase.title}</span>
            {phase.status === "current" && (
              <span className="rounded-md bg-accent/15 px-1.5 py-px text-xs font-medium text-accent-soft">
                Agora
              </span>
            )}
          </span>
        </span>
        <span className="hidden text-right text-[12px] text-ink-faint sm:block">{when}</span>
        <ChevronDown
          size={17}
          className="shrink-0 text-ink-faint transition-transform duration-200 ease-out group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="pb-5 pl-[60px] pr-3">
        {phase.description && <p className="mb-3 text-[13px] text-ink-dim">{phase.description}</p>}
        <div className="flex items-center gap-3 text-[12px] text-ink-faint">
          <span className="block h-1 w-40 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden>
            <span
              className="block h-full rounded-full"
              style={{ width: `${phase.percent}%`, background: "rgb(var(--c-accent))" }}
            />
          </span>
          {phase.closedCount} de {phase.total} · {phase.percent}%
        </div>
        {phase.tasks.length > 0 ? (
          <PhaseTasks tasks={phase.tasks} />
        ) : (
          <p className="mt-4 text-[13px] text-ink-faint">
            {phase.total > 0
              ? "O trabalho desta etapa é técnico e interno. O progresso conta na percentagem."
              : "Ainda sem tarefas planeadas para esta etapa."}
          </p>
        )}
      </div>
    </details>
  );
}

/** Em aberto primeiro; as concluídas ficam recolhidas para a lista não pesar. */
function PhaseTasks({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => t.state === "open");
  const done = tasks.filter((t) => t.state === "closed");
  const doneList = (
    <ul className="mt-2 space-y-1">
      {done.map((t) => (
        <TaskRow key={t.number} task={t} />
      ))}
    </ul>
  );
  return (
    <div className="mt-4">
      {open.length > 0 && (
        <ul className="space-y-1">
          {open.map((t) => (
            <TaskRow key={t.number} task={t} />
          ))}
        </ul>
      )}
      {done.length > 0 &&
        (open.length > 0 ? (
          <details className="group/done mt-2">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 py-2 text-[12px] text-ink-faint transition-colors hover:text-ink-dim [&::-webkit-details-marker]:hidden">
              <ChevronDown size={14} className="transition-transform duration-200 group-open/done:rotate-180" aria-hidden />
              {done.length} {done.length === 1 ? "tarefa concluída" : "tarefas concluídas"}
            </summary>
            {doneList}
          </details>
        ) : (
          doneList
        ))}
    </div>
  );
}

function StageDot({ status, n }: { status: PhaseView["status"]; n: number }) {
  if (status === "done") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-ink-dim">
        <Check size={15} strokeWidth={2.4} aria-hidden />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent bg-accent/10 ring-4 ring-accent/10">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-soft" aria-hidden />
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-xs font-semibold text-ink-faint">
      {String(n).padStart(2, "0")}
    </span>
  );
}

/* ---------- tarefas ---------- */

const ORDER: Record<string, number> = { "needs-client": 0, progress: 1, review: 2, waiting: 3, todo: 4, done: 5 };

function Tasks({ phases }: { phases: PhaseView[] }) {
  const all = phases.flatMap((ph) => ph.tasks.map((t) => ({ ...t, phase: ph.title })));
  const key = (t: Task) => (t.state === "closed" ? "done" : (t.stage ?? "todo"));
  const open = all.filter((t) => t.state === "open").sort((a, b) => ORDER[key(a)] - ORDER[key(b)]);
  const done = all
    .filter((t) => t.state === "closed")
    .sort((a, b) => +new Date(b.closedAt ?? b.updatedAt) - +new Date(a.closedAt ?? a.updatedAt));

  if (all.length === 0) {
    return (
      <section className="panel p-7 text-[13px] text-ink-faint">Ainda sem tarefas.</section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TaskGroup title="Em aberto" tasks={open} empty="Nada em aberto. Tudo feito!" />
      <TaskGroup title="Concluídas" tasks={done} empty="Ainda nenhuma concluída." collapsed />
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  empty,
  collapsed,
}: {
  title: string;
  tasks: (Task & { phase: string })[];
  empty: string;
  /** Lista recolhida atrás de "Ver detalhes" (ex.: concluídas). */
  collapsed?: boolean;
}) {
  const list = (
    <ul className="space-y-1">
      {tasks.map((t) => (
        <TaskRow key={t.number} task={t} phase={t.phase} />
      ))}
    </ul>
  );
  return (
    <section className="panel h-fit p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        <span className="text-[12px] text-ink-faint">{tasks.length}</span>
      </div>
      {!tasks.length ? (
        <p className="mt-5 text-[13px] text-ink-faint">{empty}</p>
      ) : collapsed ? (
        <Details className="mt-3">{list}</Details>
      ) : (
        <div className="mt-5">{list}</div>
      )}
    </section>
  );
}

const STAGE: Record<NonNullable<Task["stage"]>, { label: string; icon: typeof Check; tone: string }> = {
  progress: { label: "Em curso", icon: LoaderCircle, tone: "bg-accent/15 text-accent-soft" },
  review: { label: "Em revisão", icon: Eye, tone: "bg-accent/15 text-accent-soft" },
  "needs-client": { label: "Precisa de si", icon: Hand, tone: "bg-action/15 text-action" },
  waiting: { label: "Em espera", icon: PauseCircle, tone: "bg-white/5 text-ink-dim" },
};

function TaskRow({ task, phase }: { task: Task; phase?: string }) {
  const done = task.state === "closed";
  const stage = !done && task.stage ? STAGE[task.stage] : undefined;
  const Icon = done ? Check : (stage?.icon ?? Circle);
  return (
    <li
      id={`tarefa-${task.number}`}
      title={phase}
      className="flex scroll-mt-24 items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.02] target:bg-accent/10"
    >
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-md",
          done ? "bg-ok/10 text-ok" : stage ? stage.tone : "text-ink-faint",
        )}
      >
        <Icon size={done || stage ? 13 : 11} strokeWidth={done ? 2.5 : 2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[13px]", done ? "text-ink-dim" : "text-ink")}>{task.title}</span>
      </span>
      <span
        className={cn(
          "shrink-0 text-right text-xs",
          task.stage === "needs-client" && !done ? "font-semibold text-action" : "text-ink-faint",
        )}
      >
        {done && task.closedAt ? shortDate(task.closedAt) : (stage?.label ?? "Por fazer")}
      </span>
    </li>
  );
}

/* ---------- demonstração ---------- */

function Demo({ project }: { project: ProjectView }) {
  const items = [
    { demo: project.latestWeb, icon: Globe, title: "Versão web", empty: "Ainda não disponível." },
    { demo: project.latestApp, icon: Smartphone, title: "App mobile", empty: "Ainda não disponível." },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {items.map(({ demo, icon: Icon, title, empty }) => (
          <section key={title} className="panel flex flex-col p-7">
            <span className="icon-tile">
              <Icon size={18} aria-hidden />
            </span>
            <h2 className="mt-5 text-base font-medium text-ink">{title}</h2>
            {demo ? (
              <>
                <p className="mt-1 text-[12px] text-ink-faint">
                  v{demo.version} · {relative(demo.createdAt)}
                </p>
                <a href={demo.url} target="_blank" rel="noreferrer" className="btn-quiet mt-6 self-start">
                  Abrir <ExternalLink size={15} aria-hidden />
                </a>
                {demo.notes && (
                  <Details className="mt-4">
                    <p className="text-[13px] leading-relaxed text-ink-dim">{demo.notes}</p>
                  </Details>
                )}
              </>
            ) : (
              <p className="mt-3 text-[13px] text-ink-faint">{empty}</p>
            )}
          </section>
        ))}
      </div>
      <Link
        href="/cliente/entregas"
        className="inline-flex items-center gap-2 text-[13px] text-accent-soft transition-colors hover:text-ink"
      >
        Todas as versões <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  );
}
