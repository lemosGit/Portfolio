import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // JSX dos testes de componentes (o tsconfig do Next usa "preserve").
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    // tests/unit: funções puras (node). __tests__: componentes React (jsdom, por ficheiro), D-157.
    include: ["tests/unit/**/*.test.ts", "__tests__/**/*.test.tsx"],
    environment: "node",
    // Instante fixo para os dados de demonstração (lib/clock.ts) e o fuso de Luanda.
    env: { PORTAL_FIXED_NOW: "2026-11-25T10:00:00+01:00", TZ: "Africa/Luanda" },
  },
});
