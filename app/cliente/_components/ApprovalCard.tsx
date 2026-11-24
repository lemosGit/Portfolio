"use client";

/**
 * Cartão de uma aprovação pendente (M5-10, RF-30.31, RF-30.33).
 * "Aprovar" pede um segundo passo no próprio cartão (Q-085): depois de aprovar não há volta.
 * "Pedir alterações" exige um comentário (RN-05).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, TriangleAlert } from "lucide-react";
import { respondToApproval } from "@/lib/approvals/actions";
import { approvalTitle, type Approval } from "@/lib/approvals/model";

type Mode = "idle" | "confirm" | "changes";

export function ApprovalCard({ a }: { a: Approval }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const title = approvalTitle(a);

  async function send(kind: "aprovar" | "pedir_alteracoes") {
    setBusy(true);
    setMsg(null);
    const r = await respondToApproval(a.id, kind, kind === "aprovar" ? "" : comment);
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: r.error });
    setMsg({ ok: true, text: r.message });
    setMode("idle");
    router.refresh();
  }

  return (
    <article className="rounded-2xl border border-action/30 bg-action/[0.05] p-5" aria-label={`Aprovar ${title}`}>
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {a.snapshot.message && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">{a.snapshot.message}</p>}
      {a.snapshot.items && a.snapshot.items.length > 0 && (
        <ol className="mt-3 space-y-1 rounded-xl border border-line bg-raised/40 p-3 text-[13px] text-ink">
          {a.snapshot.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      )}
      {a.snapshot.files && a.snapshot.files.length > 0 && (
        <p className="mt-3 text-[13px] text-ink-dim">
          Ficheiros: {a.snapshot.files.join(", ")} · veja-os em <a href="/cliente/entregas" className="underline">Ficheiros</a>
        </p>
      )}

      {mode === "idle" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-violet h-11" onClick={() => setMode("confirm")}>
            Aprovar
          </button>
          <button type="button" className="btn-quiet h-11 py-0" onClick={() => setMode("changes")}>
            Pedir alterações
          </button>
        </div>
      )}

      {mode === "confirm" && (
        <div role="group" aria-label="Confirmar aprovação" className="mt-4 rounded-xl border border-line bg-raised/60 p-4">
          <p className="flex items-start gap-2 text-[14px] text-ink">
            <TriangleAlert size={16} aria-hidden className="mt-0.5 shrink-0 text-action" />
            Depois de aprovar não pode voltar atrás. Se precisar de mudar alguma coisa, fale com o João.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={busy} className="btn-violet h-11" onClick={() => send("aprovar")}>
              {busy ? "A enviar…" : "Confirmar aprovação"}
            </button>
            <button type="button" disabled={busy} className="btn-quiet h-11 py-0" onClick={() => setMode("idle")}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mode === "changes" && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">O que quer alterar?</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={2000}
              className="field h-auto w-full py-2.5"
              placeholder="Ex.: falta o capítulo da metodologia"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !comment.trim()} className="btn-violet h-11 disabled:opacity-50" onClick={() => send("pedir_alteracoes")}>
              {busy ? "A enviar…" : "Enviar pedido"}
            </button>
            <button type="button" disabled={busy} className="btn-quiet h-11 py-0" onClick={() => setMode("idle")}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "mt-3 flex items-center gap-1.5 text-[13px] text-ok" : "mt-3 text-[13px] text-[#ff8fa3]"}>
          {msg.ok && <Check size={14} aria-hidden />} {msg.text}
        </p>
      )}
    </article>
  );
}
