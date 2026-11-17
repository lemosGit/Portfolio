import { cn } from "@/lib/utils";

/** Marca JP Studio: monograma num quadrado violeta. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-[14px] font-display text-[15px] font-bold tracking-tight text-white",
        className,
      )}
      style={{
        background: "linear-gradient(150deg, #9d82ff 0%, #6d4cff 60%, #5a3be6 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -6px 14px rgba(40,20,120,0.35), 0 10px 26px -10px rgba(109,76,255,0.9)",
      }}
    >
      JP
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <span className="leading-tight">
        <span className="block font-display text-[17px] font-semibold tracking-tight text-ink">JP Studio</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.24em] text-ink-faint">
          Digital experience
        </span>
      </span>
    </span>
  );
}
