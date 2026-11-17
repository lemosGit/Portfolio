import { CalendarCheck, CalendarClock, Check, ChevronDown, Circle, Eye, Hand, LoaderCircle, PauseCircle } from "lucide-react";
import { longDate, shortDate } from "@/lib/portal/format";
import { requirePortal } from "@/lib/portal/session";
import type { PhaseView, Task } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "../../_components/PageHeader";
import { Roadmap } from "../../_components/Roadmap";

export const metadata = { title: "Meu projeto" };

export default async function ProjectPage() {
  const { project, unread } = await requirePortal();

  return (
    <div className="space-y-6">
      <PageHeader section="Meu projeto" title={project.name} unread={unread} syncedAt={project.syncedAt} source={project.source} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="road-title" className="panel p-7 md:p-9">
          <p className="kicker">Roadmap</p>
          <h2 id="road-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
            Etapas do projeto
          </h2>
          <div className="mt-10">
            <Roadmap phases={project.phaseViews} compact />
          </div>
        </section>

        <section aria-labelledby="about-title" className="panel p-7">
          <p className="kicker">Sobre o projeto</p>
          <h2 id="about-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
            {project.tagline}
          </h2>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">{project.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-[13px]">
            <div>
              <dt className="flex items-center gap-1.5 text-ink-faint">
                <CalendarCheck size={14} aria-hidden /> Início
              </dt>
              <dd className="mt-1 text-ink">{longDate(project.startedOn)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-ink-faint">
                <CalendarClock size={14} aria-hidden /> Entrega prevista
              </dt>
              <dd className="mt-1 text-ink">{longDate(project.dueOn)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ink-faint">Tarefas concluídas</dt>
              <dd className="mt-1 text-ink">
                {project.closedCount} de {project.total} · {project.percent}%
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section aria-labelledby="tasks-title" className="panel p-4 sm:p-7">
        <div className="px-3 pb-2 sm:px-0">
          <p className="kicker">Tarefas</p>
          <h2 id="tasks-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
            O que foi feito e o que falta
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          {project.phaseViews.map((ph) => (
            <PhaseBlock key={ph.number} phase={ph} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PhaseBlock({ phase }: { phase: PhaseView }) {
  const label = { done: "Concluída", current: "Em curso", pending: "Por iniciar" }[phase.status];
  return (
    <details
      open={phase.status === "current"}
      className="group rounded-2xl border border-line bg-white/[0.015] open:bg-white/[0.025]"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 rounded-2xl px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-sm font-semibold text-ink-faint">{String(phase.number).padStart(2, "0")}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] font-semibold text-ink">{phase.title}</span>
          <span className="mt-0.5 block text-xs text-ink-faint">{phase.description}</span>
        </span>
        <span className="hidden w-40 sm:block" aria-hidden>
          <span className="block h-1 overflow-hidden rounded-full bg-white/[0.07]">
            <span
              className="block h-full rounded-full"
              style={{ width: `${phase.percent}%`, background: "linear-gradient(90deg, #8b6cff, #5fd4e8)" }}
            />
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
            phase.status === "done" && "bg-ok/10 text-ok",
            phase.status === "current" && "bg-accent/20 text-accent-soft",
            phase.status === "pending" && "bg-white/5 text-ink-faint",
          )}
        >
          {label} · {phase.closedCount}/{phase.total}
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 text-ink-faint transition-transform duration-200 ease-out group-open:rotate-180"
          aria-hidden
        />
      </summary>
      {phase.tasks.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {phase.tasks.map((t) => (
            <TaskRow key={t.number} task={t} />
          ))}
        </ul>
      ) : (
        <p className="border-t border-line px-5 py-4 text-[13px] text-ink-faint">
          {phase.total > 0
            ? "O trabalho desta fase é técnico e interno. O progresso conta na percentagem acima."
            : "Ainda sem tarefas planeadas para esta fase."}
        </p>
      )}
    </details>
  );
}

const STAGE: Record<NonNullable<Task["stage"]>, { label: string; icon: typeof Check; tone: string }> = {
  progress: { label: "Em curso", icon: LoaderCircle, tone: "bg-accent/15 text-accent-soft" },
  review: { label: "Em revisão", icon: Eye, tone: "bg-accent/15 text-accent-soft" },
  "needs-client": { label: "Precisa de si", icon: Hand, tone: "bg-amber-400/15 text-amber-300" },
  waiting: { label: "Em espera", icon: PauseCircle, tone: "bg-white/5 text-ink-dim" },
};

function TaskRow({ task }: { task: Task }) {
  const done = task.state === "closed";
  const stage = !done && task.stage ? STAGE[task.stage] : undefined;
  const Icon = done ? Check : (stage?.icon ?? Circle);
  return (
    <li id={`tarefa-${task.number}`} className="flex scroll-mt-24 items-center gap-4 px-5 py-3.5 target:bg-accent/10">
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
          done ? "bg-ok/10 text-ok" : stage ? stage.tone : "text-ink-faint",
        )}
      >
        <Icon size={done ? 14 : stage ? 14 : 12} strokeWidth={done ? 2.5 : 2} aria-hidden />
      </span>
      <span className={cn("min-w-0 flex-1 text-[13px]", done ? "text-ink-dim" : "text-ink")}>{task.title}</span>
      <span className="hidden text-[11px] text-ink-faint sm:inline">{task.area}</span>
      <span
        className={cn(
          "w-24 shrink-0 text-right text-[11px]",
          task.stage === "needs-client" && !done ? "font-semibold text-amber-300" : "text-ink-faint",
        )}
      >
        {done && task.closedAt ? shortDate(task.closedAt) : (stage?.label ?? "Por fazer")}
      </span>
    </li>
  );
}
