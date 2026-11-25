import Link from "next/link";
import { notFound } from "next/navigation";
import { replyToClient } from "@/lib/admin/actions";
import { getProjectById, listThread } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { longDate, time } from "@/lib/portal/format";
import { cn } from "@/lib/utils";
import { ActionForm } from "../../_components/forms";
import { inputCls, textareaCls } from "../../_components/styles";
import { AdminHeader, Empty, NotifyClient, Section } from "../../_components/ui";

export const metadata = { title: "Conversa" };

const ABOUT = { geral: "Geral", fase: "Fase", tarefa: "Tarefa #" } as const;

export default async function ThreadPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { sb } = await requireAdmin();
  const [p, thread] = await Promise.all([getProjectById(sb, projectId), listThread(sb, projectId)]);
  if (!p) notFound();

  const repo = p.githubOwner && p.githubRepo ? `${p.githubOwner}/${p.githubRepo}` : "";

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[
          { href: "/admin/mensagens", label: "Mensagens" },
          { href: `/admin/mensagens/${p.id}`, label: p.clientName },
        ]}
        title={p.clientName}
        subtitle={
          <>
            <Link href={`/admin/projetos/${p.id}`} className="hover:underline">
              {p.name}
            </Link>
            {p.clientCompany && ` · ${p.clientCompany}`}
          </>
        }
      />

      <Section title="Conversa" className="max-w-3xl">
        {thread.length === 0 ? (
          <Empty>Ainda não há mensagens neste projeto. Pode escrever a primeira.</Empty>
        ) : (
          <ol className="space-y-4">
            {thread.map((m, i) => {
              const mine = m.author === "admin";
              const newDay = i === 0 || longDate(thread[i - 1].createdAt) !== longDate(m.createdAt);
              const about =
                m.target.kind === "geral"
                  ? null
                  : m.target.kind === "tarefa" && repo
                    ? { label: `${ABOUT.tarefa}${m.target.ref}`, href: `https://github.com/${repo}/issues/${m.target.ref}` }
                    : { label: `${ABOUT[m.target.kind]}${m.target.kind === "fase" ? ` ${m.target.ref}` : m.target.ref}` };
              return (
                <li key={m.id}>
                  {newDay && <p className="mb-3 text-center text-xs text-ink-faint">{longDate(m.createdAt)}</p>}
                  <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        mine ? "rounded-br-md bg-accent/20 text-ink" : "rounded-bl-md border border-line bg-white/[0.03] text-ink-dim",
                      )}
                    >
                      {about && (
                        <p className="mb-1 text-xs font-semibold text-accent-soft">
                          Sobre:{" "}
                          {"href" in about && about.href ? (
                            <a href={about.href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                              {about.label}
                            </a>
                          ) : (
                            about.label
                          )}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1.5 text-right text-xs text-ink-faint">
                        {mine ? "Você" : p.clientName.split(" ")[0]} · {time(m.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <ActionForm action={replyToClient} submit="Enviar resposta" pendingLabel="A enviar…" resetOnOk>
            <input type="hidden" name="projeto" value={p.id} />
            <label htmlFor="resposta" className="sr-only">
              Resposta
            </label>
            <textarea
              id="resposta"
              name="mensagem"
              rows={4}
              maxLength={2000}
              required
              placeholder={`Responder a ${p.clientName.split(" ")[0]}…`}
              className={textareaCls}
            />
            <NotifyClient />
          </ActionForm>
        </div>
      </Section>
    </div>
  );
}
