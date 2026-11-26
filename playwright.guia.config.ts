/**
 * Capturas dos guias do cliente (docs/guias): o fluxo real com o Supabase local (D-172), em tamanho de
 * telemóvel. Não corre no CI. Uso: `npx supabase start` e `npx playwright test -c playwright.guia.config.ts`.
 */
import { defineConfig } from "@playwright/test";
import base from "./playwright.fluxo.config";

export default defineConfig({
  ...base,
  testDir: "./docs/guias/src",
  outputDir: "test-results-guia",
  reporter: "list",
  use: { ...base.use, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, trace: "off" },
});
