import { CalendarPlus, Clock, NotebookPen, Users } from "lucide-react";
import { dayParts, longDate, time } from "@/lib/portal/format";
import { requirePortal } from "@/lib/portal/session";
import { PageHeader } from "../../_components/PageHeader";
import { icsHref, TextLink } from "../../_components/Widgets";

export const metadata = { title: "Agenda" };

export default async function AgendaPage() {
  const { project, unread } = await requirePortal();
  const next = project.nextMeeting;

  return (
    <div className="space-y-6">
      <PageHeader section="Agenda" title="Reuniões do projeto" unread={unread} syncedAt={project.syncedAt} source={project.source} />

      {next ? (
        <section aria-labelledby="next-title" className="panel grid gap-8 p-7 md:grid-cols-[150px_minmax(0,1fr)] md:p-9">
          <div
            className="flex flex-col items-center justify-center rounded-[22px] border border-line py-6 text-center"
            style={{ background: "linear-gradient(180deg, rgba(139,108,255,0.03), rgba(139,108,255,0.18))" }}
          >
            <p className="text-[11px] font-semibold tracking-[0.2em] text-ink-dim">{dayParts(next.startsAt).month}</p>
            <p className="font-display text-[56px] font-semibold leading-none text-ink">{dayParts(next.startsAt).day}</p>
            <p className="mt-2 text-xs text-ink-faint">{dayParts(next.startsAt).weekday}</p>
          </div>
          <div>
            <p className="kicker">Próxima reunião</p>
            <h2 id="next-title" className="mt-2.5 font-display text-2xl font-semibold text-ink">
              {next.title}
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-dim">
              <Clock size={16} aria-hidden /> {time(next.startsAt)} – {time(next.endsAt)} (hora de Luanda)
            </p>
            <h3 className="mt-7 text-xs font-semibold text-ink-faint">Pauta</h3>
            <ul className="mt-3 space-y-2">
              {next.agenda.map((a) => (
                <li key={a} className="flex items-center gap-3 text-sm text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> {a}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={next.callUrl} target="_blank" rel="noreferrer" className="btn-violet h-12">
                <Users size={16} aria-hidden /> Entrar na reunião
              </a>
              <a href={icsHref(next)} download={`${next.title}.ics`} className="btn-quiet h-12">
                <CalendarPlus size={16} aria-hidden /> Adicionar ao calendário
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel p-9 text-center">
          <p className="text-sm text-ink-dim">Não há reuniões marcadas.</p>
          <div className="mt-4">
            <TextLink href="/cliente/mensagens">Pedir uma reunião</TextLink>
          </div>
        </section>
      )}

      <section aria-labelledby="past-title" className="panel p-7">
        <p className="kicker">Anteriores</p>
        <h2 id="past-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
          O que ficou decidido
        </h2>
        {project.pastMeetings.length === 0 ? (
          <p className="mt-6 text-sm text-ink-dim">Os resumos das reuniões aparecem aqui depois de cada encontro.</p>
        ) : (
          <ol className="mt-6 divide-y divide-line border-t border-line">
            {project.pastMeetings.map((m) => (
              <li key={m.id} className="grid gap-2 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
                <div>
                  <p className="font-display text-[15px] font-semibold text-ink">{m.title}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    <time dateTime={m.startsAt}>{longDate(m.startsAt)}</time>
                  </p>
                </div>
                <p className="flex gap-3 text-[13px] leading-relaxed text-ink-dim">
                  <NotebookPen size={16} className="mt-0.5 shrink-0 text-accent-soft" aria-hidden />
                  {m.notes ?? "Resumo ainda não publicado."}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
