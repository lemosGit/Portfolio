# Registo de perguntas
> Projeto: GeniusFrela — Área do Cliente multi-serviço (módulos Académico e Design) · Versão: 1.0 · Data: 2026-11-23
> Fonte: `docs/references/1/GeniusFrela_Projeto_e_Layouts.md`

| ID | Data | Fase | Pergunta | Resposta | Impacto (artefactos) |
|----|------|------|----------|----------|----------------------|
| Q-001 | 2026-11-23 | M1/M3 | Académico e Design não têm repositório GitHub: onde ficam as fases? | No Supabase (`phase_templates` + `project_phases`), editadas no admin. O Tech continua a ler do GitHub. | D-001, M2-01, M3-01, M5-02, M5-03 |
| Q-002 | 2026-11-23 | M1 | Pagamentos, Aprovações, Ficheiros e Link mágico entram no roteiro? | Sim, como fundação partilhada pelos 3 serviços | D-002, milestone M5 |
| Q-003 | 2026-11-23 | M1 | Que módulo sai primeiro? | Académico primeiro | D-003, M6 antes de M7 |
| Q-004 | 2026-11-23 | M4 | Paleta do documento (#0B0F1A/#7C3AED) ou design system atual? | Manter a base atual (ameixa + lavanda), só acentos por serviço | D-004, M3-04, M4-06, M5-04 |
| Q-005 | 2026-11-23 | M1 | O que faz o bloco Pagamentos (a spec v1.2 punha-os fora de âmbito)? | Só mostrar; registo manual pelo admin, pagamento fora do portal | D-009, M5-11, visao-modulos.md §5.1 |
| Q-006 | 2026-11-23 | M1 | O cliente pode enviar ficheiros no briefing e na revisão? | Sim, nas fases de briefing e revisão | D-010, M5-09, M3-03 |
| Q-007 | 2026-11-23 | M1 | Como chega o link mágico ao cliente? | O admin copia ou usa "Abrir no WhatsApp" (wa.me), e há envio opcional por email (Resend) | D-011, M3-02, M5-12 |
| Q-008 | 2026-11-23 | M1 | Quem é o cliente típico do Académico? | Ambos, sobretudo universitário | PER-03 (principal), PER-05 (secundária) |
| Q-009 | 2026-11-23 | M1 | Quem é o cliente típico do Design? | Particular com evento | PER-04 |
| Q-010 | 2026-11-23 | M1 | Que dispositivo e rede usam? | Telemóvel Android com dados móveis | M1-06, M7-02, M4 |
| Q-011 | 2026-11-23 | M1 | Quem aprova e paga é quem acompanha? | Normalmente sim | D-012 |
| Q-012 | 2026-11-23 | M1 | Académico: quando começa o trabalho? | Com o sinal pago (ex.: 50%); o restante antes da entrega final | D-013, RF-10.20/23/61 |
| Q-013 | 2026-11-23 | M1 | O cliente vê os capítulos à medida que ficam prontos? | Só o estado; o ficheiro só no fim | D-015, RF-10.42 |
| Q-014 | 2026-11-23 | M1 | Como funcionam os ajustes? | Um prazo de dias após a entrega, definido por projeto | D-016, RF-10.64/70–74 |
| Q-015 | 2026-11-23 | M1 | Formato da entrega final? | PDF e Word | RF-10.60 |
| Q-016 | 2026-11-23 | M1 | Design: quantas rondas de revisão estão incluídas e o que acontece quando acabam? | Nº definido por projeto (por omissão 2); depois, ronda extra paga | D-017, RF-20.20/40–43 |
| Q-017 | 2026-11-23 | M1 | Design: quando é pago o restante? | Antes da produção | D-018, RF-20.23/60 |
| Q-018 | 2026-11-23 | M1 | Design: um evento com várias peças é um projeto ou vários? | Um projeto por peça | D-019, RF-20 (âmbito) |
| Q-019 | 2026-11-23 | M1 | Design: que ficheiros finais recebe o cliente? | Depende da peça (indicado na ficha técnica) | D-020, RF-20.11/62/71 |
| Q-020 | 2026-11-23 | M1 | Quanto tempo vale o link mágico e é preciso senha depois? | 24 h, uso único; sessão longa, senha opcional | D-023, RF-30.51/53/56, M3-02, M5-12 |
| Q-021 | 2026-11-23 | M1 | Que limites para os ficheiros enviados pelo cliente? | 10 MB; imagens (JPG/PNG/WebP/HEIC), PDF, Word; 10 por fase | D-024, RF-30.42, M3-03, M5-09 |
| Q-022 | 2026-11-23 | M1 | Quanto tempo ficam guardados os ficheiros de um projeto concluído? | 90 dias, depois são apagados (fica o registo) | D-025, RF-30.47/48 |
| Q-023 | 2026-11-23 | M1 | Que estados tem cada pagamento? | Pendente / pago / em atraso, com data limite opcional | D-026, RF-30.20/21 |
| Q-024 | 2026-11-23 | M1 | Que meta de desempenho no telemóvel com dados móveis? | LCP ≤ 2,5 s em 4G (Lighthouse ≥ 80); 1.ª vista ≤ 500 KB | D-028, RNF-101/102 |
| Q-025 | 2026-11-23 | M1 | Que nível de serviço com o plano gratuito? | Melhor esforço, com gatilhos para passar a plano pago | D-029, RNF-501…505 |
| Q-026 | 2026-11-23 | M1 | O que se exige para a privacidade dos clientes? | Política de privacidade (Lei 22/11), confidencialidade no portfólio e eliminação a pedido | D-030, RNF-401…405 |
| Q-027 | 2026-11-23 | M1 | Os ficheiros também precisam de backup? | Não; a BD continua com backup semanal, como hoje | D-031, RNF-601…603 |
| Q-028 | 2026-11-23 | M1 | Se o cliente desistir depois de pagar o sinal, o que acontece ao sinal? | Não é reembolsável | D-033, RN-13 |
| Q-029 | 2026-11-23 | M1 | Se uma ação fica parada do lado do cliente, o prazo muda? | O prazo desliza os mesmos dias e o cliente recebe lembrete | D-034, RN-21…23 |
| Q-030 | 2026-11-23 | M1 | O que conta como ajuste incluído e o que é trabalho novo? | O que cumpre a ficha está incluído; mudar tema, páginas, peça ou conceito é trabalho novo (extra) | D-035, RN-31/32 |
| Q-031 | 2026-11-23 | M1 | Qual é o horário de atendimento e o que vê quem escreve fora dele? | Das 08h00 às 20h00, também aos fins de semana; fora de horas: "Entraremos em contacto assim que o horário de abertura estiver disponível." | D-036, RN-51/52, personas.md (PER-01) |
| Q-032 | 2026-11-23 | M1 | Que critério define um Must na v1.1? | Só o que o piloto precisa para terminar, ou o que tem risco de segurança ou dinheiro | D-038, priorizacao-moscow.md |
| Q-033 | 2026-11-23 | M1 | Que prioridade têm os emails de aviso? | Should | D-039 |
| Q-034 | 2026-11-23 | M1 | As páginas públicas do Académico e do Design entram na v1.1? | Should | D-040, #61, #71 |
| Q-035 | 2026-11-23 | M1 | Com que detalhe se escrevem as user stories? | Uma por passo do fluxo | D-041, user-stories.md |
| Q-036 | 2026-11-23 | M1 (G1) | D-005: o Desenvolvimento passa a 7 fases? | Não, mantém as 6 | D-005, actas/G1-requisitos.md |
| Q-037 | 2026-11-23 | M1 (G1) | Confirma D-021, D-022 e D-037 (aprovação e reabertura da arte)? | Sim, as três | D-021, D-022, D-037 |
| Q-038 | 2026-11-23 | M1 (G1) | Confirma D-014 (estrutura não aplicável, capítulos opcionais)? | Sim | D-014 |
| Q-039 | 2026-11-23 | M1 (G1) | Confirma os valores assumidos (50%, 10 por fase, 7 dias, gatilhos, 30 dias, horário ao fim de semana, 5 links/h)? | Sim, todos | D-018, D-024, D-025, D-029, D-030, D-032, D-036 |
| Q-040 | 2026-11-23 | M1 (G1) | Aprova os requisitos da v1.1? | Aprovado | actas/G1-requisitos.md |
| Q-041 | 2026-11-23 | M1 (G1) | Como integrar os PRs da M1 na main? | Merge em cadeia pelo Claude, com confirmação antes de executar | PRs #84…#92 |
| Q-042 | 2026-11-23 | M2 | Mudar o modelo de fases afeta os projetos existentes? | Não: cada projeto guarda uma cópia, ligada ao modelo | D-042, mer/fases-servicos.md §3.3 |
| Q-043 | 2026-11-23 | M2 | Como guardar as mudanças de estado das fases? | Tabela de eventos `phase_events` | D-043, §3.4, §6 |
| Q-044 | 2026-11-23 | M2 | Cada fase tem data-limite? | Só o projeto tem prazo; cada fase pode ter uma data opcional | D-044, §3.3 |
| Q-045 | 2026-11-23 | M2 | Quem cria as fases de um projeto novo? | A base de dados, por trigger | D-045, §5 (B1) |
| Q-046 | 2026-11-24 | M2 | Como modelar versões com vários ficheiros (prova com várias imagens, PDF + Word)? | Entregável (versão) com N ficheiros | D-048, mer/blocos-comuns.md §3.5–3.6 |
| Q-047 | 2026-11-24 | M2 | Como guardar o que o cliente aprovou? | Um pedido por versão com cópia fixa (snapshot); respostas numa tabela própria | D-049, §3.3–3.4 |
| Q-048 | 2026-11-24 | M2 | Onde fica o orçamento? | Tabela `quotes`, que ao ser aceite gera o sinal e o restante | D-050, §3.1 |
| Q-049 | 2026-11-24 | M2 | Como fazer a auditoria de pagamentos, orçamentos e ficheiros? | Log genérico `activity_log` preenchido por triggers | D-051, §3.7 |
| Q-050 | 2026-11-24 | M2 | Onde ficam as fichas de cada serviço? | Uma tabela por serviço, 1:1 com o projeto | D-055, mer/fichas-servico.md |
| Q-051 | 2026-11-24 | M2 | Onde ficam os pedidos de ajuste? | Tabela `adjustment_requests` | D-056 |
| Q-052 | 2026-11-24 | M2 | Textos-chave do Design: campos fixos ou lista? | Lista livre rótulo + valor | D-057 |
| Q-053 | 2026-11-24 | M2 | É preciso guardar cada versão do índice? | Não: lista atual + cópia no snapshot da aprovação | D-058 |
| Q-054 | 2026-11-24 | M2 | PA-001: o cliente pode anexar ficheiros ao pedido de ajuste? | Sim (RF-30.41 e RN-09 atualizados) | PA-001, D-061 |

Skill usada: `lemos-engineer-01` (planeamento e backlog M0), 2026-11-23.
Consulta de documentação: Supabase (MCP `search_docs`) para os limites do plano gratuito — ficheiro ≤ 50 MB, OTP ≤ 86 400 s, SMTP próprio 30/h — na M1-06, 2026-11-23.
Permissão negada: `npx @mermaid-js/mermaid-cli` para gerar `docs/02-modelagem/img/mer-fases.png` (M2-01, 2026-11-23). A fonte `.mmd` fica no repositório.
