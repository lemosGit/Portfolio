/** M5-14: o modo de demonstração mostra os 3 layouts sem Supabase, entrando pelo formulário de login. */
import { expect, test } from "@playwright/test";

const ACCOUNTS = [
  { email: "alex@novaapp.ao", service: "development", label: "Tech" },
  { email: "kiala@exemplo.ao", service: "academic", label: "Académico" },
  { email: "teresa@exemplo.ao", service: "design", label: "Design" },
] as const;

for (const a of ACCOUNTS) {
  test(`login de demonstração → layout ${a.label}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/cliente/login");
    await expect(page.getByText(a.email)).toBeVisible(); // a conta aparece na lista do login
    await page.getByLabel("O seu email").fill(a.email);
    await page.getByLabel("Senha", { exact: true }).fill("jpstudio");
    await page.getByRole("button", { name: "Entrar no meu espaço" }).click();
    await expect(page).toHaveURL(/\/cliente$/);
    await expect(page.locator(".app")).toHaveAttribute("data-service", a.service);
    await expect(page.locator("header").getByText(a.label, { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test.describe("Design (M5-14)", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([{ name: "jp_portal_session", value: "c_teresa", url: baseURL! }]);
  });

  test("Visão geral: revisões à espera da V2, aprovação da prova e restante que trava a produção", async ({ page }) => {
    await page.goto("/cliente");
    await expect(page.getByText("Fase 4 de 7")).toBeVisible();
    // M7-07: painel de decisão (estado + prova à espera) e pagamentos compactos
    await expect(page.getByRole("heading", { name: "A segunda versão está pronta" })).toBeVisible();
    await expect(page.getByText("Aguarda a sua resposta").first()).toBeVisible();
    await expect(page.getByRole("article", { name: "Aprovar arte para produção Convite V2" })).toBeVisible();
    const pay = page.getByRole("region", { name: "Pagamentos" });
    await expect(pay.getByText("Sinal pago")).toBeVisible();
    await expect(pay).toContainText("Falta 60 000 Kz, restante, antes da produção.");
    await pay.getByText("Ver pagamentos").click();
    await expect(pay.getByText("Restante, antes da produção", { exact: true })).toBeVisible();
  });

  test("Ficheiros: provas V1/V2 e referências do briefing", async ({ page }) => {
    await page.goto("/cliente/entregas");
    await expect(page.getByText("convite-v2-frente.jpg")).toBeVisible();
    await expect(page.getByText("atual", { exact: true })).toBeVisible();
    await expect(page.getByText("convite-que-gostei.jpg")).toBeVisible();
  });

  test("todas as páginas do menu abrem sem erros", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of ["/cliente", "/cliente/projeto", "/cliente/entregas", "/cliente/mensagens"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
    }
    expect(errors).toEqual([]);
  });

  test("Ficha técnica: tipo e evento no topo, detalhes atrás de 'Ver detalhes da peça' (M7-01)", async ({ page }) => {
    await page.goto("/cliente");
    await expect(page.locator("header").getByText("Convite impresso · evento a 19 de dezembro de 2026")).toBeVisible();
    const block = page.getByRole("region", { name: "Ficha técnica" });
    await expect(block.getByText("Papel couché 300 g")).toBeHidden();
    await block.getByText("Ver detalhes da peça").click();
    await expect(block.getByText("Papel couché 300 g")).toBeVisible();
    await expect(block.getByText("Ana & Paulo")).toBeVisible();
    await page.goto("/cliente/projeto");
    await expect(page.getByText("Ver detalhes da peça")).toBeVisible();
  });

  test("Galeria de provas: V2 atual em grande, ampliar, comparar e carrossel no Projeto (M7-02)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/cliente");
    const proof = page.getByRole("region", { name: "Convite V2, a versão atual" });
    await expect(proof.getByText("V2, atual", { exact: false })).toBeVisible();
    await expect(proof.getByRole("img", { name: "Convite V2: convite-v2-frente.jpg" })).toBeVisible();
    // frente / verso
    await proof.getByRole("button", { name: "Verso" }).click();
    await expect(proof.getByRole("img", { name: "Convite V2: convite-v2-verso.jpg" })).toBeVisible();
    // ampliar: miniatura em grande e o original só a pedido, com o tamanho
    await proof.getByRole("button", { name: "Ampliar Convite V2" }).click();
    const zoom = page.getByRole("dialog", { name: "Convite V2" });
    // frente e verso, cada uma com o original a pedido e o tamanho à vista
    await expect(zoom.getByRole("button", { name: /^Descarregar original \(\d/ })).toHaveCount(2);
    await zoom.getByRole("button", { name: "Fechar" }).click();
    await expect(zoom).toBeHidden();
    // comparar com a V1, com o pedido que levou à V2
    // M7-07: as outras versões são um bloco à parte (à direita da prova no computador)
    await page.getByRole("region", { name: "Outras versões" }).getByRole("button", { name: "Comparar com a V2" }).click();
    const cmp = page.getByRole("dialog", { name: "Comparar V1 e V2" });
    await expect(cmp.getByText("O seu pedido:", { exact: false })).toContainText("Os nomes podem ser maiores?");
    await page.keyboard.press("Escape");
    await expect(cmp).toBeHidden();
    // Projeto (TEL-31): as versões lado a lado, a atual marcada
    await page.goto("/cliente/projeto");
    const list = page.getByRole("list", { name: "Versões" });
    await expect(list.getByRole("listitem")).toHaveCount(2);
    await expect(list.getByText("V2, atual")).toBeVisible();
    await expect(page.getByRole("button", { name: "Comparar V1 e V2" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Rondas: 'Ronda 1 de 2' no próximo passo, na prova e no Projeto; aviso da última ronda (M7-03)", async ({ page }) => {
    await page.goto("/cliente");
    // M7-07: o próximo passo e a prova à espera são um só painel de decisão
    await expect(page.getByRole("region", { name: "A segunda versão está pronta" }).getByText("Ronda 1 de 2")).toBeVisible();
    const card = page.getByRole("article", { name: "Aprovar arte para produção Convite V2" });
    await card.getByRole("button", { name: "Pedir alterações" }).click();
    await expect(card.getByText("Esta é a ronda 2 de 2 incluídas", { exact: false })).toBeVisible();
    // o comentário à V1 aparece ligado à V1 (Outras versões)
    await expect(page.getByRole("list", { name: "Comentários à V1" })).toContainText("Os nomes podem ser maiores?");
    await page.goto("/cliente/projeto");
    await expect(page.getByRole("list").filter({ hasText: "Briefing" }).getByText("Ronda 1 de 2")).toBeVisible();
  });

  test("Aprovar arte para produção: aviso, textos-chave e 'Confirmo' (M7-04)", async ({ page }) => {
    await page.goto("/cliente");
    const card = page.getByRole("article", { name: "Aprovar arte para produção Convite V2" });
    await card.getByRole("button", { name: "Aprovar arte para produção" }).click();
    const box = card.getByRole("group", { name: "Aprovar para produção" });
    await expect(box.getByText("a peça vai para impressão e já não pode ser alterada", { exact: false })).toBeVisible();
    await expect(box.getByText("Ana & Paulo")).toBeVisible();
    await expect(box.getByText("120", { exact: true })).toBeVisible();
    const go = box.getByRole("button", { name: "Aprovar para produção" });
    await expect(go).toBeDisabled();
    await box.getByText("Confirmo que os nomes, a data e a quantidade estão certos").click();
    await expect(go).toBeEnabled();
    await go.click();
    await expect(card.getByRole("alert")).toContainText("modo de demonstração");
  });

  test("Levantamento previsto na Visão geral antes da produção (M7-05, TEL-30 A)", async ({ page }) => {
    await page.goto("/cliente");
    // M7-07: no painel de decisão, por baixo dos botões
    const decision = page.getByRole("region", { name: "A segunda versão está pronta" });
    await expect(decision.getByText("Levantamento previsto").locator("..")).toContainText("Loja GeniusFrela, Talatona");
  });

  test("Layout do wireframe: prova à esquerda e decisão à direita no computador; num só painel (M7-07)", async ({ page }) => {
    await page.goto("/cliente");
    const decision = page.getByRole("region", { name: "A segunda versão está pronta" });
    await expect(decision.getByText("Aguarda a sua resposta")).toBeVisible();
    await expect(decision.getByRole("button", { name: "Aprovar arte para produção" })).toBeVisible();
    await expect(decision.getByText("Ainda pode pedir 1 revisão incluída no preço.")).toBeVisible();
    await expect(decision.getByText("Levantamento previsto")).toBeVisible();
    // a prova não se repete em Aprovações, nem há um painel "Revisões" à parte
    await expect(page.getByRole("article", { name: /Convite V2/ })).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Revisões" })).toHaveCount(0);
    const proof = await page.getByRole("region", { name: "Convite V2, a versão atual" }).boundingBox();
    const box = await decision.boundingBox();
    if ((page.viewportSize()?.width ?? 0) >= 1280) {
      expect(box!.x).toBeGreaterThan(proof!.x + proof!.width - 1); // à direita
      expect(Math.abs(box!.y - proof!.y)).toBeLessThan(40); // à mesma altura
    } else {
      expect(box!.y).toBeGreaterThan(proof!.y + proof!.height - 1); // por baixo
    }
  });

  test("360 px sem scroll horizontal (RNF-201, M7-07)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ["/cliente", "/cliente/projeto", "/cliente/entregas", "/cliente/mensagens"]) {
      await page.goto(path);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, path).toBe(0);
    }
  });

  test("Orçamento aceite no histórico com design + impressão (M7-06, RF-20.21)", async ({ page }) => {
    await page.goto("/cliente");
    const box = page.getByRole("region", { name: "Aprovações" });
    await box.getByText("Ver histórico").click();
    await expect(box.getByText("Valor total: 120 000 Kz (design 45 000 Kz + impressão 75 000 Kz).")).toBeVisible();
  });
});
