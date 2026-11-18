import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isAdminUser } from "./role";

/**
 * Sessão do administrador. Todas as páginas e ações de /admin passam por aqui.
 * As consultas com `sb` continuam sujeitas às regras RLS (public.is_admin()).
 */
export const requireAdmin = cache(async () => {
  if (!supabaseEnabled) redirect("/cliente/login");
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/cliente/login");
  if (!isAdminUser(user)) redirect("/cliente");

  const name = (user.user_metadata?.name as string | undefined) ?? "João Pereira";
  return { sb, user, name };
});
