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
