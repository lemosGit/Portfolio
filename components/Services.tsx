import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services, type Service } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

/** Classes literais por serviço (o Tailwind só gera as classes que encontra escritas). */
export const SERVICE_TONE: Record<Service["tone"], { text: string; border: string; dot: string; glow: string }> = {
  dev: { text: "text-svc-dev", border: "border-svc-dev/40 hover:border-svc-dev", dot: "bg-svc-dev", glow: "from-svc-dev/15" },
  aca: { text: "text-svc-aca", border: "border-svc-aca/40 hover:border-svc-aca", dot: "bg-svc-aca", glow: "from-svc-aca/15" },
  design: { text: "text-svc-design", border: "border-svc-design/40 hover:border-svc-design", dot: "bg-svc-design", glow: "from-svc-design/15" },
};

/** Secção "Serviços" do portal público (GeniusFrela_Projeto_e_Layouts §3, M6-08). */
export function Services() {
  return (
    <section id="servicos" className="py-28 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          index="02"
          label="Serviços"
          title={
            <>
              Três serviços, <span className="text-accent">um só acompanhamento.</span>
            </>
          }
          aside="Cada projeto tem a sua Área do Cliente, com as fases do serviço, os ficheiros, as aprovações e os pagamentos."
        />
        <ul className="grid gap-5 md:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.id}>
              <Reveal delay={i * 0.08} className="h-full">
                <ServiceCard service={s} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServiceCard({ service: s }: { service: Service }) {
  const tone = SERVICE_TONE[s.tone];
  const body = (
    <>
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", tone.dot)} />
      <p className={cn("font-mono text-[10px] uppercase tracking-[0.2em]", tone.text)}>{s.short}</p>
      <h3 className="mt-3 text-xl font-normal leading-snug">{s.name}</h3>
      <ul className="mt-5 space-y-2 text-[13px] text-ink-dim">
        {s.examples.map((e) => (
          <li key={e} className="flex items-center gap-2.5">
            <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0", tone.dot)} />
            {e}
          </li>
        ))}
      </ul>
      <p className={cn("mt-auto inline-flex items-center gap-2 pt-8 font-mono text-[10px] uppercase tracking-[0.18em]", s.href ? tone.text : "text-ink-faint")}>
        {s.href ? (
          <>
            {s.id === "development" ? "Ver projetos" : "Conhecer o serviço"} <ArrowUpRight size={13} aria-hidden />
          </>
        ) : (
          "Em breve"
        )}
      </p>
    </>
  );
  const cls = cn(
    "relative flex h-full flex-col overflow-hidden border bg-gradient-to-b to-transparent p-6 transition-colors duration-300",
    tone.border,
    tone.glow,
  );
  if (!s.href) {
    return <article aria-label={`${s.name} (em breve)`} className={cls}>{body}</article>;
  }
  return s.href.startsWith("#") ? (
    <a href={s.href} className={cls} aria-label={`${s.name}: ver projetos`}>
      {body}
    </a>
  ) : (
    <Link href={s.href} className={cls} aria-label={`${s.name}: conhecer o serviço`}>
      {body}
    </Link>
  );
}
