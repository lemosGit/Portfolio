import Link from "next/link";
import { CalendarDays, GitBranch, LockKeyhole, Smartphone } from "lucide-react";
import { Reveal } from "./Reveal";

const POINTS = [
  { icon: GitBranch, title: "Etapas em tempo real", text: "O progresso vem diretamente das tarefas no GitHub." },
  { icon: Smartphone, title: "Demos sempre à mão", text: "Link da versão web e QR code para instalar a app." },
  { icon: CalendarDays, title: "Reuniões e feedback", text: "Próxima reunião, decisões tomadas e canal direto." },
];

/** Entrada para a Área do Cliente na página inicial. */
export function ClientAccess() {
  return (
    <section id="area-cliente" aria-labelledby="ca-title" className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
      <Reveal>
        <div className="panel overflow-hidden p-8 md:p-14">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(109,76,255,0.35), transparent)" }}
          />
          <div className="relative grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
            <div>
              <h2 id="ca-title" className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
                Já é cliente?
                <br />
                <span className="text-gradient">Acompanhe o seu projeto.</span>
              </h2>
              <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-ink-dim">
                Cada cliente recebe um acesso privado para ver em que fase está o trabalho, experimentar as
                demonstrações e falar diretamente comigo.
              </p>
              <Link href="/cliente/login" className="btn-violet mt-8 h-[52px] px-6">
                <LockKeyhole size={16} aria-hidden /> Entrar na área do cliente
              </Link>
            </div>
            <ul className="space-y-3">
              {POINTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4 rounded-2xl border border-line bg-white/[0.02] p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-soft">
                    <Icon size={19} aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-[15px] font-semibold text-ink">{title}</span>
                    <span className="mt-1 block text-[13px] text-ink-dim">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
