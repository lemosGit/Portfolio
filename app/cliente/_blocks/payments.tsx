/**
 * Bloco "payments" (layout-blocos §4, RF-30.23): total, pago, em falta e a lista com o estado de cada
 * pagamento. Só leitura: sem pagamento online nem comprovativo (D-009). Sem pagamentos, não aparece.
 */
import { KIND_LABEL, VIEW_LABEL, kz, paymentView, totals, type PaymentView } from "@/lib/payments/model";
import { longDate } from "@/lib/portal/format";
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
      <p className="mt-3 text-xs text-ink-faint">O pagamento é feito fora do portal. O João marca-o como pago quando o receber.</p>
    </section>
  );
}
