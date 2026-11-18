import { useId } from "react";
import { cn } from "@/lib/utils";

/** Cores da marca GeniusFrela (gradiente violeta → ciano do logótipo). */
export const BRAND = { from: "#9a84f8", to: "#5cc8e6", tile: "#15102a" } as const;

/**
 * Símbolo "G" da GeniusFrela em SVG: anel aberto com barra interior e o ponto ciano.
 * Desenhado numa grelha de 44×44 a partir do logótipo original.
 */
export function BrandGlyph({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden className={cn("h-8 w-8 shrink-0", className)}>
      <defs>
        <linearGradient id={`gf-${id}`} x1="4" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={BRAND.from} />
          <stop offset="1" stopColor={BRAND.to} />
        </linearGradient>
      </defs>
      <path
        d="M30.6 13.4 A15 15 0 1 0 35 24 H21.6"
        stroke={`url(#gf-${id})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35.4" cy="8.8" r="2.7" fill={BRAND.to} />
    </svg>
  );
}

/** Símbolo dentro do mosaico escuro (ícone de app / avatar). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-accent/25",
        className,
      )}
      style={{
        background: `linear-gradient(160deg, #1b1536 0%, ${BRAND.tile} 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 26px -12px rgba(124,140,248,0.55)",
      }}
    >
      <BrandGlyph className="h-[68%] w-[68%]" />
    </span>
  );
}

/** Nome "GeniusFrela" com "Frela" no gradiente da marca. */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-semibold tracking-[-0.02em] text-ink", className)}>
      Genius
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, ${BRAND.from}, ${BRAND.to})` }}
      >
        Frela
      </span>
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <span className="leading-tight">
        <BrandWordmark className="block text-[18px]" />
        <span className="block text-[10px] font-medium uppercase tracking-[0.24em] text-ink-faint">
          Digital experience
        </span>
      </span>
    </span>
  );
}
