/**
 * Revisão de segurança da v1.1 (M9-05, #78) com o Supabase local (D-172):
 * - link mágico substituído, expirado e reutilizado → recusado (RN-53);
 * - URL assinada do download: 15 min, recusada com o token alterado ou depois de expirar;
 * - IDOR: o cliente A repete os pedidos das Server Actions (descarregar, responder a aprovação) com os
 *   ids do cliente B, e tenta abrir o projeto de B pelo cookie do projeto.
 * Relatório: docs/05-qa/relatorios/seguranca-v1.1.md.
 */
import { expect, test, type BrowserContext, type Page, type Request } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { localSupabase } from "./supabase-local";
import { carregarVersao, criarAdmin, criarClienteEProjeto, gerarLinkAcesso, ok, pdf, service, type Conta } from "./dados";

test.describe.configure({ mode: "serial" });

const run = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
let admin: Conta & { db: SupabaseClient };
type Lado = { projectId: string; fileId: string; approvalId: string };
let A: Lado;
let B: Lado;
let ctxA: BrowserContext;
let pageA: Page;

/** Projeto com um entregável descarregável (não bloqueado) e um índice à espera do cliente. */
async function preparar(sufixo: string, nome: string): Promise<Lado> {
  const { projectId } = await criarClienteEProjeto(admin.db, `${run}${sufixo}`, "academic", nome);
  const d = await carregarVersao(admin.db, projectId, { phaseKey: "pedido-briefing", role: "entregavel", seriesKey: "guia", title: "Guia", versionNo: 1, fileName: `guia-${sufixo}.pdf`, mime: "application/pdf", body: pdf(sufixo) });
  const f = (await ok(admin.db.from("files").select("id").eq("deliverable_id", d).single(), "ficheiro")) as { id: string };
  const a = (await ok(
    admin.db.from("approvals").insert({ project_id: projectId, subject: "indice", version_label: "V1", snapshot: { title: "Índice", items: ["1. Introdução"] } }).select("id").single(),
    "índice",
  )) as { id: string };
  return { projectId, fileId: f.id, approvalId: a.id };
}

/** Repete um pedido de Server Action capturado, com os argumentos trocados, a partir da sessão de A. */
async function repetir(req: Request, args: unknown[]): Promise<string> {
  const headers = Object.fromEntries(Object.entries(await req.allHeaders()).filter(([k]) => !k.startsWith(":") && !["content-length", "cookie"].includes(k)));
  const cookie = (await ctxA.cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
  const res = await fetch(req.url(), { method: "POST", headers: { ...headers, cookie }, body: JSON.stringify(args) });
  return res.text();
}

/** Captura o pedido da próxima Server Action da página e não o deixa seguir (não gasta nada do lado de A). */
async function capturarAcao(page: Page, gatilho: () => Promise<void>): Promise<Request> {
  let pedido: Request | undefined;
  await page.route("**/*", async (route) => {
    const r = route.request();
    if (r.method() === "POST" && r.headers()["next-action"]) {
      pedido = r;
      return route.abort();
    }
    return route.continue();
  });
  await gatilho();
  await expect.poll(() => Boolean(pedido)).toBe(true);
  await page.unroute("**/*");
  return pedido!;
}

test.beforeAll(async () => {
  admin = await criarAdmin(run);
  A = await preparar("a", "Projeto do cliente A");
  B = await preparar("b", "Projeto do cliente B");
});

test.afterAll(async () => {
  await ctxA?.close();
});

test("1. link mágico: substituído, expirado e reutilizado são recusados; o válido entra (RN-53)", async ({ browser, baseURL }) => {
  const recusado = async (link: string) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(link);
    await expect(p.getByRole("heading", { name: "Este link já não é válido" })).toBeVisible();
    await expect(p.getByRole("button", { name: "Entrar no meu projeto" })).toHaveCount(0);
    await ctx.close();
  };
  const antigo = await gerarLinkAcesso(A.projectId, admin.userId, baseURL!);
  const expirado = await gerarLinkAcesso(A.projectId, admin.userId, baseURL!);
  await recusado(antigo); // substituído pelo seguinte

  // Expirado (24 h passadas): recusado antes de chegar ao Auth.
  const digestOf = (await import("../../../lib/access/digest")).digest;
  const token = new URL(expirado).searchParams.get("t")!;
  await ok(service().from("access_links").update({ expires_at: new Date(Date.now() - 60_000).toISOString() }).eq("token_digest", digestOf(token)), "expirar");
  await recusado(expirado);

  // Válido: entra; depois de usado, recusado.
  const valido = await gerarLinkAcesso(A.projectId, admin.userId, baseURL!);
  ctxA = await browser.newContext();
  pageA = await ctxA.newPage();
  await pageA.goto(valido);
  await pageA.getByRole("button", { name: "Entrar no meu projeto" }).click();
  await pageA.waitForURL(/\/cliente$/);
  await recusado(valido);

  // Segunda barreira (ADR-002 §4): mesmo sem a nossa verificação, o Auth recusa o token já gasto.
  const usado = new URL(valido).searchParams.get("t")!;
  const sb = localSupabase();
  const { error } = await createClient(sb.url, sb.publishableKey, { auth: { persistSession: false } }).auth.verifyOtp({ token_hash: usado, type: "email" });
  expect(error?.message ?? "").toMatch(/expired|invalid/i);
});

test("2. URL assinada: 15 minutos; recusada com o token alterado e depois de expirar", async () => {
  await pageA.goto("/cliente/entregas");
  const [download] = await Promise.all([pageA.waitForEvent("download"), pageA.getByRole("button", { name: "Descarregar" }).click()]);
  const url = new URL(download.url());
  const jwt = url.searchParams.get("token")!;
  const claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString()) as { exp: number; iat: number; url: string };
  expect(claims.exp - claims.iat).toBe(15 * 60);
  expect(claims.url).toContain(A.projectId); // só o ficheiro pedido, no projeto de A

  expect((await fetch(url)).status).toBe(200);
  const alterado = new URL(url);
  alterado.searchParams.set("token", jwt.slice(0, -4) + (jwt.endsWith("AAAA") ? "BBBB" : "AAAA"));
  expect((await fetch(alterado)).status).toBeGreaterThanOrEqual(400);
  const semToken = new URL(url);
  semToken.searchParams.delete("token");
  expect((await fetch(semToken)).status).toBeGreaterThanOrEqual(400);

  // Expiração: um URL de 1 s, assinado da mesma forma, deixa de servir.
  const path = claims.url.replace(/^project-files\//, "");
  const { data } = await service().storage.from("project-files").createSignedUrl(path, 1);
  expect((await fetch(data!.signedUrl)).status).toBe(200);
  await new Promise((r) => setTimeout(r, 2500));
  expect((await fetch(data!.signedUrl)).status).toBeGreaterThanOrEqual(400);
});

test("3. IDOR no download: com o id do ficheiro de B, a ação devolve 'não encontrado' e nenhum URL", async () => {
  await pageA.goto("/cliente/entregas");
  const req = await capturarAcao(pageA, () => pageA.getByRole("button", { name: "Descarregar" }).click());
  expect(JSON.parse(req.postData() ?? "[]")).toEqual([A.fileId]);

  const deA = await repetir(req, [A.fileId]);
  expect(deA).toContain("token="); // controlo: o pedido repetido funciona com o ficheiro de A
  const deB = await repetir(req, [B.fileId]);
  expect(deB).toContain("Ficheiro não encontrado.");
  expect(deB).not.toContain("token=");
  expect(deB).not.toContain(B.projectId);
});

test("4. IDOR nas aprovações: responder à aprovação de B falha e B continua pendente", async () => {
  await pageA.goto("/cliente");
  const card = pageA.getByRole("article", { name: "Aprovar Índice V1" });
  await card.getByRole("button", { name: "Aprovar" }).click();
  const req = await capturarAcao(pageA, () => card.getByRole("button", { name: "Confirmar aprovação" }).click());
  expect(JSON.parse(req.postData() ?? "[]")).toEqual([A.approvalId, "aprovar", ""]);

  const deB = await repetir(req, [B.approvalId, "aprovar", ""]);
  // Nem confirma que a aprovação de B existe.
  expect(deB).toContain("Pedido não encontrado.");
  expect(deB).not.toMatch(/"ok":true/);
  const b = (await ok(admin.db.from("approvals").select("status").eq("id", B.approvalId).single(), "aprovação de B")) as { status: string };
  expect(b.status).toBe("pendente");
  const respostas = (await ok(admin.db.from("approval_responses").select("id").eq("approval_id", B.approvalId), "respostas de B")) as unknown[];
  expect(respostas).toHaveLength(0);

  // controlo: a mesma ação com a aprovação de A funciona
  const deA = await repetir(req, [A.approvalId, "aprovar", ""]);
  expect(deA).toMatch(/"ok":true/);
});

test("5. IDOR pelo cookie do projeto: com o id do projeto de B, o portal mostra o projeto de A", async ({ baseURL }) => {
  await ctxA.addCookies([{ name: "jp_portal_project", value: B.projectId, url: baseURL! }]);
  await pageA.goto("/cliente");
  await expect(pageA.getByText("Projeto do cliente A").first()).toBeVisible();
  await expect(pageA.getByText("Projeto do cliente B")).toHaveCount(0);
  await pageA.goto("/cliente/entregas");
  await expect(pageA.getByText("guia-a.pdf")).toBeVisible();
  await expect(pageA.getByText("guia-b.pdf")).toHaveCount(0);
});
