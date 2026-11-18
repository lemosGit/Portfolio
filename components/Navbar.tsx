"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { LockKeyhole, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/data";
import { useActiveSection } from "@/lib/useActiveSection";
import { cn, EASE } from "@/lib/utils";
import { BrandLockup } from "./BrandMark";

const ids = [...navLinks.map((l) => l.id), "contacto"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500",
        scrolled
          ? "border-accent/10 bg-bg/70 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Navegação principal"
        className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5"
      >
        <a href="#inicio" className="rounded-xl" aria-label="GeniusFrela — início">
          <BrandLockup />
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {navLinks.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? "true" : undefined}
                className={cn(
                  "relative py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                  active === l.id ? "text-accent" : "text-ink-dim hover:text-ink",
                )}
              >
                {l.label}
                {active === l.id && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-accent shadow-[0_0_10px_#8b6cff]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <Link href="/cliente/login" className="btn-violet hidden h-11 px-4 md:inline-flex">
          <LockKeyhole size={15} aria-hidden /> Área do cliente
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="grid h-10 w-10 place-items-center border border-accent/30 text-accent md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100svh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-2 px-5 pt-10">
              {[...navLinks, { id: "contacto", label: "Contacto" }].map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE }}
                >
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-white/5 py-5 text-3xl font-light"
                  >
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="px-5 pt-8">
              <Link href="/cliente/login" className="btn-violet h-[52px] w-full">
                <LockKeyhole size={16} aria-hidden /> Área do cliente
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
