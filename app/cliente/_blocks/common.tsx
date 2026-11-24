/**
 * Blocos comuns de Académico e Design (layout-blocos.md §4), com as cores de estado do
 * Design System V1: Concluído (verde), Em curso (cor do módulo), Aguarda a sua resposta
 * (coral, só quando a ação é do cliente), Planeado (cinzento), Atrasada (cor do módulo + etiqueta).
 */
import { approvalTitle } from "@/lib/approvals/model";
import { blockingPayment, kz, payLabel } from "@/lib/payments/model";
import type { PhaseView } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

type Tone = "done" | "now" | "action" | "planned";

const isWaiting = (ph: PhaseView) => ph.state === "aguarda_cliente";

export function StateChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
        tone === "done" && "bg-ok/10 text-ok",
        tone === "now" && "bg-accent/15 text-accent-soft",
        tone === "action" && "bg-action/[0.12] text-action",
        tone === "planned" && "bg-raised text-ink-dim",
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

const STATE_LABEL: Record<PhaseView["status"], string> = {
  done: "Concluída",
  current: "Em curso",
  pending: "Por iniciar",
  skipped: "Não se aplica",
};

/** Barra de fases segmentada: "Fase N de 7" + nome (D-108). */
export function PhaseBar({ project }: BlockProps) {
  const phases = project.phaseViews;
  const current = project.currentPhase;
  const position = phases.findIndex((ph) => ph === current) + 1;
  return (
    <section aria-labelledby="fases-title" className="space-y-2">
      <h2 id="fases-title" className="sr-only">
        Fases do projeto
      </h2>
      <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))` }}>
        {phases.map((ph) => (
          <li key={ph.number} className="min-w-0">
            <span
              aria-hidden
              className={cn(
                "block h-1.5 rounded-full",
                ph.status === "done" && "bg-ok",
                ph.status === "current" && (isWaiting(ph) ? "bg-action" : "bg-accent"),
                ph.status === "pending" && "bg-line",
                ph.status === "skipped" && "border border-dashed border-ink-faint/50",
              )}
            />
            <span className="sr-only">
              {ph.title}: {isWaiting(ph) ? "aguarda a sua resposta" : STATE_LABEL[ph.status]}
              {ph.late ? ", atrasada" : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="flex items-center justify-between gap-3 text-[13px] text-ink-dim">
        <span>
          Fase {position} de {phases.length}
        </span>
        <b className="truncate font-semibold text-ink">{current.title}</b>
      </p>
    </section>
  );
}

/** Fase atual + próximo passo, e de quem é a ação (RF-10.04, RF-20.04). */
export function NextStep({ project }: BlockProps) {
  const ph = project.currentPhase;
  const allDone = project.phaseViews.every((p) => p.status === "done" || p.status === "skipped");
  // Um pedido de aprovação pendente é sempre um passo do cliente (M5-10, D-136).
  const pending = (project.approvals ?? []).filter((a) => a.status === "pendente");
  // RF-30.24: um pagamento por pagar que trava uma fase por começar é o passo do cliente.
  const blocking = blockingPayment(project.payments ?? [], Object.fromEntries(project.phaseViews.map((p) => [p.key ?? "", p.state ?? ""])));
  const clientTurn = isWaiting(ph) || ph.nextStep?.owner === "cliente" || pending.length > 0 || Boolean(blocking);
  const tone: Tone = allDone ? "done" : clientTurn ? "action" : ph.status === "pending" ? "planned" : "now";
  const label = allDone
    ? "Concluído"
    : clientTurn
      ? "Aguarda a sua resposta"
      : ph.late
        ? "Atrasada"
        : STATE_LABEL[ph.status];
  const text =
    pending.length > 0 && !(isWaiting(ph) || ph.nextStep?.owner === "cliente")
      ? pending.length === 1
        ? `Tem um pedido à sua espera: ${approvalTitle(pending[0])}. Veja-o em Aprovações, mais abaixo.`
        : `Tem ${pending.length} pedidos à sua espera. Veja-os em Aprovações, mais abaixo.`
      : blocking && !(isWaiting(ph) || ph.nextStep?.owner === "cliente")
        ? `${payLabel(blocking)}: ${kz(blocking.amountKz)}. A fase “${blocking.gatesPhase?.name}” começa depois do pagamento.`
        : (ph.nextStep?.text ??
        (clientTurn ? "Há um passo do seu lado. Veja os detalhes." : ph.description || "Estamos a tratar desta fase."));

  return (
    <section aria-labelledby="proximo-title" className="panel p-6 sm:p-7">
      <StateChip tone={tone}>{label}</StateChip>
      <h2 id="proximo-title" className="mt-4 font-display text-[22px] leading-tight text-ink sm:text-[26px]">
        {allDone ? "Projeto concluído" : ph.title}
      </h2>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-dim">{text}</p>
      {!allDone && ph.percent > 0 && ph.status === "current" && (
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-dim">Progresso da fase</span>
            <b className="font-semibold text-accent-soft">{ph.percent}%</b>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <i className="block h-full rounded-full bg-accent" style={{ width: `${ph.percent}%` }} />
          </div>
        </div>
      )}
    </section>
  );
}
