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
| Q-055 | 2026-11-24 | M2 | Uma fase concluída pode ser reaberta? | Sim, só pelo admin, com motivo | D-062, PA-002 |
| Q-056 | 2026-11-24 | M2 | Pode haver uma fase em curso antes de a anterior estar concluída? | Sim, sequência flexível | D-063, PA-002 |
| Q-057 | 2026-11-24 | M2 | O tempo em pausa desliza o prazo? | Sim, se a pausa for a pedido do cliente | D-064, PA-002 |
| Q-058 | 2026-11-24 | M2 | Um projeto entregue pode ser reaberto? | Sim, só pelo admin, com motivo | D-065, PA-002 |
| Q-059 | 2026-11-24 | M2 | Como evitar que a pré-visualização do WhatsApp gaste o link de uso único? | Página com botão "Entrar"; só o POST gasta o token | D-068, sequencia/sequencias.md L2 |
| Q-060 | 2026-11-24 | M2 | Com o link expirado, o cliente pede um novo sozinho? | Não, só pelo WhatsApp (RF-30.51 sem alterações) | sequencias.md L6 |
| Q-061 | 2026-11-24 | M2 | Como confirma o cliente a aprovação da arte? | Caixa "Confirmo" + botão | D-071, sequencias.md A1 |
| Q-062 | 2026-11-24 | M3 | Como se calcula a % de um projeto Académico ou Design? | Fases concluídas + parte das fases em curso, sem as "não aplicável" | D-072, ADR-001 |
| Q-063 | 2026-11-24 | M3 | Como encaixar as fases da BD no tipo atual? | Mesmo tipo `Phase`, com campos opcionais; `ProjectView` não muda | D-073, ADR-001 |
| Q-064 | 2026-11-24 | M3 | Posso testar o link mágico na produção com o cliente de teste? | Sim, só com o cliente de teste | ADR-002 (spike), D-076 |
| Q-065 | 2026-11-24 | M3 | Onde são geradas as miniaturas WebP? | No browser, antes do envio | D-082, ADR-003 |
| Q-066 | 2026-11-24 | M3 | Que agendador para a limpeza dos 90 dias e dos órfãos? | Vercel Cron diário | D-085, ADR-003 |
| Q-067 | 2026-11-24 | M3 | (Instrução do João) Em que se baseia o design? | No **Design System V1** (`docs/references/designer_system/Design System — GeniusFrela@2x.png`): mesma base e metodologia, só diversificar por módulo; todas as tarefas de design seguem esta imagem | PA-003, D-086, ADR-004 |
| Q-068 | 2026-11-24 | M3 | Como mostrar uma fase "Atrasada" (atraso da GeniusFrela)? | Cor do módulo + etiqueta "Atrasada" | D-088 |
| Q-069 | 2026-11-24 | M3 | Que entradas tem o menu de Académico e Design? | 4: Visão geral, Projeto, Ficheiros, Mensagens (o Tech mantém 5) | D-092, layout-blocos.md §3 |
| Q-070 | 2026-11-24 | M3 | Como se navega no telemóvel? | Barra inferior com ícones, nos 3 serviços | D-093 |
| Q-071 | 2026-11-24 | M3 | Como proteger as escritas do cliente (aprovar, pedir ajuste…)? | Funções SQL (RPC) + triggers | D-098, seguranca.md §3 |
| Q-072 | 2026-11-24 | M3 | R-01: o que fazer com o plano Hobby da Vercel (uso não comercial)? | Ficar no Hobby por agora | D-102, riscos.md R-01 |
| Q-073 | 2026-11-24 | M4 | Em que formato ficam os wireframes da M4? | HTML no repositório, com o DS V1 | D-107 |
| Q-074 | 2026-11-24 | M4 (G2) | Aprova a contagem do prazo como elemento principal e a barra de fases segmentada? | Sim | D-108 |
| Q-075 | 2026-11-24 | M4 (G2) | Aprova a moldura neutra da prova e a folha "sem rondas"? | Sim | D-109, D-110 |
| Q-076 | 2026-11-24 | M4 (G2) | Aprova os tons derivados da marca e o WhatsApp como botão principal no link e no admin? | Sim | D-111 |
| Q-077 | 2026-11-24 | M4 (G2) | Aprova os textos da regra do sinal, da irreversibilidade e da validade do link? | Sim | wireframes |
| Q-078 | 2026-11-24 | M4 (G2) | Aprova o design da v1.1? | Aprovado | actas/G2-design.md |
| Q-079 | 2026-11-24 | M4 (G2) | Faz o merge da M4 na main? | Sim | PRs #107…#112 |
| Q-080 | 2026-11-24 | M5 | Como fazer o backup antes da migração 0006, se o backup semanal nunca correu (faltam os segredos)? | Exportação local agora; o João define os segredos depois | D-118, R-08 |
| Q-081 | 2026-11-24 | M5 | Aprova o novo aspeto do portal (DS V1) e a troca das 12 capturas de referência? | Sim | D-125, `tests/e2e/__screenshots__/` |
| Q-082 | 2026-11-24 | M5 | Aprova a etiqueta do serviço no cabeçalho e o esqueleto do Académico (barra de fases + próximo passo)? | Sim | D-126, capturas de referência |
| Q-083 | 2026-11-24 | M5 | M5-08: onde ficam os controlos das fases, como vai o email ao cliente e o que faz "Avançar"? | Página `/admin/projetos/[id]/fases` + resumo e botão "Gerir fases" na página do projeto; caixa "Avisar o cliente" marcada por omissão; "Avançar" conclui a fase e inicia a seguinte por iniciar | D-129, D-130, `app/admin/projetos/[id]/fases/page.tsx` |
| Q-084 | 2026-11-24 | M5 | M5-09: fazer o ADR-003 todo neste PR? Onde o admin gere os ficheiros? Como cria as versões? | Dividir: miniaturas WebP e limpeza diária numa issue nova (criar só com confirmação); página `/admin/projetos/[id]/ficheiros` + botão "Ficheiros"; "Novo ficheiro" (título) ou "Nova versão de…" com V1, V2… automático | D-131…D-133, `lib/files/`, `components/files/` |
| Q-085 | 2026-11-24 | M5 | M5-10: pôr uma aprovação pendente no Académico de exemplo (muda a captura de referência)? Como confirma o cliente que aprovar é definitivo? | Sim, com o "Índice V3" pendente (captura atualizada e aprovada); segundo passo no próprio cartão ("Confirmar aprovação" / "Cancelar") | D-134…D-136, `app/cliente/_blocks/approvals.tsx`, `tests/e2e/__screenshots__/…/academico-visao-geral-*.png` |
Issue criada com confirmação do utilizador (2026-11-24): #122 [M5-09b] Gerar miniaturas WebP e limpar ficheiros diariamente (D-133), também em `scripts/tarefas.py` e no quadro #9.
| Q-086 | 2026-11-24 | M5 | M5-11: aprova a captura "Académico Visão geral" com o bloco Pagamentos (sinal pago, restante pendente)? | Sim (captura atualizada e aprovada) | D-137…D-139, `tests/e2e/__screenshots__/…/academico-visao-geral-*.png` |
| Q-087 | 2026-11-24 | M5 | M5-12: como abre o WhatsApp sem telefone na BD? Entrar pelo link obriga a definir senha? Onde fica o botão "Gerar link"? | `wa.me` sem número (o João escolhe o contacto); o link dispensa a senha obrigatória (`must_change_password = false`); secção "Acesso do cliente" na página do projeto | D-140…D-142 |
| Q-088 | 2026-11-24 | M5 | M5-12: testar o link mágico de ponta a ponta em produção, com o cliente de teste, criando um cliente e um projeto temporários? | Sim; criados, testados e apagados no fim (sem emails) | Prova no PR da M5-12 |
Teste real M5-12 (2026-11-24): app local com o `.env.local`, conta `cliente.teste@` do Auth; criados o cliente "Cliente de teste" e o projeto Académico `zz-teste-link-magico`; GET não gastou o token, POST entrou no projeto, `access_links` ficou `usado`, `must_change_password` passou a falso, 2.º uso → "Este link já não é válido". Projeto, cliente e links apagados no fim (verificado: 0 links restantes).
| Q-089 | 2026-11-24 | M5 | M5-13 (T9): pôr 1 KB de teste em `project-files` e `client-uploads` de produção para provar que não se lê sem URL assinada, e apagar logo? | Sim; testado e apagado (0 restantes) | `scripts/teste-storage-t9.mjs`, `docs/05-qa/relatorios/M5-13-rls.md` |
Consulta: Supabase MCP `get_advisors(security)` na M5-13 (2026-11-24) para o T15: 0 avisos de RLS em falta ou `search_path`; ficam 2 SECURITY DEFINER previstos e a *leaked password protection* (D-143).
| Q-090 | 2026-11-24 | M5 | M5-14: aprova a captura nova "Design Visão geral" e a do Login com as 3 contas de demonstração? | Sim (aprovadas depois de vistas) | D-145, `tests/e2e/__screenshots__/…/design-visao-geral-*.png`, `login-*.png` |
| Q-091 | 2026-11-24 | M5 | #122: a RN-08 diz "pode adiar" e o ADR-003 diz "sem adiamento"; como fica? A quem vai o aviso dos 83 dias? | Botão "Adiar 30 dias" (repetível, migração 0008 com `files_keep_until`); email diário ao João com a lista + faixa no projeto do admin | D-146, D-147, `supabase/migrations/0008_files_retention.sql` |
| Q-092 | 2026-11-24 | M5 | #122: aplicar a migração 0008 em produção pelo MCP? | Sim; aplicada (só acrescenta), 2 projetos intactos, consultas da limpeza verificadas só com leituras, Security Advisor sem avisos novos | D-147 |
| Q-093 | 2026-11-25 | M5 | M5-99: como fazer a demo "um projeto de cada serviço" (os previews da Vercel pedem login e não há Design em produção)? Marcar a v0.1.0 no GitHub? | Demo em produção com dados de teste (Cliente de teste M5 — Académico; Cliente de teste Design — Design, criado pelo painel; Tech dos clientes reais); tag `v0.1.0` + GitHub Release depois do merge das notas | `docs/06-entrega/releases/v0.1.0.md` |
| Q-094 | 2026-11-25 | M6 | M6-01: aprovar a captura do Académico com o bloco "Ficha do trabalho" e aplicar a migração 0009 em produção? | Sim aos dois; 0009 aplicada (tabela vazia, RLS, 3 políticas), Security Advisor sem avisos novos da tabela; o aviso `auth_otp_long_expiry` confirma o R-06 feito (aceite, D-078) | D-149, `supabase/migrations/0009_academic_briefs.sql` |
Issue criada com confirmação (2026-11-25): #132 [M9-07] Reduzir o tempo de resposta das páginas e ações do admin (limitação L3 da v0.1.0), também em `scripts/tarefas.py` e no quadro #9.
| Q-095 | 2026-11-25 | M6 | M6-02: aprovar a captura do Académico com a contagem do prazo (12 dias em destaque, âmbar, depois da barra de fases)? | Sim (vista e aprovada) | D-150, `tests/e2e/__screenshots__/…/academico-visao-geral-*.png` |
| Q-096 | 2026-11-25 | M6 | M6-03: aprovar a captura do Académico com o bloco "Capítulos" e aplicar a migração 0010 em produção? | Sim aos dois; 0010 aplicada (tabela vazia, RLS, 4 políticas, anon sem EXECUTE), Security Advisor sem avisos novos | D-151, `supabase/migrations/0010_academic_sections.sql` |
| Q-097 | 2026-11-25 | M6 | M6-04: travar na BD o início do trabalho sem orçamento aceite (RN-11)? Incluir já "substituir orçamento aceite com motivo"? Aplicar a 0011? | Travar na BD (migração 0011, aplicada); substituir um aceite fica para quando for preciso; retirar um enviado entra | D-152, `supabase/migrations/0011_quote_gate.sql` |
| Q-098 | 2026-11-25 | M6 | M6-06: como fica disponibilizada a entrega final? Como junta o cliente o ficheiro do pedido de ajuste? Até quando se pedem ajustes? Aplicar a 0012? | Botão "Disponibilizar entrega" (só com o restante pago); o ficheiro vai em "Ficheiros" com a fase Ajustes em curso (o pedido é só texto); até ao fim do último dia em Luanda; 0012 aplicada | D-154, `supabase/migrations/0012_adjustments.sql` |
| Q-099 | 2026-11-25 | M6 | M6-07: compor o Académico como o wireframe aprovado (Visão geral e página Projeto TEL-11)? Aprovar as capturas? | Tudo como o wireframe; capturas da Visão geral (computador e telemóvel) e da página Projeto (nova) aprovadas. Cor: fica o #E8B65A do ADR-004 (o #F59E0B da issue veio da D-004, substituída) | D-155 |

Skill usada: `lemos-engineer-01` (planeamento e backlog M0), 2026-11-23.
Consulta de documentação: Supabase (MCP `search_docs`) para os limites do plano gratuito — ficheiro ≤ 50 MB, OTP ≤ 86 400 s, SMTP próprio 30/h — na M1-06, 2026-11-23.
Permissão negada: `npx @mermaid-js/mermaid-cli` para gerar `docs/02-modelagem/img/mer-fases.png` (M2-01, 2026-11-23). A fonte `.mmd` fica no repositório.
Consulta de documentação: Supabase (MCP `search_docs`), fluxo SSR com `token_hash` + `verifyOtp` (M2-06, 2026-11-24). O retorno de `generateLink` (`hashed_token`) fica para o spike M3-02.
Spike M3-02 (2026-11-24): `docs/03-arquitetura/spikes/spike-link-magico.mjs` corrido na produção só com o cliente de teste; efeito lateral: o email do cliente de teste ficou confirmado (1.ª execução devolveu um link `signup`).
Skill usada: `frontend-design` na M4-03 (wireframe HTML do Académico), 2026-11-24.
