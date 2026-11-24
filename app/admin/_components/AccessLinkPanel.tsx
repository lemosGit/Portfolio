"use client";

/**
 * Link mágico do projeto (M5-12, RF-30.50, RF-30.52): gerar em 1 clique e enviar por
 * Copiar, WhatsApp (wa.me sem número, Q-087) ou email. O link só existe neste ecrã.
 */
import { useActionState, useState } from "react";
import { Check, Copy, Link2, Mail, MessageCircle, TriangleAlert } from "lucide-react";
import { emailAccessLink, generateAccessLink, setAccessLinkChannel, type AdminState } from "@/lib/admin/actions";
import { linkMessage, whatsappShare } from "@/lib/access/links";
import { time } from "@/lib/portal/format";

export function AccessLinkPanel({ projectId, emailOn }: { projectId: string; emailOn: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(generateAccessLink, {});
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState<AdminState | null>(null);
  const [sending, setSending] = useState(false);
  const link = state.link;
  const text = link ? linkMessage({ clientName: link.clientName, projectName: link.projectName, url: link.url }) : "";

  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="projeto" value={projectId} />
        <button type="submit" disabled={pending} className="btn-violet h-11">
          <Link2 size={16} aria-hidden /> {pending ? "A gerar…" : link ? "Gerar outro link" : "Gerar link de acesso"}
        </button>
        {state.error && (
          <p role="alert" className="flex items-center gap-1.5 text-[13px] text-[#ff8fa3]">
            <TriangleAlert size={14} aria-hidden /> {state.error}
          </p>
        )}
      </form>

      {link && (
        <div className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-4">
          <p className="text-sm font-semibold text-ink">Link para {link.clientName}</p>
          <p className="mt-1 text-xs text-ink-faint">Uso único · válido até amanhã às {time(link.expiresAt)} · os links anteriores deixaram de funcionar.</p>
          <input readOnly value={link.url} aria-label="Link de acesso" onFocus={(e) => e.currentTarget.select()} className="field mt-3 h-10 w-full font-mono text-xs" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-quiet h-10 py-0"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  void setAccessLinkChannel(link.url, projectId, "copiar");
                } catch {
                  /* sem permissão: copiar à mão a partir do campo */
                }
              }}
            >
              {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />} {copied ? "Copiado" : "Copiar mensagem"}
            </button>
            <a
              href={whatsappShare(text)}
              target="_blank"
              rel="noreferrer"
              className="btn-quiet h-10 py-0"
              onClick={() => void setAccessLinkChannel(link.url, projectId, "whatsapp")}
            >
              <MessageCircle size={15} aria-hidden /> Abrir no WhatsApp
            </a>
            <button
              type="button"
              disabled={!emailOn || sending}
              title={emailOn ? undefined : "Falta RESEND_API_KEY"}
              className="btn-quiet h-10 py-0 disabled:opacity-50"
              onClick={async () => {
                setSending(true);
                setSent(await emailAccessLink(link.url, projectId));
                setSending(false);
              }}
            >
              <Mail size={15} aria-hidden /> {sending ? "A enviar…" : "Enviar por email"}
            </button>
          </div>
          {sent && (
            <p role={sent.error ? "alert" : "status"} className={sent.error ? "mt-2 text-[13px] text-[#ff8fa3]" : "mt-2 text-[13px] text-ok"}>
              {sent.error ?? sent.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
