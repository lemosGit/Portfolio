/**
 * Fluxo Académico de ponta a ponta com o Supabase local (M9-02, #75, D-172):
 * link mágico → aceite do orçamento → índice → entrega final (bloqueada até ao restante) → ajuste.
 * O cliente faz tudo no browser; o admin faz os seus passos pela sua sessão (as mesmas tabelas, RPC e
 * regras da BD que as Server Actions) e o link é gerado com a lógica de `generateAccessLink` (ver dados.ts).
 * Plano de testes: CT-002, CT-003, CT-009, CT-011, CT-012, CT-017, CT-024, CT-026, CT-027.
 */
import { expect, test, type Page } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { carregarVersao, criarAdmin, criarClienteEProjeto, estadoFase, faseId, gerarLinkAcesso, marcarPago, mudarFase, ok, pdf, type Conta } from "./dados";

test.describe.configure({ mode: "serial" });

const run = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
let admin: Conta & { db: SupabaseClient };
let projectId: string;
let cliente: Page;

test.beforeAll(async () => {
  admin = await criarAdmin(run);
  ({ projectId } = await criarClienteEProjeto(admin.db, run, "academic", "Monografia de fluxo"));
  await ok(
    admin.db.from("academic_briefs").insert({ project_id: projectId, topic: "Microcrédito em Luanda", work_type: "universitario", education_level: "licenciatura", institution: "Universidade de teste", citation_style: "APA", pages_target: 40, adjust_days: 7 }),
    "ficha",
  );
  expect(await mudarFase(admin.db, projectId, "pedido-briefing", "em_curso")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "pedido-briefing", "concluida")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "orcamento-aceite", "em_curso")).toBeNull();
  // Orçamento enviado (createQuote + sendQuote): 60 000 Kz, sinal 50%, entrega daqui a 30 dias.
  const due = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  await ok(admin.db.from("quotes").insert({ project_id: projectId, version: 1, total_kz: 60000, deposit_pct: 50, deposit_kz: 30000, delivery_due_on: due }), "orçamento");
  await ok(admin.db.from("quotes").update({ status: "enviado" }).eq("project_id", projectId).eq("version", 1), "enviar orçamento");
});

test.afterAll(async () => {
  await cliente?.context().close();
});

test("1. link mágico: o cliente entra no projeto sem senha; o link não volta a servir (CT-002, CT-003)", async ({ browser, baseURL }) => {
  const link = await gerarLinkAcesso(projectId, admin.userId, baseURL!);
  expect(link).toMatch(/^http:\/\/127\.0\.0\.1:3200\/cliente\/entrar\?t=[0-9a-f]{56}$/);

  const ctx = await browser.newContext();
  cliente = await ctx.newPage();
  await cliente.goto(link);
  await expect(cliente.getByText("Vai entrar no projeto Monografia de fluxo", { exact: false })).toBeVisible();
  await cliente.getByRole("button", { name: "Entrar no meu projeto" }).click();
  await cliente.waitForURL(/\/cliente$/);
  await expect(cliente.locator(".app")).toHaveAttribute("data-service", "academic");

  // Uso único (RN-53): noutro browser, o mesmo link já não entra.
  const outro = await browser.newContext();
  const p2 = await outro.newPage();
  await p2.goto(link);
  await expect(p2.getByRole("button", { name: "Entrar no meu projeto" })).toHaveCount(0);
  await expect(p2.getByText("já não é válido", { exact: false })).toBeVisible();
  await outro.close();
});

test("2. aceite do orçamento: regra do sinal, aceite em dois passos, sinal e restante criados (CT-012, CT-011)", async () => {
  await cliente.goto("/cliente");
  const card = cliente.getByRole("article", { name: "Aceitar Orçamento v1" });
  await expect(card.getByText("O sinal não é devolvido", { exact: false })).toBeVisible();
  await card.getByRole("button", { name: "Aceitar" }).click();
  await card.getByRole("button", { name: "Confirmar aceite" }).click();
  await expect(card.getByRole("status")).toBeVisible();

  const pays = (await ok(admin.db.from("payments").select("kind, amount_kz, status").eq("project_id", projectId).order("kind"), "pagamentos")) as { kind: string; amount_kz: number | string; status: string }[];
  expect(pays.map((p) => [p.kind, Number(p.amount_kz), p.status])).toEqual([
    ["restante", 30000, "pendente"],
    ["sinal", 30000, "pendente"],
  ]);
  // RN-11: com o sinal por pagar, a Estrutura não começa; o cliente vê "Pagar o sinal".
  expect(await mudarFase(admin.db, projectId, "estrutura", "em_curso")).toMatch(/Falta o pagamento "Sinal \(50%\)" \(30 000 Kz\)/);
  await cliente.reload();
  await expect(cliente.getByText("Pagar o sinal (50%): 30 000 Kz", { exact: false })).toBeVisible();
});

test("3. índice: o admin pede a aprovação dos capítulos; o cliente aprova e a Estrutura fecha (CT-024)", async () => {
  await marcarPago(admin.db, projectId, "sinal");
  expect(await mudarFase(admin.db, projectId, "estrutura", "em_curso")).toBeNull();
  const titles = ["1. Introdução", "2. Revisão da literatura", "3. Metodologia", "4. Conclusões"];
  await ok(admin.db.from("academic_sections").insert(titles.map((title, i) => ({ project_id: projectId, position: i + 1, title }))), "capítulos");
  // requestIndexApproval: o índice gerado dos capítulos, ligado à fase Estrutura.
  await ok(
    admin.db.from("approvals").insert({ project_id: projectId, project_phase_id: await faseId(admin.db, projectId, "estrutura"), subject: "indice", version_label: "V1", snapshot: { title: "Índice", items: titles } }),
    "pedir índice",
  );

  await cliente.goto("/cliente");
  const card = cliente.getByRole("article", { name: "Aprovar Índice V1" });
  for (const t of titles) await expect(card.getByText(t)).toBeVisible();
  await card.getByRole("button", { name: "Aprovar" }).click();
  await card.getByRole("button", { name: "Confirmar aprovação" }).click();
  await expect(card.getByRole("status")).toBeVisible();
  await expect.poll(() => estadoFase(admin.db, projectId, "estrutura")).toBe("concluida");
});

test("4. entrega final: bloqueada até ao restante (RN-14); paga, descarrega-se e abrem os ajustes (CT-026, CT-017, CT-009)", async () => {
  for (const [k, s] of [["desenvolvimento", "em_curso"], ["desenvolvimento", "concluida"], ["revisao-formatacao", "em_curso"], ["revisao-formatacao", "concluida"], ["entrega-final", "em_curso"]] as const) {
    expect(await mudarFase(admin.db, projectId, k, s), `${k} → ${s}`).toBeNull();
  }
  await carregarVersao(admin.db, projectId, { phaseKey: "entrega-final", role: "entregavel", seriesKey: "entrega-final", title: "Entrega final", versionNo: 1, fileName: "monografia-final.pdf", mime: "application/pdf", body: pdf("V1") });

  // O cliente vê a entrega, bloqueada, sem botão de descarregar.
  await cliente.goto("/cliente/entregas");
  await expect(cliente.getByText("disponível depois do pagamento")).toBeVisible();
  await expect(cliente.getByRole("img", { name: "Bloqueado" })).toBeVisible();
  await expect(cliente.getByRole("button", { name: "Descarregar" })).toHaveCount(0);

  // "Disponibilizar a entrega" é recusado sem o restante pago.
  const { error: e1 } = await admin.db.rpc("admin_deliver_final", { p_project: projectId });
  expect(e1?.message ?? "").toMatch(/restante/i);
  await marcarPago(admin.db, projectId, "restante");
  const { error: e2 } = await admin.db.rpc("admin_deliver_final", { p_project: projectId });
  expect(e2).toBeNull();

  // Desbloqueada: descarrega-se por um link temporário.
  await cliente.goto("/cliente/entregas");
  await expect(cliente.getByText("disponível depois do pagamento")).toHaveCount(0);
  const [download] = await Promise.all([cliente.waitForEvent("download"), cliente.getByRole("button", { name: "Descarregar" }).click()]);
  expect(download.suggestedFilename()).toBe("monografia-final.pdf");
});

test("5. ajuste: o cliente pede dentro do prazo; o admin resolve com a V2, que fica a atual (CT-027)", async () => {
  await cliente.goto("/cliente");
  // O bloco dos ajustes (há outra região "Ajustes": o próximo passo). Dentro do prazo, tem o formulário.
  const ajustes = cliente.getByRole("region", { name: "Ajustes" }).filter({ has: cliente.getByLabel("O que quer ajustar?") });
  await ajustes.getByLabel("O que quer ajustar?").fill("A bibliografia não segue a APA na página 12.");
  await ajustes.getByRole("button", { name: "Pedir ajuste" }).click();
  await expect(ajustes.getByRole("status")).toBeVisible();

  const reqs = (await ok(admin.db.from("adjustment_requests").select("id, status, description").eq("project_id", projectId), "pedidos")) as { id: string; status: string; description: string }[];
  expect(reqs).toHaveLength(1);
  expect(reqs[0]).toMatchObject({ status: "aberto", description: "A bibliografia não segue a APA na página 12." });

  // closeAdjustment: resolver com a versão nova da entrega (a V1 fica).
  const v2 = await carregarVersao(admin.db, projectId, { phaseKey: "ajustes", role: "entregavel", seriesKey: "entrega-final", title: "Entrega final", versionNo: 2, fileName: "monografia-final-v2.pdf", mime: "application/pdf", body: pdf("V2") });
  await ok(admin.db.from("adjustment_requests").update({ status: "resolvido", resolved_by_deliverable_id: v2, admin_note: "Corrigido." }).eq("id", reqs[0].id), "resolver");

  await cliente.goto("/cliente/entregas");
  await expect(cliente.getByText("V2", { exact: true })).toBeVisible();
  await expect(cliente.getByText("V1", { exact: true })).toBeVisible();
  await expect(cliente.getByText("monografia-final-v2.pdf")).toBeVisible();
  // No bloco dos ajustes, o pedido aparece resolvido com a V2.
  await cliente.goto("/cliente");
  await expect(cliente.getByText("resolvido em Entrega final V2 · Corrigido.", { exact: false })).toBeVisible();
});
