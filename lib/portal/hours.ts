/**
 * Horário de atendimento (RN-51, RN-52, D-036; M9-08, RF-30.63): todos os dias, das 08h00 às 20h00,
 * em hora de Luanda. As mensagens são aceites a qualquer hora; fora do horário, o cliente vê o aviso.
 */
import { nowMs } from "@/lib/clock";

export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 20;

/** Para as páginas públicas: "todos os dias, das 8h às 20h". */
export const HOURS_LABEL = `todos os dias, das ${OPEN_HOUR}h às ${CLOSE_HOUR}h`;

export const OUT_OF_HOURS_MESSAGE = "Entraremos em contacto assim que o horário de abertura estiver disponível.";

/** Hora e minuto em Luanda (Africa/Luanda, UTC+1 sem horário de verão). */
function luandaMinutes(ms: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Luanda", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(ms));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

/** Dentro do horário: das 08h00 (inclusive) às 20h00 (exclusive), em Luanda. */
export const isOpen = (ms = nowMs()) => {
  const m = luandaMinutes(ms);
  return m >= OPEN_HOUR * 60 && m < CLOSE_HOUR * 60;
};
