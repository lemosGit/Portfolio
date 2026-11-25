"use client";

/**
 * Avançar / Recuar as fases (M5-08) com UM estado partilhado: a mensagem mostrada é sempre a da
 * última ação. Antes, cada formulário tinha o seu estado; ao recuar, o formulário "Reabrir" podia
 * desaparecer (já não havia fase concluída antes da atual) e ficava à vista a mensagem antiga do
 * "Avançar" — enganadora.
 */
import { useActionState } from "react";
import { advancePhase, reopenPreviousPhase, type AdminState } from "@/lib/admin/actions";
import { Field, Status, Submit } from "./forms";
import { inputCls } from "./styles";

async function run(prev: AdminState, form: FormData): Promise<AdminState> {
  return form.get("op") === "reabrir" ? reopenPreviousPhase(prev, form) : advancePhase(prev, form);
}

export function PhaseNav({
  projectId,
  current,
  back,
  notify,
  empty,
}: {
  projectId: string;
  /** Fase atual (ou nenhuma, se todas estiverem fechadas). */
  current: { id: string; name: string; state: React.ReactNode } | null;
  /** Fase a reabrir, ou a frase que explica porque não há. */
  back: { name: string } | { error: string };
  /** Caixa "Avisar o cliente" (renderizada no servidor: sabe se o Resend está ligado). */
  notify: React.ReactNode;
  empty: React.ReactNode;
}) {
  const [state, action] = useActionState<AdminState, FormData>(run, {});

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {current ? (
          <form action={action} className="space-y-4">
            <input type="hidden" name="op" value="avancar" />
            <input type="hidden" name="projeto" value={projectId} />
            <input type="hidden" name="fase" value={current.id} />
            <p className="text-sm text-ink-dim">Estado: {current.state}</p>
            {notify}
            <Submit variant="primary" pendingLabel="A avançar…">
              Concluir “{current.name}” e avançar
            </Submit>
          </form>
        ) : (
          empty
        )}
        {"error" in back ? (
          <p className="text-sm text-ink-faint">{back.error}</p>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="op" value="reabrir" />
            <input type="hidden" name="projeto" value={projectId} />
            <Field label="Motivo (obrigatório)" hint="Fica no histórico da fase.">
              <input name="motivo" required maxLength={500} className={inputCls} placeholder="Ex.: o cliente pediu para rever o índice" />
            </Field>
            {notify}
            <Submit variant="quiet" pendingLabel="A reabrir…">
              Reabrir “{back.name}”
            </Submit>
          </form>
        )}
      </div>
      {/* Uma só mensagem, a da última ação (avançar ou reabrir). */}
      <Status state={state} />
    </div>
  );
}
