import { now as clockNow, nowMs } from "@/lib/clock";
const TZ = "Africa/Luanda";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "12 Mai" */
export function shortDate(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleDateString("pt-PT", { month: "short", timeZone: TZ }).replace(".", "");
  const day = d.toLocaleDateString("pt-PT", { day: "numeric", timeZone: TZ });
  return `${day} ${cap(month)}`;
}

/** "25 de novembro de 2026" */
export function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}

export function dayParts(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("pt-PT", { day: "numeric", timeZone: TZ }),
    month: d.toLocaleDateString("pt-PT", { month: "short", timeZone: TZ }).replace(".", "").toUpperCase(),
    weekday: cap(d.toLocaleDateString("pt-PT", { weekday: "long", timeZone: TZ })),
  };
}

/** "14:30" */
export function time(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

/** "há 12 minutos", "ontem", "há 3 dias" */
export function relative(iso: string, now = nowMs()) {
  const diff = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (diff < 1) return "agora mesmo";
  if (diff < 60) return `há ${diff} ${diff === 1 ? "minuto" : "minutos"}`;
  const h = Math.round(diff / 60);
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  const days = Math.round(h / 24);
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  return shortDate(iso);
}

/** Igual a relative(), mas "hoje" para qualquer momento do próprio dia. */
export function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = clockNow();
  if (d.toDateString() === today.toDateString()) return "hoje";
  return relative(iso);
}

export function greeting(now = clockNow()) {
  const h = Number(now.toLocaleTimeString("pt-PT", { hour: "2-digit", hour12: false, timeZone: TZ }));
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}
