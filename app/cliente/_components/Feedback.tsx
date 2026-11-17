"use client";

import { useActionState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, SendHorizontal } from "lucide-react";
import { sendFeedback, type FeedbackState } from "@/lib/portal/actions";

type Target = { value: string; label: string };

/** Caixa de feedback. Assíncrono: o João responde no painel de administração. */
export function FeedbackComposer({ targets, compact }: { targets?: Target[]; compact?: boolean }) {
  const [state, action, pending] = useActionState<FeedbackState, FormData>(sendFeedback, {});
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className="space-y-3">
      {targets && targets.length > 0 && (
        <div>
          <label htmlFor="fb-target" className="mb-2 block text-xs text-ink-faint">
            Sobre
          </label>
          <select
            id="fb-target"
            name="target"
            defaultValue="geral"
            className="h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-ink outline-none transition-colors focus:border-accent/50"
          >
            {targets.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#141026]">
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative rounded-2xl border border-line bg-white/[0.02] transition-colors focus-within:border-accent/50">
        <label htmlFor="fb-body" className="sr-only">
          A sua mensagem
        </label>
        <textarea
          id="fb-body"
          name="body"
          required
          maxLength={2000}
          rows={compact ? 3 : 4}
          placeholder="Escreva uma mensagem…"
          aria-describedby="fb-help"
          className="block w-full resize-none rounded-2xl bg-transparent px-4 pb-16 pt-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
          }}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Enviar mensagem"
          className="btn-violet absolute bottom-3 right-3 h-11 w-11 rounded-xl p-0"
        >
          <SendHorizontal size={18} aria-hidden className={pending ? "animate-pulse" : undefined} />
        </button>
      </div>

      <div className="flex min-h-5 items-center justify-between gap-3 text-[11px]" id="fb-help" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {state.error ? (
            <motion.p key="err" className="text-[#ff8fa3]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {state.error}
            </motion.p>
          ) : state.ok && !pending ? (
            <motion.p
              key="ok"
              className="flex items-center gap-1.5 text-ok"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Check size={14} aria-hidden /> Mensagem enviada
            </motion.p>
          ) : (
            <motion.p key="help" className="text-ink-faint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Normalmente responde em menos de 2 horas
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
