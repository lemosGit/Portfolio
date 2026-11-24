import Link from "next/link";
import type { AdminClient, ProjectStatus } from "@/lib/admin/data";
import { emailEnabled } from "@/lib/email/send";
import { cn } from "@/lib/utils";

export function AdminHeader({
  trail = [],
  title,
  subtitle,
  actions,
}: {
  trail?: { href: string; label: string }[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <nav aria-label="Localização" className="kicker flex-wrap">
          <Link href="/admin" className="transition-colors hover:text-ink">
            Administração
          </Link>
          {trail.map((t) => (
            <span key={t.href} className="flex items-center gap-2">
              <span aria-hidden className="text-ink-faint/50">
                /
              </span>
              <Link href={t.href} className="transition-colors hover:text-ink">
                {t.label}
              </Link>
            </span>
          ))}
        </nav>
        <h1 className="mt-4 font-display text-[28px] font-normal leading-[1.12] tracking-[-0.03em] text-ink md:text-[32px]">
          {title}
        </h1>
        {subtitle && <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-ink-dim">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
  tone,
  id,
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tone?: "danger";
}) {
  return (
    <section id={id} className={cn("panel scroll-mt-6 p-5 sm:p-6", tone === "danger" && "border-[#ff8fa3]/20", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={cn("text-base font-medium text-ink", tone === "danger" && "text-[#ffb3c0]")}>
            {title}
          </h2>
          {description && <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "ok" | "warn" | "danger" | "accent" | "neutral"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 text-xs font-medium",
        tone === "ok" && "border-ok/25 bg-ok/10 text-ok",
        tone === "warn" && "border-amber-400/25 bg-amber-400/10 text-amber-300",
        tone === "danger" && "border-[#ff8fa3]/25 bg-[#ff8fa3]/10 text-[#ffb3c0]",
        tone === "accent" && "border-accent/30 bg-accent/10 text-accent-soft",
        tone === "neutral" && "border-line bg-white/[0.03] text-ink-dim",
      )}
    >
      {children}
    </span>
  );
}

const STATUS: Record<ProjectStatus, { label: string; tone: "ok" | "warn" | "accent" | "neutral" }> = {
  ativo: { label: "Ativo", tone: "accent" },
  pausado: { label: "Pausado", tone: "warn" },
  entregue: { label: "Entregue", tone: "ok" },
  cancelado: { label: "Cancelado", tone: "neutral" },
};

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => (
  <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>
);

export function Progress({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-white/[0.07]", className)} role="presentation">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%`, background: "linear-gradient(90deg, #8b6cff, #5fd4e8)" }}
      />
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-7 text-center text-[13px] text-ink-faint">{children}</p>;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.07] text-xs font-semibold text-ink",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function AccessBadge({ c }: { c: AdminClient }) {
  if (c.account?.suspended) return <Badge tone="danger">Suspenso</Badge>;
  if (c.mustChangePassword) return <Badge tone="warn">Aguarda 1.º acesso</Badge>;
  return <Badge tone="ok">Ativo</Badge>;
}

/** Caixa "avisar o cliente por email" (campo `avisar`), marcada por defeito. */
export function NotifyClient({ defaultChecked = true }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-[13px] text-ink-dim">
      <input
        type="checkbox"
        name="avisar"
        value="1"
        defaultChecked={emailEnabled && defaultChecked}
        disabled={!emailEnabled}
        className="h-4 w-4 rounded border-line accent-[#8863e6]"
      />
      Avisar o cliente por email
      {!emailEnabled && <span className="text-ink-faint">(desligado: falta RESEND_API_KEY)</span>}
    </label>
  );
}
