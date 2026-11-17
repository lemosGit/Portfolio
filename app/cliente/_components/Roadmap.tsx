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
        const lineLit = ph.status === "done" && next && next.status !== "pending";
        return (
          <li key={ph.number} className="relative flex gap-4 sm:block min-[1440px]:pr-4">
            {/* linha até à próxima etapa (desktop) */}
            {row && next && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[34px] right-0 top-[17px] hidden h-px min-[1440px]:block",
                  lineLit ? "bg-accent" : "bg-white/10",
                )}
                style={lineLit ? { boxShadow: "0 0 10px rgba(139,108,255,0.7)" } : undefined}
              />
            )}
            <StepDot status={ph.status} n={ph.number} />
            <div className="min-w-0 sm:mt-4 min-[1440px]:mt-6 min-[1440px]:pr-2">
              <p className="font-display text-[15px] font-semibold leading-snug text-ink [overflow-wrap:anywhere]">{ph.title}</p>
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
                <span className="mt-2.5 inline-block rounded-md bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent-soft">
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
        className="relative z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full text-white"
        style={{
          background: "linear-gradient(160deg, #9d82ff, #6d4cff)",
          boxShadow: "0 0 0 4px rgba(139,108,255,0.14), 0 0 18px rgba(139,108,255,0.6)",
        }}
      >
        <Check size={16} strokeWidth={2.6} aria-hidden />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "relative z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border bg-bg text-xs font-semibold",
        status === "current"
          ? "border-accent text-accent-soft shadow-[0_0_0_4px_rgba(139,108,255,0.12),0_0_16px_rgba(139,108,255,0.45)]"
          : "border-white/15 text-ink-faint",
      )}
    >
      {n}
    </span>
  );
}
