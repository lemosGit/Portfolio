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
    await expect(page.getByRole("heading", { name: "Revisões" })).toBeVisible();
    await expect(page.getByText("Aguarda a sua resposta").first()).toBeVisible();
    await expect(page.getByRole("article", { name: "Aprovar Convite V2" })).toBeVisible();
    const pay = page.getByRole("region", { name: "Pagamentos" });
    await expect(pay.getByText("120 000 Kz")).toBeVisible();
    await expect(pay.getByText("Restante, antes da produção")).toBeVisible();
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
    await proof.getByRole("button", { name: "Comparar com a V2" }).click();
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
});
