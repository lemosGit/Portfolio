"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { profile, whatsappLink } from "@/lib/data";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "./Icons";
import { Reveal } from "./Reveal";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível: o link mailto continua a funcionar */
    }
  };

  return (
    <section id="contacto" className="relative overflow-hidden border-y border-accent/40 py-32 md:py-44">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10 bg-[radial-gradient(circle,rgba(109,76,255,0.12),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <p className="eyebrow mb-6">
            <span className="mr-3 text-ink-faint">05</span>Contacto
          </p>
          <h2 className="text-[clamp(2.2rem,5.4vw,4rem)] font-light leading-[1.08] tracking-tight">
            Vamos construir algo <span className="text-accent">extraordinário.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink-dim">
            Estou disponível para colaborar em projetos ambiciosos, resolver problemas complexos e
            criar tecnologia com propósito.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-col items-center gap-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pedir um projeto pelo WhatsApp (abre numa nova janela)"
            className="btn-primary !px-8 !py-4"
          >
            <WhatsappIcon className="h-4 w-4" /> Pedir um projeto
            <ArrowRight size={14} />
          </a>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Resposta pelo WhatsApp · ou por email
          </p>

          <div className="flex items-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-3 border-b border-accent/50 pb-1.5 text-lg transition-colors hover:border-accent sm:text-xl"
            >
              {profile.email}
              <ArrowRight size={18} className="text-accent transition-transform group-hover:translate-x-1" />
            </a>
            <button
              type="button"
              onClick={copy}
              aria-label="Copiar email"
              className="grid h-9 w-9 place-items-center border border-white/10 text-ink-dim transition-colors hover:border-accent/50 hover:text-accent"
            >
              {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
            </button>
          </div>
          <p role="status" aria-live="polite" className="h-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {copied ? "Email copiado" : ""}
          </p>

          <div className="flex gap-3">
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-ghost !px-5 !py-3">
              <LinkedinIcon className="h-3.5 w-3.5" /> LinkedIn
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost !px-5 !py-3">
              <GithubIcon className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
