/**
 * Cliente Supabase com a chave secreta (ignora as regras RLS).
 * Só para operações de contas (criar, redefinir senha, suspender, apagar), e
 * sempre depois de requireAdmin(). Nunca importar a partir de um componente "use client".
 */
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

if (typeof window !== "undefined") throw new Error("lib/supabase/admin.ts só pode correr no servidor.");

export const accountsEnabled = Boolean(SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

export function createSupabaseAdmin() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !key) {
    throw new Error("Falta SUPABASE_SECRET_KEY nas variáveis de ambiente do servidor.");
  }
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
