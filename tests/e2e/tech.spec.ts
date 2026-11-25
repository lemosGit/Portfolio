/** Comportamento do portal Tech (Desenvolvimento) — corre no CI em cada PR. */
import { expect, loginDemo, TECH_PAGES, test } from "./fixtures";

test.describe("sem sessão", () => {
  test("a Área do Cliente leva ao login", async ({ page }) => {
    await page.goto("/cliente");
    await expect(page).toHaveURL(/\/cliente\/login/);
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });
});

test.describe("cliente de demonstração", () => {
  test.beforeEach(async ({ context, baseURL }) => loginDemo(context, baseURL));

  for (const p of TECH_PAGES) {
    test(`${p.title} abre sem erros`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(p.title));
      await expect(page.locator("main#conteudo")).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("a navegação leva a cada página", async ({ page }) => {
    await page.goto("/cliente");
    for (const p of TECH_PAGES.slice(1)) {
      await page.goto(p.path);
      await expect(page).toHaveURL(new RegExp(`${p.path}$`));
    }
  });
});

test.describe("link mágico (M5-12)", () => {
  test("/cliente/entrar abre sem sessão e, com um link inválido, oferece um novo pelo WhatsApp", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/cliente/entrar?t=abcdefabcdefabcdefabcdefabcdefabcdef");
    await expect(page).toHaveURL(/\/cliente\/entrar/);
    await expect(page.getByRole("heading", { name: "Este link já não é válido" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pedir um link novo no WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);
    await page.getByRole("link", { name: "Tenho senha: entrar com email e senha" }).click();
    await expect(page).toHaveURL(/\/cliente\/login/);
    expect(errors).toEqual([]);
  });
});

test("T13: a limpeza diária recusa pedidos sem o CRON_SECRET (#122)", async ({ request }) => {
  expect((await request.get("/api/cron/limpeza")).status()).toBe(401);
  expect((await request.get("/api/cron/limpeza", { headers: { Authorization: "Bearer errado" } })).status()).toBe(401);
});
