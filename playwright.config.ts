import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const CI = !!process.env.CI;

/**
 * E2E do portal em modo de demonstração (sem Supabase nem GitHub), com o relógio fixo
 * (lib/clock.ts) para as datas não mudarem. As capturas de referência (@visual) correm
 * só localmente: a renderização das letras muda de máquina para máquina.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  snapshotPathTemplate: "tests/e2e/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Localmente usa o Google Chrome instalado; no CI, o Chromium do Playwright.
    channel: CI ? undefined : "chrome",
    reducedMotion: "reduce",
    locale: "pt-PT",
    timezoneId: "Africa/Luanda",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "telemovel", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 740 }, isMobile: false } },
    { name: "computador", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/cliente/login`,
    reuseExistingServer: !CI,
    timeout: 240_000,
    env: {
      // Força o modo de demonstração mesmo com .env.local (valores vazios ganham ao ficheiro).
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_SECRET_KEY: "",
      GITHUB_TOKEN: "",
      PORTAL_DEMO_REPO: "",
      PORTAL_FIXED_NOW: "2026-11-25T10:00:00+01:00",
      TZ: "Africa/Luanda",
    },
  },
});
