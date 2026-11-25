import { notFound } from "next/navigation";
import { createQuote, sendQuote, updateQuote, withdrawQuote } from "@/lib/admin/actions";
import { getProjectById } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { kz } from "@/lib/payments/model";
import { longDate } from "@/lib/portal/format";
import { DEFAULT_DEPOSIT_PCT, DEFAULT_ROUNDS, QUOTE_LABEL, depositFromPct, loadQuotes, type Quote } from "@/lib/quotes/model";
import { ActionForm, Field } from "../../../_components/forms";
import { inputCls } from "../../../_components/styles";
import { AdminHeader, Badge, Empty, NotifyClient, Section } from "../../../_components/ui";

export const metadata = { title: "Orçamento do projeto" };

const TONE = { rascunho: "neutral", enviado: "warn", aceite: "ok", substituido: "neutral" } as const;

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();

  const trail = [
    { href: "/admin/clientes", label: "Clientes" },
    { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
    { href: `/admin/projetos/${p.id}`, label: p.name },
    { href: `/admin/projetos/${p.id}/orcamento`, label: "Orçamento" },
  ];
  if (p.serviceType === "development") {
    return (
      <div className="space-y-6">
        <AdminHeader trail={trail} title="Orçamento" />
        <Empty>Os orçamentos no portal são para projetos Académico e Design.</Empty>
      </div>
    );
  }

  const quotes = await loadQuotes(sb, p.id);
  const draft = quotes.find((q) => q.status === "rascunho");
  const active = quotes.find((q) => q.status === "enviado" || q.status === "aceite");

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={trail}
        title="Orçamento"
        subtitle="Enviado, o cliente vê o valor, o sinal, o prazo e a regra do sinal junto ao botão “Aceitar”. Aceite, o prazo do projeto muda e o sinal e o restante aparecem em Pagamentos; o trabalho (fase 3) só começa com o sinal pago (RN-11)."
      />

      {active && (
        <Section title={`Orçamento v${active.version} · ${QUOTE_LABEL[active.status]}`}>
          <QuoteSummary q={active} />
          {active.status === "enviado" && (
            <div className="mt-4">
              <ActionForm action={withdrawQuote} inline variant="quiet" submit="Retirar este orçamento" pendingLabel="…">
                <input type="hidden" name="id" value={active.id} />
              </ActionForm>
            </div>
          )}
        </Section>
      )}

      {draft ? (
        <Section title={`Rascunho v${draft.version}`} description="Reveja os valores e envie ao cliente. Depois de enviado já não se edita.">
          <ActionForm action={updateQuote} submit="Guardar rascunho">
            <input type="hidden" name="id" value={draft.id} />
            <QuoteFields q={draft} design={p.serviceType === "design"} />
          </ActionForm>
          <div className="mt-5 border-t border-line pt-5">
            <ActionForm action={sendQuote} submit="Enviar ao cliente" pendingLabel="A enviar…">
              <input type="hidden" name="id" value={draft.id} />
              <NotifyClient />
            </ActionForm>
          </div>
        </Section>
      ) : (
        !(active?.status === "aceite") && (
          <Section title="Novo orçamento" description={active ? "Para enviar outro, retire primeiro o que está enviado." : "Cria um rascunho; envia-o a seguir."}>
            <ActionForm action={createQuote} submit="Criar rascunho" pendingLabel="A criar…">
              <input type="hidden" name="projeto" value={p.id} />
              <QuoteFields design={p.serviceType === "design"} />
            </ActionForm>
          </Section>
        )
      )}

      {quotes.length > 0 && (
        <Section title="Histórico">
          <ul className="divide-y divide-line">
            {quotes.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <span className="font-semibold text-ink">v{q.version}</span>
                <span className="text-ink-dim">{kz(q.totalKz)}</span>
                <span className="text-xs text-ink-faint">
                  {q.acceptedAt ? `aceite a ${longDate(q.acceptedAt)}` : q.sentAt ? `enviado a ${longDate(q.sentAt)}` : `criado a ${longDate(q.createdAt)}`}
                </span>
                <span className="ml-auto">
                  <Badge tone={TONE[q.status]}>{QUOTE_LABEL[q.status]}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function QuoteSummary({ q }: { q: Quote }) {
  const rows: [string, string][] = [
    ["Total", kz(q.totalKz)],
    [`Sinal (${q.depositPct}%)`, kz(q.depositKz)],
    ["Restante", kz(q.totalKz - q.depositKz)],
    ["Entrega", q.deliveryDueOn ? longDate(q.deliveryDueOn) : "Por definir"],
  ];
  if (q.roundsIncluded != null) rows.push(["Rondas incluídas", String(q.roundsIncluded)]);
  return (
    <dl className="grid gap-3 sm:grid-cols-4">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-xl border border-line p-3">
          <dt className="text-xs text-ink-faint">{k}</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function QuoteFields({ q, design }: { q?: Quote; design: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="servico" value={design ? "design" : "academic"} />
      <Field label="Valor total (Kz)" hint="Ex.: 90 000 ou 90 000,50">
        <input name="total" required inputMode="decimal" defaultValue={q ? String(q.totalKz) : ""} className={inputCls} placeholder="90 000" />
      </Field>
      <Field label="Entrega prevista" hint="Passa a ser o prazo do projeto quando o cliente aceitar.">
        <input name="prazo" type="date" defaultValue={q?.deliveryDueOn ?? ""} className={inputCls} />
      </Field>
      <Field label="Sinal (%)" hint="Por omissão 50% (RN-12).">
        <input name="sinal_pct" type="number" min={1} max={100} defaultValue={q?.depositPct ?? DEFAULT_DEPOSIT_PCT} className={inputCls} />
      </Field>
      <Field label="Sinal em Kz (opcional)" hint="Se o escrever, ganha à percentagem.">
        <input
          name="sinal_kz"
          inputMode="decimal"
          // Um sinal escrito à mão mantém-se ao editar; o calculado pela % fica vazio (volta a calcular).
          defaultValue={q && q.depositKz !== depositFromPct(q.totalKz, q.depositPct) ? String(q.depositKz) : ""}
          className={inputCls}
          placeholder="Calculado pela %"
        />
      </Field>
      {design && (
        <Field label="Rondas de revisão incluídas" hint="Por omissão 2 (RN-35). Depois disso, cada ronda é um extra pago e aceite (RN-36).">
          <input name="rondas" type="number" min={0} max={10} defaultValue={q?.roundsIncluded ?? DEFAULT_ROUNDS} className={inputCls} />
        </Field>
      )}
    </div>
  );
}
