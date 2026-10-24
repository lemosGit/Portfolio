import { Reveal } from "./Reveal";

const tags = ["Systems thinking", "Clean architecture", "Human-centered"];

export function About() {
  return (
    <section id="sobre" className="py-28 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-2 md:items-center">
        <Reveal>
          <p className="eyebrow mb-5">
            <span className="mr-3 text-ink-faint">01</span>Sobre mim
          </p>
          <h2 className="text-[clamp(2rem,4.8vw,3.6rem)] font-light leading-[1.08] tracking-tight">
            Entre a engenharia e o código, encontro <span className="text-accent">soluções simples</span>{" "}
            para problemas complexos.
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="space-y-5 text-[15px] leading-relaxed text-ink-dim">
            <p>
              Acredito que a boa tecnologia começa com uma compreensão profunda do problema.
              Combino pensamento sistémico, engenharia rigorosa e execução pragmática para
              construir produtos que permanecem fiáveis à medida que crescem.
            </p>
            <p>
              Do desenho da arquitetura à última linha de código, valorizo clareza, desempenho e
              uma experiência que faça sentido para quem a utiliza.
            </p>
          </div>
          <ul className="mt-8 flex flex-wrap gap-3">
            {tags.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
