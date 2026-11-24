import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import { layoutFor } from "@/lib/portal/service-layouts";
import type { ProjectView } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

type Props = {
  /** Nome da secção (aparece no sobretítulo se não houver `eyebrow`). */
  section: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  source: ProjectView["source"];
  /** Serviço do projeto: mostra a etiqueta na cor do módulo (DS V1). */
  serviceType?: ProjectView["serviceType"];
  unread: number;
};

const SYNC_LABEL: Record<Exclude<Props["source"], "github" | "bd">, string> = {
  exemplo: "Modo demonstração",
  erro: "Progresso indisponível",
};

export function PageHeader({ section, eyebrow, title, subtitle, source, serviceType, unread }: Props) {
  const ok = source !== "erro";
  return (
    <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-6 items-center rounded-lg bg-[var(--m-tint)] px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-soft">
            {layoutFor(serviceType).label}
          </span>
          <p className="kicker">{eyebrow ?? section}</p>
        </div>
        <h1 className="mt-4 font-display text-[28px] font-normal leading-[1.12] tracking-[-0.03em] text-ink md:text-[32px]">
          {title}
        </h1>
        {subtitle && <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-ink-dim">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* A origem dos dados é assunto do programador: só avisamos em modo demonstração ou se falhar. */}
        {(source === "exemplo" || source === "erro") && (
          <>
            <p
              className="mr-1 flex items-center gap-2 text-xs text-ink-faint"
              title={ok ? undefined : "Não foi possível ler o progresso. Tente mais tarde."}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-ok" : "bg-amber-400")} aria-hidden />
              {SYNC_LABEL[source]}
            </p>
            <span className="hidden h-6 w-px bg-line sm:block" aria-hidden />
          </>
        )}
        <Link
          href="/cliente/mensagens"
          aria-label={unread ? `Notificações: ${unread} novas` : "Notificações"}
          className="relative grid h-11 w-11 place-items-center rounded-xl text-ink-dim transition-colors duration-200 hover:bg-white/[0.05] hover:text-ink"
        >
          <Bell size={18} strokeWidth={1.7} aria-hidden />
          {unread > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" aria-hidden />}
        </Link>
        <Link href="/cliente/mensagens" className="btn-quiet h-11 px-4 text-[13px]">
          <MessageCircle size={16} aria-hidden /> Falar com o João
        </Link>
      </div>
    </header>
  );
}
