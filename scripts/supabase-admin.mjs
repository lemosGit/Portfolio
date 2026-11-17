#!/usr/bin/env node
/**
 * Gestão do Portal do Cliente pelo terminal (até existir o painel /admin).
 * Usa a chave secreta do Supabase — nunca a coloque no browser nem no Git.
 *
 *   npm run portal -- ajuda
 */
import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const HELP = `
Uso: npm run portal -- <comando> [opções]

  cliente     Cria o acesso de um cliente e o seu projeto
              --nome "Alex Martins" --email alex@empresa.ao --projeto "Nova App Mobile"
              [--empresa "Nova Mobilidade"] [--slug nova-app] [--repo dono/repositorio]
              [--inicio 2026-11-01] [--entrega 2026-12-20] [--descricao "..."] [--resumo "..."]

  admin       Dá permissões de administrador a um utilizador existente
              --email joao@exemplo.com

  demo        Regista um link de demonstração (Vercel ou build do EAS)
              --projeto nova-app --tipo web|android|ios --url https://... --versao 0.9.0 [--notas "..."]

  reuniao     Marca uma reunião (horas em Luanda, UTC+1)
              --projeto nova-app --titulo "Revisão do Sprint 04" --inicio "2026-11-25 14:30"
              --fim "2026-11-25 15:15" --link https://meet.google.com/... [--pauta "Tema 1; Tema 2"]

  responder   Responde no canal de mensagens como João (precisa de ADMIN_EMAIL no .env.local)
              --projeto nova-app --mensagem "Já está corrigido na versão 0.9.1."

  mensagens   Lista as últimas mensagens de um projeto
              --projeto nova-app
`;

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

const [command, ...rest] = process.argv.slice(2);
if (!command || command === "ajuda" || command === "--help") {
  console.log(HELP);
  process.exit(0);
}
if (!URL || !SECRET) {
  fail("Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.local (ver .env.example).");
}

const sb = createClient(URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });

const { values: o } = parseArgs({
  args: rest,
  strict: true,
  options: Object.fromEntries(
    ["nome", "email", "empresa", "projeto", "slug", "repo", "inicio", "entrega", "descricao", "resumo",
     "tipo", "url", "versao", "notas", "titulo", "fim", "link", "pauta", "mensagem"].map((k) => [k, { type: "string" }]),
  ),
});

const need = (...keys) => {
  const missing = keys.filter((k) => !o[k]);
  if (missing.length) fail(`Falta: ${missing.map((k) => `--${k}`).join(", ")}. Veja: npm run portal -- ajuda`);
};

const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** "2026-11-25 14:30" em hora de Luanda (UTC+1) → ISO */
const luanda = (s) => {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})$/.exec(s ?? "");
  if (!m) fail(`Data inválida "${s}". Use o formato "AAAA-MM-DD HH:MM".`);
  return new Date(`${m[1]}T${m[2]}:00+01:00`).toISOString();
};

async function projectBySlug(slug) {
  const { data, error } = await sb.from("projects").select("id, name").eq("slug", slug).maybeSingle();
  if (error) fail(error.message);
  if (!data) fail(`Não existe nenhum projeto com o slug "${slug}".`);
  return data;
}

async function findUserByEmail(email) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail(error.message);
    const u = data.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
    if (u) return u;
    if (data.users.length < 200) return undefined;
  }
}

const commands = {
  async cliente() {
    need("nome", "email", "projeto");
    // Senha temporária legível (sem 0/O, 1/l): o cliente troca-a no primeiro acesso.
    const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const password = Array.from(randomBytes(14), (b) => alphabet[b % alphabet.length]).join("");

    const { data: created, error: ue } = await sb.auth.admin.createUser({
      email: o.email,
      password,
      email_confirm: true,
      user_metadata: { name: o.nome },
    });
    if (ue) fail(`Não foi possível criar o utilizador: ${ue.message}`);
    const userId = created.user.id;

    const { data: client, error: ce } = await sb
      .from("clients")
      .insert({ user_id: userId, name: o.nome, company: o.empresa ?? null, email: o.email })
      .select("id")
      .single();
    if (ce) {
      await sb.auth.admin.deleteUser(userId);
      fail(`Não foi possível criar o cliente: ${ce.message}`);
    }

    const [owner, repo] = (o.repo ?? "").split("/");
    const slug = o.slug ?? slugify(o.projeto);
    const { error: pe } = await sb.from("projects").insert({
      slug,
      client_id: client.id,
      name: o.projeto,
      tagline: o.resumo ?? null,
      description: o.descricao ?? null,
      github_owner: owner || null,
      github_repo: repo || null,
      started_on: o.inicio ?? new Date().toISOString().slice(0, 10),
      due_on: o.entrega ?? null,
      team: [{ initials: "JP", name: "João Pereira" }],
    });
    if (pe) {
      await sb.auth.admin.deleteUser(userId); // apaga também o cliente (on delete cascade)
      fail(`Não foi possível criar o projeto: ${pe.message}`);
    }

    console.log(`
✔ Cliente criado. Envie estes dados ao cliente por um canal privado:

  Endereço:        <o seu domínio>/cliente/login
  Email:           ${o.email}
  Senha temporária: ${password}

  No primeiro acesso o portal pede-lhe para definir uma senha nova.
  Projeto: ${o.projeto} (slug: ${slug})
`);
  },

  async admin() {
    need("email");
    const user = await findUserByEmail(o.email);
    if (!user) fail(`Não existe utilizador com o email ${o.email}. Crie-o primeiro em Authentication → Users.`);
    const { error } = await sb.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, role: "admin" },
    });
    if (error) fail(error.message);
    console.log(`✔ ${o.email} é agora administrador. Termine e volte a iniciar sessão para aplicar.`);
  },

  async demo() {
    need("projeto", "tipo", "url", "versao");
    if (!["web", "android", "ios"].includes(o.tipo)) fail("--tipo tem de ser web, android ou ios.");
    const p = await projectBySlug(o.projeto);
    const { error } = await sb
      .from("demo_links")
      .insert({ project_id: p.id, kind: o.tipo, url: o.url, version: o.versao, notes: o.notas ?? "" });
    if (error) fail(error.message);
    console.log(`✔ Demo ${o.tipo} v${o.versao} registada em "${p.name}".`);
  },

  async reuniao() {
    need("projeto", "titulo", "inicio", "fim", "link");
    const p = await projectBySlug(o.projeto);
    const agenda = (o.pauta ?? "").split(";").map((s) => s.trim()).filter(Boolean);
    const { error } = await sb.from("meetings").insert({
      project_id: p.id,
      title: o.titulo,
      starts_at: luanda(o.inicio),
      ends_at: luanda(o.fim),
      call_url: o.link,
      agenda,
    });
    if (error) fail(error.message);
    console.log(`✔ Reunião "${o.titulo}" marcada em "${p.name}".`);
  },

  async responder() {
    need("projeto", "mensagem");
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) fail("Defina ADMIN_EMAIL no .env.local (o seu email de administrador).");
    const admin = await findUserByEmail(adminEmail);
    if (!admin) fail(`Não existe utilizador com o email ${adminEmail}.`);
    const p = await projectBySlug(o.projeto);
    const { error } = await sb
      .from("feedback")
      .insert({ project_id: p.id, author_id: admin.id, author_role: "admin", body: o.mensagem });
    if (error) fail(error.message);
    console.log(`✔ Resposta enviada para "${p.name}".`);
  },

  async mensagens() {
    need("projeto");
    const p = await projectBySlug(o.projeto);
    const { data, error } = await sb
      .from("feedback")
      .select("author_role, body, target_kind, target_ref, created_at")
      .eq("project_id", p.id)
      .order("created_at", { ascending: false })
      .limit(15);
    if (error) fail(error.message);
    console.log(`\nÚltimas mensagens — ${p.name}\n`);
    for (const m of data.reverse()) {
      const who = m.author_role === "admin" ? "João  " : "Cliente";
      const when = new Date(m.created_at).toLocaleString("pt-PT", { timeZone: "Africa/Luanda" });
      const about = m.target_kind === "geral" ? "geral" : `${m.target_kind} ${m.target_ref}`;
      console.log(`[${when}] ${who} (${about}): ${m.body}`);
    }
    console.log();
  },
};

if (!commands[command]) fail(`Comando desconhecido "${command}". Veja: npm run portal -- ajuda`);
await commands[command]();
