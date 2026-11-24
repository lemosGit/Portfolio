/** Ilustrações decorativas do portal (sem conteúdo — aria-hidden). */

export function PhoneOrbit() {
  return (
    <div aria-hidden className="pointer-events-none relative aspect-square h-full max-h-full w-full">
      {/* halo */}
      <div
        className="absolute inset-[12%] rounded-full"
        style={{ background: "radial-gradient(circle, rgb(var(--c-accent) / 0.18) 0%, rgb(var(--c-accent) / 0.04) 45%, transparent 70%)" }}
      />
      {/* órbitas */}
      <div className="absolute inset-0 rounded-full border border-accent/15" />
      <div className="absolute inset-[9%] rounded-full border border-accent/20" />
      <div className="absolute inset-[22%] rounded-full border border-accent/10 bg-accent/[0.03]" />

      {/* pontos em órbita lenta */}
      <div className="absolute inset-0 animate-spin-slow">
        <span className="absolute right-[12%] top-[6%] h-3 w-3 rounded-full bg-accent-soft" />
        <span className="absolute bottom-[8%] left-[2%] h-2.5 w-2.5 rounded-full bg-accent" />
      </div>

      {/* telemóvel */}
      <div className="absolute left-1/2 top-1/2 h-[64%] w-[34%] -translate-x-1/2 -translate-y-1/2 rotate-[-10deg]">
        <div
          className="flex h-full w-full flex-col rounded-[13%/7%] border-[3px] border-accent/50 p-[8%]"
          style={{
            background: "linear-gradient(175deg, rgb(var(--c-raised)), rgb(var(--c-surface)))",
            boxShadow: "0 30px 60px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="mx-auto h-[3.5%] w-[36%] rounded-full bg-black/60" />
          <p className="mt-[10%] font-display text-[10px] font-semibold text-ink">
            nova<span className="text-accent-soft">.</span>
          </p>
          <div
            className="relative mt-[8%] h-[34%] overflow-hidden rounded-[10%]"
            style={{ background: "linear-gradient(150deg, rgb(var(--c-accent-soft)), rgb(var(--c-accent)))" }}
          >
            <span className="absolute right-[10%] top-[12%] h-[34%] w-auto rounded-full bg-white/25" style={{ aspectRatio: "1" }} />
            <span className="absolute bottom-[12%] left-[10%] h-1 w-[45%] rounded-full bg-white/50" />
            <span className="absolute bottom-[24%] left-[10%] h-1 w-[30%] rounded-full bg-white/35" />
          </div>
          <div className="mt-[10%] space-y-[6%]">
            <div className="h-1 w-[80%] rounded-full bg-white/20" />
            <div className="h-1 w-[60%] rounded-full bg-white/12" />
          </div>
          <div className="mt-auto h-[9%] rounded-lg bg-accent-soft/25" />
        </div>
      </div>
    </div>
  );
}

/** Pré-visualização estilizada quando a demo não pode ser incorporada. */
export function PreviewArtwork({ name }: { name: string }) {
  return (
    <div aria-hidden className="relative h-full w-full overflow-hidden bg-bg">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--c-accent) / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-accent) / 0.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="absolute -right-[10%] top-1/2 aspect-square w-[60%] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgb(var(--c-accent) / 0.16), transparent 65%)" }}
      />
      <div className="absolute inset-x-[5%] top-[9%] flex items-center justify-between">
        <span className="text-sm font-bold text-ink">{name.split(" ")[0].toLowerCase()}.</span>
        <span className="flex gap-2">
          <span className="h-0.5 w-6 rounded bg-white/15" />
          <span className="h-0.5 w-6 rounded bg-white/15" />
          <span className="h-0.5 w-6 rounded bg-white/15" />
        </span>
      </div>
      <div className="absolute left-[5%] top-[36%]">
        <p className="text-xs font-semibold text-accent-soft/70">Uma nova forma de</p>
        <p className="mt-2 font-display text-xl font-semibold text-ink sm:text-2xl">Viajar pela cidade.</p>
        <span className="mt-4 block h-3 w-16 rounded-md" style={{ background: "linear-gradient(90deg, rgb(var(--c-accent)), rgb(var(--c-accent-soft)))" }} />
      </div>
      {/* globo */}
      <div className="absolute right-[12%] top-1/2 aspect-square w-[30%] -translate-y-1/2 rounded-full border border-accent/40">
        <div className="absolute inset-y-0 left-1/2 w-[34%] -translate-x-1/2 rounded-[50%] border border-accent/40" />
        <div className="absolute inset-x-0 top-1/2 h-[34%] -translate-y-1/2 rounded-[50%] border border-accent/40" />
      </div>
    </div>
  );
}
