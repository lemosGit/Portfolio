/**
 * Dados e passos do admin para os testes de fluxo (M9-02, D-172). Os dados são criados no Supabase local
 * a cada execução, com um sufixo único (não colidem entre execuções). Os passos do admin passam pela
 * sessão de um admin de teste (RLS e gatilhos como nas Server Actions); só a criação das contas usa a
 * chave de servidor, como `createClientAccount`.
 */
import { randomBytes, randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { digest } from "../../../lib/access/digest";
import { LINK_TTL_MS, entryUrl, looksLikeToken } from "../../../lib/access/links";
import { localSupabase } from "./supabase-local";

const sb = localSupabase();
const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

export const service = () => createClient(sb.url, sb.secretKey, noSession);

/** Valor de teste gerado aqui (nunca uma senha real), só válido no Supabase local. */
const testPassword = () => `t-${randomBytes(12).toString("hex")}`;

export type Conta = { email: string; password: string; userId: string };

export async function criarAdmin(run: string): Promise<Conta & { db: SupabaseClient }> {
  const email = `admin-${run}@teste.local`;
  const password = testPassword();
  const { data, error } = await service().auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: "admin" } });
  if (error) throw error;
  const db = createClient(sb.url, sb.publishableKey, noSession);
  const { error: se } = await db.auth.signInWithPassword({ email, password });
  if (se) throw se;
  return { email, password, userId: data.user.id, db };
}

/** Cliente + projeto, como `createClientAccount` (conta com o email confirmado, fases criadas pelo gatilho B1). */
export async function criarClienteEProjeto(admin: SupabaseClient, run: string, serviceType: "academic" | "design", nome: string) {
  const email = `cliente-${run}@teste.local`;
  const { data: u, error: ue } = await service().auth.admin.createUser({ email, password: testPassword(), email_confirm: true, user_metadata: { name: "Cliente Fluxo" } });
  if (ue) throw ue;
  const { data: c, error: ce } = await admin.from("clients").insert({ user_id: u.user.id, name: "Cliente Fluxo", email }).select("id").single();
  if (ce) throw ce;
  const { data: p, error: pe } = await admin
    .from("projects")
    .insert({ client_id: c.id, name: nome, slug: `${serviceType}-${run}`, service_type: serviceType, started_on: new Date().toISOString().slice(0, 10), team: [{ initials: "JP", name: "João Pereira" }] })
    .select("id")
    .single();
  if (pe) throw pe;
  return { clientId: c.id as string, projectId: p.id as string, email };
}

/**
 * Link de acesso do cliente, com a mesma lógica de `generateAccessLink` (lib/admin/actions.ts):
 * `generateLink` do tipo magiclink, só o resumo SHA-256 do token na BD, 24 h, os anteriores substituídos.
 * O botão "Gerar link de acesso" do admin não é usado aqui: no Supabase local, a resposta da ação fica
 * por receber no browser (D-172, investigado na #132).
 */
export async function gerarLinkAcesso(projectId: string, adminUserId: string, site: string): Promise<string> {
  const admin = service();
  const p = (await ok(admin.from("projects").select("id, client_id, clients (id, email)").eq("id", projectId).single(), "projeto")) as unknown as { id: string; client_id: string; clients: { id: string; email: string } };
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: p.clients.email });
  if (error || !data?.properties) throw new Error(`generateLink: ${error?.message}`);
  if (data.properties.verification_type !== "magiclink") throw new Error(`link ${data.properties.verification_type}, não magiclink`);
  const token = data.properties.hashed_token;
  if (!looksLikeToken(token)) throw new Error("token inesperado");
  await ok(admin.from("access_links").update({ status: "substituido" }).eq("client_id", p.client_id).eq("status", "ativo"), "substituir links");
  await ok(
    admin.from("access_links").insert({ client_id: p.client_id, project_id: p.id, token_digest: digest(token), channel: "copiar", expires_at: new Date(Date.now() + LINK_TTL_MS).toISOString(), created_by: adminUserId }),
    "registar link",
  );
  return entryUrl(site, token);
}

async function ok<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>, what: string): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

export async function faseId(db: SupabaseClient, projectId: string, key: string): Promise<string> {
  const r = await ok(db.from("project_phases").select("id").eq("project_id", projectId).eq("key", key).single(), `fase ${key}`);
  return (r as { id: string }).id;
}

export async function estadoFase(db: SupabaseClient, projectId: string, key: string): Promise<string> {
  const r = await ok(db.from("project_phases").select("status").eq("project_id", projectId).eq("key", key).single(), `estado ${key}`);
  return (r as { status: string }).status;
}

/** `admin_set_phase_status` (como "Mudar estado"); devolve a mensagem de erro, se houver. */
export async function mudarFase(db: SupabaseClient, projectId: string, key: string, status: string): Promise<string | null> {
  const { error } = await db.rpc("admin_set_phase_status", { p_phase: await faseId(db, projectId, key), p_status: status });
  return error?.message ?? null;
}

/** Como "Marcar como pago" (markPaymentPaid). */
export async function marcarPago(db: SupabaseClient, projectId: string, kind: "sinal" | "restante") {
  const r = await ok(
    db.from("payments").update({ status: "pago", paid_on: new Date().toISOString().slice(0, 10) }).eq("project_id", projectId).eq("kind", kind).eq("status", "pendente").select("id"),
    `pagar ${kind}`,
  );
  if ((r as unknown[]).length !== 1) throw new Error(`pagar ${kind}: nenhum pagamento pendente`);
}

/**
 * Carrega uma versão de um entregável como `prepareUpload` + `finalizeUpload`: o ficheiro vai para o
 * bucket privado e o registo passa pelos gatilhos (RN-14 bloqueia a entrega final sem o restante pago).
 */
export async function carregarVersao(
  db: SupabaseClient,
  projectId: string,
  o: { phaseKey: string; role: "entregavel" | "prova"; seriesKey: string; title: string; versionNo: number; fileName: string; mime: string; body: Buffer },
) {
  const deliverableId = randomUUID();
  const fileId = randomUUID();
  const ext = o.fileName.split(".").pop();
  const path = `${projectId}/${deliverableId}/${fileId}.${ext}`;
  // Como prepareUpload: URL de envio assinado (chave de servidor; os buckets são privados) e o envio direto.
  const st = service().storage.from("project-files");
  const { data: signed, error: ue } = await st.createSignedUploadUrl(path);
  if (ue || !signed) throw new Error(`storage (URL assinado): ${ue?.message}`);
  const { error: se } = await st.uploadToSignedUrl(path, signed.token, o.body, { contentType: o.mime });
  if (se) throw new Error(`storage: ${se.message}`);
  await ok(
    db.from("deliverables").insert({
      id: deliverableId,
      project_id: projectId,
      project_phase_id: await faseId(db, projectId, o.phaseKey),
      role: o.role,
      series_key: o.seriesKey,
      version_no: o.versionNo,
      label: `V${o.versionNo}`,
      title: o.title,
      uploaded_by_role: "admin",
    }),
    "deliverables",
  );
  await ok(
    db.from("files").insert({ id: fileId, deliverable_id: deliverableId, project_id: projectId, bucket: "project-files", storage_path: path, original_name: o.fileName, mime_type: o.mime, size_bytes: o.body.length }),
    "files",
  );
  return deliverableId;
}

/** Como `createApproval` para uma prova: o snapshot leva o título e os ficheiros; a BD junta os textos-chave (RN-42). */
export async function pedirAprovacaoProva(db: SupabaseClient, projectId: string, deliverableId: string, phaseKey: string, message: string) {
  const d = (await ok(db.from("deliverables").select("id, label, title, files (original_name)").eq("id", deliverableId).single(), "versão")) as unknown as {
    id: string; label: string; title: string | null; files: { original_name: string }[];
  };
  await ok(
    db.from("approvals").insert({
      project_id: projectId,
      project_phase_id: await faseId(db, projectId, phaseKey),
      subject: "prova",
      deliverable_id: d.id,
      version_label: d.label,
      snapshot: { title: d.title ?? "Prova", files: d.files.map((x) => x.original_name), message },
    }),
    "pedir aprovação da prova",
  );
}

/** PNG mínimo válido (1×1), para as provas. */
export const png = () =>
  Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c4944415408d763f8cfc0f00000030101001b8bb0b50000000049454e44ae426082", "hex");

/** PDF mínimo válido (o portal confirma a assinatura %PDF). */
export const pdf = (texto: string) => Buffer.from(`%PDF-1.4\n% ${texto}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n`);

export { ok };
