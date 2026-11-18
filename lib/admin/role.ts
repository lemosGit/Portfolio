import type { User } from "@supabase/supabase-js";

/** O papel vem de app_metadata, que só a chave secreta pode alterar (nunca o próprio utilizador). */
export const isAdminUser = (user: Pick<User, "app_metadata"> | null | undefined) =>
  user?.app_metadata?.role === "admin";
