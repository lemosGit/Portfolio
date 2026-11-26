/**
 * Testes de fluxo de ponta a ponta com um Supabase local (M9-02, D-172): auth do link mágico, Storage,
 * Server Actions e as regras da BD a sério. Corre com `npm run e2e:fluxo` (precisa de `npx supabase start`).
 * O E2E de demonstração (playwright.config.ts) continua igual.
 */
import { defineConfig, devices } from "@playwright/test";
import { localSupabase } from "./tests/e2e/fluxo/supabase-local";

const PORT = 3200;
const CI = !!process.env.CI;
const sb = localSupabase();

export default defineConfig({
  testDir: "./tests/e2e/fluxo",
  // Um fluxo depende do passo anterior: em série, um só browser.
  fullyParallel: false,
  workers: 1,
  timeout: 240_000,
  expect: { timeout: 15_000 },
  retries: 0,
  reporter: CI ? [["list"], ["html", { open: "never", outputFolder: "playwright-report-fluxo" }]] : "list",
  outputDir: "test-results-fluxo",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
    ...(CI ? {} : { channel: "chrome" }),
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/cliente/login`,
    reuseExistingServer: !CI,
    timeout: 300_000,
    // Os erros do servidor (Server Actions) aparecem no relatório.
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NEXT_DIST_DIR: ".next-fluxo",
      NEXT_PUBLIC_SUPABASE_URL: sb.url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: sb.publishableKey,
      SUPABASE_SECRET_KEY: sb.secretKey,
      NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${PORT}`,
      // Sem emails, sem GitHub, hora real (sem PORTAL_FIXED_NOW).
      RESEND_API_KEY: "",
      GITHUB_TOKEN: "",
      CRON_SECRET: "fluxo-local",
    },
  },
});
