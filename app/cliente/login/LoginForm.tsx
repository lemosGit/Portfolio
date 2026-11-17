"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { login, type LoginState } from "@/lib/portal/actions";

export function LoginForm({ demo }: { demo?: { email: string; password: string } }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  const errId = state.error ? "login-error" : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-ink-dim">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          aria-invalid={Boolean(state.error)}
          aria-describedby={errId}
          className="h-[52px] w-full rounded-xl border border-line bg-white/[0.03] px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent/60 focus:bg-white/[0.05]"
          placeholder="nome@empresa.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-ink-dim">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.error)}
            aria-describedby={errId}
            className="h-[52px] w-full rounded-xl border border-line bg-white/[0.03] pl-4 pr-14 text-[15px] text-ink outline-none transition-colors focus:border-accent/60 focus:bg-white/[0.05]"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={show}
            className="absolute right-1.5 top-1.5 grid h-10 w-10 place-items-center rounded-lg text-ink-faint transition-colors hover:text-ink"
          >
            {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {state.error && (
        <p id="login-error" role="alert" className="rounded-xl border border-[#ff8fa3]/25 bg-[#ff8fa3]/[0.06] px-4 py-3 text-[13px] text-[#ffb3c0]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-violet h-[52px] w-full text-[15px]">
        {pending ? "A entrar…" : "Entrar na área do cliente"}
        {!pending && <ArrowRight size={17} aria-hidden />}
      </button>

      {demo && (
        <p className="rounded-xl border border-dashed border-line px-4 py-3 text-[12px] leading-relaxed text-ink-faint">
          Acesso de demonstração: <span className="text-ink-dim">{demo.email}</span> · senha{" "}
          <span className="text-ink-dim">{demo.password}</span>
        </p>
      )}
    </form>
  );
}
