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
  await expect(page.getByText("Estamos a escrever o capítulo 4.", { exact: false })).toBeVisible();
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
