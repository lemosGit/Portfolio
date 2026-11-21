import { CalendarPlus, Clock, Users } from "lucide-react";
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
      <PageHeader
        section="Agenda"
        eyebrow="Sempre alinhados"
        title="Reuniões"
        subtitle="Um momento para conversar, alinhar e avançar."
        unread={unread}
        syncedAt={project.syncedAt}
        source={project.source}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {next ? (
          <section aria-labelledby="next-title" className="panel panel-glow p-7 md:p-8">
            <p className="kicker">Próximo encontro</p>
            <div className="mt-6 flex items-center gap-5">
              <div className="grid h-[76px] w-[68px] shrink-0 place-items-center rounded-2xl border border-[#b59fe1]/25 bg-[#b59fe1]/[0.06] text-center">
                <div>
                  <p className="lav text-[11px] font-semibold uppercase tracking-[0.12em]">{dayParts(next.startsAt).month}</p>
                  <p className="lav mt-0.5 font-display text-[30px] font-normal leading-none">{dayParts(next.startsAt).day}</p>
                </div>
              </div>
              <div className="min-w-0">
                <h2 id="next-title" className="font-display text-[22px] font-normal leading-tight tracking-[-0.02em] text-ink">
                  {next.title}
                </h2>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-dim">
                  <Clock size={14} aria-hidden />
                  {dayParts(next.startsAt).weekday}, {time(next.startsAt)} – {time(next.endsAt)}
                </p>
              </div>
            </div>

            <h3 className="mt-8 text-sm font-medium text-ink">O que vamos conversar</h3>
            <ul className="mt-3 space-y-2.5">
              {next.agenda.map((a) => (
                <li key={a} className="flex items-center gap-3 text-sm text-ink-dim">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#b59fe1]" aria-hidden /> {a}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={next.callUrl} target="_blank" rel="noreferrer" className="btn-violet h-11 px-5">
                <Users size={16} aria-hidden /> Entrar na reunião
              </a>
              <a href={icsHref(next)} download={`${next.title}.ics`} className="btn-quiet h-11">
                <CalendarPlus size={16} aria-hidden /> Adicionar ao calendário
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-faint">Hora de Luanda (WAT).</p>
          </section>
        ) : (
          <section className="panel grid place-items-center p-9 text-center">
            <div>
              <p className="kicker">Próximo encontro</p>
              <p className="mt-4 text-sm text-ink-dim">Não há reuniões marcadas.</p>
              <div className="mt-3">
                <TextLink href="/cliente/mensagens">Pedir uma reunião</TextLink>
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="past-title" className="panel p-7 md:p-8">
          <h2 id="past-title" className="font-display text-[22px] font-normal tracking-[-0.02em] text-ink">
            Já conversámos sobre
          </h2>
          {project.pastMeetings.length === 0 ? (
            <p className="mt-6 border-t border-line pt-6 text-sm text-ink-dim">
              Os resumos das reuniões aparecem aqui depois de cada encontro.
            </p>
          ) : (
            <ol className="mt-6 divide-y divide-line border-t border-line">
              {project.pastMeetings.map((m) => (
                <li key={m.id} className="py-5">
                  <time dateTime={m.startsAt} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                    {longDate(m.startsAt)}
                  </time>
                  <p className="mt-2 text-[15px] font-medium text-ink">{m.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{m.notes ?? "Resumo ainda não publicado."}</p>
                  <span className="mt-3 inline-flex rounded-md bg-[#b59fe1]/10 px-2 py-0.5 text-xs text-[#cbbaf0]">Concluída</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
