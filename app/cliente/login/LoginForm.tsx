"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, LockKeyhole, Mail } from "lucide-react";
import { login, type LoginState } from "@/lib/portal/actions";

export function LoginForm({ helpHref }: { helpHref: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  const errId = state.error ? "login-error" : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="field-label">
          O seu email
        </label>
        <span className="field-wrap">
          <Mail aria-hidden />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            aria-invalid={Boolean(state.error)}
            aria-describedby={errId}
            className="field"
            placeholder="nome@empresa.com"
          />
        </span>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor="password" className="field-label mb-0">
            Senha
          </label>
          <a href={helpHref} className="text-xs text-ink-faint transition-colors hover:text-ink">
            Precisa de ajuda?
          </a>
        </div>
        <span className="field-wrap">
          <Lock aria-hidden />
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.error)}
            aria-describedby={errId}
            className="field pr-12"
            placeholder="A senha que recebeu"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={show}
            className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-faint transition-colors hover:text-ink"
          >
            {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        </span>
      </div>

      {state.error && (
        <p id="login-error" role="alert" className="rounded-xl border border-action/25 bg-action/[0.06] px-4 py-3 text-[13px] text-action">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-violet group relative h-12 w-full text-sm">
        {pending ? "A entrar…" : "Entrar no meu espaço"}
        {!pending && (
          <ArrowRight
            size={17}
            className="absolute right-5 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
            aria-hidden
          />
        )}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-ink-faint">
        <LockKeyhole size={13} aria-hidden /> Um espaço reservado para si e para o seu projeto.
      </p>
    </form>
  );
}
