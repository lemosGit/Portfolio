// Gera o PDF de um guia do cliente (docs/guias) com o Google Chrome (Playwright), A4 com fundos.
// Uso: node scripts/gerar_pdf_guia.mjs <guia.html absoluto> <saida.pdf> <pasta das pré-visualizações>
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire("/data/Projects/portfolio/package.json");
const { chromium } = require("@playwright/test");
const [src, out, previews] = process.argv.slice(2);
mkdirSync(previews, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.goto("file://" + src, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
// Páginas que transbordam (conteúdo maior que a folha A4)
const over = await page.$$eval(".pagina", (ps) => ps.map((p, i) => ({ i: i + 1, over: p.scrollHeight - p.clientHeight })).filter((x) => x.over > 1));
console.log("transbordam:", JSON.stringify(over));
const pags = await page.$$(".pagina");
for (let i = 0; i < pags.length; i++) await pags[i].screenshot({ path: `${previews}/p${String(i + 1).padStart(2, "0")}.png` });
await page.emulateMedia({ media: "print" });
await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
console.log("páginas:", pags.length);
await browser.close();
