import { notFound } from "next/navigation";
import { cancelApproval, createApproval, reopenApproval } from "@/lib/admin/actions";
import { getProjectById } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { RESPONSE_LABEL, SUBJECT_LABEL, approvalTitle, loadApprovals, type Approval, type ApprovalStatus } from "@/lib/approvals/model";
import { loadSeries } from "@/lib/files/data";
import { longDate, relative } from "@/lib/portal/format";
import { ActionForm, Field } from "../../../_components/forms";
import { inputCls, textareaCls } from "../../../_components/styles";
import { AdminHeader, Badge, Empty, NotifyClient, Section } from "../../../_components/ui";

export const metadata = { title: "Aprovações do projeto" };

const TONE: Record<ApprovalStatus, "ok" | "warn" | "danger" | "neutral"> = {
  pendente: "warn",
  aprovada: "ok",
  alteracoes_pedidas: "danger",
  cancelada: "neutral",
};
const ADMIN_STATUS: Record<ApprovalStatus, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  alteracoes_pedidas: "Alterações pedidas",
  cancelada: "Cancelada",
};

export default async function ApprovalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();

  const [approvals, series, { data: phases }] = await Promise.all([
    loadApprovals(sb, p.id),
    loadSeries(sb, p.id),
    sb
      .from("project_phases")
      .select("id, position, name")
      .eq("project_id", p.id)
      .order("position")
      .returns<{ id: string; position: number; name: string }[]>(),
  ]);
  // Versões que se podem pedir para aprovar: entregáveis e provas (nunca internos nem referências).
  const versions = "error" in series ? [] : series.filter((s) => s.role === "entregavel" || s.role === "prova").flatMap((s) => s.versions.map((v) => ({ id: v.deliverableId, label: `${s.title} ${v.label}`, files: v.files.length })));

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
          { href: `/admin/projetos/${p.id}`, label: p.name },
          { href: `/admin/projetos/${p.id}/aprovacoes`, label: "Aprovações" },
        ]}
        title="Aprovações"
        subtitle="O cliente aprova ou pede alterações. Uma aprovação dada só se reabre aqui, com motivo. Os orçamentos e os extras pedem aprovação sozinhos ao serem enviados."
      />

      <Section title="Pedir aprovação" description="A fase escolhida passa a “a aguardar o cliente” e fecha-se quando o cliente aprovar.">
        <ActionForm action={createApproval} submit="Pedir aprovação" resetOnOk pendingLabel="A pedir…">
          <input type="hidden" name="projeto" value={p.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="O que aprovar">
              <select name="assunto" defaultValue={p.serviceType === "academic" ? "indice" : "prova"} className={inputCls}>
                <option value="indice" className="bg-raised">{SUBJECT_LABEL.indice} (escrito abaixo)</option>
                <option value="prova" className="bg-raised">{SUBJECT_LABEL.prova} (uma versão de ficheiro)</option>
                <option value="entrega" className="bg-raised">{SUBJECT_LABEL.entrega} (uma versão de ficheiro)</option>
              </select>
            </Field>
            <Field label="Fase (opcional)">
              <select name="fase" defaultValue="" className={inputCls}>
                <option value="" className="bg-raised">Sem fase</option>
                {(phases ?? []).map((ph) => (
                  <option key={ph.id} value={ph.id} className="bg-raised">
                    {ph.position}. {ph.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Versão do ficheiro (prova ou entrega)">
              <select name="versao_ficheiro" defaultValue="" className={inputCls}>
                <option value="" className="bg-raised">—</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id} className="bg-raised">
                    {v.label} ({v.files} ficheiro{v.files === 1 ? "" : "s"})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Versão do índice (opcional)">
              <input name="versao" maxLength={10} className={inputCls} placeholder="V2" />
            </Field>
            <Field label="Índice (um capítulo ou secção por linha)" className="sm:col-span-2">
              <textarea name="itens" rows={5} className={textareaCls} placeholder={"1. Introdução\n2. Revisão da literatura\n3. Metodologia"} />
            </Field>
            <Field label="Mensagem ao cliente (opcional)" className="sm:col-span-2">
              <input name="mensagem" maxLength={1000} className={inputCls} placeholder="Ex.: juntámos o capítulo da metodologia, como pediu" />
            </Field>
          </div>
          <NotifyClient />
        </ActionForm>
      </Section>

      <Section title="Pedidos e respostas">
        {"error" in approvals ? (
          <Empty>{approvals.error}</Empty>
        ) : approvals.length === 0 ? (
          <Empty>Ainda não há pedidos de aprovação.</Empty>
        ) : (
          <ul className="space-y-3">
            {approvals.map((a) => (
              <ApprovalItem key={a.id} a={a} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function ApprovalItem({ a }: { a: Approval }) {
  return (
    <li className="rounded-2xl border border-line bg-white/[0.015] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          {approvalTitle(a)} <span className="font-normal text-ink-faint">· {SUBJECT_LABEL[a.subject]}{a.phase && ` · fase ${a.phase.position}. ${a.phase.name}`}</span>
        </p>
        <Badge tone={TONE[a.status]}>{ADMIN_STATUS[a.status]}</Badge>
      </div>
      <p className="mt-1 text-xs text-ink-faint">Pedido {relative(a.requestedAt)}</p>
      {a.snapshot.items && <p className="mt-2 text-xs text-ink-dim">{a.snapshot.items.join(" · ")}</p>}
      {a.snapshot.files && <p className="mt-2 text-xs text-ink-dim">Ficheiros: {a.snapshot.files.join(", ")}</p>}
      {a.responses.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-ink-dim">
          {a.responses.map((r, i) => (
            <li key={i}>
              {longDate(r.createdAt)} · {r.actorRole === "client" ? "Cliente" : "Admin"}: {RESPONSE_LABEL[r.kind].toLowerCase()}
              {r.comment && <> — “{r.comment}”</>}
            </li>
          ))}
        </ul>
      )}
      {a.status === "pendente" && (
        <div className="mt-3">
          <ActionForm action={cancelApproval} inline variant="quiet" submit="Cancelar pedido" pendingLabel="…">
            <input type="hidden" name="id" value={a.id} />
          </ActionForm>
        </div>
      )}
      {a.status === "aprovada" && (
        <details className="mt-3">
          <summary className="cursor-pointer list-none text-xs font-semibold text-accent-soft">Reabrir aprovação</summary>
          <div className="mt-3">
            <ActionForm action={reopenApproval} variant="danger" submit="Reabrir" pendingLabel="A reabrir…">
              <input type="hidden" name="id" value={a.id} />
              <Field label="Motivo (obrigatório)" hint="Fica no histórico e o cliente vê-o.">
                <input name="motivo" required maxLength={2000} className={inputCls} />
              </Field>
            </ActionForm>
          </div>
        </details>
      )}
    </li>
  );
}
