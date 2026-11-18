"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronsUpDown,
  FolderOpen,
  House,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { BrandLockup } from "@/components/BrandMark";
import { logout, selectProject } from "@/lib/portal/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/cliente", label: "Visão geral", icon: House },
  { href: "/cliente/projeto", label: "Meu projeto", icon: LayoutGrid },
  { href: "/cliente/entregas", label: "Entregas", icon: FolderOpen },
  { href: "/cliente/mensagens", label: "Mensagens", icon: MessageSquare, badge: true },
  { href: "/cliente/agenda", label: "Agenda", icon: CalendarDays },
] as const;

type Props = {
  client: { name: string; initials: string };
  project: { id: string; name: string; percent: number };
  projects: { id: string; name: string; status: "ativo" | "entregue" | "pausado" }[];
  unread: number;
};

export function Sidebar(props: Props) {
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
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[288px] flex-col border-r border-line bg-bg/60 px-5 pb-5 pt-7 backdrop-blur-xl lg:flex">
        <SidebarBody {...props} layoutGroup="desk" />
      </aside>

      {/* Mobile: barra superior + gaveta */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/cliente" aria-label="Visão geral">
          <BrandLockup className="scale-90 origin-left" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-xl border border-line text-ink-dim transition-transform duration-150 ease-out active:scale-[0.95]"
        >
          <Menu size={20} />
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
              <SidebarBody {...props} layoutGroup="mob" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarBody({ client, project, projects, unread, layoutGroup }: Props & { layoutGroup: string }) {
  const pathname = usePathname();
  return (
    <>
      <Link href="/cliente" className="rounded-xl" aria-label="GeniusFrela — Visão geral">
        <BrandLockup />
      </Link>

      <nav aria-label="Área do cliente" className="mt-14">
        <p className="kicker mb-4 px-3">Workspace</p>
        <ul className="space-y-1.5">
          {NAV.map(({ href, label, icon: Icon, ...rest }) => {
            const active = href === "/cliente" ? pathname === href : pathname.startsWith(href);
            const showBadge = "badge" in rest && unread > 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-[52px] items-center gap-3.5 rounded-2xl px-4 text-[15px] transition-colors duration-200",
                    active ? "text-ink" : "text-ink-dim hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={`nav-active-${layoutGroup}`}
                      className="absolute inset-0 rounded-2xl border border-accent/40"
                      style={{
                        background: "linear-gradient(90deg, rgba(139,108,255,0.22), rgba(139,108,255,0.06))",
                        boxShadow: "inset 3px 0 0 #8b6cff",
                      }}
                      transition={{ type: "spring", stiffness: 520, damping: 42 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={1.7} className="relative" aria-hidden />
                  <span className="relative">{label}</span>
                  {showBadge && (
                    <span
                      className="relative ml-auto grid h-6 min-w-6 place-items-center rounded-lg bg-accent px-1.5 text-[11px] font-bold text-white"
                      aria-label={`${unread} ${unread === 1 ? "resposta nova" : "respostas novas"}`}
                    >
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto space-y-5">
        {projects.length > 1 ? (
          <ProjectSwitcher project={project} projects={projects} />
        ) : (
          <Link
            href="/cliente/projeto"
            className="block rounded-2xl border border-line bg-white/[0.02] p-5 transition-colors duration-200 hover:border-accent/30"
          >
            <ProjectCard project={project} />
          </Link>
        )}

        <UserRow client={client} />
      </div>
    </>
  );
}

function UserRow({ client }: { client: Props["client"] }) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <div ref={ref} className="relative flex items-center gap-3 border-t border-line px-1 pt-5">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#3a2d6e] to-[#211a3f] text-sm font-semibold text-accent-soft">
        {client.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{client.name}</p>
        <p className="text-xs text-ink-faint">Cliente</p>
      </div>
      <button
        type="button"
        onClick={() => setMenu((v) => !v)}
        aria-label="Opções da conta"
        aria-expanded={menu}
        className="grid h-10 w-10 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-white/5 hover:text-ink"
      >
        <MoreHorizontal size={18} />
      </button>
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="absolute bottom-[calc(100%+8px)] right-0 w-48 rounded-xl border border-line bg-[#141026] p-1.5 shadow-2xl"
          >
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
              >
                <LogOut size={16} aria-hidden /> Terminar sessão
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ project, switcher }: { project: Props["project"]; switcher?: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-left">
          <p className="text-xs text-ink-faint">{switcher ? "Projeto · trocar" : "Projeto ativo"}</p>
          <p className="mt-2 truncate font-display font-semibold text-ink">{project.name}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent-soft">
          {switcher ? <ChevronsUpDown size={18} aria-hidden /> : <Sparkles size={18} aria-hidden />}
        </span>
      </div>
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full"
          style={{ width: `${project.percent}%`, background: "linear-gradient(90deg, #8b6cff, #5fd4e8)" }}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <span className="text-ink-faint">Progresso</span>
        <span className="font-semibold text-accent-soft">{project.percent}%</span>
      </div>
    </>
  );
}

const STATUS_LABEL = { ativo: "Em curso", pausado: "Pausado", entregue: "Entregue" } as const;

/** Cartão do projeto que abre uma lista para trocar de projeto (só com 2+ projetos). */
function ProjectSwitcher({ project, projects }: { project: Props["project"]; projects: Props["projects"] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Projeto ${project.name}. Trocar de projeto`}
        className="block w-full rounded-2xl border border-line bg-white/[0.02] p-5 transition-colors duration-200 hover:border-accent/30"
      >
        <ProjectCard project={project} switcher />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Os seus projetos"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "bottom center" }}
            className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-10 max-h-72 overflow-y-auto rounded-xl border border-line bg-[#141026] p-1.5 shadow-2xl"
          >
            {projects.map((p) => {
              const current = p.id === project.id;
              return (
                <li key={p.id} role="option" aria-selected={current}>
                  <form action={selectProject}>
                    <input type="hidden" name="projeto" value={p.id} />
                    <input type="hidden" name="voltar" value={pathname} />
                    <button
                      type="submit"
                      disabled={current}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink-dim transition-colors hover:bg-white/5 hover:text-ink disabled:cursor-default disabled:text-ink"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="block text-xs text-ink-faint">{STATUS_LABEL[p.status]}</span>
                      </span>
                      {current && <Check size={16} className="text-accent-soft" aria-hidden />}
                    </button>
                  </form>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
