// T9 (seguranca.md §6, M5-13): um objeto real num bucket privado não se lê sem URL assinada. Cria 1 KB, testa e apaga.
// Uso: node --env-file=.env.local scripts/teste-storage-t9.mjs  (escreve em produção: só com autorização, Q-089)
import { createClient } from "@supabase/supabase-js";
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL, PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin = createClient(URL_, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const body = new Blob(["%PDF-1.4\n% teste T9 M5-13\n" + " ".repeat(1000)], { type: "application/pdf" });
const code = async (u, h = {}) => (await fetch(u, { headers: h })).status;
let fail = 0;
for (const b of ["project-files", "client-uploads"]) {
  const path = `zz-t9/${crypto.randomUUID()}.pdf`;
  const { error } = await admin.storage.from(b).upload(path, body, { contentType: "application/pdf" });
  if (error) throw new Error(`${b}: ${error.message}`);
  const signed = (await admin.storage.from(b).createSignedUrl(path, 60)).data.signedUrl;
  const r = {
    controlo_url_assinada: await code(signed),
    publico: await code(`${URL_}/storage/v1/object/public/${b}/${path}`),
    anonimo: await code(`${URL_}/storage/v1/object/${b}/${path}`, { apikey: PUB }),
    anonimo_bearer: await code(`${URL_}/storage/v1/object/authenticated/${b}/${path}`, { apikey: PUB, Authorization: `Bearer ${PUB}` }),
    lista_anonima: (await (await fetch(`${URL_}/storage/v1/object/list/${b}`, { method: "POST", headers: { apikey: PUB, Authorization: `Bearer ${PUB}`, "content-type": "application/json" }, body: JSON.stringify({ prefix: "zz-t9" }) })).json()).length ?? "erro",
  };
  await admin.storage.from(b).remove([path]);
  const left = (await admin.storage.from(b).list("zz-t9")).data.length;
  const ok = r.controlo_url_assinada === 200 && [r.publico, r.anonimo, r.anonimo_bearer].every((s) => s >= 400) && r.lista_anonima === 0 && left === 0;
  if (!ok) fail++;
  console.log(ok ? "✔" : "✘", b, JSON.stringify(r), "restantes:", left);
}
process.exit(fail);
