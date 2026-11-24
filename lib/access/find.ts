/** Procura de um link mágico pelo token (só no servidor; não é uma Server Action). */
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseEnabled } from "@/lib/supabase/config";
import { digest } from "./digest";
import { looksLikeToken, type LinkStatus } from "./links";

if (typeof window !== "undefined") throw new Error("lib/access/find.ts só pode correr no servidor.");

export type LinkRow = {
  id: string;
  client_id: string;
  project_id: string;
  status: LinkStatus;
  expires_at: string;
  clients: { name: string } | null;
  projects: { name: string } | null;
};

/** Procura o link pelo SHA-256 do token (chave secreta: quem abre o link ainda não tem sessão). */
export async function findLink(token: string | undefined): Promise<LinkRow | undefined> {
  if (!supabaseEnabled || !looksLikeToken(token)) return undefined;
  let admin;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return undefined;
  }
  const { data } = await admin
    .from("access_links")
    .select("id, client_id, project_id, status, expires_at, clients (name), projects (name)")
    .eq("token_digest", digest(token))
    .maybeSingle<LinkRow>();
  return data ?? undefined;
}

