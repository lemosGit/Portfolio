/**
 * Aviso fora do horário de atendimento (M9-08, RF-30.63, RN-52). A mensagem é aceite na mesma;
 * o aviso só diz quando vai haver resposta.
 */
import { Clock } from "lucide-react";
import { OUT_OF_HOURS_MESSAGE } from "@/lib/portal/hours";

export function HoursNotice({ open }: { open: boolean }) {
  if (open) return null;
  return (
    <p role="status" className="flex items-start gap-2.5 rounded-xl border border-line bg-raised/50 px-4 py-3 text-[13px] leading-relaxed text-ink-dim">
      <Clock size={15} aria-hidden className="mt-0.5 shrink-0 text-accent-soft" />
      {OUT_OF_HOURS_MESSAGE}
    </p>
  );
}
