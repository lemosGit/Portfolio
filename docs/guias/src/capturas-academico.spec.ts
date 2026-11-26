/**
 * Capturas do guia do cliente Académico (docs/guias/academico). Percorre o fluxo real com o Supabase local
 * (como tests/e2e/fluxo/academico.fluxo.spec.ts) e guarda cada ecrã em docs/guias/academico/capturas.
 * Dados fictícios: a cliente "Ana Silva" e a "Monografia sobre microcrédito".
 */
import { expect, test, type Locator, type Page } from "@playwright/test";
import { carregarVersao, criarAdmin, criarClienteEProjeto, faseId, gerarLinkAcesso, marcarPago, mudarFase, ok, pdf } from "../../../tests/e2e/fluxo/dados";

const DIR = "docs/guias/academico/capturas";
const run = `g${Date.now().toString(36)}`;

/** Captura de um elemento (ou da página visível), com uma margem à volta. */
async function foto(alvo: Page | Locator, nome: string) {
  if ("goto" in alvo) {
    await alvo.waitForTimeout(400);
    await alvo.screenshot({ path: `${DIR}/${nome}.png` });
  } else {
    // Num elemento, a barra de navegação fixa do telemóvel não deve tapar o conteúdo.
    const p = alvo.page();
    const css = await p.addStyleTag({ content: ".fixed.inset-x-0.bottom-0{display:none!important}" });
    await alvo.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await alvo.screenshot({ path: `${DIR}/${nome}.png` });
    await css.evaluate((el) => (el as HTMLElement).remove());
  }
}

test("capturas do guia Académico", async ({ browser, baseURL }) => {
  test.setTimeout(300_000);
  const admin = await criarAdmin(run);
  const { projectId } = await criarClienteEProjeto(admin.db, run, "academic", "Monografia sobre microcrédito", "Ana Silva");
  await ok(
    admin.db.from("academic_briefs").insert({ project_id: projectId, topic: "O microcrédito e as pequenas empresas em Luanda", work_type: "universitario", education_level: "licenciatura", institution: "Universidade Agostinho Neto", discipline: "Economia", citation_style: "APA", pages_target: 45, adjust_days: 7 }),
    "ficha",
  );
  expect(await mudarFase(admin.db, projectId, "pedido-briefing", "em_curso")).toBeNull();

  // 1. Entrar pelo link
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(await gerarLinkAcesso(projectId, admin.userId, baseURL!));
  await foto(page, "01-entrar-link");
  await page.getByRole("button", { name: "Entrar no meu projeto" }).click();
  await page.waitForURL(/\/cliente$/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "02-visao-geral-briefing");

  // Enviar referências no briefing
  await page.goto("/cliente/entregas");
  await foto(page.getByRole("region", { name: "Enviar referências" }), "03-enviar-referencias");

  // Ficha do trabalho
  await page.goto("/cliente");
  const ficha = page.getByText("Ver detalhes do trabalho");
  await ficha.click();
  await foto(page.locator("section").filter({ has: ficha }).last(), "04-ficha-trabalho");

  // 2. Orçamento
  expect(await mudarFase(admin.db, projectId, "pedido-briefing", "concluida")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "orcamento-aceite", "em_curso")).toBeNull();
  const due = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  await ok(admin.db.from("quotes").insert({ project_id: projectId, version: 1, total_kz: 90000, deposit_pct: 50, deposit_kz: 45000, delivery_due_on: due }), "orçamento");
  await ok(admin.db.from("quotes").update({ status: "enviado" }).eq("project_id", projectId).eq("version", 1), "enviar");
  await page.goto("/cliente");
  const orc = page.getByRole("article", { name: "Aceitar Orçamento v1" });
  await foto(orc, "05-orcamento");
  await orc.getByRole("button", { name: "Aceitar" }).click();
  await foto(orc, "06-orcamento-confirmar");
  await orc.getByRole("button", { name: "Confirmar aceite" }).click();
  await expect(orc.getByRole("status")).toBeVisible();

  // Sinal por pagar
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "07-pagar-sinal");
  const pag = page.getByRole("region", { name: "Pagamentos" });
  await pag.getByText("Ver pagamentos").click();
  await foto(pag, "08-pagamentos");

  // 3. Índice
  await marcarPago(admin.db, projectId, "sinal");
  expect(await mudarFase(admin.db, projectId, "estrutura", "em_curso")).toBeNull();
  const caps = ["1. Introdução", "2. Revisão da literatura", "3. Metodologia", "4. Resultados", "5. Conclusões"];
  await ok(admin.db.from("academic_sections").insert(caps.map((title, i) => ({ project_id: projectId, position: i + 1, title }))), "capítulos");
  await ok(admin.db.from("approvals").insert({ project_id: projectId, project_phase_id: await faseId(admin.db, projectId, "estrutura"), subject: "indice", version_label: "V1", snapshot: { title: "Índice", items: caps, message: "Proposta de índice com 5 capítulos." } }), "índice");
  await page.goto("/cliente");
  const ind = page.getByRole("article", { name: "Aprovar Índice V1" });
  await foto(ind, "09-indice");
  await ind.getByRole("button", { name: "Pedir alterações" }).click();
  await ind.getByRole("textbox").fill("Podemos juntar um capítulo sobre o enquadramento legal?");
  await foto(ind, "10-indice-pedir-alteracoes");
  await ind.getByRole("button", { name: "Cancelar" }).click();
  await ind.getByRole("button", { name: "Aprovar" }).click();
  await foto(ind, "11-indice-confirmar");
  await ind.getByRole("button", { name: "Confirmar aprovação" }).click();
  await expect(ind.getByRole("status")).toBeVisible();

  // 4. Desenvolvimento: capítulos
  expect(await mudarFase(admin.db, projectId, "desenvolvimento", "em_curso")).toBeNull();
  await ok(admin.db.from("academic_sections").update({ status: "concluido" }).eq("project_id", projectId).lte("position", 2), "capítulos feitos");
  await ok(admin.db.from("academic_sections").update({ status: "em_curso" }).eq("project_id", projectId).eq("position", 3), "capítulo em curso");
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "12-desenvolvimento");
  await page.goto("/cliente/projeto");
  await foto(page, "13-projeto-fases");

  // Mensagens: a Ana escreve sobre a fase em curso; o João responde.
  await page.goto("/cliente/mensagens");
  await page.getByLabel("Sobre").selectOption({ label: "Etapa — Desenvolvimento" });
  await page.getByPlaceholder("Escreva uma mensagem…").fill("Posso enviar mais dois artigos para a revisão da literatura?");
  await page.getByRole("button", { name: /Enviar/ }).click();
  await page.waitForTimeout(1500);
  const { data: auth } = await admin.db.auth.getUser();
  await ok(admin.db.from("feedback").insert({ project_id: projectId, author_id: auth.user!.id, author_role: "admin", body: "Claro! Envie em Ficheiros ou aqui. Junto-os ao capítulo 2.", target_kind: "fase", target_ref: 4 }), "resposta do João");
  await page.goto("/cliente/mensagens");
  await foto(page, "14-mensagens");

  // 6. Entrega final bloqueada até ao restante
  for (const [k, s] of [["desenvolvimento", "concluida"], ["revisao-formatacao", "em_curso"], ["revisao-formatacao", "concluida"], ["entrega-final", "em_curso"]] as const) {
    expect(await mudarFase(admin.db, projectId, k, s)).toBeNull();
  }
  await carregarVersao(admin.db, projectId, { phaseKey: "entrega-final", role: "entregavel", seriesKey: "entrega-final", title: "Entrega final", versionNo: 1, fileName: "monografia-final.pdf", mime: "application/pdf", body: pdf("V1") });
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "15-pagar-restante");
  await page.goto("/cliente/entregas");
  await foto(page.getByRole("region", { name: "Ficheiros do projeto" }), "16-entrega-bloqueada");

  await marcarPago(admin.db, projectId, "restante");
  await ok(admin.db.rpc("admin_deliver_final", { p_project: projectId }), "entregar");
  await page.goto("/cliente/entregas");
  await foto(page.getByRole("region", { name: "Ficheiros do projeto" }), "17-entrega-disponivel");

  // 7. Ajustes
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "18-visao-geral-ajustes");
  const aj = page.getByRole("region", { name: "Ajustes" }).filter({ has: page.getByLabel("O que quer ajustar?") });
  await aj.getByLabel("O que quer ajustar?").fill("A bibliografia não segue a APA na página 12.");
  await foto(aj, "19-pedir-ajuste");
  await aj.getByRole("button", { name: "Pedir ajuste" }).click();
  await expect(aj.getByRole("status")).toBeVisible();
  await foto(aj, "20-ajuste-enviado");

  await ctx.close();

  // Entrar com email e senha
  const p2 = await browser.newPage();
  await p2.goto("/cliente/login");
  await foto(p2, "21-login");
  await p2.close();
});
