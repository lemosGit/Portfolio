// Spike M3-02: testa o link mágico só com o cliente de teste. Não envia emails.
// Uso: node spike-link-magico.mjs /data/Projects/portfolio
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const root = process.argv[2];
const require = createRequire(root + "/package.json");
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  readFileSync(root + "/.env.local", "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const EMAIL = "cliente.teste@joao-pereira.dev";
const admin = createClient(URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const anon = () => createClient(URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const short = (s) => createHash("sha256").update(s).digest("hex").slice(0, 8);

async function gen() {
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: EMAIL });
  if (error) throw new Error("generateLink: " + error.message);
  const p = data.properties;
  return { hash: p.hashed_token, type: p.verification_type, hasAction: !!p.action_link, userId: data.user.id };
}
async function verify(hash, label) {
  const c = anon();
  const { data, error } = await c.auth.verifyOtp({ token_hash: hash, type: "email" });
  const ok = !error && !!data.session;
  console.log(`${label}: ${ok ? "ENTROU" : "RECUSADO"}${error ? ` (${error.status} ${error.code ?? ""} ${error.message})` : ""}`);
  if (ok) {
    const exp = data.session.expires_in;
    console.log(`   access token expira em ${exp}s; refresh token presente: ${!!data.session.refresh_token}`);
    await c.auth.signOut(); // termina a sessão criada pelo teste
  }
  return ok;
}

const l1 = await gen();
console.log(`link 1 gerado: type=${l1.type}, action_link=${l1.hasAction}, hash#${short(l1.hash)}`);
const l2 = await gen();
console.log(`link 2 gerado: hash#${short(l2.hash)} (diferente do 1: ${l1.hash !== l2.hash})`);

const r1 = await verify(l1.hash, "A) usar o link 1 depois de gerar o 2");
const r2 = await verify(l2.hash, "B) usar o link 2");
const r3 = await verify(l2.hash, "C) usar o link 2 outra vez");

console.log("\nResumo:");
console.log(`  hashed_token + verifyOtp(type=email) funciona: ${r2}`);
console.log(`  link novo invalida o anterior no Auth: ${!r1}`);
console.log(`  uso único: ${r2 && !r3}`);
