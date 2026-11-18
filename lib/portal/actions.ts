"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/admin/role";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { addFeedback, findClientByEmail } from "./data";
import { DEMO_CREDENTIALS } from "./mock-data";
import { PROJECT_COOKIE, requirePortal, SESSION_COOKIE } from "./session";
import type { Feedback } from "./types";

/* ───────────── Login ───────────── */

export type LoginState = { error?: string; email?: string };

const WRONG_CREDENTIALS = "Email ou senha incorretos. Confirme os dados que recebeu por email.";

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Preencha o email e a senha.", email };

  if (supabaseEnabled) {
    const sb = await createSupabaseServer();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      const tooMany = error.status === 429;
      const banned = error.code === "user_banned";
      return {
        error: tooMany
          ? "Demasiadas tentativas. Aguarde um minuto e tente de novo."
          : banned
            ? "Este acesso está suspenso. Fale com a JP Studio para o reativar."
            : WRONG_CREDENTIALS,
        email,
      };
    }
    redirect(isAdminUser(data.user) ? "/admin" : "/cliente");
  }

  const client = await findClientByEmail(email);
  if (!client || password !== DEMO_CREDENTIALS.password) return { error: WRONG_CREDENTIALS, email };
  (await cookies()).set(SESSION_COOKIE, client.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/cliente");
}

export async function logout() {
  if (supabaseEnabled) await (await createSupabaseServer()).auth.signOut();
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PROJECT_COOKIE);
  redirect("/cliente/login");
}

/* ───────────── Nova senha (primeiro acesso) ───────────── */

export type PasswordState = { error?: string };

export async function changePassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (password.length < 8) return { error: "A senha precisa de pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As duas senhas não coincidem. Escreva a mesma senha nos dois campos." };
  if (!supabaseEnabled) redirect("/cliente");

  const sb = await createSupabaseServer();
  const { error } = await sb.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Escolha uma senha diferente da que recebeu por email." };
    if (error.code === "weak_password") return { error: "Senha demasiado fraca. Junte letras, números e símbolos." };
    return { error: "Não foi possível guardar a senha. Inicie sessão de novo e tente outra vez." };
  }
  const { error: rpcError } = await sb.rpc("mark_password_changed");
  if (rpcError) return { error: "A senha foi alterada, mas não conseguimos concluir o registo. Tente de novo." };
  redirect("/cliente");
}

/* ───────────── Feedback ───────────── */

export type FeedbackState = { ok?: boolean; error?: string };

export async function sendFeedback(_prev: FeedbackState, form: FormData): Promise<FeedbackState> {
  const { project } = await requirePortal();
  const body = String(form.get("body") ?? "").trim();
  const targetRaw = String(form.get("target") ?? "geral");

  if (body.length < 2) return { error: "Escreva a sua mensagem antes de enviar." };
  if (body.length > 2000) return { error: "A mensagem tem mais de 2000 caracteres. Divida-a em duas." };

  let target: Feedback["target"] = { kind: "geral" };
  const [kind, ref] = targetRaw.split(":");
  if ((kind === "fase" || kind === "tarefa") && Number(ref)) target = { kind, ref: Number(ref) };

  if (supabaseEnabled) {
    const sb = await createSupabaseServer();
    const { error } = await sb.from("feedback").insert({
      project_id: project.id,
      author_role: "client",
      body,
      target_kind: target.kind,
      target_ref: target.kind === "geral" ? null : target.ref,
    });
    if (error) return { error: "A mensagem não foi enviada. Verifique a ligação e tente de novo." };
  } else {
    await addFeedback(project.id, { author: "client", body, target });
  }

  revalidatePath("/cliente", "layout");
  return { ok: true };
}

/* ───────────── Seletor de projeto ───────────── */

export async function selectProject(form: FormData) {
  const { projects } = await requirePortal();
  const id = String(form.get("projeto") ?? "");
  // Só aceita projetos do próprio cliente (a lista já vem filtrada pela RLS).
  if (projects.some((p) => p.id === id)) {
    (await cookies()).set(PROJECT_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  const back = String(form.get("voltar") ?? "/cliente");
  revalidatePath("/cliente", "layout");
  redirect(back.startsWith("/cliente") ? back : "/cliente");
}
