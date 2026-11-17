import Link from "next/link";
import { ArrowRight, Hand, MoreHorizontal, Play } from "lucide-react";
import { requirePortal } from "@/lib/portal/session";
import { FeedbackComposer } from "../_components/Feedback";
import { PageHeader } from "../_components/PageHeader";
import { ProgressRing, WeekBars } from "../_components/Progress";
import { Roadmap } from "../_components/Roadmap";
import { PhoneOrbit } from "../_components/Visuals";
import { GithubBadge, GithubFeed, NextMeeting, PanelHead, PreviewWindow, TextLink } from "../_components/Widgets";

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
        unread={unread}
        syncedAt={project.syncedAt}
        source={project.source}
        title={
          <>
            Olá, {firstName}. <span className="font-normal text-ink-faint">O projeto está a evoluir.</span>
          </>
        }
      />

      {project.needsClient.length > 0 && (
        <section
          aria-labelledby="needs-title"
          className="flex flex-col gap-4 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-5 sm:flex-row sm:items-center"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-300/15 text-amber-300">
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
                  <Link href={`/cliente/projeto#tarefa-${t.number}`} className="underline-offset-4 hover:text-ink hover:underline">
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
        <section aria-labelledby="hero-title" className="panel overflow-hidden">
          <div className="grid items-center gap-4 p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:p-12">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_8px_#3ddc97]" aria-hidden />
                {statusLabel}
              </p>
              <h2
                id="hero-title"
                className="mt-8 font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[42px]"
              >
                {project.name},
                <br />
                <span className="text-gradient">mais perto da entrega.</span>
              </h2>
              <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ink-dim">
                Acompanhe cada etapa, reveja os últimos avanços e partilhe feedback diretamente com a equipa.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link href="/cliente/entregas" className="btn-violet h-[52px] px-6">
                  <Play size={15} fill="currentColor" aria-hidden /> Ver demonstração
                </Link>
                <TextLink href="/cliente/projeto">Detalhes do projeto</TextLink>
              </div>
            </div>
            <div className="relative mx-auto hidden w-full max-w-[330px] md:block">
              <PhoneOrbit />
              <p className="absolute -bottom-2 right-0 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden /> Live preview
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="progress-title" className="panel flex flex-col p-7">
          <PanelHead
            id="progress-title"
            kicker="Estado geral"
            title="Progresso do projeto"
            action={
              <Link
                href="/cliente/projeto"
                aria-label="Ver todas as tarefas"
                className="-mr-2 -mt-1 grid h-10 w-10 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-white/5 hover:text-ink"
              >
                <MoreHorizontal size={20} aria-hidden />
              </Link>
            }
          />
          <div className="mt-8 flex items-center gap-7">
            <ProgressRing percent={project.percent} />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">Fase atual</p>
              <p className="mt-1.5 font-display text-lg font-semibold text-ink">{cp.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                {cp.closedCount} de {cp.total} tarefas concluídas
              </p>
              <div className="mt-5 flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {project.team.slice(0, 2).map((m) => (
                    <span
                      key={m.initials}
                      title={m.name}
                      className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#6d4cff] to-[#3f2f8f] text-[10px] font-bold text-white ring-2 ring-[#120e22]"
                    >
                      {m.initials}
                    </span>
                  ))}
                  {project.team.length > 2 && (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[10px] font-semibold text-ink-dim ring-2 ring-[#120e22]">
                      +{project.team.length - 2}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight text-ink-faint">Equipa ativa</span>
              </div>
            </div>
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
            action={<TextLink href="/cliente/projeto">Ver roadmap</TextLink>}
          />
          <div className="mt-10">
            <Roadmap phases={project.phaseViews} />
          </div>
        </section>

        <section aria-label="Próxima reunião" className="panel">
          <NextMeeting meeting={project.nextMeeting} />
        </section>

        <section aria-labelledby="gh-title" className="panel p-7">
          <PanelHead id="gh-title" kicker="GitHub sync" title="Últimas atualizações" action={<GithubBadge />} />
          <div className="mt-6">
            <GithubFeed items={project.recentActivity} />
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
              <h2 id="fb-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
                Partilhe o seu feedback
              </h2>
            </div>
            {unread > 0 && (
              <Link href="/cliente/mensagens" className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent-soft">
                {unread} {unread === 1 ? "resposta nova" : "respostas novas"} <ArrowRight size={12} aria-hidden />
              </Link>
            )}
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-ink-dim">
            Tem uma sugestão ou encontrou algo a rever? Envie uma mensagem diretamente por aqui.
          </p>
          <div className="mt-6">
            <FeedbackComposer compact />
          </div>
        </section>
      </div>
    </div>
  );
}
