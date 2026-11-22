import { BrandMark } from "@/components/BrandMark";
import { longDate, relative } from "@/lib/portal/format";
import { requirePortal } from "@/lib/portal/session";
import type { Feedback } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { FeedbackComposer } from "../../_components/Feedback";
import { PageHeader } from "../../_components/PageHeader";

export const metadata = { title: "Mensagens" };

export default async function MessagesPage() {
  const { client, project, feedback, unread } = await requirePortal();

  const phaseName = (n: number) => project.phases.find((p) => p.number === n)?.title ?? `Fase ${n}`;
  const taskName = (n: number) =>
    project.phases.flatMap((p) => p.tasks).find((t) => t.number === n)?.title ?? `Tarefa #${n}`;
  const targetLabel = (t: Feedback["target"]) =>
    t.kind === "fase" ? phaseName(t.ref) : t.kind === "tarefa" ? taskName(t.ref) : "Geral";

  const targets = [
    { value: "geral", label: "Geral — o projeto no seu todo" },
    ...project.phaseViews
      .filter((p) => p.status !== "pending")
      .map((p) => ({ value: `fase:${p.number}`, label: `Etapa — ${p.title}` })),
    // Tarefas à espera de informação do cliente: a resposta fica ligada à tarefa certa.
    ...project.needsClient.map((t) => ({ value: `tarefa:${t.number}`, label: `Precisa de si — ${t.title}` })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader section="Mensagens" eyebrow="Canal direto" title="Conversa com a GeniusFrela" unread={unread} source={project.source} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="thread-title" className="panel p-5 sm:p-7">
          <h2 id="thread-title" className="sr-only">
            Histórico de mensagens
          </h2>
          {feedback.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-dim">Ainda não há mensagens.</p>
          ) : (
            <ol className="space-y-6">
              {feedback.map((f) => {
                const mine = f.author === "client";
                return (
                  <li key={f.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                    {mine ? (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.07] text-xs font-semibold text-ink">
                        {client.initials}
                      </span>
                    ) : (
                      <BrandMark className="h-9 w-9 rounded-xl text-xs" />
                    )}
                    <div className={cn("max-w-[78%]", mine && "text-right")}>
                      <p className="text-xs text-ink-faint">
                        <span className="font-semibold text-ink-dim">{mine ? "Você" : "João · GeniusFrela"}</span>
                        {" · "}
                        <time dateTime={f.createdAt} title={longDate(f.createdAt)}>
                          {relative(f.createdAt)}
                        </time>
                      </p>
                      <div
                        className={cn(
                          "mt-1.5 inline-block rounded-2xl px-4 py-3 text-left text-sm leading-relaxed",
                          mine
                            ? "rounded-tr-md bg-accent/[0.18] text-ink"
                            : "rounded-tl-md border border-line bg-white/[0.035] text-ink",
                        )}
                      >
                        {f.body}
                      </div>
                      <p className="mt-1.5 text-xs text-ink-faint">Sobre: {targetLabel(f.target)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section aria-labelledby="new-title" className="panel h-fit p-7 xl:sticky xl:top-8">
          <p className="kicker">Canal direto</p>
          <h2 id="new-title" className="mt-2.5 text-base font-medium text-ink">
            Nova mensagem
          </h2>
          <div className="mt-6">
            <FeedbackComposer targets={targets} />
          </div>
        </section>
      </div>
    </div>
  );
}
