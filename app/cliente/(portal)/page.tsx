import Link from "next/link";
import { ArrowRight, Hand, Play } from "lucide-react";
import { requirePortal } from "@/lib/portal/session";
import { CoverBackdrop } from "../_components/Details";
import { FeedbackComposer } from "../_components/Feedback";
import { PageHeader } from "../_components/PageHeader";
import { ProgressRing, WeekBars } from "../_components/Progress";
import { Roadmap } from "../_components/Roadmap";
import { PhoneOrbit } from "../_components/Visuals";
import { ActivityFeed, NextMeeting, PanelHead, PreviewWindow, TextLink } from "../_components/Widgets";

export const metadata = { title: "Visão geral" };

export default async function Overview() {
  const { client, project, unread } = await requirePortal();
  const firstName = client.name.split(" ")[0];
  const cp = project.currentPhase;
  const statusLabel = cp.status === "done" ? "Projeto entregue" : `${cp.title} em curso`;

  return (
    <div className="space-y-6">
      <PageHeader
        section="Visão geral"
        eyebrow="Vamos construir algo bom"
        unread={unread}
        source={project.source}
        title={
          <>
            Olá, <span className="aurora">{firstName}.</span>
          </>
        }
      />

      {project.needsClient.length > 0 && (
        <section
          aria-labelledby="needs-title"
          className="flex flex-col gap-4 rounded-2xl border border-action/25 bg-action/[0.05] p-4 sm:flex-row sm:items-center sm:px-5"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-action/15 text-action">
            <Hand size={18} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="needs-title" className="text-sm font-semibold text-ink">
              {project.needsClient.length === 1
                ? "Uma tarefa está à espera de informação sua"
                : `${project.needsClient.length} tarefas estão à espera de informação sua`}
            </h2>
            <ul className="mt-1 text-[13px] text-ink-dim">
              {project.needsClient.slice(0, 3).map((t) => (
                <li key={t.number}>
                  <Link href={`/cliente/projeto?vista=tarefas#tarefa-${t.number}`} className="underline-offset-4 hover:text-ink hover:underline">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/cliente/mensagens" className="btn-quiet h-11 shrink-0 px-5">
            Responder
          </Link>
        </section>
      )}

      {/* Linha 1: destaque + progresso */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="hero-title" className="panel panel-glow">
          <CoverBackdrop src={project.coverUrl} />
          <div className="relative grid items-center gap-4 p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] md:p-9">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
                {statusLabel}
              </p>
              <h2
                id="hero-title"
                className="mt-5 font-display text-[28px] font-normal leading-[1.12] tracking-[-0.03em] text-ink sm:text-[32px]"
              >
                {project.name},
                <br />
                <span className="aurora">mais perto da entrega.</span>
              </h2>
              <div className="mt-7 flex flex-wrap items-center gap-6">
                <Link href="/cliente/entregas" className="btn-violet h-12 px-6">
                  <Play size={15} fill="currentColor" aria-hidden /> Ver demonstração
                </Link>
                <TextLink href="/cliente/projeto">Detalhes do projeto</TextLink>
              </div>
            </div>
            {!project.coverUrl && (
              <div className="relative mx-auto hidden w-full max-w-[260px] md:block">
                <PhoneOrbit />
              </div>
            )}
          </div>
        </section>

        <section aria-labelledby="progress-title" className="panel flex flex-col p-7">
          <PanelHead
            id="progress-title"
            kicker="Estado geral"
            title="Progresso do projeto"
            action={<TextLink href="/cliente/projeto">Ver detalhes</TextLink>}
          />
          <div className="mt-8 flex justify-center">
            <ProgressRing percent={project.percent} size={184} />
          </div>
          <div className="mt-auto pt-9">
            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="text-ink-faint">Esta semana</span>
              <span className="font-semibold text-ok">+{project.weeklyDelta}%</span>
            </div>
            <WeekBars data={project.weekly} />
          </div>
        </section>
      </div>

      {/* Linha 2: roadmap + reunião + GitHub */}
      <div className="grid gap-6 lg:grid-cols-2 min-[1720px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_380px]">
        <section aria-labelledby="roadmap-title" className="panel p-7 lg:col-span-2 min-[1720px]:col-span-1">
          <PanelHead
            id="roadmap-title"
            kicker="Roadmap"
            title="Etapas do projeto"
            action={<TextLink href="/cliente/projeto">Ver detalhes</TextLink>}
          />
          <div className="mt-8">
            <Roadmap phases={project.phaseViews} />
          </div>
        </section>

        <section aria-label="Próxima reunião" className="panel">
          <NextMeeting meeting={project.nextMeeting} />
        </section>

        <section aria-labelledby="news-title" className="panel p-7">
          <PanelHead id="news-title" kicker="Novidades" title="Últimas atualizações" />
          <div className="mt-6">
            <ActivityFeed items={project.recentActivity} />
          </div>
        </section>
      </div>

      {/* Linha 3: preview + feedback */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-label="Demonstração web" className="panel">
          <PreviewWindow demo={project.latestWeb} projectName={project.name} />
        </section>

        <section aria-labelledby="fb-title" className="panel flex flex-col p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="kicker">Canal direto</p>
              <h2 id="fb-title" className="mt-2.5 text-base font-medium text-ink">
                Partilhe o seu feedback
              </h2>
            </div>
            {unread > 0 && (
              <Link href="/cliente/mensagens" className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-soft">
                {unread} {unread === 1 ? "resposta nova" : "respostas novas"} <ArrowRight size={12} aria-hidden />
              </Link>
            )}
          </div>
          <div className="mt-6">
            <FeedbackComposer compact />
          </div>
        </section>
      </div>
    </div>
  );
}
