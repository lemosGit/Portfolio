# Plano de testes — Área do Cliente multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M9-01] · Issue: #74 · Versão: 1.0 · Data: 2026-11-25
> Depende de: `docs/01-requisitos/user-stories.md` (36 US), `regras-negocio.md`, `requisitos-nao-funcionais.md`, `docs/05-qa/testes.md` (como correr os testes) · Decisões usadas: D-041, D-097, D-113…D-115, D-157, D-168, D-170

## 1. Objetivo e âmbito
Cada **user story** tem pelo menos um **caso de teste** (CT), escrito a partir dos seus critérios "Dado · Quando · Então". O plano diz, para cada caso:
- **como** se testa (nível);
- **onde** já está automatizado (ficheiro);
- **o que falta** fazer, e em que tarefa (M9-02 a M9-05).

Entra no âmbito: o portal do cliente (Tech, Académico, Design), o admin, a BD (gatilhos, RLS) e as páginas públicas dos serviços.
Fica fora: o envio real de emails pelo Resend, que se verifica à parte (§6, lacuna G3), e o GitHub do Tech, testado na v1.0.

## 2. Níveis de teste
| Nível | Ferramenta | Onde | Corre em | Para quê |
|---|---|---|---|---|
| **U** — Unitário | Vitest (node) | `tests/unit/` | local + CI | Funções puras: regras, formatação, leitura dos formulários |
| **C** — Componente | Vitest + Testing Library (jsdom) | `__tests__/<módulo>/` | local + CI | O que o cliente vê e faz num bloco, com interação (D-157) |
| **B** — BD | psql em Postgres 17 (Docker) | `supabase/tests/` | local + CI | Gatilhos, transições, regras de negócio na BD, RLS, concorrência |
| **E** — E2E | Playwright, 360 px e 1280 px | `tests/e2e/*.spec.ts` | local + CI | O portal no modo de demonstração, de ponta a ponta no browser |
| **V** — Visual | Playwright (capturas) | `tests/e2e/tech.visual.spec.ts` | só local (D-114) | Regressão visual contra as capturas de referência aprovadas |
| **M** — Manual em produção | Chrome (admin) + janela anónima (cliente, link mágico) | `joao-pereira.dev` | por entrega | O fluxo real com a BD, o Storage e o link mágico (como na M6-99 e na M7-99) |

**Estado** de cada caso: ✅ automatizado · 🟢 verificado à mão em produção (sem automação) · 🟡 parcial · ⬜ por testar · ❌ funcionalidade por implementar.

## 3. Dados de teste por serviço
### 3.1 Modo de demonstração (E2E, local e CI)
`npm run dev` ou `next start` sem as variáveis do Supabase. O relógio está fixo em `PORTAL_FIXED_NOW=2026-11-25T10:00:00+01:00`, `TZ=Africa/Luanda` (D-113). Os dados estão em `lib/portal/mock-data.ts`. Senha de demonstração: `jpstudio`.

| Serviço | Conta (cookie E2E) | Projeto | Estado que permite testar |
|---|---|---|---|
| **Tech** | `alex@novaapp.ao` (`c_alex`) | Nova App Mobile | Fases do GitHub, tarefas, demos e feedback, reuniões, mensagens, entregas |
| **Académico** | `kiala@exemplo.ao` (`c_kiala`) | Monografia | Fase 4 (Desenvolvimento), 2 de 5 capítulos, índice V3 à espera, orçamento v1 aceite, prazo a 7/12 (12 dias), pagamentos compactos |
| **Design** | `teresa@exemplo.ao` (`c_teresa`) | Convite de casamento | Fase 4 (Revisões), V2 à espera ("Ronda 1 de 2"), V1 com alterações pedidas, sinal pago e restante pendente, orçamento 45 000 + 75 000 Kz, levantamento previsto a 15/12 |

### 3.2 BD (Docker)
`supabase/tests/_supabase_stub.sql` cria o admin (`…00ad`), o cliente A (`10000000-…00a1`) e o cliente B (`…00b1`). Cada ficheiro `NNNN_*.sql` cria os seus projetos com ids próprios (ex.: `d0000000-…0018a1`) e, quando precisa de partir de um estado avançado, passa os gatilhos à frente com `session_replication_role = replica`.

### 3.3 Produção (testes manuais, M)
| Serviço | Cliente de teste | Projeto | Estado em 25/11 |
|---|---|---|---|
| **Tech** | Cliente de teste (v1.0) | Candongueiro_pay (`candongueiro-pay`, repositório `candongueiro_pay`) | Fases do GitHub; para a regressão (M9-04) |
| **Académico** | Cliente de teste M5 | **Monografia de teste v0.2** | 7 fases feitas (M6-99): orçamento, índice, 4 capítulos, entrega V1/V2, 1 ajuste resolvido |
| **Académico** | Cliente de teste M5 | Monografia de teste M5 | Fase 1, por usar: **ponto de partida da M9-02** |
| **Design** | Cliente de teste Design | **Convite de teste v0.3** | 7 fases feitas e entregue (M7-99) |
| **Design** | Cliente de teste Design | Convite de teste M5 | Fase 2, por usar: **ponto de partida da M9-03** |

- O lado do cliente entra pelo **link mágico** (projeto → *Acesso do cliente* → *Gerar link de acesso*), numa **janela anónima**, porque o link substitui a sessão do admin (L3).
- Nos testes, desliga-se **"Avisar o cliente por email"**, exceto nos casos do email (G3).
- Projetos novos de teste: `"<Peça|Trabalho> de teste <versão>"`, sempre num dos clientes de teste. Nunca em clientes reais.

### 3.4 Ficheiros de teste
`python3 scripts/gerar_ficheiros_teste.py` gera em `tests/fixtures/gerados/` (fora do git):

| Ficheiro | Tamanho | Para |
|---|---|---|
| `foto-referencia-4mb.png` | ~4 MB | Referência aceite (US-015) |
| `enunciado-2mb.pdf` | 2 MB | Enunciado do Académico (US-015) |
| `limite-10mb.pdf` | 10 MB | No limite: aceite (RF-30.42) |
| `documento-12mb.pdf` | 12 MB | Recusado **antes** do envio (US-015) |
| `ficheiro.txt` / `falso.pdf` | — | Formato fora da lista / conteúdo que não bate com a extensão: recusados |
| `convite-v1…v3-frente.png` | ~10 KB | Provas do Design **com** pré-visualização |
| `convite-v1…v3-frente.svg` | ~1 KB | Prova **sem** pré-visualização (L5 da v0.3) |
| `monografia-final.pdf`, `convite-final.pdf` | 1 MB | Entrega final (US-026) e ficheiros digitais (US-036) |

## 4. Casos de teste por user story
Em "Automatizado em", os ficheiros são relativos à raiz do repositório (E = `tests/e2e/`, C = `__tests__/`, U = `tests/unit/`, B = `supabase/tests/`).

### 4.1 Comum
| CT | US | Caso (dado · quando · então) | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-001 | US-001 | Admin cria um projeto Design → 7 fases do modelo, sem campo de repositório; Académico idem | B, U, M | B `0006_fases.sql` (modelos e fases), U `project-form.test.ts` | ✅ 🟢 | Repetir na M9-02/03 (passo 1) |
| CT-002 | US-002 | "Gerar link" → link de 24 h, uso único; "Abrir no WhatsApp" com a mensagem e o link | U, M | U `access-links.test.ts` | ✅ 🟢 | M9-05: expiração e 2.º uso em produção |
| CT-003 | US-003 | Link válido → entra no projeto; link usado ou expirado → "peça um novo" com WhatsApp | E, M | E `tech.spec.ts` (link inválido) | 🟡 🟢 | M9-05: link usado e link expirado |
| CT-004 | US-004 | Visão geral: etiqueta do serviço, barra de fases, fase atual e um só botão de ação | E, V | E `academico.spec.ts`, `servicos.spec.ts` (Visão geral) · V capturas `*-visao-geral-*` | ✅ | — |
| CT-005 | US-005 | Admin conclui uma fase ou põe "a aguardar o cliente" → a barra e o próximo passo mudam; fase "não aplicável" | U, B, M | U `admin-phases.test.ts` · B `0006_fases.sql` | ✅ 🟢 | M9-02/03: verificar no cliente logo a seguir (L4: concluir e avançar não é atómico) |
| CT-006 | US-006 | Cliente com 2 projetos troca no seletor → fases, provas e pagamentos do outro | M | — | ⬜ | **M9-03**: usar os 2 projetos do Cliente de teste Design |
| CT-007 | US-007 | Projeto cancelado depois do sinal pago → cancelado, sinal fica pago, pendentes anulados | B | B `0007_blocos.sql` (RN-13), `0008_retencao.sql` | ✅ | M9-02: cancelar um projeto de teste no admin |
| CT-008 | US-008 | Cliente Tech abre o portal depois da v1.1 → páginas como antes | E, V | E `tech.spec.ts` · V capturas Tech (12) | ✅ | **M9-04** (regressão completa) |

### 4.2 Pagamentos
| CT | US | Caso | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-009 | US-009 | Admin marca o sinal pago com a data → pago, no histórico, "Desfazer pago" | U, B, M | U `payments.test.ts` · B `0007_blocos.sql` | ✅ 🟢 | — |
| CT-010 | US-010 | Cliente vê total, pago, em falta e o estado (pendente, pago, em atraso); sem botão de pagar | U, C, E | U `payments.test.ts` (em atraso em Luanda) · C `academico/payments.test.tsx` · E `academico.spec.ts` (pagamentos compactos) | ✅ | — |
| CT-011 | US-011 | Aceite com o sinal pendente → "Pagar o sinal" com o valor; a fase seguinte não avança (RN-11, D-052) | U, C, B, M | B `0011_aceite.sql`, `0017_orcamento_design.sql`, `0018_correcoes_v03.sql` (mensagem "50 000 Kz") · C `design/art-lock.test.tsx` | ✅ 🟢 | — |

### 4.3 Aprovações
| CT | US | Caso | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-012 | US-012 | "Aceitar" mostra a regra do sinal; aceite com data, hora e autor; Design com design + impressão | C, B, E, M | C `design/quote.test.tsx` · B `0011_aceite.sql`, `0017_orcamento_design.sql` · E `academico.spec.ts`, `servicos.spec.ts` (histórico) | ✅ 🟢 | — |
| CT-013 | US-013 | "Pedir alterações" sem texto pede o comentário; com texto fica com a versão; o admin é avisado | U, C, B, E | B `0007_blocos.sql` (comentário vazio recusado, RN-05) · U `approvals.test.ts` (autor e comentário) · C `design/rounds.test.tsx` · E `academico.spec.ts` (aprovações, RN-05) | ✅ | Aviso ao admin por email: G3 |
| CT-014 | US-014 | Admin reabre a arte aprovada com motivo → pendente; com a produção começada → recusado (RN-43); reaberta, volta a aceitar provas (RN-41) | B | B `0007_blocos.sql`, `0015_arte.sql`, `0018_correcoes_v03.sql` | ✅ | M9-03: reabrir no ecrã do admin |
| CT-014b | — | Duas respostas em paralelo à mesma aprovação → 1 sucesso, 1 "já foi respondido" | B | B `concorrencia.sh` (T3) | ✅ | — |

### 4.4 Ficheiros
| CT | US | Caso | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-015 | US-015 | Cliente envia uma foto de 4 MB (aceite, com progresso) e um PDF de 12 MB (recusado antes do envio); formato fora da lista e conteúdo falso recusados | U, M | U `files.test.ts` (tipos, assinatura, limites) | 🟡 | **M9-02**: enviar no briefing com os ficheiros da §3.4 |
| CT-016 | US-016 | Nova versão de um entregável → a anterior fica e a nova é a atual; prova de peça com a arte aprovada recusada (RN-41) | U, E, B, M | U `files.test.ts` · E `academico.spec.ts`, `servicos.spec.ts` (Ficheiros) · B `0018_correcoes_v03.sql` | ✅ 🟢 | — |
| CT-017 | US-017 | Descarregar usa um link temporário; um ficheiro bloqueado por pagamento aparece mas não se descarrega (RN-14) | B, C, M | B `0007_blocos.sql`, `0012_ajustes.sql` (RN-14) · C `design/gallery.test.tsx` (bloqueada sem imagem) | 🟡 🟢 | **M9-05**: link expira (URL assinada de 15 min) e não abre noutra sessão |
| CT-018 | US-018 | Projeto concluído há 83 dias → aviso; "Adiar"; aos 90 dias apagados, fica o registo; o cliente vê "até quando" | U, B, E | U `retention.test.ts` · B `0008_retencao.sql` · E `tech.spec.ts` (T13, `CRON_SECRET`) | ✅ | Email do aviso: G3 |

### 4.5 Mensagens e avisos
| CT | US | Caso | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-019 | US-019 | Mensagem sobre uma fase fica guardada e ligada à fase; **fora do horário (08h–20h)** aparece "Entraremos em contacto assim que…" | E, M | E `tech.spec.ts`, `servicos.spec.ts` (Mensagens abre sem erros) | 🟡 ❌ | Mensagem por fase: M9-02. **Aviso fora do horário (RF-30.63) não está implementado: G1** |
| CT-020 | US-020 | Aprovação pendente há 2 dias → lembrete por email, sem dados sensíveis, com o link | — | — | ❌ | **Lembrete (RF-30.64) não está implementado: G2**; emails de evento: G3 |
| CT-021 | US-021 | 3 dias "a aguardar o cliente" depois do aceite → prazo 3 dias depois, com o motivo | U, C, B | U `countdown.test.ts` · C `academico/countdown.test.tsx` (prazo ajustado) · B `0013_prazo.sql` (24 h completas) | ✅ | — |

### 4.6 Académico
| CT | US | Caso | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-022 | US-022 | Admin preenche a ficha → o cliente vê-a em "Ver detalhes" | U, B, E | U `academic-brief.test.ts` · B `0009_ficha.sql` · E `academico.spec.ts` (ficha) | ✅ 🟢 | — |
| CT-023 | US-023 | Faltam 36 h → contagem em horas, "Prazo próximo"; depois do prazo, "Atrasada" | U, C, E | U `countdown.test.ts` · C `academico/countdown.test.tsx` (limites 4/3 dias, horas, meia-noite) · E `academico.spec.ts` | ✅ | — |
| CT-024 | US-024 | Pedir alterações ao índice → a fase 3 volta a "em curso"; "não aplicável" num trabalho curto | B, E, M | B `0011_aceite.sql` (índice) · E `academico.spec.ts` (aprovações) | ✅ 🟢 | — |
| CT-025 | US-025 | 3 de 5 capítulos → "3 de 5 capítulos" e %, sem o texto; sem capítulos, só o progresso | U, C, B, E | U `chapters.test.ts` · C `academico/chapters.test.tsx` · B `0010_capitulos.sql` · E `academico.spec.ts` | ✅ | — |
| CT-026 | US-026 | Finais carregados com o restante pendente → "falta pagar o restante" com o valor; pago → descarrega e começam os ajustes | B, M | B `0012_ajustes.sql` (RN-14) | ✅ 🟢 | M9-02: ver o aviso no cliente antes do pagamento |
| CT-027 | US-027 | Com 4 de 7 dias de ajustes, pedido com descrição e ficheiro → o admin responde com nova versão; depois do prazo, leva às mensagens | U, C, B, M | U `adjustments.test.ts` · C `academico/adjustments.test.tsx` · B `0012_ajustes.sql` | ✅ 🟢 | Ficheiro anexo ao pedido: M9-02 |
| CT-028 | US-028 | Prazo de ajustes terminado sem pedidos → concluído e começam os 90 dias | U, B | U `retention.test.ts` · B `0012_ajustes.sql`, `0008_retencao.sql` | ✅ | — |

### 4.7 Design
| CT | US | Caso | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-029 | US-029 | Convite digital sem impressão → ficha em "Ver detalhes da peça", Produção "não se aplica"; orçamento só com design (RN-44) | U, C, B, E | U `design-spec.test.ts` · C `design/spec.test.tsx` · B `0014_ficha_tecnica.sql`, `0017_orcamento_design.sql` · E `servicos.spec.ts` (ficha) | ✅ | M9-03: uma peça sem impressão de ponta a ponta |
| CT-030 | US-030 | A V2 em grande, miniatura comprimida, "Ronda 1 de 2" e a decisão num só painel | U, C, E, V | U `design-proofs.test.ts` · C `design/gallery.test.tsx`, `design/decision.test.tsx` · E `servicos.spec.ts` (galeria, layout) · V `design-visao-geral-*` | ✅ 🟢 | Prova SVG sem pré-visualização (L5) |
| CT-031 | US-031 | Comparar duas versões, uma por cima da outra no telemóvel, com a data e o pedido | U, C, E | U `design-proofs.test.ts` (par) · C `design/gallery.test.tsx` · E `servicos.spec.ts` (comparar) | ✅ | — |
| CT-032 | US-032 | Na ronda 1 de 2, pedir alterações → gasta 1 ronda, "Ronda 2 de 2"; o admin responde com a V seguinte | U, C, B, E, M | U `design-rounds.test.ts` · C `design/rounds.test.tsx`, `design/decision.test.tsx` · B `0007_blocos.sql` (`design_rounds`) · E `servicos.spec.ts` (rondas) | ✅ 🟢 | Imagem anexa ao pedido: M9-03 |
| CT-033 | US-033 | Rondas esgotadas → "Pedir revisão extra"; o admin regista o extra; só conta depois de aceite (RN-07, RN-36) | C, B, M | C `design/rounds.test.tsx`, `design/decision.test.tsx` · B `0007_blocos.sql` (extra acrescenta ronda) | ✅ | **M9-03**: extra de ponta a ponta em produção |
| CT-034 | US-034 | "Aprovar arte para produção" → aviso, nomes/data/quantidade, "Confirmo"; depois disso, sem botões, sem novas provas (RN-41, RN-42) | C, B, E, M | C `design/art-approval.test.tsx`, `design/art-lock.test.tsx` · B `0015_arte.sql`, `0018_correcoes_v03.sql` · E `servicos.spec.ts` (aprovar arte) | ✅ 🟢 | — |
| CT-035 | US-035 | Arte aprovada e restante pendente → "Pagar o restante"; pago → "a imprimir" → "pronto" (RN-15) | C, B, M | C `design/art-lock.test.tsx`, `design/pickup.test.tsx` · B `0016_producao.sql` | ✅ 🟢 | — |
| CT-036 | US-036 | Pronta → data e local em destaque, mapa, folga, ficheiros finais; "Marcar como entregue" conclui (recusado antes de "pronto") | U, C, B, E, M | U `design-spec.test.ts` (folga) · C `design/pickup.test.tsx` · B `0016_producao.sql` · E `servicos.spec.ts` (levantamento previsto) | ✅ 🟢 | Ficheiros digitais em produção: M9-03 |

### 4.8 Transversais (RNF e segurança)
| CT | Requisito | Caso | Nível | Automatizado em | Estado | Falta / onde |
|---|---|---|---|---|---|---|
| CT-101 | RNF-201 | 360 px sem scroll horizontal (portal e páginas públicas) | E | E `academico.spec.ts`, `servicos.spec.ts`, `publico.spec.ts` | ✅ | Tech a 360 px: M9-04 |
| CT-102 | RNF-204 | Contraste AA dos tokens do DS V1 | — | ADR-004 §5 (verificado à mão) | 🟢 | — |
| CT-103 | Segurança (M3-06) | Cliente A não lê nem escreve dados de B; históricos só de inserção; anon sem acesso | B | B `0090_rls.sql` (T1, T2, T6, T7, T10–T12) e RLS nos `00NN` | ✅ | **M9-05**: revisão completa (URLs assinadas, link mágico) |
| CT-104 | T13 | A limpeza diária recusa pedidos sem `CRON_SECRET` | E | E `tech.spec.ts` | ✅ | — |
| CT-105 | Páginas públicas | Serviços com 3 cartões; páginas Académico e Design sem preços, com WhatsApp; filtro do Portfólio | E, V | E `publico.spec.ts` · V `publico-*` | ✅ | — |
| CT-106 | #132 | Tempo de resposta das ações do admin | M | — | ⬜ | **M9-07** |

## 5. Como correr cada ciclo
| Quando | O quê | Critério para passar |
|---|---|---|
| **Cada PR** (CI) | typecheck, Vitest (U + C), Playwright (E), `db-test.sh` (B) | Tudo verde |
| **Antes do merge de uma mudança visual** | `npm run e2e:visual` (V) | 0 diferenças, ou capturas novas **aprovadas pelo João** |
| **Antes de aplicar migrações em produção** | `db-test.sh` verde + backup (RNF-604) | — |
| **Cada entrega (v0.x, v1.1)** | Ciclo M: um projeto novo de cada serviço alterado pelas 7 fases em produção (§3.3), com os ficheiros da §3.4 | 7 de 7 fases fechadas; os defeitos ficam nas notas da entrega, corrigidos ou como limitações |
| **M9-02 / M9-03** | Os casos ⬜, 🟡 e "Falta" do Académico (§4.6) e do Design (§4.7), mais os comuns que lhes dizem respeito | Cada CT com resultado registado no relatório (`docs/05-qa/relatorios/`) |
| **M9-04** | CT-008, capturas do Tech, Tech a 360 px | Sem diferenças além das aprovadas |
| **M9-05** | CT-002, CT-003, CT-017, CT-103 (revisão de segurança) | Sem acesso indevido |

## 6. Lacunas encontradas ao escrever o plano
| # | Lacuna | US / RF | Prioridade | Proposta |
|---|---|---|---|---|
| G1 | **Aviso fora do horário de atendimento** na página de mensagens não existe | US-019 / RF-30.63 (Should) | Should | **Decidido (Q-108): implementar já, antes da M9-02** (texto e horário já decididos: D-036, RN-51/52) |
| G2 | **Lembrete por email** de uma ação do cliente pendente há 2 dias não existe | US-020 / RF-30.64 (Should) | Should | **Decidido (Q-108): v1.2**, depois de o envio real dos emails funcionar (L1, G3) |
| G3 | **Envio real dos emails** (Resend) nunca foi testado de ponta a ponta; nos testes M os avisos vão desligados | US-013, US-018, US-020 / RF-30.35, RF-30.61, RF-30.62 | Should | Um ciclo com os avisos ligados para um email de teste, depois de definir `EMAIL_FROM` (L1) |
| G4 | **Seletor de projetos** (US-006) sem teste automático | US-006 | Must | E2E com um cliente de demonstração com 2 projetos, ou ciclo M na M9-03 |
| G5 | **"Concluir e avançar" não é atómico** (L4 da v0.3) | US-005 | Must | Avaliar na M9-02: verificar o travão antes de concluir a fase atual |
| G6 | **Envio de ficheiros pelo cliente** só testado nas funções puras; o envio no browser (progresso, recusa antes do envio) nunca foi automatizado | US-015 | Must | Ciclo M na M9-02 com os ficheiros da §3.4 |

## 7. Rastreabilidade
- As 36 US (US-001…US-036) têm um CT com o mesmo número (CT-001…CT-036). CT-014b e CT-101…CT-106 cobrem a concorrência e os RNF.
- Totais em 25/11: **30 de 36 US** com o comportamento principal automatizado (✅); 4 parciais (🟡: US-003, US-015, US-017 e US-019, esta também com o aviso fora do horário por implementar); 1 só manual (⬜: US-006); 1 por implementar (❌: US-020).
- Testes automáticos à data: 201 (U + C), 112 (E + V), SQL 0006…0018 + 0090 + T3.
