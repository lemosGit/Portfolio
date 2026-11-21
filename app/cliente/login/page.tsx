import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, GitBranch, Smartphone, Sparkles } from "lucide-react";
import { BrandLockup } from "@/components/BrandMark";
import { profile } from "@/lib/data";
import { DEMO_CREDENTIALS } from "@/lib/portal/mock-data";
import { supabaseEnabled } from "@/lib/supabase/config";
import { PhoneOrbit } from "../_components/Visuals";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar · Área do cliente · GeniusFrela",
  robots: { index: false, follow: false },
};

const FEATURES = [
  { icon: GitBranch, title: "Etapa a etapa", text: "Progresso com clareza" },
  { icon: Smartphone, title: "Do lado de dentro", text: "Experimente o projeto" },
  { icon: CalendarDays, title: "Sempre alinhados", text: "Conversas e encontros" },
];

const MOTIVOS: Record<string, string> = {
  "sem-projeto": "A sua conta ainda não tem um projeto associado. Fale com a GeniusFrela para o ativar.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const notice = motivo ? MOTIVOS[motivo] : undefined;
  const help = `mailto:${profile.email}?subject=Recuperar%20acesso%20%C3%A0%20%C3%A1rea%20do%20cliente`;

  return (
    <main id="conteudo" className="app relative grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div aria-hidden className="app-ambient">
        <i />
        <i />
      </div>
      {/* Formulário */}
      <section className="relative z-[1] flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="GeniusFrela — página inicial" className="rounded-xl">
            <BrandLockup />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-ink-faint transition-colors hover:text-ink">
            <ArrowLeft size={15} aria-hidden /> Portfólio
          </Link>
        </div>

        <div className="rise mx-auto my-auto w-full max-w-[380px] py-14">
          <p className="kicker">Área do cliente</p>
          <h1 className="mt-6 font-display text-[40px] font-normal leading-[1.08] tracking-[-0.035em] text-ink sm:text-[46px]">
            O seu projeto,
            <br />
            <span className="aurora">mais perto.</span>
          </h1>
          <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-ink-dim">
            Um espaço para acompanhar, conversar e ver a sua ideia ganhar vida.
          </p>
          {notice && (
            <p role="status" className="mt-6 rounded-xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-[13px] text-ink-dim">
              {notice}
            </p>
          )}
          <div className="mt-9">
            <LoginForm helpHref={help} />
          </div>

          <div className="mt-9 border-t border-line pt-6 text-center">
            {supabaseEnabled ? (
              <p className="text-[13px] text-ink-faint">
                Ainda não tem acesso?{" "}
                <a href={help} className="text-ink-dim underline-offset-4 transition-colors hover:text-ink hover:underline">
                  Fale com a GeniusFrela
                </a>
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-ink-faint">
                Acesso de demonstração: <span className="text-ink-dim">{DEMO_CREDENTIALS.email}</span>, senha{" "}
                <span className="text-ink-dim">{DEMO_CREDENTIALS.password}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Ilustração */}
      <aside
        className="relative hidden h-dvh flex-col justify-between overflow-hidden border-l border-line px-12 py-8 lg:sticky lg:top-0 lg:flex"
        aria-label="O que encontra na área do cliente"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 38%, rgba(110,80,230,0.2), transparent 70%), radial-gradient(40% 30% at 85% 90%, rgba(95,212,232,0.07), transparent 70%), linear-gradient(180deg, #1d1730, #151122)",
        }}
      >
        <p className="kicker">Clareza em cada etapa</p>

        <div className="relative mx-auto my-4 h-[44vh] max-h-[400px] min-h-[260px] w-full max-w-[540px]">
          <div className="absolute left-1/2 top-1/2 aspect-square h-full -translate-x-1/2 -translate-y-1/2">
            <PhoneOrbit />
          </div>

          <div aria-hidden className="glass-card float-soft absolute left-0 top-[22%] w-[210px] p-4">
            <div className="flex items-center gap-3">
              <span className="icon-tile h-9 w-9">
                <GitBranch size={16} aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">O seu projeto</p>
                <p className="text-[13px] font-medium text-ink">A ganhar forma</p>
              </div>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[64%] rounded-full" style={{ background: "linear-gradient(90deg, #8b6cff, #5fd4e8)" }} />
            </div>
            <p className="mt-2 flex justify-between text-[11px] text-ink-faint">
              <span>Desenvolvimento</span>
              <span className="text-ink-dim">64%</span>
            </p>
          </div>

          <div aria-hidden className="glass-card float-soft-late absolute right-0 top-[62%] flex w-[260px] items-center gap-3 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-ink-dim">
              <Check size={15} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-ink">Mais uma etapa concluída.</p>
              <p className="text-[11px] text-ink-faint">Cada detalhe faz a diferença.</p>
            </div>
            <Sparkles size={15} className="shrink-0 text-ink-faint" aria-hidden />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[520px] text-center">
          <p className="kicker kicker-plain">Da primeira ideia ao lançamento</p>
          <p className="mt-3 font-display text-[30px] font-normal leading-[1.15] tracking-[-0.03em] text-ink">
            Um processo claro.
            <br />
            Uma experiência <span className="aurora">próxima.</span>
          </p>
          <p className="mt-4 text-[13px] text-ink-faint">Menos dúvidas. Mais partilha. Tudo no mesmo lugar.</p>

          <ul className="mt-7 grid grid-cols-3 gap-4 border-t border-line pt-5 text-left">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <Icon size={17} className="mt-0.5 shrink-0 text-[#a99bf0]" aria-hidden />
                <span>
                  <span className="block text-[13px] text-ink">{title}</span>
                  <span className="block text-[11px] text-ink-faint">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
