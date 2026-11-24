import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    // Instante fixo para os dados de demonstração (lib/clock.ts) e o fuso de Luanda.
    env: { PORTAL_FIXED_NOW: "2026-11-25T10:00:00+01:00", TZ: "Africa/Luanda" },
  },
});
