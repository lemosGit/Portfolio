/**
 * Esqueleto mostrado de imediato ao navegar no portal e no admin (loading.tsx),
 * enquanto o servidor prepara a página. A barra lateral mantém-se visível.
 */
function Bar({ className }: { className: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
}

export function PageSkeleton({ label = "A carregar" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">{label}…</span>
      <header className="space-y-3">
        <Bar className="h-3.5 w-40" />
        <Bar className="h-8 w-[min(420px,80%)]" />
      </header>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="panel space-y-4 p-6">
            <Bar className="h-3 w-24" />
            <Bar className="h-7 w-32" />
            <Bar className="h-2.5 w-full" />
          </div>
        ))}
      </div>
      <div className="panel space-y-4 p-6">
        <Bar className="h-3 w-32" />
        {[0, 1, 2, 3].map((i) => (
          <Bar key={i} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
