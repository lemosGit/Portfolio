import { ArrowUp } from "lucide-react";
import { profile } from "@/lib/data";
import { BrandGlyph } from "./BrandMark";

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint md:flex-row">
      <p className="inline-flex items-center gap-2.5">
        <BrandGlyph className="h-4 w-4" />
        © {new Date().getFullYear()} GeniusFrela · {profile.name}
      </p>
      <p className="text-center">Projetado com intenção. Construído com precisão.</p>
      <a href="/cliente/login" className="transition-colors hover:text-accent">
        Área do cliente
      </a>
      <a href="#inicio" className="inline-flex items-center gap-2 transition-colors hover:text-accent">
        Voltar ao topo <ArrowUp size={12} />
      </a>
    </footer>
  );
}
