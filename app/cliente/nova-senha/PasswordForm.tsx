"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { changePassword, type PasswordState } from "@/lib/portal/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  const [show, setShow] = useState(false);
  const errId = state.error ? "pw-error" : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="password" className="field-label">
          Nova senha
        </label>
        <span className="field-wrap">
          <Lock aria-hidden />
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.error)}
            aria-describedby={["pw-hint", errId].filter(Boolean).join(" ")}
            className="field pr-12"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Esconder senhas" : "Mostrar senhas"}
            aria-pressed={show}
            className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-faint transition-colors hover:text-ink"
          >
            {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        </span>
        <p id="pw-hint" className="mt-2 text-xs text-ink-faint">
          Pelo menos 8 caracteres.
        </p>
      </div>

      <div>
        <label htmlFor="confirm" className="field-label">
          Repetir a nova senha
        </label>
        <span className="field-wrap">
          <KeyRound aria-hidden />
          <input
          id="confirm"
          name="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          aria-invalid={Boolean(state.error)}
          aria-describedby={errId}
          className="field"
          />
        </span>
      </div>

      {state.error && (
        <p id="pw-error" role="alert" className="rounded-xl border border-[#ff8fa3]/25 bg-[#ff8fa3]/[0.06] px-4 py-3 text-[13px] text-[#ffb3c0]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-violet h-12 w-full text-sm">
        {pending ? "A guardar…" : "Guardar senha e continuar"}
      </button>
    </form>
  );
}
