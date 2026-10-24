import { projects } from "@/lib/data";
import { ProjectCard } from "./ProjectCard";
import { SectionHeader } from "./SectionHeader";

export function Projects() {
  return (
    <section id="projetos" className="py-28 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          index="03"
          label="Projetos selecionados"
          title={
            <>
              Engenharia aplicada a <span className="text-accent">desafios reais.</span>
            </>
          }
          aside="Cada projeto: o problema, a arquitetura, a stack e o que foi alcançado."
        />
        <div className="space-y-6">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
