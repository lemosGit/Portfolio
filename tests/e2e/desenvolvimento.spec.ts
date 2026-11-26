/**
 * Regressão do layout Desenvolvimento (Tech) depois da v1.1 multi-serviço (M9-04, #77, US-008, CT-008).
 * O conteúdo de cada página, como na v1.0 (D-097): fases do GitHub, tarefas, demos, mensagens e agenda,
 * com o cliente de demonstração Alex (Nova App Mobile). O aspeto é verificado pelas capturas `tech-*` (@visual).
 */
import { expect, loginDemo, test } from "./fixtures";

test.beforeEach(async ({ context, baseURL }) => loginDemo(context, baseURL));

const FASES = [
  ["Descoberta & Requisitos", "Concluída"],
  ["Design (UI/UX)", "Concluída"],
  ["Desenvolvimento", "Em curso"],
  ["Testes & Validação", "Prevista 17 Dez"],
  ["Entrega & Publicação", "Prevista 27 Dez"],
  ["Suporte & Manutenção", "Por iniciar"],
] as const;

test("menu do Tech: as 5 entradas da v1.0, com a Agenda, e a etiqueta TECH", async ({ page }) => {
  await page.goto("/cliente");
  await expect(page.locator(".app")).toHaveAttribute("data-service", "development");
  await expect(page.locator("header").getByText("Tech", { exact: true })).toBeVisible();
  const nav = page.getByRole("navigation").filter({ has: page.getByRole("link", { name: /Agenda/ }) }).first();
  for (const l of ["Visão geral", "Meu projeto", "Entregas", "Mensagens", "Agenda"]) {
    await expect(nav.getByRole("link", { name: new RegExp(l) })).toBeVisible();
  }
});

test("Visão geral: tarefa à espera do cliente, progresso, fases do GitHub, reunião, novidades e demo", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/cliente");
  // Tarefa do GitHub que precisa do cliente
  await expect(page.getByText("Uma tarefa está à espera de informação sua")).toBeVisible();
  await expect(page.getByText("Textos dos termos e da privacidade").first()).toBeVisible();
  // Progresso calculado das issues
  await expect(page.getByText("Progresso do projeto")).toBeVisible();
  await expect(page.getByRole("img", { name: "66% do projeto concluído" })).toBeVisible();
  // As 6 fases do GitHub, pela ordem, com o estado de cada uma
  const roadmap = page.getByRole("region", { name: "Etapas do projeto" });
  for (const [nome, estado] of FASES) {
    const fase = roadmap.getByText(nome, { exact: true });
    await expect(fase).toBeVisible();
    await expect(fase.locator("xpath=..")).toContainText(estado);
  }
  await expect(roadmap.getByText("67%")).toBeVisible();
  // Próxima reunião, novidades das issues e a demo
  await expect(page.getByText("Revisão do Sprint 04").first()).toBeVisible();
  for (const n of ["Sistema de notificações", "Integração com GitHub", "Leitor de QR para fiscais"]) {
    await expect(page.getByText(n, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("Preview online · v0.9.0").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Meu projeto: as 6 etapas, e os separadores Tarefas e Demonstração", async ({ page }) => {
  await page.goto("/cliente/projeto");
  await expect(page.getByRole("heading", { name: "O meu projeto" })).toBeVisible();
  for (const [nome] of FASES) await expect(page.getByText(nome, { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Agora", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Tarefas", exact: true }).click();
  await expect(page).toHaveURL(/vista=tarefas/);
  await expect(page.getByText("Textos dos termos e da privacidade").first()).toBeVisible();

  await page.getByRole("link", { name: "Demonstração", exact: true }).click();
  await expect(page).toHaveURL(/vista=demonstracao/);
  await expect(page.getByRole("heading", { name: "Versão web", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "App mobile", exact: true })).toBeVisible();
  await expect(page.getByText("v0.9.0 · há 12 minutos")).toBeVisible();
  await expect(page.getByRole("link", { name: "Todas as versões" })).toHaveAttribute("href", "/cliente/entregas");
});

test("Entregas: demo web, app mobile com QR e o histórico das 4 versões", async ({ page }) => {
  await page.goto("/cliente/entregas");
  await expect(page.getByText("Painel do operador").first()).toBeVisible();
  await expect(page.getByText("Instalar no telemóvel")).toBeVisible();
  await expect(page.getByRole("link", { name: /Instalar v0\.9\.0/ })).toBeVisible();
  for (const v of ["Web · v0.9.0", "Android · v0.9.0", "Web · v0.8.0", "Android · v0.8.0"]) {
    await expect(page.getByText(v, { exact: true })).toBeVisible();
  }
});

test("Mensagens: o histórico com o tema de cada mensagem e o formulário com Geral/etapas/tarefas", async ({ page }) => {
  await page.goto("/cliente/mensagens");
  await expect(page.getByText("O fluxo de compra ficou muito claro", { exact: false })).toBeVisible();
  await expect(page.getByText("Já está na build 0.9.0", { exact: false })).toBeVisible();
  await expect(page.getByText("Sobre: Desenvolvimento").first()).toBeVisible();
  const sobre = page.getByLabel("Sobre");
  await expect(sobre.locator("option", { hasText: "Geral — o projeto no seu todo" })).toHaveCount(1);
  await expect(sobre.locator("option", { hasText: "Etapa — Desenvolvimento" })).toHaveCount(1);
  await expect(sobre.locator("option", { hasText: "Precisa de si — Textos dos termos e da privacidade" })).toHaveCount(1);
});

test("Agenda: a próxima reunião com o link e as reuniões anteriores", async ({ page }) => {
  await page.goto("/cliente/agenda");
  await expect(page.getByRole("heading", { name: "Reuniões" })).toBeVisible();
  await expect(page.getByText("Revisão do Sprint 04")).toBeVisible();
  await expect(page.getByRole("link", { name: /Entrar na reunião/ })).toBeVisible();
  await expect(page.getByText("Revisão do Sprint 03")).toBeVisible();
  await expect(page.getByText("Aprovação do protótipo")).toBeVisible();
});

test("os blocos dos serviços novos não aparecem no Tech (D-097)", async ({ page }) => {
  await page.goto("/cliente");
  for (const t of ["Aprovações", "Pagamentos", "Ver detalhes da peça", "Ver detalhes do trabalho"]) {
    await expect(page.getByRole("heading", { name: t, exact: true })).toHaveCount(0);
  }
  await expect(page.getByText(/Fase \d de 7/)).toHaveCount(0);
});
