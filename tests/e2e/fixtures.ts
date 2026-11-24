import { expect, type BrowserContext, test } from "@playwright/test";

/** Páginas do cliente Tech (Desenvolvimento) que existem hoje — RNF-701. */
export const TECH_PAGES = [
  { path: "/cliente", title: "Visão geral", key: "visao-geral" },
  { path: "/cliente/projeto", title: "Meu projeto", key: "projeto" },
  { path: "/cliente/entregas", title: "Entregas", key: "entregas" },
  { path: "/cliente/mensagens", title: "Mensagens", key: "mensagens" },
  { path: "/cliente/agenda", title: "Agenda", key: "agenda" },
] as const;

/** Sessão do modo de demonstração: o cookie guarda o id do cliente de exemplo (lib/portal/session.ts). */
export async function loginDemo(context: BrowserContext, baseURL: string | undefined) {
  await context.addCookies([{ name: "jp_portal_session", value: "c_alex", url: baseURL! }]);
}

export { expect, test };
