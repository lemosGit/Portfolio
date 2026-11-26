/**
 * Capturas do guia do cliente Design (docs/guias/design). Percorre o fluxo real com o Supabase local
 * (como tests/e2e/fluxo/design.fluxo.spec.ts) e guarda cada ecrã em docs/guias/design/capturas.
 * Dados fictícios: a cliente "Ana Silva" e o convite de casamento "Ana & Paulo" (provas em docs/guias/design/provas).
 */
import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { carregarVersao, criarAdmin, criarClienteEProjeto, gerarLinkAcesso, marcarPago, mudarFase, ok, pedirAprovacaoProva } from "../../../tests/e2e/fluxo/dados";

const DIR = "docs/guias/design/capturas";
const PROVAS = "docs/guias/design/provas";
const run = `gd${Date.now().toString(36)}`;

async function foto(alvo: Page | Locator, nome: string) {
  if ("goto" in alvo) {
    await alvo.waitForTimeout(500);
    await alvo.screenshot({ path: `${DIR}/${nome}.png` });
  } else {
    const p = alvo.page();
    const css = await p.addStyleTag({ content: ".fixed.inset-x-0.bottom-0,.sticky.top-0.z-40{display:none!important}" });
    await alvo.scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    await alvo.screenshot({ path: `${DIR}/${nome}.png` });
    await css.evaluate((el) => (el as HTMLElement).remove());
  }
}

test("capturas do guia Design", async ({ browser, baseURL }) => {
  test.setTimeout(400_000);
  const admin = await criarAdmin(run);
  const { projectId } = await criarClienteEProjeto(admin.db, run, "design", "Convite de casamento", "Ana Silva");
  await ok(
    admin.db.from("design_specs").insert({
      project_id: projectId,
      piece_type: "convite_impresso",
      piece_label: "Convite do casamento, com envelope",
      width_cm: 14.8,
      height_cm: 21,
      material: "Papel couché 300 g",
      finish: "Laminação mate",
      quantity: 120,
      has_print: true,
      has_digital_files: false,
      event_date: "2026-12-19",
      key_texts: [
        { label: "Noivos", value: "Ana & Paulo" },
        { label: "Data", value: "Sábado, 19 de dezembro de 2026, às 16h" },
        { label: "Local", value: "Igreja da Sagrada Família, Luanda" },
      ],
    }),
    "ficha técnica",
  );
  expect(await mudarFase(admin.db, projectId, "briefing", "em_curso")).toBeNull();

  const prova = (n: number, notes: string) =>
    carregarVersao(admin.db, projectId, {
      phaseKey: n === 1 ? "conceito" : "revisoes",
      role: "prova",
      seriesKey: "convite",
      title: "Convite",
      versionNo: n,
      fileName: `convite-v${n}-frente.png`,
      mime: "image/png",
      body: readFileSync(`${PROVAS}/convite-v${n}-frente.png`),
      preview: readFileSync(`${PROVAS}/convite-v${n}-frente.preview.webp`),
      notes,
    });

  // 1. Entrar e briefing
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(await gerarLinkAcesso(projectId, admin.userId, baseURL!));
  await foto(page, "01-entrar-link");
  await page.getByRole("button", { name: "Entrar no meu projeto" }).click();
  await page.waitForURL(/\/cliente$/);
  await foto(page, "02-visao-geral-briefing");
  const ficha = page.getByRole("region", { name: "Ficha técnica" });
  await ficha.getByText("Ver detalhes da peça").click();
  await foto(ficha, "03-ficha-tecnica");
  await page.goto("/cliente/entregas");
  await foto(page.getByRole("region", { name: "Enviar referências" }), "04-enviar-referencias");

  // 2. Orçamento: design + impressão
  expect(await mudarFase(admin.db, projectId, "briefing", "concluida")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "orcamento-sinal", "em_curso")).toBeNull();
  await ok(admin.db.from("quotes").insert({ project_id: projectId, version: 1, total_kz: 120000, design_kz: 45000, print_kz: 75000, deposit_pct: 50, deposit_kz: 60000, rounds_included: 2, delivery_due_on: "2026-12-15" }), "orçamento");
  await ok(admin.db.from("quotes").update({ status: "enviado" }).eq("project_id", projectId).eq("version", 1), "enviar");
  await page.goto("/cliente");
  const orc = page.getByRole("article", { name: "Aceitar Orçamento v1" });
  await foto(orc, "05-orcamento");
  await orc.getByRole("button", { name: "Aceitar" }).click();
  await foto(orc, "06-orcamento-confirmar");
  await orc.getByRole("button", { name: "Confirmar aceite" }).click();
  await expect(orc.getByRole("status")).toBeVisible();
  await page.goto("/cliente");
  await foto(page, "07-pagar-sinal");

  // 3. Conceito: V1
  await marcarPago(admin.db, projectId, "sinal");
  expect(await mudarFase(admin.db, projectId, "conceito", "em_curso")).toBeNull();
  const v1 = await prova(1, "Primeira proposta.");
  expect(await mudarFase(admin.db, projectId, "conceito", "concluida")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "revisoes", "em_curso")).toBeNull();
  await pedirAprovacaoProva(admin.db, projectId, v1, "revisoes", "A primeira proposta do convite.");
  await page.goto("/cliente");
  await foto(page, "08-v1-visao-geral");
  const p1 = page.getByRole("region", { name: "A primeira versão está pronta" });
  await foto(p1, "09-v1-decisao");
  await p1.getByRole("button", { name: "Pedir alterações" }).click();
  await p1.getByRole("textbox").fill("Os nomes podem ser maiores?");
  await foto(p1, "10-v1-pedir-alteracoes");
  await p1.getByRole("button", { name: /Enviar/ }).click();
  await expect(p1.getByRole("status")).toBeVisible();

  // 4. Revisões: V2 (última ronda incluída)
  const v2 = await prova(2, "Nomes maiores, como pediu.");
  await pedirAprovacaoProva(admin.db, projectId, v2, "revisoes", "Nomes maiores, como pediu.");
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "11-v2-visao-geral");
  await foto(page.getByRole("region", { name: "Outras versões" }), "12-outras-versoes");
  await page.getByRole("region", { name: "Outras versões" }).getByRole("button", { name: "Comparar com a V2" }).click();
  await foto(page, "13-comparar");
  await page.keyboard.press("Escape");
  const p2 = page.getByRole("region", { name: "A segunda versão está pronta" });
  await p2.getByRole("button", { name: "Pedir alterações" }).click();
  await p2.getByRole("textbox").fill("A data é sábado, não domingo.");
  await foto(p2, "14-v2-ultima-ronda");
  await p2.getByRole("button", { name: /Enviar/ }).click();
  await expect(p2.getByRole("status")).toBeVisible();

  // V3: sem rondas incluídas → revisão extra ou aprovar
  const v3 = await prova(3, "Data corrigida para sábado.");
  await pedirAprovacaoProva(admin.db, projectId, v3, "revisoes", "Data corrigida para sábado.");
  await page.goto("/cliente");
  const p3 = page.getByRole("region", { name: "A terceira versão está pronta" });
  await foto(p3, "15-v3-sem-rondas");
  await p3.getByRole("button", { name: "Pedir revisão extra" }).click();
  await foto(p3, "16-revisao-extra");

  // 5. Aprovar a arte para produção ("Voltar e aprovar" leva à confirmação)
  await p3.getByRole("button", { name: "Voltar e aprovar" }).click();
  const conf = p3.getByRole("group", { name: "Aprovar para produção" });
  await conf.getByText("Confirmo que os nomes, a data e a quantidade estão certos").click();
  await foto(p3, "17-aprovar-arte");
  await conf.getByRole("button", { name: "Aprovar para produção" }).click();
  await expect(p3.getByRole("status")).toBeVisible();

  // 6. Produção: falta o restante → a imprimir → pronto
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "18-pagar-restante");
  await marcarPago(admin.db, projectId, "restante");
  await ok(admin.db.from("design_specs").update({ production_status: "a_imprimir", pickup_at: "2026-12-15T14:00:00Z", pickup_place: "Loja GeniusFrela, Talatona" }).eq("project_id", projectId), "a imprimir");
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "19-em-producao");
  await ok(admin.db.from("design_specs").update({ production_status: "pronto" }).eq("project_id", projectId), "pronto");
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "20-pronto-levantar");

  // Projeto (galeria e fases) e Mensagens
  await page.goto("/cliente/projeto");
  await foto(page, "21-projeto-galeria");
  await page.goto("/cliente/mensagens");
  await page.getByLabel("Sobre").selectOption({ index: 0 });
  await page.getByPlaceholder("Escreva uma mensagem…").fill("Posso levantar no dia 16 em vez de 15?");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await page.waitForTimeout(1500);
  const { data: auth } = await admin.db.auth.getUser();
  await ok(admin.db.from("feedback").insert({ project_id: projectId, author_id: auth.user!.id, author_role: "admin", body: "Pode sim. A loja abre às 9h.", target_kind: "geral" }), "resposta");
  await page.goto("/cliente/mensagens");
  await foto(page, "22-mensagens");

  // 7. Entregue
  await ok(admin.db.rpc("admin_design_delivered", { p_project: projectId }), "entregue");
  await page.goto("/cliente");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "23-entregue");
  await ctx.close();
});
