import Link from "next/link";
import { ArrowRight, CalendarPlus, Check, Clock, ExternalLink, LoaderCircle, Users } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import { dayLabel, dayParts, relative, time } from "@/lib/portal/format";
import type { DemoLink, Meeting, ProjectView } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { PreviewArtwork } from "./Visuals";

export function PanelHead({
  kicker,
  title,
  action,
  id,
}: {
  id?: string;
  kicker: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="kicker">{kicker}</p>
        <h2 id={id} className="mt-2.5 text-base font-medium tracking-[-0.01em] text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function TextLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const Icon = external ? ExternalLink : ArrowRight;
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group inline-flex shrink-0 items-center gap-2 rounded-md py-1 text-[13px] text-ink-dim transition-colors hover:text-ink"
    >
      {children}
      <Icon size={16} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/* ---------- Próxima reunião ---------- */

export function icsHref(m: Meeting) {
  const f = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GeniusFrela//Portal//PT",
    "BEGIN:VEVENT",
    `UID:${m.id}@jpstudio`,
    `DTSTART:${f(m.startsAt)}`,
    `DTEND:${f(m.endsAt)}`,
    `SUMMARY:${m.title}`,
    `DESCRIPTION:${m.callUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function NextMeeting({ meeting }: { meeting?: Meeting }) {
  if (!meeting) {
    return (
      <div className="flex h-full flex-col justify-center gap-3 p-7">
        <p className="kicker">Próxima reunião</p>
        <p className="text-sm text-ink-dim">Sem reuniões marcadas. Peça uma pelo canal de mensagens.</p>
        <TextLink href="/cliente/mensagens">Pedir reunião</TextLink>
      </div>
    );
  }
  const d = dayParts(meeting.startsAt);
  return (
    <div className="flex h-full gap-6 p-5 sm:p-6">
      <div
        className="flex w-[76px] shrink-0 flex-col items-center justify-center self-center rounded-2xl border border-[#b59fe1]/25 bg-[#b59fe1]/[0.06] py-3.5 text-center"
      >
        <p className="lav text-[11px] font-semibold uppercase tracking-[0.12em]">{d.month}</p>
        <p className="lav mt-0.5 font-display text-[30px] font-normal leading-none">{d.day}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-2">
        <p className="kicker">Próxima reunião</p>
        <h2 className="mt-2.5 text-base font-medium text-ink">{meeting.title}</h2>
        <p className="mt-1 text-xs text-ink-faint">{d.weekday}</p>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-dim">
          <Clock size={15} aria-hidden />
          {time(meeting.startsAt)} – {time(meeting.endsAt)} <span className="text-ink-faint">WAT</span>
        </p>
        <div className="mt-5 flex gap-2.5">
          <a href={meeting.callUrl} target="_blank" rel="noreferrer" className="btn-violet flex-1 whitespace-nowrap px-4 text-[13px]">
            <Users size={16} aria-hidden /> Entrar na reunião
          </a>
          <a
            href={icsHref(meeting)}
            download={`${meeting.title}.ics`}
            className="btn-quiet w-12 shrink-0 px-0"
            aria-label="Adicionar ao calendário"
            title="Adicionar ao calendário"
          >
            <CalendarPlus size={18} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- Atualizações do GitHub ---------- */

export function GithubFeed({ items, limit = 3 }: { items: ProjectView["recentActivity"]; limit?: number }) {
  return (
    <ul className="divide-y divide-line border-t border-line">
      {items.slice(0, limit).map((t) => {
        const done = t.state === "closed";
        return (
          <li key={t.number}>
            <Link
              href={`/cliente/projeto?vista=tarefas#tarefa-${t.number}`}
              className="group flex items-center gap-4 py-4 transition-colors"
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
                  done ? "border-ok/20 bg-ok/10 text-ok" : "border-transparent bg-accent/15 text-[#a99bf0]",
                )}
              >
                {done ? <Check size={16} strokeWidth={2.4} aria-hidden /> : <LoaderCircle size={16} aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{t.title}</span>
                <span className="mt-1 block text-xs text-ink-faint">
                  {t.area} · {done ? "concluída" : "em curso"} {dayLabel(t.updatedAt)}
                </span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-ink-faint transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-ink"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function GithubBadge() {
  return (
    <span className="relative text-ink-dim" aria-hidden>
      <GithubIcon className="h-6 w-6" />
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-ok ring-2 ring-surface" />
    </span>
  );
}

/* ---------- Preview web ---------- */

export function PreviewWindow({ demo, projectName }: { demo?: DemoLink; projectName: string }) {
  if (!demo) {
    return (
      <div className="grid min-h-[280px] place-items-center p-8 text-center text-sm text-ink-dim">
        A primeira demonstração web aparece aqui assim que for publicada.
      </div>
    );
  }
  const host = demo.url.replace(/^https?:\/\//, "");
  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      <div className="overflow-hidden rounded-2xl border border-line bg-bg">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-[#ff6b8a]/70" />
            <span className="h-2 w-2 rounded-full bg-[#ffc46b]/70" />
            <span className="h-2 w-2 rounded-full bg-ok/70" />
          </span>
          <span className="mx-auto max-w-[60%] truncate rounded-md bg-white/[0.04] px-6 py-1 text-xs text-ink-faint sm:px-16">
            {host}
          </span>
          <a
            href={demo.url}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir a demonstração num novo separador"
            className="text-ink-faint transition-colors hover:text-ink"
          >
            <ExternalLink size={16} aria-hidden />
          </a>
        </div>
        <div className="aspect-[16/7] min-h-[200px]">
          <PreviewArtwork name={projectName} />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-ok" aria-hidden />
          <div>
            <p className="text-[13px] font-semibold text-ink">Preview online · v{demo.version}</p>
            <p className="text-xs text-ink-faint">Atualizado {relative(demo.createdAt)}</p>
          </div>
        </div>
        <TextLink href={demo.url} external>
          Abrir projeto
        </TextLink>
      </div>
    </div>
  );
}
