# Guias do cliente
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Preparação da homologação (M9-06, #79) · Data: 2026-11-26

| Guia | Ficheiros |
|---|---|
| **Académico** (13 páginas A4) | [`academico/guia-cliente-academico.pdf`](academico/guia-cliente-academico.pdf) · fonte HTML `academico/guia-cliente-academico.html` · capturas em `academico/capturas/` |

O visual segue o Design System V1 (ADR-004): os neutros do portal, o Âmbar do Académico, Space Grotesk e Inter (OFL, em `fontes/`).
As capturas são **ecrãs reais do portal**, tirados ao correr o fluxo completo com o Supabase local e uma cliente fictícia ("Ana Silva").

## Voltar a gerar (quando o portal mudar)
1. `npx supabase start` (Docker; ver `docs/05-qa/testes.md`, D-172).
2. Capturas: `npx playwright test -c playwright.guia.config.ts` → `docs/guias/academico/capturas/*.png` (telemóvel, 390 px, resolução dupla).
3. PDF: `node scripts/gerar_pdf_guia.mjs "$(pwd)/docs/guias/academico/guia-cliente-academico.html" "$(pwd)/docs/guias/academico/guia-cliente-academico.pdf" /tmp/guia-previews` (usa o Google Chrome instalado; avisa se alguma página transbordar).

Os textos do guia estão no HTML. Se mudar uma regra (prazos, limites, horário), atualize o guia ao mesmo tempo: as regras vêm de `docs/01-requisitos/regras-negocio.md` (RN-11…RN-14, RN-21, RN-33, RN-51…RN-53).
