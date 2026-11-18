import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, GitBranch, Smartphone } from "lucide-react";
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
  { icon: GitBranch, text: "Etapas e tarefas atualizadas a partir do GitHub" },
  { icon: Smartphone, text: "Demonstração web e app para instalar por QR code" },
  { icon: CalendarDays, text: "Reuniões marcadas e resumo de cada uma" },
];

const MOTIVOS: Record<string, string> = {
  "sem-projeto": "A sua conta ainda não tem um projeto associado. Fale com a GeniusFrela para o ativar.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const notice = motivo ? MOTIVOS[motivo] : undefined;
  return (
    <main id="conteudo" className="relative grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div
          className="absolute -left-[10%] -top-[20%] h-[60vh] w-[60vw] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(109,76,255,0.18), transparent)" }}
        />
      </div>

      <section className="relative flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="GeniusFrela — página inicial" className="rounded-xl">
            <BrandLockup />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-ink-faint transition-colors hover:text-ink">
            <ArrowLeft size={15} aria-hidden /> Portfólio
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-[400px] py-16">
          <h1 className="font-display text-[34px] font-semibold leading-tight tracking-[-0.03em] text-ink">
            Área do cliente
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">
            Entre com o email e a senha que recebeu da GeniusFrela para acompanhar o seu projeto.
          </p>
          {notice && (
            <p role="status" className="mt-6 rounded-xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-[13px] text-ink-dim">
              {notice}
            </p>
          )}
          <div className="mt-10">
            <LoginForm demo={supabaseEnabled ? undefined : DEMO_CREDENTIALS} />
          </div>
          <p className="mt-8 text-[13px] text-ink-faint">
            Esqueceu a senha?{" "}
            <a href={`mailto:${profile.email}?subject=Recuperar%20acesso%20%C3%A0%20%C3%A1rea%20do%20cliente`} className="text-accent-soft underline-offset-4 hover:underline">
              Peça um novo acesso
            </a>
          </p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden border-l border-line lg:block" aria-label="O que encontra na área do cliente">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 60% 40%, rgba(109,76,255,0.28), transparent 70%), linear-gradient(160deg, #120d26, #08060f)",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-16">
          <div className="w-full max-w-[360px]">
            <PhoneOrbit />
          </div>
          <ul className="mt-14 w-full max-w-[420px] space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-[14px] text-ink-dim">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03] text-accent-soft">
                  <Icon size={18} aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
