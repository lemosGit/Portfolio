/**
 * Supabase local para os testes de fluxo (M9-02, D-172): lê o URL e as chaves de `supabase status`
 * (as chaves do stack local são públicas e fixas; nunca as de produção).
 */
import { execSync } from "node:child_process";

export type LocalSupabase = { url: string; publishableKey: string; secretKey: string };

let cached: LocalSupabase | undefined;

export function localSupabase(): LocalSupabase {
  if (cached) return cached;
  let raw: string;
  try {
    raw = execSync("npx supabase status -o json", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    throw new Error("O Supabase local não está a correr. Arranque-o com `npx supabase start` (Docker).");
  }
  const s = JSON.parse(raw.slice(raw.indexOf("{"))) as Record<string, string>;
  const url = s.API_URL;
  const publishableKey = s.PUBLISHABLE_KEY ?? s.ANON_KEY;
  const secretKey = s.SECRET_KEY ?? s.SERVICE_ROLE_KEY;
  if (!url || !publishableKey || !secretKey) throw new Error(`\`supabase status\` sem URL ou chaves: ${Object.keys(s).join(", ")}`);
  // Nunca correr contra a produção por engano.
  if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(url)) throw new Error(`Recusado: ${url} não é um Supabase local.`);
  cached = { url, publishableKey, secretKey };
  return cached;
}
