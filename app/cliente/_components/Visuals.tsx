/** Ilustrações decorativas do portal (sem conteúdo — aria-hidden). */

export function PhoneOrbit() {
  return (
    <div aria-hidden className="pointer-events-none relative aspect-square w-full max-w-[330px]">
      {/* halo */}
      <div
        className="absolute inset-[12%] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(109,76,255,0.45) 0%, rgba(109,76,255,0.08) 45%, transparent 70%)" }}
      />
      {/* órbitas */}
      <div className="absolute inset-0 rounded-full border border-accent/15" />
      <div className="absolute inset-[9%] rounded-full border border-accent/20" />
      <div className="absolute inset-[22%] rounded-full border border-accent/10 bg-accent/[0.04]" />

      {/* pontos em órbita lenta */}
      <div className="absolute inset-0 animate-spin-slow">
        <span className="absolute right-[12%] top-[6%] h-3 w-3 rounded-full bg-aqua shadow-[0_0_14px_#5fd4e8]" />
        <span className="absolute bottom-[8%] left-[2%] h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_#8b6cff]" />
      </div>

      {/* telemóvel */}
      <div className="absolute left-1/2 top-1/2 h-[54%] w-[30%] -translate-x-1/2 -translate-y-1/2 rotate-[14deg]">
        <div
          className="h-full w-full rounded-[22px] border-2 border-accent/70 p-[9%]"
          style={{
            background: "linear-gradient(170deg, #1d1638, #0d0a1c)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(139,108,255,0.45), inset 0 0 20px rgba(139,108,255,0.15)",
          }}
        >
          <div className="mx-auto h-[3%] w-[34%] rounded-full bg-white/15" />
          <div
            className="mt-[16%] h-[24%] rounded-lg"
            style={{ background: "linear-gradient(135deg, #8b6cff, #5fd4e8)" }}
          />
          <div className="mt-[14%] space-y-[9%]">
            <div className="h-1.5 w-[90%] rounded-full bg-white/20" />
            <div className="h-1.5 w-[70%] rounded-full bg-white/15" />
            <div className="h-1.5 w-[80%] rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pré-visualização estilizada quando a demo não pode ser incorporada. */
export function PreviewArtwork({ name }: { name: string }) {
  return (
    <div aria-hidden className="relative h-full w-full overflow-hidden bg-[#0b0917]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,108,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,108,255,0.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="absolute -right-[10%] top-1/2 aspect-square w-[60%] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(109,76,255,0.4), transparent 65%)" }}
      />
      <div className="absolute inset-x-[5%] top-[9%] flex items-center justify-between">
        <span className="font-display text-sm font-bold text-ink">{name.split(" ")[0].toLowerCase()}.</span>
        <span className="flex gap-2">
          <span className="h-0.5 w-6 rounded bg-white/15" />
          <span className="h-0.5 w-6 rounded bg-white/15" />
          <span className="h-0.5 w-6 rounded bg-white/15" />
        </span>
      </div>
      <div className="absolute left-[5%] top-[36%]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-accent-soft/70">Uma nova forma de</p>
        <p className="mt-2 font-display text-xl font-semibold text-ink sm:text-2xl">Viajar pela cidade.</p>
        <span className="mt-4 block h-3 w-16 rounded-md" style={{ background: "linear-gradient(90deg, #8b6cff, #6d8cff)" }} />
      </div>
      {/* globo */}
      <div className="absolute right-[12%] top-1/2 aspect-square w-[30%] -translate-y-1/2 rounded-full border border-accent/40 shadow-[0_0_40px_rgba(139,108,255,0.35)]">
        <div className="absolute inset-y-0 left-1/2 w-[34%] -translate-x-1/2 rounded-[50%] border border-accent/40" />
        <div className="absolute inset-x-0 top-1/2 h-[34%] -translate-y-1/2 rounded-[50%] border border-accent/40" />
      </div>
    </div>
  );
}
