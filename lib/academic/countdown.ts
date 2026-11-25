/**
 * Contagem do prazo do Académico (M6-02, RF-10.80…82, RN-21…24). Pura, em hora de Luanda.
 * - Mostra dias até ao prazo (o fim do dia do prazo, 23:59 em Luanda).
 * - Com menos de 2 dias, passa a horas (RF-10.81).
 * - A ≤ 3 dias: "Prazo próximo"; depois do prazo: "Atrasada" (RF-10.82), sempre na cor do módulo (D-088).
 * - O prazo que conta é o ajustado (RN-21): due_on + dias em que se esperou pelo cliente.
 */

const TZ_OFFSET = "+01:00"; // Africa/Luanda, sem horário de verão
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** AAAA-MM-DD em Luanda, aceite tanto uma data como um ISO com hora. */
export function luandaDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "Africa/Luanda" });
}

/** Fim do dia do prazo em Luanda (23:59:59.999). */
export const deadlineMs = (date: string) => Date.parse(`${luandaDate(date)}T23:59:59.999${TZ_OFFSET}`);

export type Countdown = {
  /** "days" e "hours" antes do prazo; "late" depois. */
  mode: "days" | "hours" | "late";
  /** Dias ou horas restantes; em atraso, os dias de atraso. */
  value: number;
  unit: string;
  /** Etiqueta (RF-10.82): "Prazo próximo" a ≤ 3 dias, "Atrasada" depois do prazo. */
  label: "Prazo próximo" | "Atrasada" | null;
  /** Prazo que conta (ajustado, se houver), AAAA-MM-DD. */
  due: string;
  /** Dias acrescentados ao prazo original por espera do cliente (RN-21, RN-23). */
  extraDays: number;
};

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export function countdown(dueOn: string, adjustedDueOn: string | null | undefined, now: number): Countdown {
  const original = luandaDate(dueOn);
  const due = adjustedDueOn && luandaDate(adjustedDueOn) > original ? luandaDate(adjustedDueOn) : original;
  const extraDays = Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${original}T00:00:00Z`)) / DAY);
  const left = deadlineMs(due) - now;

  if (left < 0) {
    const late = Math.max(1, Math.ceil(-left / DAY));
    return { mode: "late", value: late, unit: plural(late, "dia de atraso", "dias de atraso"), label: "Atrasada", due, extraDays };
  }
  if (left < 2 * DAY) {
    const hours = Math.max(1, Math.ceil(left / HOUR));
    return { mode: "hours", value: hours, unit: plural(hours, "hora", "horas"), label: "Prazo próximo", due, extraDays };
  }
  // Dias de calendário em Luanda: hoje → dia do prazo (amanhã = 1).
  const today = luandaDate(new Date(now).toISOString());
  const days = Math.round((Date.parse(`${due}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);
  return { mode: "days", value: days, unit: plural(days, "dia", "dias"), label: days <= 3 ? "Prazo próximo" : null, due, extraDays };
}
