"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { whatsappLink } from "@/lib/data";
import { WhatsappIcon } from "./Icons";
import { EASE } from "@/lib/utils";

/**
 * Botão flutuante do WhatsApp (canto inferior direito).
 * Aparece depois de passar o hero — lá já existe o botão "Pedir um projeto".
 */
export function WhatsappFloat({ href = whatsappLink }: { href?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pedir um projeto pelo WhatsApp (abre numa nova janela)"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-8 sm:right-8"
        >
          {/* etiqueta que desliza no hover (só em ecrãs com rato) */}
          <span className="glass pointer-events-none hidden translate-x-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink opacity-0 transition duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:block">
            Pedir um projeto
          </span>

          <span className="relative grid h-14 w-14 place-items-center">
            {/* ondas de sinal */}
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/30 [animation-duration:2.4s]" />
            <span aria-hidden className="absolute -inset-1.5 rounded-full border border-accent/40 shadow-[0_0_24px_rgba(139,108,255,0.45)]" />
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.65)] transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95">
              <WhatsappIcon className="h-7 w-7" />
            </span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
