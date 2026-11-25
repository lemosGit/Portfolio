import { notFound } from "next/navigation";
import { cancelPayment, createPayment, markPaymentPaid, undoPaymentPaid } from "@/lib/admin/actions";
import { getProjectById } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { KIND_LABEL, VIEW_LABEL, kz, loadPayments, paymentView, todayLuanda, totals, type Payment, type PaymentView } from "@/lib/payments/model";
import { longDate } from "@/lib/portal/format";
import { ActionForm, Field } from "../../../_components/forms";
import { inputCls } from "../../../_components/styles";
import { AdminHeader, Badge, Empty, NotifyClient, Section } from "../../../_components/ui";

export const metadata = { title: "Pagamentos do projeto" };

const TONE: Record<PaymentView, "ok" | "warn" | "danger" | "accent" | "neutral"> = {
  pago: "ok",
  pendente: "warn",
  atrasado: "danger",
  por_aceitar: "accent",
  anulado: "neutral",
};

export default async function PaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();

  const [payments, { data: phases }] = await Promise.all([
    loadPayments(sb, p.id),
    sb
      .from("project_phases")
      .select("id, position, name")
      .eq("project_id", p.id)
      .order("position")
      .returns<{ id: string; position: number; name: string }[]>(),
  ]);
  const t = "error" in payments ? undefined : totals(payments);

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
          { href: `/admin/projetos/${p.id}`, label: p.name },
          { href: `/admin/projetos/${p.id}/pagamentos`, label: "Pagamentos" },
        ]}
        title="Pagamentos"
        subtitle={
          t
            ? `Total ${kz(t.total)} · pago ${kz(t.paid)} · em falta ${kz(t.missing)}. Registo manual: o cliente paga fora do portal (D-009).`
            : "Registo manual: o cliente paga fora do portal (D-009)."
        }
      />

      <Section title="Pagamentos registados" description="O sinal e o restante também se criam sozinhos quando o cliente aceita o orçamento. Um pagamento que trava uma fase impede-a de começar até estar pago.">
        {"error" in payments ? (
          <Empty>{payments.error}</Empty>
        ) : payments.length === 0 ? (
          <Empty>Ainda não há pagamentos.</Empty>
        ) : (
          <ul className="space-y-3">
            {payments.map((pay) => (
              <PaymentItem key={pay.id} pay={pay} />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Registar pagamento" description="Um extra fica “por aceitar” e o cliente recebe um pedido de aprovação; só conta depois de aceite (RN-07).">
        <ActionForm action={createPayment} submit="Registar" resetOnOk pendingLabel="A registar…">
          <input type="hidden" name="projeto" value={p.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <select name="tipo" defaultValue="extra" className={inputCls}>
                {(["sinal", "restante", "extra"] as const).map((k) => (
                  <option key={k} value={k} className="bg-raised">
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Descrição" hint="O cliente vê-a. No sinal e no restante pode ficar vazia.">
              <input name="descricao" maxLength={200} className={inputCls} placeholder="Ex.: ronda de revisão adicional" />
            </Field>
            <Field label="Valor (Kz)" hint="Ex.: 25 000 ou 25 000,50">
              <input name="valor" required inputMode="decimal" className={inputCls} placeholder="25 000" />
            </Field>
            <Field label="Data limite (opcional)" hint="Depois dela, aparece “em atraso”.">
              <input name="prazo" type="date" className={inputCls} />
            </Field>
            <Field label="Trava a fase (opcional)" hint="A fase não começa enquanto isto estiver por pagar.">
              <select name="fase" defaultValue="" className={inputCls}>
                <option value="" className="bg-raised">Nenhuma</option>
                {(phases ?? []).map((ph) => (
                  <option key={ph.id} value={ph.id} className="bg-raised">
                    {ph.position}. {ph.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rondas extra (só Design)" hint="Quantas rondas de revisão este extra acrescenta.">
              <input name="rondas" type="number" min={0} max={20} defaultValue={0} className={inputCls} />
            </Field>
          </div>
          <NotifyClient />
        </ActionForm>
      </Section>
    </div>
  );
}

function PaymentItem({ pay }: { pay: Payment }) {
  const v = paymentView(pay);
  return (
    <li className="rounded-2xl border border-line bg-white/[0.015] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">
            {pay.description} <span className="font-normal text-ink-faint">· {KIND_LABEL[pay.kind]}</span>
          </p>
          <p className="text-xs text-ink-faint">
            {pay.status === "pago" && pay.paidOn ? `Pago a ${longDate(pay.paidOn)}` : pay.dueOn ? `Até ${longDate(pay.dueOn)}` : "Sem data limite"}
            {pay.gatesPhase && ` · trava a fase ${pay.gatesPhase.position}. ${pay.gatesPhase.name}`}
            {pay.extraRounds > 0 && ` · +${pay.extraRounds} ronda${pay.extraRounds === 1 ? "" : "s"}`}
          </p>
        </div>
        <b className="text-sm font-semibold text-ink">{kz(pay.amountKz)}</b>
        <Badge tone={TONE[v]}>{VIEW_LABEL[v]}</Badge>
      </div>

      {pay.status === "pendente" && (
        <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-line pt-3">
          <ActionForm action={markPaymentPaid} submit="Marcar como pago" pendingLabel="A guardar…" className="flex-1">
            <input type="hidden" name="id" value={pay.id} />
            <Field label="Data do pagamento">
              <input name="data" type="date" defaultValue={todayLuanda()} max={todayLuanda()} className={`${inputCls} max-w-[200px]`} />
            </Field>
            <NotifyClient />
          </ActionForm>
          <ActionForm action={cancelPayment} inline variant="danger" submit="Anular" pendingLabel="…">
            <input type="hidden" name="id" value={pay.id} />
          </ActionForm>
        </div>
      )}
      {pay.status === "por_aceitar" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-xs text-ink-dim">
          <span className="flex-1">À espera de o cliente aceitar em Aprovações.</span>
          <ActionForm action={cancelPayment} inline variant="danger" submit="Anular" pendingLabel="…">
            <input type="hidden" name="id" value={pay.id} />
          </ActionForm>
        </div>
      )}
      {pay.status === "pago" && (
        <div className="mt-3 border-t border-line pt-3">
          <ActionForm action={undoPaymentPaid} inline variant="quiet" submit="Desfazer “pago” (engano)" pendingLabel="…">
            <input type="hidden" name="id" value={pay.id} />
          </ActionForm>
        </div>
      )}
    </li>
  );
}
