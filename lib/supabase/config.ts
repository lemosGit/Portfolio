/**
 * Configuração do Supabase. Sem estas variáveis o portal funciona em modo de
 * demonstração (dados de exemplo em lib/portal/mock-data.ts).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Aceita a chave nova ("publishable", sb_publishable_…) ou a antiga ("anon").
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);
