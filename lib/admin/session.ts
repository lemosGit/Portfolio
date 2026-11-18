import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/supabase/claims";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isAdminUser } from "./role";

/**
 * Sessão do administrador para as páginas de /admin: assinatura do JWT verificada
 * localmente (rápido). As consultas com `sb` continuam sujeitas às regras RLS
 * (public.is_admin()), que o Postgres valida com o mesmo token.
 */
export const requireAdmin = cache(async () => {
  if (!supabaseEnabled) redirect("/cliente/login");
  const sb = await createSupabaseServer();
  const claims = await getSessionClaims(sb);
  if (!claims) redirect("/cliente/login");
  if (!isAdminUser(claims)) redirect("/cliente");

  const name = claims.user_metadata?.name ?? "João Pereira";
  return { sb, userId: claims.sub, name };
});

/**
 * Versão estrita para as ações do admin (criar contas, suspender, redefinir senhas…):
 * pergunta ao servidor de autenticação, por isso uma sessão terminada é recusada logo.
 */
export const requireAdminStrict = cache(async () => {
  if (!supabaseEnabled) redirect("/cliente/login");
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/cliente/login");
  if (!isAdminUser(user)) redirect("/cliente");

  const name = (user.user_metadata?.name as string | undefined) ?? "João Pereira";
  return { sb, userId: user.id, name };
});
