"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, House, LogOut, Menu, MessageSquare, ShieldCheck, Users, X } from "lucide-react";
import { BrandLockup } from "@/components/BrandMark";
import { logout } from "@/lib/portal/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Visão geral", icon: House },
  { href: "/admin/clientes", label: "Clientes e projetos", icon: Users },
  { href: "/admin/mensagens", label: "Mensagens", icon: MessageSquare, badge: true },
] as const;

type Props = { name: string; awaiting: number };

export function AdminSidebar(props: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-line bg-bg/60 px-5 pb-5 pt-7 backdrop-blur-xl lg:flex">
        <Body {...props} group="desk" />
      </aside>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" aria-label="Visão geral">
          <BrandLockup className="origin-left scale-90" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="relative grid h-11 w-11 place-items-center rounded-xl border border-line text-ink-dim transition-transform duration-150 ease-out active:scale-[0.95]"
        >
          <Menu size={20} />
          {props.awaiting > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[320px] flex-col border-r border-line bg-[#0c0918] px-5 pb-5 pt-6 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0, transition: { type: "spring", stiffness: 420, damping: 42 } }}
              exit={{ x: "-100%", transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-4 top-5 grid h-10 w-10 place-items-center rounded-xl text-ink-dim hover:text-ink"
              >
                <X size={20} />
              </button>
              <Body {...props} group="mob" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Body({ name, awaiting, group }: Props & { group: string }) {
  const pathname = usePathname();
  return (
    <>
      <Link href="/admin" className="rounded-xl" aria-label="JP Studio — Administração">
        <BrandLockup />
      </Link>

      <nav aria-label="Administração" className="mt-12">
        <p className="kicker mb-4 flex items-center gap-2 px-3">
          <ShieldCheck size={13} aria-hidden /> Administração
        </p>
        <ul className="space-y-1.5">
          {NAV.map(({ href, label, icon: Icon, ...rest }) => {
            const active =
              href === "/admin"
                ? pathname === href
                : pathname.startsWith(href) || (href === "/admin/clientes" && pathname.startsWith("/admin/projetos"));
            const badge = "badge" in rest && awaiting > 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-[50px] items-center gap-3.5 rounded-2xl px-4 text-[15px] transition-colors duration-200",
                    active ? "text-ink" : "text-ink-dim hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={`admin-nav-${group}`}
                      className="absolute inset-0 rounded-2xl border border-accent/40"
                      style={{
                        background: "linear-gradient(90deg, rgba(139,108,255,0.22), rgba(139,108,255,0.06))",
                        boxShadow: "inset 3px 0 0 #8b6cff",
                      }}
                      transition={{ type: "spring", stiffness: 520, damping: 42 }}
                    />
                  )}
                  <Icon size={19} strokeWidth={1.7} className="relative" aria-hidden />
                  <span className="relative">{label}</span>
                  {badge && (
                    <span
                      className="relative ml-auto grid h-6 min-w-6 place-items-center rounded-lg bg-accent px-1.5 text-[11px] font-bold text-white"
                      aria-label={`${awaiting} por responder`}
                    >
                      {awaiting}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto space-y-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-ink-faint transition-colors hover:text-ink"
        >
          <ExternalLink size={15} aria-hidden /> Ver o site público
        </Link>
        <div className="flex items-center gap-3 border-t border-line px-1 pt-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#3a2d6e] to-[#211a3f] text-sm font-semibold text-accent-soft">
            JP
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            <p className="text-xs text-ink-faint">Administrador</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Terminar sessão"
              title="Terminar sessão"
              className="grid h-10 w-10 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-white/5 hover:text-ink"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
