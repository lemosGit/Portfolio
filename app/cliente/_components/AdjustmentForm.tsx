"use client";

/** Formulário do pedido de ajuste (M6-06, RF-10.71): descrição de 10 a 2000 caracteres. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { requestAdjustment } from "@/lib/academic/actions";

export function AdjustmentForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        const r = await requestAdjustment(projectId, text);
        setBusy(false);
        if (!r.ok) return setMsg({ ok: false, text: r.error });
        setMsg({ ok: true, text: r.message });
        setText("");
        router.refresh();
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">O que quer ajustar?</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} className="field" placeholder="Ex.: a bibliografia não segue a APA na página 12" />
      </label>
      <button type="submit" disabled={busy || text.trim().length < 10} className="btn-violet h-11 disabled:opacity-50">
        {busy ? "A enviar…" : "Pedir ajuste"}
      </button>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "flex items-center gap-1.5 text-[13px] text-ok" : "text-[13px] text-[#ff8fa3]"}>
          {msg.ok && <Check size={14} aria-hidden />} {msg.text}
        </p>
      )}
    </form>
  );
}
