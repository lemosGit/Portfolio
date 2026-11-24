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
});
