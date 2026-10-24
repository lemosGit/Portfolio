import { ArrowUp } from "lucide-react";
import { profile } from "@/lib/data";

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint md:flex-row">
      <p>
        © {new Date().getFullYear()} {profile.name}
      </p>
      <p className="text-center">Projetado com intenção. Construído com precisão.</p>
      <a href="#inicio" className="inline-flex items-center gap-2 transition-colors hover:text-accent">
        Voltar ao topo <ArrowUp size={12} />
      </a>
    </footer>
  );
}
