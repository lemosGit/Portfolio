import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarClock, FileCheck2, ListChecks, LockKeyhole, MessageSquareText, Wallet } from "lucide-react";
import { BackgroundFX } from "@/components/BackgroundFX";
import { Footer } from "@/components/Footer";
import { WhatsappIcon } from "@/components/Icons";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { HOURS_LABEL } from "@/lib/portal/hours";
import { CITATION_STYLES, WORK_TYPES } from "@/lib/academic/brief";
import { academicRequestMessage, whatsappWith } from "@/lib/data";

/**
 * Página pública do serviço Académico (M6-08, #61). GeniusFrela_Projeto_e_Layouts §3.
 * Estilo do portfólio público (D-090) com o âmbar do Académico (#E8B65A, ADR-004). Sem preços (Q-100).
 */
export const metadata: Metadata = {
  title: "Académico · GeniusFrela",
  description:
    "Trabalhos escolares e universitários, formatação nas normas e revisão do texto, com o prazo e os capítulos à vista na Área do Cliente.",
};

const whatsapp = whatsappWith(academicRequestMessage);

/** As 7 fases do Académico (phase_templates, 0006). */
const PHASES = [
  ["Pedido e briefing", "Conta-nos o tema, a instituição, as normas, o número de páginas e o prazo. Pode enviar o enunciado."],
  ["Orçamento e aceite", "Recebe o valor, o sinal e a data de entrega na Área do Cliente e aceita com um clique."],
  ["Estrutura (índice)", "Propomos o índice. Aprova-o ou pede alterações antes de começarmos a escrever."],
  ["Desenvolvimento", "Escrevemos capítulo a capítulo. Vê quantos estão prontos."],
  ["Revisão e formatação", "Revemos o texto e aplicamos as normas pedidas."],
  ["Entrega final", "Os ficheiros finais, em PDF e Word, ficam disponíveis com o restante pago."],
  ["Ajustes", "Durante os dias combinados (7, por omissão) pode pedir pequenas correções."],
] as const;

const PORTAL = [
  { icon: CalendarClock, title: "Quantos dias faltam", text: "A contagem até à entrega em destaque, sempre à vista." },
  { icon: ListChecks, title: "Capítulos feitos", text: "Quantos capítulos já estão prontos e qual está a ser escrito." },
  { icon: FileCheck2, title: "Índice e aprovações", text: "Aprova o índice e o orçamento no portal, com o histórico guardado." },
  { icon: BookOpenCheck, title: "Ficheiros por versão", text: "O enunciado, as normas e as versões do trabalho num só sítio." },
  { icon: Wallet, title: "Pagamentos", text: "O que já pagou e o que falta, com a data de cada parte." },
  { icon: MessageSquareText, title: "Pedidos de ajuste", text: "Depois da entrega, pede os ajustes no portal, dentro do prazo." },
];

const styles = Object.values(CITATION_STYLES).filter((s) => s !== "Outra");

export default function AcademicServicePage() {
  return (
    <>
      <BackgroundFX />
      <Navbar base="/" />
      <main id="conteudo" className="relative z-10">
        {/* ───── Hero ───── */}
        <section id="inicio" className="pb-20 pt-36 md:pb-28 md:pt-44">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-aca">
                <Link href="/#servicos" className="text-ink-faint transition-colors hover:text-ink">
                  Serviços
                </Link>
                <span aria-hidden className="mx-3 text-ink-faint">/</span>
                Académico
              </p>
              <h1 className="max-w-3xl text-[clamp(2.4rem,6vw,4.6rem)] font-light leading-[1.04] tracking-tight">
                O seu trabalho académico, <span className="text-svc-aca">com o prazo à vista.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-dim">
                Trabalhos escolares e universitários, formatação nas normas e revisão do texto. Acompanha tudo na
                Área do Cliente: quantos dias faltam, os capítulos feitos e o índice para aprovar.
              </p>
            </Reveal>
            <Reveal delay={0.12} className="mt-10 flex flex-wrap gap-3">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fale connosco pelo WhatsApp (abre numa nova janela)"
                className="btn-aca"
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
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-aca">O que fazemos</p>
              <h2 id="fazemos-title" className="text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-[1.1] tracking-tight">
                Do ensino médio ao mestrado.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-dim">
                Normas {styles.slice(0, -1).join(", ")} ou {styles.at(-1)!.toLowerCase()}.
              </p>
            </Reveal>
            <ul className="grid gap-3 sm:grid-cols-2">
              {Object.values(WORK_TYPES).map((w, i) => (
                <li key={w}>
                  <Reveal delay={i * 0.05} className="flex h-full items-center gap-3 border border-svc-aca/25 bg-svc-aca/[0.04] px-5 py-4">
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-svc-aca" />
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
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-aca">Como funciona</p>
              <h2 id="fases-title" className="mb-12 max-w-xl text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-[1.1] tracking-tight">
                Sete fases, do briefing aos ajustes.
              </h2>
            </Reveal>
            <ol className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {PHASES.map(([name, text], i) => (
                <li key={name} className="bg-bg p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-svc-aca">Fase {i + 1}</p>
                  <h3 className="mt-2 text-lg font-normal">{name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{text}</p>
                </li>
              ))}
              <li className="flex flex-col justify-center bg-svc-aca/[0.06] p-6">
                <p className="text-[13px] leading-relaxed text-ink-dim">
                  O preço é acertado na conversa, depois do briefing. O trabalho começa com o sinal (50%) e o restante
                  paga-se antes da entrega final.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ───── Na Área do Cliente ───── */}
        <section aria-labelledby="portal-title" className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-svc-aca">Na Área do Cliente</p>
              <h2 id="portal-title" className="mb-12 max-w-xl text-[clamp(1.8rem,4vw,2.8rem)] font-light leading-[1.1] tracking-tight">
                Sem perguntar &ldquo;como vai o meu trabalho?&rdquo;
              </h2>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PORTAL.map(({ icon: Icon, title, text }, i) => (
                <li key={title}>
                  <Reveal delay={i * 0.05} className="h-full border border-white/10 p-6">
                    <Icon size={20} aria-hidden className="text-svc-aca" />
                    <h3 className="mt-4 text-base font-normal">{title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink-dim">
              Entra com um link que lhe enviamos, sem palavra-passe.{" "}
              <Link href="/?servico=academic#projetos" className="text-svc-aca underline-offset-4 hover:underline">
                Ver trabalhos académicos no portfólio
              </Link>
            </p>
          </div>
        </section>

        {/* ───── Contacto ───── */}
        <section aria-labelledby="contacto-title" className="border-y border-svc-aca/30 py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <Reveal>
              <h2 id="contacto-title" className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.08] tracking-tight">
                Tem um trabalho para entregar? <span className="text-svc-aca">Fale connosco.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-dim">
                Diga-nos o tema, as normas e o prazo. Atendimento {HOURS_LABEL}.
              </p>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fale connosco pelo WhatsApp (abre numa nova janela)"
                className="btn-aca mt-9"
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
