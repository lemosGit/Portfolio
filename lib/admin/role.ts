/** O papel vem de app_metadata, que só a chave secreta pode alterar (nunca o próprio utilizador). */
export const isAdminUser = (user: { app_metadata?: Record<string, unknown> } | null | undefined) =>
  user?.app_metadata?.role === "admin";
