import { Check } from "lucide-react";
import { shortDate } from "@/lib/portal/format";
import type { PhaseView } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

/**
 * As 6 fases do projeto. Lista no telemóvel, grelha de 3 em ecrãs médios e
 * linha contínua em ecrãs largos (onde as 6 cabem lado a lado).
 */
export function Roadmap({ phases, compact = false }: { phases: PhaseView[]; compact?: boolean }) {
  // compact: painel estreito (página do projeto), fica sempre em grelha de 3.
  const row = !compact;
  return (
    <ol
      className={cn(
        "grid gap-7 sm:grid-cols-3",
        row && "min-[1440px]:gap-0 min-[1440px]:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]",
      )}
      style={{ "--n": phases.length } as React.CSSProperties}
    >
      {phases.map((ph, i) => {
        const next = phases[i + 1];
        return (
          <li key={ph.number} className="relative flex gap-4 sm:block min-[1440px]:pr-4">
            {/* linha até à próxima etapa (desktop) */}
            {row && next && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[46px] right-3 top-[17px] hidden h-px min-[1440px]:block",
                  ph.status === "done" ? "bg-white/20" : "border-t border-dashed border-white/15 bg-transparent",
                )}
              />
            )}
            <StepDot status={ph.status} n={ph.number} />
            <div className="min-w-0 sm:mt-4 min-[1440px]:mt-6 min-[1440px]:pr-2">
              <p className="text-sm font-medium leading-snug text-ink [overflow-wrap:anywhere]">{ph.title}</p>
              <p className="mt-1.5 text-xs text-ink-faint">
                {ph.status === "current"
                  ? "Em curso"
                  : ph.status === "done"
                    ? "Concluída"
                    : ph.dueOn
                      ? `Prevista ${shortDate(ph.dueOn)}`
                      : "Por iniciar"}
              </p>
              {ph.status === "current" && (
                <span className="mt-2.5 inline-block rounded-md bg-accent-soft/10 px-2 py-0.5 text-xs font-medium text-accent-soft">
                  {ph.percent}%
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepDot({ status, n }: { status: PhaseView["status"]; n: number }) {
  if (status === "done") {
    return (
      <span
        className="relative z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-ink-dim"
      >
        <Check size={15} strokeWidth={2.2} aria-hidden />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="relative z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-accent-soft/70 bg-accent-soft/10 ring-4 ring-accent-soft/10">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-soft" aria-hidden />
      </span>
    );
  }
  return (
    <span className="relative z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-white/10 bg-surface text-[11px] font-medium text-ink-faint">
      {String(n).padStart(2, "0")}
    </span>
  );
}
