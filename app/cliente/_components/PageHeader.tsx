import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";
import { relative } from "@/lib/portal/format";
import type { ProjectView } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

type Props = {
  section: string;
  title: React.ReactNode;
  syncedAt: string;
  source: ProjectView["source"];
  unread: number;
};

const SYNC_LABEL: Record<Props["source"], string> = {
  github: "Sincronizado com GitHub",
  exemplo: "Dados de demonstração",
  erro: "Progresso indisponível",
};

export function PageHeader({ section, title, syncedAt, source, unread }: Props) {
  const ok = source !== "erro";
  return (
    <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <nav aria-label="Localização" className="text-[13px] font-medium tracking-wide text-ink-faint">
          <Link href="/cliente" className="transition-colors hover:text-ink">
            Área do cliente
          </Link>
          <span className="mx-3 text-ink-faint/60" aria-hidden>
            /
          </span>
          <span className="text-ink-dim" aria-current="page">
            {section}
          </span>
        </nav>
        <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[30px]">
          {title}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <p
          className="mr-1 flex items-center gap-2.5 text-[13px] text-ink-dim"
          title={ok ? `Última leitura: ${relative(syncedAt)}` : "Não foi possível ler o progresso. Tente mais tarde."}
        >
          <span className="relative flex h-2 w-2">
            {ok && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-50 motion-reduce:hidden" />
            )}
            <span className={cn("relative inline-flex h-2 w-2 rounded-full", ok ? "bg-ok" : "bg-amber-400")} />
          </span>
          {SYNC_LABEL[source]}
        </p>
        <Link
          href="/cliente/mensagens"
          aria-label={unread ? `Notificações: ${unread} novas` : "Notificações"}
          className="relative grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white/[0.02] text-ink-dim transition-[transform,color,border-color] duration-200 ease-out hover:border-accent/30 hover:text-ink active:scale-[0.95]"
        >
          <Bell size={19} strokeWidth={1.8} aria-hidden />
          {unread > 0 && (
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" aria-hidden />
          )}
        </Link>
        <Link href="/cliente/mensagens" className="btn-violet h-12 px-5">
          Falar com João <ArrowRight size={17} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
