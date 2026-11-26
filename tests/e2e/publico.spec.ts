/** Portal público: secção Serviços, filtro do Portfólio e páginas do Académico (M6-08, #61) e do Design (M7-08, #71). */
import { expect, test } from "@playwright/test";

test("Serviços: 3 cartões; o Académico e o Design abrem a sua página (M7-08)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const section = page.locator("#servicos");
  await expect(section.getByRole("heading", { level: 3 })).toHaveCount(3);
  await expect(section.getByText("Em breve")).toHaveCount(0);
  await section.getByRole("link", { name: "Design: conhecer o serviço" }).click();
  await expect(page).toHaveURL(/\/servicos\/design$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("aprovada antes de imprimir");
  await page.goto("/");
  await page.locator("#servicos").getByRole("link", { name: "Académico: conhecer o serviço" }).click();
  await expect(page).toHaveURL(/\/servicos\/academico$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("com o prazo à vista");
  expect(errors).toEqual([]);
});

test("Portfólio: filtro por serviço, com estado vazio no Académico", async ({ page }) => {
  await page.goto("/");
  const group = page.getByRole("group", { name: "Filtrar por serviço" });
  await expect(group.getByRole("button", { name: "Todos" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Kero PriceGuard")).toBeVisible();
  await group.getByRole("button", { name: "Académico" }).click();
  await expect(group.getByRole("button", { name: "Académico" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Em breve, trabalhos académicos.")).toBeVisible();
  await expect(page.getByText("Kero PriceGuard")).toHaveCount(0);
  await group.getByRole("button", { name: "Desenvolvimento" }).click();
  await expect(page.getByText("Kero PriceGuard")).toBeVisible();
});

test("Portfólio: /?servico=academic abre já filtrado", async ({ page }) => {
  await page.goto("/?servico=academic#projetos");
  await expect(page.getByRole("button", { name: "Académico" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Em breve, trabalhos académicos.")).toBeVisible();
});

test("Página do Académico: 7 fases, sem preços e 'Fale connosco' para o WhatsApp", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto("/servicos/academico");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/Académico/);
  const phases = page.getByRole("region", { name: "Sete fases, do briefing aos ajustes." }).getByRole("listitem");
  await expect(phases.filter({ hasText: /^Fase \d/ })).toHaveCount(7);
  await expect(page.getByText("Revisão e formatação", { exact: true })).toBeVisible();
  await expect(page.getByText(/\d[\d\s.]*\s?Kz/)).toHaveCount(0); // sem preços (Q-100)
  const cta = page.getByRole("link", { name: "Fale connosco pelo WhatsApp (abre numa nova janela)" }).first();
  const href = await cta.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/244957392400\?text=/);
  expect(decodeURIComponent(href!.split("text=")[1])).toContain("trabalho académico");
  expect(errors).toEqual([]);
});

test("Portfólio: /?servico=design abre filtrado; o 'Fale connosco' leva a mensagem do Design (M7-08)", async ({ page }) => {
  await page.goto("/?servico=design#projetos");
  await expect(page.getByRole("button", { name: "Design" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Em breve, trabalhos de design.")).toBeVisible();
  const empty = page.locator("#projetos");
  const href = await empty.getByRole("link", { name: "Fale connosco" }).getAttribute("href");
  expect(decodeURIComponent(href!.split("text=")[1])).toContain("trabalho de design");
  await empty.getByRole("link", { name: "Conhecer o serviço" }).click();
  await expect(page).toHaveURL(/\/servicos\/design$/);
});

test("Página do Design: 7 fases, tipos de peça, sem preços e 'Fale connosco' para o WhatsApp (M7-08)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto("/servicos/design");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/Design/);
  const phases = page.getByRole("region", { name: "Sete fases, do briefing ao levantamento." }).getByRole("listitem");
  await expect(phases.filter({ hasText: /^Fase \d/ })).toHaveCount(7);
  await expect(page.getByText("Aprovação final da arte", { exact: true })).toBeVisible();
  await expect(page.getByText("Convite impresso", { exact: true })).toBeVisible();
  await expect(page.getByText(/\d[\d\s.]*\s?Kz/)).toHaveCount(0); // sem preços (Q-100)
  const cta = page.getByRole("link", { name: "Fale connosco pelo WhatsApp (abre numa nova janela)" }).first();
  await expect(cta).toHaveClass(/btn-design/);
  const href = await cta.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/244957392400\?text=/);
  expect(decodeURIComponent(href!.split("text=")[1])).toContain("trabalho de design");
  // M9-08: o horário aprovado (D-036), nas duas páginas
  await expect(page.getByText("Atendimento todos os dias, das 8h às 20h.", { exact: false })).toBeVisible();
  await page.goto("/servicos/academico");
  await expect(page.getByText("Atendimento todos os dias, das 8h às 20h.", { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test("Página do Académico: o menu leva às secções da inicial", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/servicos/academico");
  await expect(page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Serviços" })).toHaveAttribute(
    "href",
    "/#servicos",
  );
});

test("360 px sem scroll horizontal (RNF-201)", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ["/", "/servicos/academico", "/servicos/design"]) {
    await page.goto(path);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, path).toBe(0);
  }
});
