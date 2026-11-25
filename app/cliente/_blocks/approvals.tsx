/**
 * Bloco "approvals" (layout-blocos §4, RF-30.34): pendentes em destaque; histórico atrás de
 * "Ver histórico" com data, autor, decisão, comentário e versão (RF-30.32). Sem aprovações, não aparece.
 */
import { RESPONSE_LABEL, STATUS_LABEL, approvalTitle } from "@/lib/approvals/model";
import { kz } from "@/lib/payments/model";
import { longDate } from "@/lib/portal/format";
import { quoteTotalLine, type QuoteSnapshot } from "@/lib/quotes/model";
import { ApprovalCard } from "../_components/ApprovalCard";
import { Details } from "../_components/Details";
import { StateChip } from "./common";
import type { BlockProps } from "./types";

export function Approvals({ project }: BlockProps) {
  const list = project.approvals ?? [];
  if (list.length === 0) return null;
  const pending = list.filter((a) => a.status === "pendente");
  const past = list.filter((a) => a.status !== "pendente");

  return (
    <section aria-labelledby="aprovacoes-title" className="panel p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="aprovacoes-title" className="text-base font-medium text-ink">
          Aprovações
        </h2>
        {pending.length > 0 && <StateChip tone="action">{pending.length === 1 ? "1 pedido à sua espera" : `${pending.length} pedidos à sua espera`}</StateChip>}
      </div>
      {pending.length > 0 ? (
        <div className="mt-4 space-y-3">
          {pending.map((a) => (
            <ApprovalCard key={a.id} a={a} rounds={project.rounds} art={project.serviceType === "design"} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[14px] text-ink-dim">Não há nada à espera da sua aprovação.</p>
      )}
      {past.length > 0 && (
        <Details label="Ver histórico" className="mt-4">
          <ul className="divide-y divide-line border-t border-line">
            {past.map((a) => (
              <li key={a.id} className="py-3 text-[13px]">
                <p className="flex flex-wrap items-center gap-2">
                  <b className="font-semibold text-ink">{approvalTitle(a)}</b>
                  <span className="text-ink-dim">· {a.status === "aprovada" && (a.subject === "orcamento" || a.subject === "extra") ? "Aceite" : STATUS_LABEL[a.status]}</span>
                </p>
                {/* M7-06: o orçamento decidido mantém o valor e o detalhe design + impressão à vista (RF-20.21). */}
                {a.subject === "orcamento" && <QuoteLine q={a.snapshot as QuoteSnapshot} />}
                <ul className="mt-1 space-y-1 text-ink-faint">
                  {a.responses.map((r, i) => (
                    <li key={i}>
                      {longDate(r.createdAt)} · {r.actorRole === "client" ? "Você" : "GeniusFrela"}: {(r.kind === "aprovar" && (a.subject === "orcamento" || a.subject === "extra") ? "aceitou" : RESPONSE_LABEL[r.kind]).toLowerCase()}
                      {r.comment && <> — “{r.comment}”</>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Details>
      )}
    </section>
  );
}

function QuoteLine({ q }: { q: QuoteSnapshot }) {
  if (q.total_kz == null) return null;
  return <p className="mt-1 text-ink-dim">{quoteTotalLine(q.total_kz, q.design_kz ?? null, q.print_kz ?? null, kz)}</p>;
}
