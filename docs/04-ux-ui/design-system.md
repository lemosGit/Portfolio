# Design system — validação dos tokens por serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M4-06] · Issue: #37 · Versão: 1.0 · Data: 2026-11-24
> Depende de: **Design System V1** (`docs/references/designer_system/`), ADR-004, [`wireframes/ds.css`](wireframes/ds.css), wireframes M4-03…M4-05 · Decisões usadas: D-086…D-091, D-111, D-112

## Fonte única
- **Definição:** ADR-004 (neutros, marca, estados, 4 tokens por módulo, tipografia, espaçamento, raio, contraste).
- **Implementação de referência:** `docs/04-ux-ui/wireframes/ds.css`, com os mesmos nomes de tokens. A M5-05 (#43) passa-os para `app/globals.css` e `tailwind.config.ts`.

## Tokens por serviço (`data-service`)
| `data-service` | Uso | `--m-primary` | `--m-soft` | `--m-tint` | `--m-on` | Origem |
|---|---|---|---|---|---|---|
| `development` | Área do Cliente Tech | `#4C8DFF` | `#9CC0FF` | `#13213D` | `#0A1530` | DS V1 |
| `academic` | Área do Cliente Académico | `#E8B65A` | `#F5D79A` | `#2E2412` | `#221A08` | DS V1 |
| `design` | Área do Cliente Design | `#A78BFA` | `#D2C4FF` | `#231B3F` | `#170F2E` | DS V1 |
| `brand` | Login, link mágico, admin, portal público | `#8B7CF6` | `#C9C2FB` | `#1C1838` | `#0B0F17` | primária do DS V1; resto derivado (D-111) |

## Validação nos wireframes (2026-11-24)
| Verificação | Resultado |
|---|---|
| Cores fora dos tokens em `academico.html`, `design.html`, `blocos-comuns.html` (excluindo a arte das provas e o logótipo) | **0** (só `#0B0F17`, que é o valor de `--n-night`) |
| Acento do módulo só dentro do seu serviço (DS V1, regra 1) | ✅ Âmbar só no Académico, Lilás só no Design; entrada e admin em marca |
| Neutros, tipografia e estados iguais nos 3 (regra 2) | ✅ mesmo `ds.css`, mesmos componentes |
| Botão primário com texto escuro (D-089) | ✅ em todos os ecrãs |
| Coral só para ações do cliente (D-088) | ✅ ("Aguarda a sua resposta", "Ação sua", aviso de irreversibilidade) |
| Planeado só como ponto/borda | ✅ |
| Contraste AA das combinações usadas | ✅ ADR-004 §6 + marca: 5,8 (botão) e 10,2 (secundário) |
| Logótipo conforme a ficha R2 | ✅ após a correção D-112 |
| 360 px sem scroll horizontal; alvos ≥ 44 px | ✅ revisto em captura |

## Componentes já desenhados (base da M5–M7)
Chip do serviço · barra de fases segmentada · chips de estado (Concluído, Em curso, Aguarda a sua resposta, Planeado) · botões primário, secundário, discreto e WhatsApp · cartão · contagem (número em Space Grotesk) · barra de progresso · lista · folha (*bottom sheet*) com pega · campo de texto · anexo · caixa de confirmação · barra inferior · barra lateral · aviso · balões de mensagem · moldura de prova.
