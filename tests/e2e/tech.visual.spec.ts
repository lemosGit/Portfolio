/**
 * Capturas de referência do portal Tech ANTES da migração (D-097, passo 0).
 * Correm só localmente: `npm run e2e:visual`; atualizar com `npm run e2e:update`
 * apenas quando uma mudança visual for intencional e aprovada.
 */
import { expect, loginDemo, TECH_PAGES, test } from "./fixtures";

test.describe("@visual Tech — referência", () => {
  test.beforeEach(async ({ context, baseURL }) => loginDemo(context, baseURL));

  for (const p of TECH_PAGES) {
    test(`${p.title} @visual`, async ({ page }) => {
      await page.goto(p.path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`tech-${p.key}.png`, { fullPage: true });
    });
  }

});

test.describe("@visual Login — referência", () => {
  test("Login @visual", async ({ page }) => {
    await page.goto("/cliente/login");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot("login.png", { fullPage: true });
  });
});

test.describe("@visual Académico — referência", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([{ name: "jp_portal_session", value: "c_kiala", url: baseURL! }]);
  });
  test("Académico Visão geral @visual", async ({ page }) => {
    await page.goto("/cliente");
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot("academico-visao-geral.png", { fullPage: true });
  });
});
