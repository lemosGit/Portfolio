/**
 * Bloco "payments" (layout-blocos §4, RF-30.23): total, pago, em falta e a lista com o estado de cada
 * pagamento. Só leitura: sem pagamento online nem comprovativo (D-009). Sem pagamentos, não aparece.
 */
import { KIND_LABEL, VIEW_LABEL, kz, paymentView, totals, type Payment, type PaymentView } from "@/lib/payments/model";
import { longDate } from "@/lib/portal/format";
import { Details } from "../_components/Details";
import { StateChip } from "./common";
import type { BlockProps } from "./types";

const TONE: Record<PaymentView, "done" | "now" | "action" | "planned"> = {
  pago: "done",
  pendente: "action",
  atrasado: "action",
  por_aceitar: "action",
  anulado: "planned",
};

export function Payments({ project }: BlockProps) {
  const list = (project.payments ?? []).filter((p) => p.status !== "anulado");
  if (list.length === 0) return null;
  const t = totals(list);

  return (
    <section aria-labelledby="pagamentos-title" className="panel p-6 sm:p-7">
      <h2 id="pagamentos-title" className="text-base font-medium text-ink">
        Pagamentos
      </h2>
      <dl className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["Total", t.total],
          ["Pago", t.paid],
          ["Em falta", t.missing],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-line p-2.5 sm:p-3">
            <dt className="text-xs text-ink-faint">{label}</dt>
            <dd className="mt-1 whitespace-nowrap font-display text-[13px] font-semibold text-ink sm:text-lg">{kz(value as number)}</dd>
          </div>
        ))}
      </dl>
      <PaymentList list={list} />
      <p className="mt-3 text-xs text-ink-faint">O pagamento é feito fora do portal. O João marca-o como pago quando o receber.</p>
    </section>
  );
}

function PaymentList({ list }: { list: Payment[] }) {
  return (
    <ul className="mt-4 divide-y divide-line border-t border-line">
        {list.map((p) => {
          const v = paymentView(p);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3 text-[14px]">
              <div className="min-w-0 basis-full sm:basis-auto sm:flex-1">
                <p className="font-medium text-ink">{p.description}</p>
                <p className="text-xs text-ink-faint">
                  {KIND_LABEL[p.kind]}
                  {p.status === "pago" && p.paidOn
                    ? ` · pago a ${longDate(p.paidOn)}`
                    : p.dueOn
                      ? ` · até ${longDate(p.dueOn)}`
                      : ""}
                  {p.status === "por_aceitar" && " · aceite-o em Aprovações para contar"}
                </p>
              </div>
              <b className="whitespace-nowrap font-semibold text-ink">{kz(p.amountKz)}</b>
              <StateChip tone={TONE[v]}>{VIEW_LABEL[v]}</StateChip>
            </li>
          );
        })}
    </ul>
  );
}

/**
 * Pagamentos compactos (wireframe Académico, M6-07, D-155): o que falta numa linha, a etiqueta do
 * último pagamento feito e a lista atrás de "Ver pagamentos". Só leitura, sem pagamento online (D-009).
 */
export function PaymentsCompact({ project }: BlockProps) {
  const list = (project.payments ?? []).filter((p) => p.status !== "anulado");
  if (list.length === 0) return null;
  const t = totals(list);
  const paid = list.filter((p) => p.status === "pago");
  const next = list.find((p) => p.status === "pendente");
  return (
    <section aria-labelledby="pagamentos-title" className="panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="pagamentos-title" className="text-[13px] font-medium text-ink-dim">
          Pagamentos
        </h2>
        {t.missing === 0 && t.total > 0 ? (
          <StateChip tone="done">Tudo pago</StateChip>
        ) : paid.length > 0 ? (
          <StateChip tone="done">{KIND_LABEL[paid[paid.length - 1].kind]} pago</StateChip>
        ) : null}
      </div>
      <p className="mt-2 text-[15px] text-ink">
        {t.missing > 0 ? (
          <>
            Falta <b className="font-semibold">{kz(t.missing)}</b>
            {next && <span className="text-ink-dim">, {next.description.charAt(0).toLowerCase() + next.description.slice(1)}</span>}.
          </>
        ) : (
          "Não há nada por pagar."
        )}
      </p>
      <Details label="Ver pagamentos" className="mt-2">
        <PaymentList list={list} />
        <p className="mt-3 text-xs text-ink-faint">O pagamento é feito fora do portal. O João marca-o como pago quando o receber.</p>
      </Details>
    </section>
  );
}
