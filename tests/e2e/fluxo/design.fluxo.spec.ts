/**
 * Fluxo Design de ponta a ponta com o Supabase local (M9-03, #76, D-172):
 * sinal → provas → rondas → aprovação da arte → produção → entrega.
 * O cliente faz tudo no browser; o admin pela sua sessão (as mesmas tabelas, RPC e gatilhos das Server Actions).
 * Plano de testes: CT-011, CT-012, CT-029, CT-030, CT-032, CT-034, CT-035, CT-036 (e RN-41, RN-42, RN-15).
 */
import { expect, test, type Page } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { carregarVersao, criarAdmin, criarClienteEProjeto, estadoFase, gerarLinkAcesso, marcarPago, mudarFase, ok, pedirAprovacaoProva, png, type Conta } from "./dados";

test.describe.configure({ mode: "serial" });

const run = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
let admin: Conta & { db: SupabaseClient };
let projectId: string;
let cliente: Page;

const prova = (versionNo: number) =>
  carregarVersao(admin.db, projectId, {
    phaseKey: versionNo === 1 ? "conceito" : "revisoes",
    role: "prova",
    seriesKey: "convite",
    title: "Convite",
    versionNo,
    fileName: `convite-v${versionNo}-frente.png`,
    mime: "image/png",
    body: png(),
  });

const rondas = async () => {
  const { data, error } = await admin.db.rpc("design_rounds", { p_project: projectId });
  if (error) throw error;
  return (data as { included: number; used: number; remaining: number }[])[0];
};

test.beforeAll(async () => {
  admin = await criarAdmin(run);
  ({ projectId } = await criarClienteEProjeto(admin.db, run, "design", "Convite de fluxo"));
  // Ficha técnica (saveDesignSpec): convite impresso, 100 unidades, textos-chave, evento daqui a 30 dias.
  const evento = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  await ok(
    admin.db.from("design_specs").insert({
      project_id: projectId,
      piece_type: "convite_impresso",
      width_cm: 14.8,
      height_cm: 21,
      quantity: 100,
      has_print: true,
      has_digital_files: false,
      event_date: evento,
      key_texts: [
        { label: "Noivos", value: "Teste & Fluxo" },
        { label: "Local", value: "Salão de teste, Luanda" },
      ],
    }),
    "ficha técnica",
  );
  expect(await mudarFase(admin.db, projectId, "briefing", "em_curso")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "briefing", "concluida")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "orcamento-sinal", "em_curso")).toBeNull();
  // Orçamento (createQuote + sendQuote): design 40 000 + impressão 60 000 = 100 000 Kz, sinal 50%, 2 rondas.
  await ok(
    admin.db.from("quotes").insert({ project_id: projectId, version: 1, total_kz: 100000, design_kz: 40000, print_kz: 60000, deposit_pct: 50, deposit_kz: 50000, rounds_included: 2 }),
    "orçamento",
  );
  await ok(admin.db.from("quotes").update({ status: "enviado" }).eq("project_id", projectId).eq("version", 1), "enviar orçamento");
});

test.afterAll(async () => {
  await cliente?.context().close();
});

test("1. link mágico e aceite do orçamento com design + impressão; o sinal trava o Conceito (CT-012, CT-011)", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext();
  cliente = await ctx.newPage();
  await cliente.goto(await gerarLinkAcesso(projectId, admin.userId, baseURL!));
  await cliente.getByRole("button", { name: "Entrar no meu projeto" }).click();
  await cliente.waitForURL(/\/cliente$/);
  await expect(cliente.locator(".app")).toHaveAttribute("data-service", "design");

  const card = cliente.getByRole("article", { name: "Aceitar Orçamento v1" });
  const valor = (k: string) => card.getByText(k, { exact: true }).locator("xpath=following-sibling::dd");
  await expect(valor("Design")).toHaveText("40 000 Kz");
  await expect(valor("Impressão")).toHaveText("60 000 Kz");
  await expect(valor("Total")).toHaveText("100 000 Kz");
  await expect(valor("Rondas incluídas")).toHaveText("2");
  await card.getByRole("button", { name: "Aceitar" }).click();
  await card.getByRole("button", { name: "Confirmar aceite" }).click();
  await expect(card.getByRole("status")).toBeVisible();

  // RN-11: o sinal trava o Conceito; o cliente vê "Pagar o sinal".
  expect(await mudarFase(admin.db, projectId, "conceito", "em_curso")).toMatch(/Falta o pagamento "Sinal \(50%\)" \(50 000 Kz\)/);
  await cliente.reload();
  await expect(cliente.getByText("Pagar o sinal (50%): 50 000 Kz", { exact: false })).toBeVisible();
});

test("2. provas e rondas: V1 com alterações pedidas (ronda 1 de 2), V2 em grande com a V1 nas outras versões (CT-030, CT-032)", async () => {
  await marcarPago(admin.db, projectId, "sinal");
  expect(await mudarFase(admin.db, projectId, "conceito", "em_curso")).toBeNull();
  const v1 = await prova(1);
  expect(await mudarFase(admin.db, projectId, "conceito", "concluida")).toBeNull();
  expect(await mudarFase(admin.db, projectId, "revisoes", "em_curso")).toBeNull();
  await pedirAprovacaoProva(admin.db, projectId, v1, "revisoes", "Primeira proposta.");

  await cliente.goto("/cliente");
  const painel = cliente.getByRole("region", { name: "A primeira versão está pronta" });
  await expect(painel.getByText("2 rondas incluídas")).toBeVisible();
  await painel.getByRole("button", { name: "Pedir alterações" }).click();
  await expect(painel.getByText("Vai usar a ronda 1 de 2 incluídas.", { exact: false })).toBeVisible();
  await painel.getByRole("textbox").fill("Os nomes podem ser maiores?");
  await painel.getByRole("button", { name: /Enviar/ }).click();
  await expect(painel.getByRole("status")).toBeVisible();
  expect(await rondas()).toEqual({ included: 2, used: 1, remaining: 1 });

  const v2 = await prova(2);
  await pedirAprovacaoProva(admin.db, projectId, v2, "revisoes", "Nomes maiores.");
  await cliente.goto("/cliente");
  const painel2 = cliente.getByRole("region", { name: "A segunda versão está pronta" });
  await expect(painel2.getByText("Ronda 1 de 2")).toBeVisible();
  await expect(painel2.getByText("Ainda pode pedir 1 revisão incluída no preço.")).toBeVisible();
  await expect(cliente.getByText(/V2, atual/)).toBeVisible();
  await expect(cliente.getByRole("region", { name: "Outras versões" }).getByRole("list", { name: "Comentários à V1" })).toContainText("Os nomes podem ser maiores?");
});

test("3. aprovação da arte: textos-chave e 'Confirmo'; depois, sem botões nem novas provas (CT-034, RN-41, RN-42)", async () => {
  await cliente.goto("/cliente");
  const painel = cliente.getByRole("region", { name: "A segunda versão está pronta" });
  await painel.getByRole("button", { name: "Aprovar arte para produção" }).click();
  const conf = painel.getByRole("group", { name: "Aprovar para produção" });
  await expect(conf.getByText("Teste & Fluxo")).toBeVisible();
  await expect(conf.getByText("Salão de teste, Luanda")).toBeVisible();
  await expect(conf.getByText("100", { exact: true })).toBeVisible();
  const go = conf.getByRole("button", { name: "Aprovar para produção" });
  await expect(go).toBeDisabled();
  await conf.getByText("Confirmo que os nomes, a data e a quantidade estão certos").click();
  await go.click();
  await expect(painel.getByRole("status")).toContainText(/aprovada/i);
  await expect(painel.getByRole("button", { name: "Pedir alterações" })).toHaveCount(0);

  await expect.poll(() => estadoFase(admin.db, projectId, "aprovacao-arte")).toBe("concluida");
  // RN-41: uma V3 da mesma peça já não se carrega.
  await expect(prova(3)).rejects.toThrow(/arte desta peça já foi aprovada/);
});

test("4. produção: 'Pagar o restante'; 'a imprimir' recusado sem ele (RN-15); pago → em produção → pronto para levantar (CT-035, CT-036)", async () => {
  await cliente.goto("/cliente");
  await expect(cliente.getByText("Pagar o restante, antes da produção: 50 000 Kz", { exact: false })).toBeVisible();

  const estado = (v: string) => admin.db.from("design_specs").update({ production_status: v }).eq("project_id", projectId);
  const { error: e1 } = await estado("a_imprimir");
  expect(e1?.message ?? "").toMatch(/Falta o pagamento "Restante, antes da produção" \(50 000 Kz\)/);

  await marcarPago(admin.db, projectId, "restante");
  await ok(estado("a_imprimir"), "a imprimir");
  await cliente.goto("/cliente");
  await expect(cliente.getByText("Em produção")).toBeVisible();
  await expect(cliente.getByText("Estamos a imprimir as 100 peças.")).toBeVisible();

  // savePickup + "Pronto": a Entrega/levantamento abre.
  const levantar = new Date(Date.now() + 7 * 86_400_000);
  levantar.setUTCHours(14, 0, 0, 0); // 15:00 em Luanda
  await ok(admin.db.from("design_specs").update({ pickup_at: levantar.toISOString(), pickup_place: "Loja GeniusFrela, Talatona" }).eq("project_id", projectId), "levantamento");
  await ok(estado("pronto"), "pronto");
  expect(await estadoFase(admin.db, projectId, "producao")).toBe("concluida");
  await cliente.goto("/cliente");
  const pronto = cliente.getByRole("region", { name: "Entrega e levantamento" });
  await expect(pronto.getByText("Pronto para levantar")).toBeVisible();
  await expect(pronto.getByText("Loja GeniusFrela, Talatona", { exact: false })).toBeVisible();
  await expect(pronto.getByRole("link", { name: "Abrir no mapa" })).toHaveAttribute("href", /google\.com\/maps/);
  await expect(pronto.getByText(/tem \d+ dias? de folga/)).toBeVisible();
});

test("5. entrega: marcada como entregue, o projeto conclui-se e o cliente vê a data (CT-036)", async () => {
  const { error } = await admin.db.rpc("admin_design_delivered", { p_project: projectId });
  expect(error).toBeNull();
  expect(await estadoFase(admin.db, projectId, "entrega-levantamento")).toBe("concluida");
  const p = (await ok(admin.db.from("projects").select("status").eq("id", projectId).single(), "projeto")) as { status: string };
  expect(p.status).toBe("entregue");
  await cliente.goto("/cliente");
  await expect(cliente.getByText(/Peça entregue a \d+ de \w+/)).toBeVisible();
});
