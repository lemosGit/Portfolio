/**
 * Validação rápida da sessão: verifica a assinatura do JWT (ES256) localmente com as
 * chaves públicas do projeto, sem um pedido ao servidor de autenticação por página.
 * As chaves ficam em memória durante 10 minutos; se aparecer uma chave nova (rotação),
 * o próprio getClaims() vai buscá-la.
 *
 * Limite conhecido: uma sessão terminada noutro sítio continua válida até o JWT expirar
 * (1 hora). Por isso as ações sensíveis do admin usam requireAdminStrict(), que pergunta
 * sempre ao servidor de autenticação.
 */
import type { JwtPayload, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

type Jwks = { keys: { kid?: string; kty: "RSA" | "EC" | "oct"; key_ops: string[]; [k: string]: unknown }[] };

const TTL = 10 * 60 * 1000;
let cache: { jwks: Jwks; at: number } | undefined;
let inflight: Promise<Jwks> | undefined;

async function loadJwks(): Promise<Jwks> {
  if (cache && Date.now() - cache.at < TTL) return cache.jwks;
  inflight ??= fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    .then((r) => (r.ok ? (r.json() as Promise<Jwks>) : { keys: [] }))
    .then((jwks) => {
      if (jwks.keys?.length) cache = { jwks, at: Date.now() };
      return jwks;
    })
    .catch(() => ({ keys: [] }))
    .finally(() => {
      inflight = undefined;
    });
  return inflight;
}

export type SessionClaims = JwtPayload & {
  email?: string;
  app_metadata?: { role?: string; [k: string]: unknown };
  user_metadata?: { name?: string; [k: string]: unknown };
};

/** Claims da sessão atual (renova o token se tiver expirado), ou null se não houver sessão válida. */
export async function getSessionClaims(sb: SupabaseClient): Promise<SessionClaims | null> {
  const jwks = await loadJwks();
  const { data, error } = await sb.auth.getClaims(undefined, jwks as never);
  if (error || !data) return null;
  return data.claims as SessionClaims;
}
