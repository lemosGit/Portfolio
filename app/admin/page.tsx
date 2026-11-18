import Link from "next/link";
import { ArrowRight, CalendarDays, FolderKanban, MessageSquare, Plus, Users, Video } from "lucide-react";
import { listClients, listConversations, listProjects, upcomingMeetings, withProgress } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { greeting, relative, shortDate, time } from "@/lib/portal/format";
import { AdminHeader, Avatar, Badge, Empty, Progress, ProjectStatusBadge, Section } from "./_components/ui";

export const metadata = { title: "Visão geral" };

export default async function AdminHome() {
  const { sb, name } = await requireAdmin();
  const [clients, projects, conversations, meetings] = await Promise.all([
    listClients(sb),
    listProjects(sb),
    listConversations(sb),
    upcomingMeetings(sb),
  ]);
  const active = projects.filter((p) => p.status === "ativo");
  const views = await Promise.all(active.map(async (p) => ({ p, v: await withProgress(p) })));
  const awaiting = conversations.filter((c) => c.awaiting);
  const firstName = name.split(" ")[0];

  const stats = [
    { label: "Clientes", value: clients.length, icon: Users, href: "/admin/clientes" },
    { label: "Projetos ativos", value: active.length, icon: FolderKanban, href: "/admin/clientes" },
    { label: "Por responder", value: awaiting.length, icon: MessageSquare, href: "/admin/mensagens", hot: awaiting.length > 0 },
    { label: "Reuniões marcadas", value: meetings.length, icon: CalendarDays, href: "#reunioes" },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`${greeting()}, ${firstName}`}
        subtitle="Estado dos projetos, mensagens por responder e próximas reuniões."
        actions={
          <Link href="/admin/clientes/novo" className="btn-violet h-11">
            <Plus size={17} aria-hidden /> Novo cliente
          </Link>
        }
      />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, hot }) => (
          <li key={label}>
            <Link href={href} className="panel flex items-center justify-between gap-3 p-5 transition-colors hover:border-accent/30">
              <div>
                <p className="text-xs text-ink-faint">{label}</p>
                <p className="mt-2 font-display text-[28px] font-semibold tabular-nums text-ink">{value}</p>
              </div>
              <span
                className={
                  hot
                    ? "grid h-11 w-11 place-items-center rounded-2xl bg-accent text-white"
                    : "grid h-11 w-11 place-items-center rounded-2xl border border-line bg-white/[0.03] text-accent-soft"
                }
              >
                <Icon size={19} aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Section title="Projetos ativos" description="Progresso calculado a partir das issues do GitHub, igual ao que o cliente vê.">
          {views.length === 0 ? (
            <Empty>Ainda não há projetos ativos.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {views.map(({ p, v }) => (
                <li key={p.id}>
                  <Link href={`/admin/projetos/${p.id}`} className="group -mx-2 flex flex-col gap-3 rounded-xl px-2 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{p.name}</p>
                        <ProjectStatusBadge status={p.status} />
                        {v.source === "erro" && <Badge tone="warn">GitHub indisponível</Badge>}
                      </div>
                      <p className="mt-1 text-[13px] text-ink-faint">
                        {p.clientName}
                        {p.clientCompany && ` · ${p.clientCompany}`} · fase: {v.currentPhase.title}
                        {p.dueOn && ` · entrega ${shortDate(p.dueOn)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:w-56">
                      <Progress percent={v.percent} className="flex-1" />
                      <span className="w-10 text-right text-sm font-semibold tabular-nums text-accent-soft">{v.percent}%</span>
                      <ArrowRight size={16} className="text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="space-y-6">
          <Section
            title="Por responder"
            actions={
              <Link href="/admin/mensagens" className="text-[13px] text-accent-soft hover:underline">
                Todas
              </Link>
            }
          >
            {awaiting.length === 0 ? (
              <Empty>Está tudo respondido.</Empty>
            ) : (
              <ul className="space-y-2">
                {awaiting.slice(0, 5).map((c) => (
                  <li key={c.projectId}>
                    <Link href={`/admin/mensagens/${c.projectId}`} className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.03]">
                      <Avatar name={c.clientName} />
                      <div className="min-w-0 flex-1">
                        <p className="flex justify-between gap-2 text-sm">
                          <span className="truncate font-semibold text-ink">{c.clientName}</span>
                          <span className="shrink-0 text-xs text-ink-faint">{relative(c.last.createdAt)}</span>
                        </p>
                        <p className="truncate text-[13px] text-ink-dim">{c.last.body}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section id="reunioes" title="Próximas reuniões">
            {meetings.length === 0 ? (
              <Empty>Nenhuma reunião marcada.</Empty>
            ) : (
              <ul className="space-y-3">
                {meetings.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03] text-center leading-tight">
                      <span className="text-[11px] text-ink-dim">{shortDate(m.startsAt)}</span>
                    </div>
                    <Link href={`/admin/projetos/${m.projectId}#reunioes`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{m.title}</p>
                      <p className="truncate text-xs text-ink-faint">
                        {time(m.startsAt)}–{time(m.endsAt)} · {m.clientName}
                      </p>
                    </Link>
                    <a href={m.callUrl} target="_blank" rel="noreferrer" aria-label="Abrir chamada" className="btn-quiet h-10 w-10 p-0">
                      <Video size={16} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
