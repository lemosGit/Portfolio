/**
 * Envio de emails transacionais pelo Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Sem RESEND_API_KEY não envia nada: o portal continua a funcionar e a ação diz que o email ficou por enviar.
 */
import { profile } from "@/lib/data";

if (typeof window !== "undefined") throw new Error("lib/email/send.ts só pode correr no servidor.");

export const emailEnabled = Boolean(process.env.RESEND_API_KEY);

/** Remetente: tem de usar um domínio verificado no Resend. */
const FROM = process.env.EMAIL_FROM ?? "JP Studio <portal@joao-pereira.dev>";
/** Base dos links nos emails. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://joao-pereira.dev").replace(/\/$/, "");

export type SendResult = { sent: true } | { sent: false; reason: string };

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "avisos por email desligados (falta RESEND_API_KEY)" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [msg.to], reply_to: profile.email, subject: msg.subject, html: msg.html, text: msg.text }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      console.error("[email] Resend recusou o envio:", res.status, body.message);
      return { sent: false, reason: `o Resend recusou o envio (${res.status}${body.message ? `: ${body.message}` : ""})` };
    }
    return { sent: true };
  } catch (e) {
    console.error("[email] Falha a contactar o Resend:", e);
    return { sent: false, reason: "não foi possível contactar o serviço de email" };
  }
}

/** Frase para juntar à mensagem de sucesso da ação. */
export const emailNote = (r: SendResult | undefined) =>
  !r ? "" : r.sent ? " O cliente foi avisado por email." : ` Email não enviado: ${r.reason}.`;
