import Link from "next/link";
import { notFound } from "next/navigation";
import { setPhaseStatus, updatePhaseDetails } from "@/lib/admin/actions";
import { getProjectById } from "@/lib/admin/data";
import {
  ACTION_LABEL,
  ADMIN_PHASE_COLS,
  PHASE_LABEL,
  PHASE_TONE,
  allowedTargets,
  currentPhase,
  mapAdminPhase,
  planBack,
  type AdminPhase,
  type AdminPhaseRow,
} from "@/lib/admin/phases";
import { requireAdmin } from "@/lib/admin/session";
import { relative, shortDate } from "@/lib/portal/format";
import type { DbPhaseState } from "@/lib/portal/types";
import { ActionForm, Field } from "../../../_components/forms";
import { PhaseNav } from "../../../_components/PhaseNav";
import { inputCls } from "../../../_components/styles";
import { AdminHeader, Badge, Empty, NotifyClient, Section } from "../../../_components/ui";

export const metadata = { title: "Fases do projeto" };


type EventRow = { project_phase_id: string; from_status: string | null; to_status: DbPhaseState; note: string | null; created_at: string };

export default async function PhasesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();

  const trail = [
    { href: "/admin/clientes", label: "Clientes" },
    { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
    { href: `/admin/projetos/${p.id}`, label: p.name },
    { href: `/admin/projetos/${p.id}/fases`, label: "Fases" },
  ];

  if (p.serviceType === "development") {
    return (
      <div className="space-y-6">
        <AdminHeader trail={trail} title="Fases do projeto" />
        <Empty>
          Os projetos Desenvolvimento leem as fases dos milestones do GitHub.{" "}
          <Link href={`/admin/projetos/${p.id}/tarefas`} className="text-accent-soft underline">
            Gerir as tarefas visíveis
          </Link>
          .
        </Empty>
      </div>
    );
  }

  const [{ data: rows, error }, { data: events }] = await Promise.all([
    sb.from("project_phases").select(ADMIN_PHASE_COLS).eq("project_id", p.id).order("position").returns<AdminPhaseRow[]>(),
    sb
      .from("phase_events")
      .select("project_phase_id, from_status, to_status, note, created_at")
      .eq("project_id", p.id)
      .order("created_at", { ascending: false })
      .limit(15)
      .returns<EventRow[]>(),
  ]);
  if (error) {
    return (
      <div className="space-y-6">
        <AdminHeader trail={trail} title="Fases do projeto" />
        <Empty>Não foi possível ler as fases: {error.message}</Empty>
      </div>
    );
  }

  const phases = (rows ?? []).map(mapAdminPhase);
  const cur = currentPhase(phases);
  const back = planBack(phases);
  const names = new Map(phases.map((ph) => [ph.id, ph.name]));
  const done = phases.filter((ph) => ph.status === "concluida" || ph.status === "nao_aplicavel").length;

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={trail}
        title="Fases do projeto"
        subtitle={`${done} de ${phases.length} fases fechadas. O cliente vê o estado, o prazo e o próximo passo de cada fase.`}
      />

      <Section
        title={cur ? `Fase atual · ${cur.position}. ${cur.name}` : "Todas as fases fechadas"}
        description="Avançar conclui a fase atual e inicia a seguinte que está por iniciar. Recuar reabre a última fase concluída."
      >
        <PhaseNav
          projectId={p.id}
          current={cur ? { id: cur.id, name: cur.name, state: <Badge tone={PHASE_TONE[cur.status]}>{PHASE_LABEL[cur.status]}</Badge> } : null}
          back={"error" in back ? { error: back.error } : { name: back.name }}
          notify={<NotifyClient />}
          empty={<Empty>Não há fases por concluir.</Empty>}
        />
      </Section>

      <Section title="Todas as fases">
        <ul className="space-y-3">
          {phases.map((ph) => (
            <PhaseItem key={ph.id} ph={ph} projectId={p.id} open={ph.id === cur?.id} />
          ))}
        </ul>
      </Section>

      <Section title="Histórico recente" description="As 15 mudanças de estado mais recentes.">
        {!events?.length ? (
          <Empty>Ainda não há mudanças.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {events.map((e, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
                <span className="w-24 shrink-0 text-xs text-ink-faint">{relative(e.created_at)}</span>
                <span className="font-medium text-ink">{names.get(e.project_phase_id) ?? "Fase"}</span>
                <span className="text-ink-dim">
                  {e.from_status ? `${PHASE_LABEL[e.from_status as DbPhaseState] ?? e.from_status} → ` : ""}
                  {PHASE_LABEL[e.to_status] ?? e.to_status}
                </span>
                {e.note && <span className="text-xs text-ink-faint">· {e.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function PhaseItem({ ph, projectId, open }: { ph: AdminPhase; projectId: string; open: boolean }) {
  const targets = allowedTargets(ph);
  return (
    <li className="rounded-2xl border border-line bg-white/[0.015]">
      <details open={open}>
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-sm font-semibold text-ink-dim">
            {ph.position}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{ph.name}</p>
            <p className="truncate text-xs text-ink-faint">
              {ph.nextStep ? `Próximo passo: ${ph.nextStep}` : ph.description}
            </p>
          </div>
          {ph.dueOn && <span className="text-xs text-ink-faint">até {shortDate(ph.dueOn)}</span>}
          <Badge tone={PHASE_TONE[ph.status]}>{PHASE_LABEL[ph.status]}</Badge>
        </summary>

        <div className="grid gap-6 border-t border-line p-4 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Mudar o estado</p>
            <ActionForm action={setPhaseStatus} submit="Mudar estado" pendingLabel="A mudar…">
              <input type="hidden" name="projeto" value={projectId} />
              <input type="hidden" name="fase" value={ph.id} />
              <Field label="Novo estado">
                <select name="estado" defaultValue={targets[0]} className={inputCls}>
                  {targets.map((t) => (
                    <option key={t} value={t} className="bg-raised">
                      {ACTION_LABEL[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={ph.status === "concluida" ? "Motivo (obrigatório para reabrir)" : "Nota (opcional)"}
                hint="Fica no histórico e vai no email."
              >
                <input name="motivo" maxLength={500} className={inputCls} />
              </Field>
              <NotifyClient />
            </ActionForm>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Prazo e próximo passo</p>
            <ActionForm action={updatePhaseDetails} submit="Guardar fase">
              <input type="hidden" name="projeto" value={projectId} />
              <input type="hidden" name="fase" value={ph.id} />
              <Field label="Próximo passo (visível ao cliente)">
                <input name="proximo" maxLength={200} defaultValue={ph.nextStep ?? ""} className={inputCls} placeholder="Ex.: enviar o índice para aprovar" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="De quem é">
                  <select name="dono" defaultValue={ph.nextStepOwner ?? "geniusfrela"} className={inputCls}>
                    <option value="geniusfrela" className="bg-raised">GeniusFrela</option>
                    <option value="cliente" className="bg-raised">Cliente</option>
                  </select>
                </Field>
                <Field label="Prazo (opcional)">
                  <input name="prazo" type="date" defaultValue={ph.dueOn ?? ""} className={inputCls} />
                </Field>
                <Field label="Progresso %">
                  <input name="progresso" type="number" min={0} max={100} defaultValue={ph.progress ?? ""} className={inputCls} />
                </Field>
              </div>
              {/* Ajustes de texto ou prazo: aviso desmarcado por omissão (D-130). */}
              <NotifyClient defaultChecked={false} />
            </ActionForm>
          </div>
        </div>
      </details>
    </li>
  );
}
