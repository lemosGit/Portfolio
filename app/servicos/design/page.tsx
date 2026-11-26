import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Images, LockKeyhole, MapPin, MessageSquareText, Repeat2, ShieldCheck, Wallet } from "lucide-react";
import { BackgroundFX } from "@/components/BackgroundFX";
import { Footer } from "@/components/Footer";
import { WhatsappIcon } from "@/components/Icons";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { HOURS_LABEL } from "@/lib/portal/hours";
import { designRequestMessage, whatsappWith } from "@/lib/data";
import { PIECE_TYPES } from "@/lib/design/spec";

/**
 * Página pública do serviço Design (M7-08, #71). GeniusFrela_Projeto_e_Layouts §3.
 * Mesma estrutura da página do Académico (D-156), com o Lilás Criativo do Design (#A78BFA, ADR-004).
 * Sem preços (Q-100, Q-107).
 */
export const metadata: Metadata = {
  title: "Design · GeniusFrela",
  description:
    "Logótipos, convites, lonas e camisolas personalizadas. Vê as provas, pede revisões e aprova a arte na Área do Cliente, antes de imprimirmos.",
};

const whatsapp = whatsappWith(designRequestMessage);

/** As 7 fases do Design (phase_templates, 0006; RF-20). */
const PHASES = [
  ["Briefing", "Conta-nos a peça, as medidas, a quantidade, os textos e a data do evento. Pode enviar referências."],
  ["Orçamento e sinal", "Recebe o valor do design e o da impressão em separado, o sinal e as revisões incluídas."],
  ["Conceito / esboço", "Com o sinal pago, desenhamos a primeira proposta."],
  ["Revisões", "Vê cada prova em grande e pede alterações com um comentário. Cada pedido usa uma ronda."],
  ["Aprovação final da arte", "Antes de aprovar, confirma os nomes, a data e a quantidade. Depois disso, a arte fica fechada."],
  ["Produção / impressão", "Imprimimos com o restante pago. Peças só digitais saltam esta fase."],
  ["Entrega / levantamento", "Diz-lhe a data, a hora e o local, com o mapa, e os ficheiros digitais ficam no portal."],
] as const;

const PORTAL = [
  { icon: Images, title: "A prova em grande", text: "A versão atual em primeiro plano, com frente e verso, e as anteriores para comparar." },
  { icon: Repeat2, title: "Rondas de revisão", text: "Sabe sempre em que ronda está e quantas revisões ainda cabem no preço." },
  { icon: ShieldCheck, title: "Aprovar sem surpresas", text: "Antes de aprovar, revê os nomes, a data e a quantidade que vão ser impressos." },
  { icon: MapPin, title: "Pronto para levantar", text: "A data, a hora e o local de levantamento, com o mapa e a folga até ao evento." },
  { icon: Wallet, title: "Design + impressão", text: "O que custa o design e o que custa a impressão, o que já pagou e o que falta." },
  { icon: MessageSquareText, title: "Mensagens", text: "Fala com o João no portal, com o histórico de cada pedido guardado." },
];

const pieces = Object.entries(PIECE_TYPES)
  .filter(([k]) => k !== "outro")
  .map(([, v]) => v);

export default function DesignServicePage() {
  return (
    <>
      <BackgroundFX />
      <Navbar base="/" />
      <main id="conteudo" className="relative z-10">
        {/* ───── Hero ───── */}
        <section id="inicio" className="pb-20 pt-36 md:pb-28 md:pt-44">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-design">
                <Link href="/#servicos" className="text-ink-faint transition-colors hover:text-ink">
                  Serviços
                </Link>
                <span aria-hidden className="mx-3 text-ink-faint">/</span>
                Design
              </p>
              <h1 className="max-w-3xl text-[clamp(2.4rem,6vw,4.6rem)] font-light leading-[1.04] tracking-tight">
                A sua peça, <span className="text-svc-design">aprovada antes de imprimir.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-dim">
                Logótipos, convites, lonas e camisolas personalizadas. Na Área do Cliente vê cada prova em grande, pede
                revisões e confirma os nomes e a data antes de a peça ir para impressão.
              </p>
            </Reveal>
            <Reveal delay={0.12} className="mt-10 flex flex-wrap gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fale connosco pelo WhatsApp (abre numa nova janela)"
                className="btn-design"
              >
                <WhatsappIcon className="h-4 w-4" /> Fale connosco
                <ArrowRight size={14} aria-hidden />
              </a>
              <Link href="/cliente/login" className="btn-ghost">
                <LockKeyhole size={14} aria-hidden /> Já é cliente? Entrar
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ───── O que fazemos ───── */}
        <section aria-labelledby="fazemos-title" className="py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-design">O que fazemos</p>
              <h2 id="fazemos-title" className="text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-[1.1] tracking-tight">
                Do logótipo ao convite do casamento.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-dim">
                Só o design, ou o design e a impressão. Os ficheiros digitais (PDF e PNG) ficam no portal quando a peça os
                tem.
              </p>
            </Reveal>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[...pieces, "Outras peças, por medida"].map((w, i) => (
                <li key={w}>
                  <Reveal delay={i * 0.05} className="flex h-full items-center gap-3 border border-svc-design/25 bg-svc-design/[0.04] px-5 py-4">
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-svc-design" />
                    <span className="text-[15px]">{w}</span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───── Como funciona ───── */}
        <section aria-labelledby="fases-title" className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-design">Como funciona</p>
              <h2 id="fases-title" className="mb-12 max-w-xl text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-[1.1] tracking-tight">
                Sete fases, do briefing ao levantamento.
              </h2>
            </Reveal>
            <ol className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {PHASES.map(([name, text], i) => (
                <li key={name} className="bg-bg p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-svc-design">Fase {i + 1}</p>
                  <h3 className="mt-2 text-lg font-normal">{name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{text}</p>
                </li>
              ))}
              <li className="flex flex-col justify-center bg-svc-design/[0.06] p-6">
                <p className="text-[13px] leading-relaxed text-ink-dim">
                  O preço é acertado na conversa, depois do briefing. O desenho começa com o sinal (50%) e o restante
                  paga-se antes de imprimir.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ───── Na Área do Cliente ───── */}
        <section aria-labelledby="portal-title" className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-design">Na Área do Cliente</p>
              <h2 id="portal-title" className="mb-12 max-w-xl text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-[1.1] tracking-tight">
                Nada vai para impressão sem o seu &ldquo;sim&rdquo;.
              </h2>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PORTAL.map(({ icon: Icon, title, text }, i) => (
                <li key={title}>
                  <Reveal delay={i * 0.05} className="h-full border border-white/10 p-6">
                    <Icon size={20} aria-hidden className="text-svc-design" />
                    <h3 className="mt-4 text-base font-normal">{title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink-dim">
              Entra com um link que lhe enviamos, sem palavra-passe.{" "}
              <Link href="/?servico=design#projetos" className="text-svc-design underline-offset-4 hover:underline">
                Ver trabalhos de design no portfólio
              </Link>
            </p>
          </div>
        </section>

        {/* ───── Contacto ───── */}
        <section aria-labelledby="contacto-title" className="border-y border-svc-design/30 py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <Reveal>
              <h2 id="contacto-title" className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.08] tracking-tight">
                Tem um evento a chegar? <span className="text-svc-design">Fale connosco.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-dim">
                Diga-nos a peça, a quantidade e a data do evento. Atendimento {HOURS_LABEL}.
              </p>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fale connosco pelo WhatsApp (abre numa nova janela)"
                className="btn-design mt-9"
              >
                <WhatsappIcon className="h-4 w-4" /> Fale connosco
                <ArrowRight size={14} aria-hidden />
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsappFloat href={whatsapp} />
    </>
  );
}
