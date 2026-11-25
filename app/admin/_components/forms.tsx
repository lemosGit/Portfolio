"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, KeyRound, TriangleAlert } from "lucide-react";
import type { AdminState } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";
import { inputCls } from "./styles";

type Action = (prev: AdminState, form: FormData) => Promise<AdminState>;


/** Formulário ligado a uma Server Action, com mensagens de erro/sucesso e credenciais únicas. */
export function ActionForm({
  action,
  children,
  submit,
  pendingLabel = "A guardar…",
  variant = "primary",
  resetOnOk,
  className,
  inline,
}: {
  action: Action;
  children?: React.ReactNode;
  submit: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "quiet" | "danger";
  resetOnOk?: boolean;
  className?: string;
  /** Botão na mesma linha dos campos, sem rodapé (ex.: remover um item). */
  inline?: boolean;
}) {
  const [state, formAction] = useActionState<AdminState, FormData>(action, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnOk) ref.current?.reset();
  }, [state, resetOnOk]);

  if (inline) {
    return (
      <form ref={ref} action={formAction} className={cn("flex items-center gap-2", className)}>
        {children}
        <Submit variant={variant} pendingLabel={pendingLabel}>
          {submit}
        </Submit>
        {state.error && (
          <span role="alert" className="text-xs text-[#ff8fa3]">
            {state.error}
          </span>
        )}
      </form>
    );
  }

  return (
    <form ref={ref} action={formAction} className={cn("space-y-4", className)} noValidate>
      {children}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Submit variant={variant} pendingLabel={pendingLabel}>
          {submit}
        </Submit>
        <Status state={state} />
      </div>
      {state.credentials && <Credentials {...state.credentials} />}
    </form>
  );
}

export function Submit({
  children,
  variant,
  pendingLabel,
}: {
  children: React.ReactNode;
  variant: "primary" | "quiet" | "danger";
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        variant === "primary" && "btn-violet h-11",
        variant === "quiet" && "btn-quiet h-11 py-0",
        variant === "danger" &&
          "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ff8fa3]/30 bg-[#ff8fa3]/[0.06] px-4 text-sm font-medium text-[#ffb3c0] transition-[transform,background-color] duration-200 hover:bg-[#ff8fa3]/[0.12] active:scale-[0.97] disabled:opacity-50",
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Status({ state }: { state: AdminState }) {
  return (
    <div aria-live="polite" className="min-h-5 text-[13px]">
      <AnimatePresence mode="wait" initial={false}>
        {state.error ? (
          <motion.p key={`e${state.error}`} role="alert" className="flex items-center gap-1.5 text-[#ff8fa3]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TriangleAlert size={14} aria-hidden /> {state.error}
          </motion.p>
        ) : state.ok && state.message ? (
          <motion.p key={`o${state.message}`} className="flex items-center gap-1.5 text-ok" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}>
            <Check size={14} aria-hidden /> {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Mostra a senha temporária uma única vez, com botão para copiar a mensagem para o cliente. */
function Credentials({ email, password }: { email: string; password: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Acesso à Área do Cliente GeniusFrela\n\nEndereço: https://joao-pereira.dev/cliente/login\nEmail: ${email}\nSenha temporária: ${password}\n\nNo primeiro acesso vai definir uma senha nova.`;

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/[0.07] p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <KeyRound size={16} className="text-accent-soft" aria-hidden /> Credenciais de acesso
      </p>
      <p className="mt-1 text-xs text-ink-faint">
        Envie-as ao cliente por um canal privado. A senha não volta a ser mostrada.
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-ink-faint">Email</dt>
        <dd className="break-all text-ink">{email}</dd>
        <dt className="text-ink-faint">Senha</dt>
        <dd className="font-mono tracking-wide text-ink">{password}</dd>
      </dl>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* sem permissão de área de transferência: copiar à mão */
          }
        }}
        className="btn-quiet mt-4 h-10 py-0"
      >
        {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
        {copied ? "Copiado" : "Copiar mensagem para o cliente"}
      </button>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

/** Zona de perigo: o botão só fica ativo depois de escrever o texto de confirmação. */
export function ConfirmDelete({
  action,
  id,
  expected,
  what,
  label,
}: {
  action: Action;
  id: string;
  expected: string;
  what: string;
  label: string;
}) {
  const [value, setValue] = useState("");
  const [state, formAction, pending] = useActionState<AdminState, FormData>(action, {});
  const ready = value.trim().toLowerCase() === expected.toLowerCase();

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Field label={`Para confirmar, escreva ${what}: ${expected}`}>
        <input
          name="confirmar"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className={inputCls}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!ready || pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ff8fa3]/30 bg-[#ff8fa3]/[0.08] px-4 text-sm font-medium text-[#ffb3c0] transition-[transform,background-color,opacity] duration-200 hover:bg-[#ff8fa3]/[0.14] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "A apagar…" : label}
        </button>
        {state.error && (
          <p role="alert" className="text-[13px] text-[#ff8fa3]">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
