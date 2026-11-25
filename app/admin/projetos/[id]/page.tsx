import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ExternalLink, Eye, FolderOpen, Globe, ListChecks, MessageSquare, Smartphone, Trash2, Wallet } from "lucide-react";
import { addDemo, deleteDemo, postponeFilesPurge, deleteMeeting, deleteProject, saveMeeting, updateProject } from "@/lib/admin/actions";
import { getProjectById, withProgress } from "@/lib/admin/data";
import { PHASE_LABEL, PHASE_TONE } from "@/lib/admin/phases";
import { VIEW_LABEL as LINK_LABEL, linkView, type LinkStatus } from "@/lib/access/links";
import { emailEnabled } from "@/lib/email/send";
import { WARN_DAYS, daysUntil } from "@/lib/files/retention";
import { todayLuanda } from "@/lib/payments/model";
import { requireAdmin } from "@/lib/admin/session";
import { longDate, relative, shortDate, time } from "@/lib/portal/format";
import type { Meeting } from "@/lib/portal/types";
import { ActionForm, ConfirmDelete, Field } from "../../_components/forms";
import { inputCls, textareaCls } from "../../_components/styles";
import { AccessLinkPanel } from "../../_components/AccessLinkPanel";
import { ProjectFields } from "../../_components/ProjectFields";
import { AdminHeader, Badge, Empty, NotifyClient, Progress, Section } from "../../_components/ui";

export const metadata = { title: "Projeto" };


/** ISO → { data: "2026-11-25", hora: "14:30" } em hora de Luanda (UTC+1). */
function luandaParts(iso: string) {
  const d = new Date(new Date(iso).getTime() + 60 * 60 * 1000).toISOString();
  return { data: d.slice(0, 10), hora: d.slice(11, 16) };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();
  const [v, { data: linkRows }] = await Promise.all([
    withProgress(p, sb),
    // Eventos do link mágico (quem gerou e quando): a RLS só deixa o admin ler.
    sb
      .from("access_links")
      .select("id, status, channel, expires_at, used_at, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<{ id: string; status: LinkStatus; channel: string; expires_at: string; used_at: string | null; created_at: string }[]>(),
  ]);
  const links = linkRows ?? [];
  // Limpeza dos ficheiros (#122): data calculada na BD (files_purge_on, 0008).
  const { data: retention } = await sb.from("projects").select("files_purge_on").eq("id", id).single<{ files_purge_on: string | null }>();
  const purgeOn = retention?.files_purge_on ?? null;
  const purgeDays = purgeOn ? daysUntil(purgeOn, todayLuanda()) : null;

  const now = Date.now();
  const upcoming = p.meetings.filter((m) => new Date(m.endsAt).getTime() > now).reverse();
  const past = p.meetings.filter((m) => new Date(m.endsAt).getTime() <= now);
  const repo = p.githubOwner && p.githubRepo ? `${p.githubOwner}/${p.githubRepo}` : "";

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
          { href: `/admin/projetos/${p.id}`, label: p.name },
        ]}
        title={p.name}
        subtitle={
          <>
            {p.clientName}
            {p.clientCompany && ` · ${p.clientCompany}`} · slug <code className="font-mono text-ink-dim">{p.slug}</code>
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {p.serviceType !== "development" && (
              <>
                <Link href={`/admin/projetos/${p.id}/aprovacoes`} className="btn-quiet h-11 py-0">
                  <BadgeCheck size={16} aria-hidden /> Aprovações
                </Link>
                <Link href={`/admin/projetos/${p.id}/pagamentos`} className="btn-quiet h-11 py-0">
                  <Wallet size={16} aria-hidden /> Pagamentos
                </Link>
              </>
            )}
            <Link href={`/admin/projetos/${p.id}/ficheiros`} className="btn-quiet h-11 py-0">
              <FolderOpen size={16} aria-hidden /> Ficheiros
            </Link>
            <Link href={`/admin/mensagens/${p.id}`} className="btn-quiet h-11 py-0">
              <MessageSquare size={16} aria-hidden /> Mensagens
            </Link>
          </div>
        }
      />

      <Section
        title={`Progresso · ${v.percent}%`}
        description={
          p.serviceType !== "development"
            ? v.source === "bd"
              ? "Fases guardadas na base de dados. O cliente vê o estado, o prazo e o próximo passo de cada fase."
              : "Não foi possível ler as fases da base de dados."
            : v.source === "github"
            ? `Lido do GitHub (${repo}) ${relative(v.syncedAt)}. ${v.closedCount} de ${v.total} issues fechadas.`
            : repo
              ? `Não foi possível ler ${repo}. Confirme o GITHUB_TOKEN e o acesso do token a este repositório.`
              : "Sem repositório GitHub associado: indique-o em “Dados do projeto”."
        }
        actions={
          p.serviceType !== "development" ? (
            <Link href={`/admin/projetos/${p.id}/fases`} className="btn-violet h-9 py-0 text-[13px]">
              <ListChecks size={14} aria-hidden /> Gerir fases
            </Link>
          ) : repo ? (
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/projetos/${p.id}/tarefas`} className="btn-violet h-9 py-0 text-[13px]">
                <Eye size={14} aria-hidden /> Tarefas visíveis
              </Link>
              <a href={`https://github.com/${repo}/issues`} target="_blank" rel="noreferrer" className="btn-quiet h-9 py-0 text-[13px]">
                Issues <ExternalLink size={13} aria-hidden />
              </a>
            </div>
          ) : undefined
        }
      >
        <Progress percent={v.percent} />
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {v.phaseViews.map((ph) => (
            <li key={ph.number} className="rounded-2xl border border-line bg-white/[0.015] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  {ph.number}. {ph.title}
                </p>
                {ph.state ? (
                  <Badge tone={PHASE_TONE[ph.state]}>{PHASE_LABEL[ph.state]}</Badge>
                ) : ph.status === "done" ? (
                  <Badge tone="ok">Concluída</Badge>
                ) : ph.status === "current" ? (
                  <Badge tone="accent">Em curso</Badge>
                ) : (
                  <Badge>Por iniciar</Badge>
                )}
              </div>
              <Progress percent={ph.state ? Math.round((ph.progress ?? 0) * 100) : ph.percent} className="mt-3 h-1" />
              <p className="mt-2 truncate text-xs text-ink-faint">
                {ph.state
                  ? ph.nextStep
                    ? `Próximo passo: ${ph.nextStep.text}`
                    : ph.dueOn
                      ? `Prazo: ${shortDate(ph.dueOn)}`
                      : ph.description
                  : `${ph.closedCount}/${ph.total} issues · ${ph.tasks.length} visíveis ao cliente`}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {purgeOn && (
        <Section
          id="ficheiros-retencao"
          title={purgeDays! <= 0 ? "Ficheiros apagados" : purgeDays! <= WARN_DAYS ? `Os ficheiros são apagados daqui a ${purgeDays} dia${purgeDays === 1 ? "" : "s"}` : "Limpeza dos ficheiros"}
          tone={purgeDays! <= WARN_DAYS ? "danger" : undefined}
          description={`Projeto ${p.status === "cancelado" ? "cancelado" : "entregue"}: os ficheiros saem do armazenamento a ${longDate(purgeOn)} (90 dias depois, RN-08). Fica o registo (nome, data, autor).`}
        >
          {purgeDays! > 0 && (
            <ActionForm action={postponeFilesPurge} submit="Adiar 30 dias" variant="quiet" pendingLabel="A adiar…">
              <input type="hidden" name="projeto" value={p.id} />
            </ActionForm>
          )}
        </Section>
      )}

      <Section
        id="acesso"
        title="Acesso do cliente"
        description="Um link de uso único, válido 24 horas, que leva o cliente direto a este projeto sem senha. O email e a senha continuam a funcionar."
      >
        <AccessLinkPanel projectId={p.id} emailOn={emailEnabled} />
        {links.length > 0 && (
          <ul className="mt-5 divide-y divide-line border-t border-line text-xs text-ink-dim">
            {links.map((l) => {
              const v = linkView({ status: l.status, expiresAt: l.expires_at });
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <span className="text-ink">Gerado {relative(l.created_at)}</span>
                  <span>· {l.channel === "copiar" ? "copiado" : l.channel === "whatsapp" ? "WhatsApp" : "email"}</span>
                  {l.used_at && <span>· usado {relative(l.used_at)}</span>}
                  <span className="ml-auto">
                    <Badge tone={v === "ativo" ? "accent" : v === "usado" ? "ok" : "neutral"}>{LINK_LABEL[v]}</Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Dados do projeto">
        <ActionForm action={updateProject} submit="Guardar projeto">
          <input type="hidden" name="id" value={p.id} />
          <ProjectFields
            showSlug
            serviceType={p.serviceType}
            d={{
              name: p.name,
              slug: p.slug,
              repo,
              startedOn: p.startedOn,
              dueOn: p.dueOn,
              tagline: p.tagline,
              description: p.description,
              coverUrl: p.coverUrl,
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado" hint="Projetos pausados, entregues ou cancelados saem da visão geral.">
              <select name="estado" defaultValue={p.status} className={inputCls}>
                <option value="ativo" className="bg-raised">Ativo</option>
                <option value="pausado" className="bg-raised">Pausado</option>
                <option value="entregue" className="bg-raised">Entregue</option>
                <option value="cancelado" className="bg-raised">Cancelado</option>
              </select>
            </Field>
            <Field label="Motivo da mudança de estado" hint="Fica no histórico. Obrigatório para pausar, cancelar ou reabrir.">
              <input name="motivo" maxLength={500} className={inputCls} placeholder="Ex.: a pedido do cliente, em exames" />
            </Field>
            {p.serviceType === "development" && (
              <Field label="Mapa de fases (avançado)" hint='Só se o projeto não seguir M0–M11. Ex.: {"M3": 3}'>
                <input
                  name="mapa"
                  defaultValue={p.phaseMap ? JSON.stringify(p.phaseMap) : ""}
                  className={`${inputCls} font-mono`}
                  spellCheck={false}
                  placeholder="(padrão)"
                />
              </Field>
            )}
          </div>
        </ActionForm>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Demos" description="O cliente vê a mais recente de cada tipo; as de Android e iOS aparecem com QR code.">
          {p.demos.length === 0 ? (
            <Empty>Nenhuma demo registada.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {p.demos.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03] text-accent-soft">
                    {d.kind === "web" ? <Globe size={17} aria-hidden /> : <Smartphone size={17} aria-hidden />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {d.kind === "web" ? "Web" : d.kind === "android" ? "Android" : "iOS"} · v{d.version}
                    </p>
                    <a href={d.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-ink-faint hover:text-accent-soft">
                      {d.url}
                    </a>
                    <p className="text-xs text-ink-faint">
                      {shortDate(d.createdAt)}
                      {d.notes && ` · ${d.notes}`}
                    </p>
                  </div>
                  <ActionForm action={deleteDemo} inline variant="quiet" submit={<Trash2 size={15} aria-label="Remover demo" />} pendingLabel="…">
                    <input type="hidden" name="id" value={d.id} />
                  </ActionForm>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 rounded-2xl border border-line bg-white/[0.015] p-4">
            <p className="mb-4 text-sm font-semibold text-ink">Registar demo</p>
            <ActionForm action={addDemo} submit="Registar" resetOnOk pendingLabel="A registar…">
              <input type="hidden" name="projeto" value={p.id} />
              <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                <Field label="Tipo">
                  <select name="tipo" defaultValue="web" className={inputCls}>
                    <option value="web" className="bg-raised">Web</option>
                    <option value="android" className="bg-raised">Android</option>
                    <option value="ios" className="bg-raised">iOS</option>
                  </select>
                </Field>
                <Field label="Link">
                  <input name="url" type="url" required className={inputCls} placeholder="https://…" />
                </Field>
                <Field label="Versão">
                  <input name="versao" required className={inputCls} placeholder="0.9.0" />
                </Field>
                <Field label="Notas (opcional)">
                  <input name="notas" className={inputCls} placeholder="O que mudou nesta versão" />
                </Field>
              </div>
              <NotifyClient />
            </ActionForm>
          </div>
        </Section>

        <Section id="reunioes" title="Reuniões" description="Horas em Luanda (UTC+1). As notas aparecem ao cliente como resumo da reunião.">
          {upcoming.length + past.length === 0 && <Empty>Nenhuma reunião marcada.</Empty>}
          <ul className="space-y-3">
            {[...upcoming, ...past].map((m) => (
              <MeetingItem key={m.id} m={m} past={new Date(m.endsAt).getTime() <= now} projectId={p.id} />
            ))}
          </ul>

          <details className="mt-5 rounded-2xl border border-line bg-white/[0.015] p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-accent-soft">+ Marcar reunião</summary>
            <div className="mt-4">
              <MeetingForm projectId={p.id} />
            </div>
          </details>
        </Section>
      </div>

      <Section title="Apagar projeto" tone="danger" description="Apaga o projeto com as demos, reuniões e mensagens. O cliente e o repositório GitHub ficam intactos.">
        <ConfirmDelete action={deleteProject} id={p.id} expected={p.slug} what="o slug" label="Apagar projeto" />
      </Section>
    </div>
  );
}

function MeetingItem({ m, past, projectId }: { m: Meeting; past: boolean; projectId: string }) {
  return (
    <li className="rounded-2xl border border-line bg-white/[0.015]">
      <details>
        <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03] text-xs text-ink-dim">
            {shortDate(m.startsAt)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{m.title}</p>
            <p className="text-xs text-ink-faint">
              {longDate(m.startsAt)} · {time(m.startsAt)}–{time(m.endsAt)}
            </p>
          </div>
          {past ? <Badge>{m.notes ? "Com resumo" : "Sem resumo"}</Badge> : <Badge tone="accent">Marcada</Badge>}
        </summary>
        <div className="space-y-4 border-t border-line p-4">
          <MeetingForm projectId={projectId} m={m} />
          <ActionForm action={deleteMeeting} inline variant="danger" submit="Remover reunião" pendingLabel="A remover…">
            <input type="hidden" name="id" value={m.id} />
          </ActionForm>
        </div>
      </details>
    </li>
  );
}

function MeetingForm({ projectId, m }: { projectId: string; m?: Meeting }) {
  const start = m ? luandaParts(m.startsAt) : undefined;
  const end = m ? luandaParts(m.endsAt) : undefined;
  return (
    <ActionForm action={saveMeeting} submit={m ? "Guardar reunião" : "Marcar reunião"} resetOnOk={!m}>
      <input type="hidden" name="projeto" value={projectId} />
      {m && <input type="hidden" name="id" value={m.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Título" className="sm:col-span-3">
          <input name="titulo" required defaultValue={m?.title} className={inputCls} placeholder="Revisão do Sprint 04" />
        </Field>
        <Field label="Data">
          <input name="data" type="date" required defaultValue={start?.data} className={inputCls} />
        </Field>
        <Field label="Início">
          <input name="inicio" type="time" required defaultValue={start?.hora} className={inputCls} />
        </Field>
        <Field label="Fim">
          <input name="fim" type="time" required defaultValue={end?.hora} className={inputCls} />
        </Field>
        <Field label="Link da chamada" className="sm:col-span-3">
          <input name="link" type="url" required defaultValue={m?.callUrl} className={inputCls} placeholder="https://meet.google.com/…" />
        </Field>
        <Field label="Pauta" hint="Um tema por linha." className="sm:col-span-3">
          <textarea name="pauta" rows={3} defaultValue={m?.agenda.join("\n")} className={textareaCls} />
        </Field>
        {m && (
          <Field label="Resumo / notas" hint="Depois da reunião: decisões e próximos passos." className="sm:col-span-3">
            <textarea name="notas" rows={3} defaultValue={m.notes} className={textareaCls} />
          </Field>
        )}
      </div>
      {/* Ao editar (ex.: só acrescentar o resumo), o aviso fica desmarcado por defeito. */}
      <NotifyClient defaultChecked={!m} />
    </ActionForm>
  );
}
