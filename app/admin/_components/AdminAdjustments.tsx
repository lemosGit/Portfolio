/**
 * Entrega final e ajustes no admin (M6-06, RF-10.60…74). Server Component (classes de styles.ts, D-148).
 */
import { closeAdjustment, deliverFinal } from "@/lib/admin/actions";
import { ADJUSTMENT_LABEL, adjustWindow, type AdjustmentRequest } from "@/lib/academic/adjustments";
import type { AcademicBrief } from "@/lib/academic/brief";
import { longDate } from "@/lib/portal/format";
import { ActionForm, Field } from "./forms";
import { inputCls } from "./styles";
import { Badge, Empty, NotifyClient } from "./ui";

export function AdminAdjustments({
  projectId,
  brief,
  requests,
  versions,
  now,
}: {
  projectId: string;
  brief: AcademicBrief | null;
  requests: AdjustmentRequest[];
  /** Versões de entregáveis que podem resolver um pedido (RF-10.73). */
  versions: { id: string; label: string }[];
  now: number;
}) {
  if (!brief) return <Empty>Preencha primeiro a ficha do trabalho (tem os dias de ajustes).</Empty>;
  if (!brief.deliveredAt) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-dim">
          Carregue o trabalho final em <b>Ficheiros</b> (papel Entregável, fase “Entrega final”, PDF e Word). Fica bloqueado até o restante estar pago
          (RN-14). Depois carregue aqui: o cliente pode descarregar e começam os {brief.adjustDays} dias de ajustes.
        </p>
        <ActionForm action={deliverFinal} submit="Disponibilizar entrega" pendingLabel="A disponibilizar…">
          <input type="hidden" name="projeto" value={projectId} />
          <NotifyClient />
        </ActionForm>
      </div>
    );
  }
  const w = adjustWindow(brief.deliveredAt, brief.adjustDays, now);
  const open = requests.filter((r) => r.status === "aberto");
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-dim">
        Entregue a <b className="text-ink">{longDate(brief.deliveredAt)}</b> · ajustes até <b className="text-ink">{longDate(w.lastDay)}</b>{" "}
        {w.open ? `(${w.daysLeft} dia${w.daysLeft === 1 ? "" : "s"})` : "(terminado)"}.{" "}
        {!w.open && open.length === 0 && "O projeto conclui-se sozinho na limpeza diária (RN-34), ou marque-o como Entregue em Dados do projeto."}
      </p>
      {requests.length === 0 ? (
        <Empty>Sem pedidos de ajuste.</Empty>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-white/[0.015] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm text-ink">{r.description}</p>
                <Badge tone={r.status === "resolvido" ? "ok" : r.status === "aberto" ? "warn" : "neutral"}>{ADJUSTMENT_LABEL[r.status]}</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                {longDate(r.createdAt)}
                {r.resolvedByLabel && ` · resolvido em ${r.resolvedByLabel}`}
                {r.adminNote && ` · ${r.adminNote}`}
              </p>
              {r.status === "aberto" && (
                <div className="mt-3 grid gap-4 border-t border-line pt-3 lg:grid-cols-2">
                  <ActionForm action={closeAdjustment} submit="Resolver" pendingLabel="A guardar…">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decisao" value="resolvido" />
                    <Field label="Versão que resolve" hint="Carregue a versão nova em Ficheiros (Nova versão de…).">
                      <select name="versao" defaultValue={versions[0]?.id ?? ""} className={inputCls}>
                        {versions.length === 0 && <option value="">Sem versões de entregáveis</option>}
                        {versions.map((v) => (
                          <option key={v.id} value={v.id} className="bg-raised">
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <NotifyClient />
                  </ActionForm>
                  <ActionForm action={closeAdjustment} variant="quiet" submit="Recusar" pendingLabel="A guardar…">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decisao" value="recusado" />
                    <Field label="Porquê (obrigatório)" hint="Ex.: mudar o tema é trabalho novo (RN-32) — pode registar um extra.">
                      <input name="nota" required maxLength={1000} className={inputCls} />
                    </Field>
                    <NotifyClient />
                  </ActionForm>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
