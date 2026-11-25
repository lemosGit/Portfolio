/**
 * Produção e entrega do Design no admin (M7-05, RF-20.61, RF-20.70…74). Server Component.
 * O estado da produção mexe nas fases (0016, Q-104); "entregue" conclui o projeto.
 */
import { markDesignDelivered, savePickup, setProductionStatus } from "@/lib/admin/actions";
import { PRODUCTION_LABEL, eventSlack, pickupInput, slackAlert, type DesignSpec } from "@/lib/design/spec";
import { longDate } from "@/lib/portal/format";
import { ActionForm, Field } from "./forms";
import { inputCls } from "./styles";
import { NotifyClient } from "./ui";

export function DesignProduction({ projectId, spec }: { projectId: string; spec: DesignSpec | null }) {
  if (!spec) return <p className="text-sm text-ink-dim">Preencha primeiro a ficha técnica da peça.</p>;
  if (spec.deliveredAt) return <p className="text-sm text-ink">Peça entregue a {longDate(spec.deliveredAt)}. O projeto está concluído.</p>;
  const alert = slackAlert(eventSlack(spec.eventDate, spec.pickupAt));
  return (
    <div className="space-y-6">
      {spec.hasPrint ? (
        <ActionForm action={setProductionStatus} submit="Guardar estado" pendingLabel="A guardar…">
          <input type="hidden" name="projeto" value={projectId} />
          <Field label="Estado da produção" hint="“A imprimir” põe a Produção em curso (só com o restante pago, RN-15). “Pronto” conclui-a e abre a Entrega.">
            {/* M7-99: a key remonta o seletor com o estado guardado (o React 19 repõe o formulário com o valor antigo, como na D-159). */}
            <select key={spec.productionStatus ?? "nenhum"} name="estado" defaultValue={spec.productionStatus ?? "a_imprimir"} className={inputCls}>
              {Object.entries(PRODUCTION_LABEL).map(([v, l]) => (
                <option key={v} value={v} className="bg-raised">
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <NotifyClient />
        </ActionForm>
      ) : (
        <p className="text-sm text-ink-dim">Peça sem impressão: a fase Produção não se aplica.</p>
      )}

      <div className="border-t border-line pt-5">
        <ActionForm action={savePickup} submit="Guardar levantamento" pendingLabel="A guardar…">
          <input type="hidden" name="projeto" value={projectId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data e hora de entrega ou levantamento">
              <input name="quando" type="datetime-local" defaultValue={pickupInput(spec.pickupAt)} className={inputCls} />
            </Field>
            <Field label="Local">
              <input name="local" maxLength={200} defaultValue={spec.pickupPlace ?? ""} className={inputCls} placeholder="Ex.: Loja GeniusFrela, Talatona" />
            </Field>
          </div>
          {alert && <p className="text-[13px] font-medium text-action">{alert} Confirme com o cliente (RF-20.74).</p>}
          <NotifyClient />
        </ActionForm>
      </div>

      <div className="border-t border-line pt-5">
        <ActionForm action={markDesignDelivered} submit="Marcar como entregue" pendingLabel="A marcar…" variant="quiet">
          <input type="hidden" name="projeto" value={projectId} />
          <p className="text-[13px] text-ink-dim">Conclui a fase Entrega/levantamento e o projeto (RF-20.73). Os ficheiros ficam disponíveis 90 dias.</p>
        </ActionForm>
      </div>
    </div>
  );
}
