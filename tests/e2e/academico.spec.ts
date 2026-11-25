/** Esqueleto genérico (M5-06) com o projeto Académico de exemplo (fases da BD). */
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([{ name: "jp_portal_session", value: "c_kiala", url: baseURL! }]);
});

test("Visão geral: etiqueta do serviço, barra de fases e próximo passo", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/cliente");
  await expect(page.locator(".app")).toHaveAttribute("data-service", "academic");
  await expect(page.locator("header").getByText("Académico", { exact: true })).toBeVisible();
  await expect(page.getByText("Fase 4 de 7")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Desenvolvimento" })).toBeVisible();
  await expect(page.getByText("Tem um pedido à sua espera: Índice V3.", { exact: false })).toBeVisible();
  await expect(page.getByText("40%")).toBeVisible();
  expect(errors).toEqual([]);
});

test("menu com 4 entradas, sem Agenda (D-092)", async ({ page }) => {
  await page.goto("/cliente");
  const nav = page.getByRole("navigation", { name: "Área do cliente" }).first();
  await expect(nav.getByRole("link", { name: "Projeto" })).toBeAttached();
  await expect(nav.getByRole("link", { name: "Ficheiros" })).toBeAttached();
  await expect(nav.getByRole("link", { name: "Agenda" })).toHaveCount(0);
});

test("/cliente/agenda volta à Visão geral (D-096)", async ({ page }) => {
  await page.goto("/cliente/agenda");
  await expect(page).toHaveURL(/\/cliente$/);
});

test("a página do projeto abre sem erros", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto("/cliente/projeto");
  expect(res?.status()).toBe(200);
  expect(errors).toEqual([]);
});

test("Ficheiros: versões por série, a atual marcada e sem envio fora do briefing/revisão (M5-09)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/cliente/entregas");
  await expect(page.getByRole("heading", { name: "Ficheiros do projeto" })).toBeVisible();
  await expect(page.getByText("Índice proposto")).toBeVisible();
  await expect(page.getByText("atual", { exact: true })).toBeVisible();
  await expect(page.getByText("normas-apa-universidade.pdf")).toBeVisible();
  await expect(page.getByText("Nesta fase não é preciso enviar nada", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Descarregar" }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Aprovações: pendente em destaque, aprovar em dois passos e histórico (M5-10)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/cliente");
  const block = page.getByRole("region", { name: "Aprovações" });
  await expect(block.getByText("1 pedido à sua espera")).toBeVisible();
  const card = block.getByRole("article", { name: "Aprovar Índice V3" });
  await expect(card.getByText("4.3 Taxas de juro praticadas")).toBeVisible();

  // "Aprovar" não aprova logo: pede confirmação no cartão (Q-085, RF-30.33).
  await card.getByRole("button", { name: "Aprovar" }).click();
  await expect(card.getByText("Depois de aprovar não pode voltar atrás", { exact: false })).toBeVisible();
  await card.getByRole("button", { name: "Confirmar aprovação" }).click();
  await expect(card.getByRole("alert")).toContainText("modo de demonstração");
  await card.getByRole("button", { name: "Cancelar" }).click();

  // "Pedir alterações" exige comentário (RN-05).
  await card.getByRole("button", { name: "Pedir alterações" }).click();
  await expect(card.getByRole("button", { name: "Enviar pedido" })).toBeDisabled();
  await card.getByRole("textbox").fill("Trocar a ordem dos capítulos 4 e 5");
  await expect(card.getByRole("button", { name: "Enviar pedido" })).toBeEnabled();

  await block.getByText("Ver histórico").click();
  await expect(block.getByText("Falta o capítulo da metodologia", { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Pagamentos compactos: o que falta e a lista em 'Ver pagamentos' (M5-11, M6-07)", async ({ page }) => {
  await page.goto("/cliente");
  const block = page.getByRole("region", { name: "Pagamentos" });
  await expect(block.getByText("Sinal pago")).toBeVisible();
  await expect(block.getByText("45 000 Kz").first()).toBeVisible();
  await expect(block.getByText("restante, antes da entrega", { exact: false }).first()).toBeVisible();
  await expect(block.getByText("Sinal (50%)")).toBeHidden();
  await block.getByText("Ver pagamentos").click();
  await expect(block.getByText("Sinal (50%)")).toBeVisible();
  await expect(block.getByText("Pendente", { exact: true })).toBeVisible();
  await expect(block.getByText("O pagamento é feito fora do portal", { exact: false })).toBeVisible();
});

test("Ficha do trabalho: fechada na primeira vista, abre em 'Ver detalhes' (M6-01)", async ({ page }) => {
  await page.goto("/cliente");
  const block = page.getByRole("region", { name: "Ficha do trabalho" });
  await expect(block).toBeVisible();
  await expect(block.getByText("Universidade Agostinho Neto")).toBeHidden();
  await block.getByText("Ver detalhes").click();
  await expect(block.getByText("Universidade Agostinho Neto")).toBeVisible();
  await expect(block.getByText("APA", { exact: true })).toBeVisible();
  await expect(block.getByText("7 dias depois da entrega")).toBeVisible();
});

test("Contagem do prazo em destaque: 12 dias até 7 de dezembro (M6-02)", async ({ page }) => {
  await page.goto("/cliente");
  const block = page.getByRole("region", { name: "Prazo de entrega" });
  await expect(block.getByText("12", { exact: true })).toBeVisible();
  await expect(block.getByText("dias", { exact: true })).toBeVisible();
  await expect(block.getByText("7 de dezembro de 2026")).toBeVisible();
  await expect(block.getByText("Prazo próximo")).toHaveCount(0);
  // a contagem vem antes do próximo passo (D-107)
  const order = await page.evaluate(() => {
    const a = document.querySelector("#prazo-title")!.getBoundingClientRect().top;
    const b = document.querySelector("#proximo-title")!.getBoundingClientRect().top;
    return a < b;
  });
  expect(order).toBe(true);
});

test("Capítulos: '2 de 5' no próximo passo e a lista na página Projeto, só o título (M6-03, M6-07)", async ({ page }) => {
  await page.goto("/cliente");
  await expect(page.getByText("2 de 5 capítulos")).toBeVisible();
  await page.goto("/cliente/projeto");
  const list = page.getByRole("list", { name: "Capítulos" });
  await expect(list.getByText("3. Metodologia")).toBeVisible();
  await expect(list.getByText("A escrever")).toBeVisible();
  await expect(list.getByText("Pronto", { exact: true })).toHaveCount(2);
});

test("Histórico: o orçamento v1 aparece como aceite (M6-04)", async ({ page }) => {
  await page.goto("/cliente");
  const block = page.getByRole("region", { name: "Aprovações" });
  await block.getByText("Ver histórico").click();
  await expect(block.getByText("Orçamento v1")).toBeVisible();
  await expect(block.getByText("· Aceite")).toBeVisible();
  await expect(block.getByText("Você: aceitou")).toBeVisible();
});

test("Projeto (TEL-11): fases na vertical, sem os separadores do Tech (M6-07)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/cliente/projeto");
  await expect(page.getByRole("heading", { name: "O seu trabalho" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tarefas" })).toHaveCount(0);
  await expect(page.getByText("Em curso", { exact: true })).toBeVisible();
  await expect(page.getByText("7 dias", { exact: true })).toBeVisible(); // fase Ajustes
  expect(errors).toEqual([]);
});

test("360 px sem scroll horizontal (RNF-201, M6-07)", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ["/cliente", "/cliente/projeto", "/cliente/entregas", "/cliente/mensagens"]) {
    await page.goto(path);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, path).toBe(0);
  }
});
