"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePassword, type PasswordState } from "@/lib/portal/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  const [show, setShow] = useState(false);
  const errId = state.error ? "pw-error" : undefined;
  const input =
    "h-[52px] w-full rounded-xl border border-line bg-white/[0.03] px-4 text-[15px] text-ink outline-none transition-colors focus:border-accent/60 focus:bg-white/[0.05]";

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-ink-dim">
          Nova senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.error)}
            aria-describedby={["pw-hint", errId].filter(Boolean).join(" ")}
            className={`${input} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Esconder senhas" : "Mostrar senhas"}
            aria-pressed={show}
            className="absolute right-1.5 top-1.5 grid h-10 w-10 place-items-center rounded-lg text-ink-faint transition-colors hover:text-ink"
          >
            {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        </div>
        <p id="pw-hint" className="mt-2 text-xs text-ink-faint">
          Pelo menos 8 caracteres.
        </p>
      </div>

      <div>
        <label htmlFor="confirm" className="mb-2 block text-[13px] font-medium text-ink-dim">
          Repetir a nova senha
        </label>
        <input
          id="confirm"
          name="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={errId}
          className={input}
        />
      </div>

      {state.error && (
        <p id="pw-error" role="alert" className="rounded-xl border border-[#ff8fa3]/25 bg-[#ff8fa3]/[0.06] px-4 py-3 text-[13px] text-[#ffb3c0]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-violet h-[52px] w-full text-[15px]">
        {pending ? "A guardar…" : "Guardar senha e continuar"}
      </button>
    </form>
  );
}
