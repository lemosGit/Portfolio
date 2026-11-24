import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Ver detalhes" com seta: o essencial fica à vista e o resto abre só a pedido.
 * Sem JavaScript (usa <details>), por isso funciona em páginas do servidor.
 */
export function Details({
  children,
  label = "Ver detalhes",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <details className={cn("group/details", className)}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg py-1.5 text-[13px] text-ink-dim transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          size={15}
          className="transition-transform duration-200 ease-out group-open/details:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

/** Imagem do projeto ao fundo de um painel, com véu para o texto continuar legível. */
export function CoverBackdrop({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover opacity-60" />
      {/* Mesmo tom do .panel, para não mudar as cores do tema. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--c-surface) / 0.97) 0%, rgb(var(--c-surface) / 0.85) 45%, rgb(var(--c-surface) / 0.6) 100%)",
        }}
      />
    </div>
  );
}
