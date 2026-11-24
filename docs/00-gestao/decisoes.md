# Decisões
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Versão: 1.0 · Data: 2026-11-23

| ID | Data | Decisão | Origem | Alternativas | Estado |
|----|------|---------|--------|--------------|--------|
| D-001 | 2026-11-23 | Fases de Académico/Design guardadas no Supabase como dados por `service_type`; o Desenvolvimento mantém os milestones do GitHub | Q-001 | Tudo na BD, Tech incluído; fases fixas no código | Aprovada |
| D-002 | 2026-11-23 | Pagamentos, Aprovações, Ficheiros e Link mágico construídos uma vez (M5) e usados pelos 3 serviços | Q-002 | Só 3 blocos; nenhum | Aprovada |
| D-003 | 2026-11-23 | Ordem: fundação (M5) → Académico (M6) → Design (M7) | Q-003 | Design primeiro; em paralelo | Aprovada |
| D-004 | 2026-11-23 | Base visual atual mantida; `--accent`/`--accent-2` por serviço (Dev #22D3EE/#3B82F6 · Académico #F59E0B/#1E3A8A · Design #EC4899/#F97316) | Q-004 | Migrar para #0B0F1A/#7C3AED | Aprovada |
| D-005 | 2026-11-23 | Layout Tech mantém as 6 fases já implementadas (o documento lista 7); não se altera neste roteiro | Assumido | Passar o Tech para 7 fases | Aprovada no G1 (Q-036…Q-039) |
| D-006 | 2026-11-23 | M6 e M7 são fatias verticais por módulo (BD + admin + cliente), não "backend" e "web" separados | Assumido | Divisão por camada da metodologia | Assumida |
| D-007 | 2026-11-23 | Sem branch `develop`: o repositório já trabalha com `feature/*` → PR → `main` | Assumido (histórico de PRs #1–#10) | Criar `develop` | Assumida |
| D-008 | 2026-11-23 | As labels por omissão do GitHub (bug, enhancement…) mantêm-se; acrescentam-se as da metodologia + `modulo: *` | Assumido | Apagá-las | Assumida |
| D-009 | 2026-11-23 | Pagamentos só mostrados ao cliente; o admin regista sinal/restante/extra; sem gateway | Q-005 | Comprovativo enviado pelo cliente; pagamento online | Aprovada |
| D-010 | 2026-11-23 | O cliente carrega ficheiros de referência nas fases de briefing e revisão (limite de tamanho e tipos) | Q-006 | Só o admin envia | Aprovada |
| D-011 | 2026-11-23 | Link mágico partilhado manualmente (Copiar / wa.me) + email via Resend; sem WhatsApp Business API | Q-007 | WhatsApp API; só email do Supabase | Aprovada |
| D-012 | 2026-11-23 | Uma conta de cliente por projeto; vários utilizadores por projeto ficam fora de âmbito | Q-011 | Contas partilhadas / convidados | Aprovada |
| D-013 | 2026-11-23 | Académico: fase 3 só com aceite + sinal pago; ficheiros finais só com o restante pago (o admin marca como pago) | Q-012 | Pagar no fim; 100% adiantado | Aprovada |
| D-014 | 2026-11-23 | Fase "Estrutura" pode ser "não aplicável" e capítulos são opcionais (trabalhos curtos) | PER-05 | Capítulos obrigatórios | Aprovada no G1 (Q-036…Q-039) |
| D-015 | 2026-11-23 | Durante o desenvolvimento o cliente vê só o estado dos capítulos, sem ficheiros | Q-013 | Pré-visualização por capítulo | Aprovada |
| D-016 | 2026-11-23 | Ajustes: N dias após a entrega (por omissão 7, editável por projeto); conclusão automática no fim sem pedidos abertos | Q-014 | Até à data da instituição; nº de pedidos | Aprovada (omissão 7 e conclusão automática assumidas) |
| D-017 | 2026-11-23 | Design: rondas incluídas definidas por projeto (por omissão 2); esgotadas, o cliente pede uma ronda extra com valor registado como extra | Q-016 | Bloquear; 2 rondas fixas | Aprovada |
| D-018 | 2026-11-23 | Design: sinal (por omissão 50%) antes do conceito; restante pago antes da produção | Q-017 | No levantamento; antes dos ficheiros finais | Aprovada; valores assumidos confirmados no G1 (Q-039) |
| D-019 | 2026-11-23 | Design: um projeto por peça; várias peças do mesmo evento são projetos separados no seletor | Q-018 | Um projeto com várias peças | Aprovada |
| D-020 | 2026-11-23 | Design: a ficha técnica indica se há impressão e ficheiros digitais; sem impressão, a fase 6 fica "não aplicável" | Q-019 | Sempre PDF+PNG; só peça física | Aprovada (salto da fase 6 assumido) |
| D-021 | 2026-11-23 | O aviso de irreversibilidade repete os textos-chave da ficha (nomes, data, quantidade) antes de aprovar a arte | Personas (Implicações) | Só o aviso genérico | Aprovada no G1 (Q-036…Q-039) |
| D-022 | 2026-11-23 | Só o admin reabre uma aprovação de arte, com motivo obrigatório no histórico | PER-01 (permissões) | Irreversível sem exceção | Aprovada no G1 (Q-036…Q-039) |
| D-023 | 2026-11-23 | Link mágico de uso único, válido 24 h; ao entrar o cliente fica com sessão longa e a senha é opcional; o admin pode criar clientes sem senha | Q-020 | 1 h; senha obrigatória | Aprovada |
| D-024 | 2026-11-23 | Uploads do cliente: JPG, PNG, WebP, HEIC, PDF, DOC, DOCX; até 10 MB por ficheiro e 10 por fase | Q-021 | 25 MB + ZIP; 5 MB só imagens/PDF | Aprovada; valores assumidos confirmados no G1 (Q-039) |
| D-025 | 2026-11-23 | Ficheiros apagados do Storage 90 dias após a conclusão (fica o registo); o admin é avisado 7 dias antes e pode adiar | Q-022 | Para sempre; manual | Aprovada; valores assumidos confirmados no G1 (Q-039) |
| D-026 | 2026-11-23 | Pagamentos com valor em Kz, data limite opcional e estado pendente / pago / em atraso (automático, fuso Africa/Luanda) | Q-023 | Só pendente/pago; com comprovativo | Aprovada |
| D-027 | 2026-11-23 | Num projeto concluído, o cliente vê até quando pode descarregar os ficheiros | D-025 | Não mostrar | Assumida |
| D-028 | 2026-11-23 | Meta de desempenho: LCP ≤ 2,5 s em 4G (Lighthouse mobile ≥ 80) e primeira vista ≤ 500 KB | Q-024 | 3G ≤ 4 s; sem meta | Aprovada |
| D-029 | 2026-11-23 | Melhor esforço no plano gratuito; passar a pago com Storage/BD ≥ 80%, 10 projetos ativos ou 1.º incidente > 24 h | Q-025 | Sempre grátis; 99,5% | Aprovada; valores assumidos confirmados no G1 (Q-039) |
| D-030 | 2026-11-23 | Política de privacidade (Lei 22/11), nada de clientes no portfólio sem autorização escrita, eliminação a pedido em ≤ 30 dias; emails sem dados sensíveis | Q-026 | Só a política; nada | Aprovada; valores assumidos confirmados no G1 (Q-039) |
| D-031 | 2026-11-23 | Backup da BD semanal (RPO 7 dias); Storage sem backup, originais guardados pelo admin | Q-027 | BD diária; BD + ficheiros | Aprovada |
| D-032 | 2026-11-23 | Limite de 5 links mágicos por cliente por hora e URLs assinadas com validade ≤ 1 h | Assumido | Sem limite; URLs de 24 h | Aprovada no G1 (Q-039) |
| D-033 | 2026-11-23 | O sinal não é reembolsável; o projeto cancelado fica registado e a regra é mostrada antes do aceite | Q-028 | Reembolso parcial; caso a caso | Aprovada |
| D-034 | 2026-11-23 | O tempo "a aguardar o cliente" desliza o prazo; lembrete ao cliente após 2 dias | Q-029 | Prazo fixo; ajuste manual | Aprovada |
| D-035 | 2026-11-23 | Ajuste/revisão incluído = cumprir a ficha; mudar tema, páginas, peça, medidas ou conceito = trabalho novo | Q-030 | Tudo incluído; admin decide | Aprovada |
| D-036 | 2026-11-23 | Atendimento todos os dias, 08h00–20h00; fora de horas, aviso "Entraremos em contacto assim que o horário de abertura estiver disponível." (substitui seg–sex 18h–21h) | Q-031 | — | Aprovada; valores assumidos confirmados no G1 (Q-039) |
| D-037 | 2026-11-23 | Reabrir uma arte aprovada só antes de a produção começar | Assumido | Reabrir em qualquer momento | Aprovada no G1 (Q-036…Q-039) |
| D-038 | 2026-11-23 | Must = o piloto não termina sem isto, ou há risco de segurança ou de dinheiro; 12 RF passam de Must a Should (94 → 83 Must) | Q-032 | Manter; só o caminho feliz | Aprovada |
| D-039 | 2026-11-23 | Todos os emails de aviso ao cliente e ao admin, incluindo o lembrete de 2 dias e o envio do link por email, são Should | Q-033 | Must; só os do admin | Aprovada |
| D-040 | 2026-11-23 | Páginas públicas dos serviços Académico e Design ficam Should | Q-034 | Must; Won't | Aprovada |
| D-041 | 2026-11-23 | 36 user stories, uma por passo do fluxo, geradas com a rastreabilidade por `scripts/gerar_us.py` | Q-035 | Uma por RF; só fluxos críticos | Aprovada |
| D-042 | 2026-11-23 | `project_phases` copia nome, ordem, descrição e flags do modelo e guarda a ligação (`template_id`, on delete set null) | Q-042 | Referência viva ao modelo | Aprovada |
| D-043 | 2026-11-23 | Histórico em `phase_events` (só inserção); dias de espera e prazo ajustado calculados a partir dele | Q-043 | Contadores na fase | Aprovada |
| D-044 | 2026-11-23 | Prazo principal em `projects.due_on` (nunca reescrito); `project_phases.due_on` opcional | Q-044 | Só o projeto; todas as fases | Aprovada |
| D-045 | 2026-11-23 | As fases são copiadas por trigger `after insert on projects`, na mesma transação | Q-045 | Server Action do admin | Aprovada |
| D-046 | 2026-11-23 | "Atrasada" automática é calculada na leitura (due_on ultrapassado) sem mudar a linha; o admin também pode gravar `atrasada` | Assumido | Job diário que grava o estado | Assumida |
| D-047 | 2026-11-23 | `projects.status` ganha `cancelado`; `completed_at` e `cancelled_at` preenchidos por trigger | RF-30.06, RN-08 | Tabela de estados do projeto | Assumida |
| D-048 | 2026-11-24 | Ficheiros em `deliverables` (uma versão: papel, série, nº, bloqueio por pagamento) + `files` (1..N por versão) no bucket privado `project-files` | Q-046 | Tabela única com série e versão | Aprovada |
| D-049 | 2026-11-24 | Um pedido de aprovação por versão, com `snapshot` imutável; `approval_responses` só de inserção (aprovar, pedir alterações, reabrir) | Q-047 | Uma aprovação reutilizada por objeto | Aprovada |
| D-050 | 2026-11-24 | Orçamento em `quotes` (versões; total, design, impressão, % e valor do sinal, prazo, rondas); ao aceitar gera sinal e restante | Q-048 | Só pagamentos; colunas em `projects` | Aprovada |
| D-051 | 2026-11-24 | Auditoria em `activity_log` genérico (antes/depois em JSON), só de inserção e só lido pelo admin | Q-049 | Tabelas de eventos por bloco | Aprovada |
| D-052 | 2026-11-24 | `payments.gates_phase_id`: um trigger recusa pôr a fase em curso enquanto o pagamento não estiver pago | RN-11, RN-15 | Só verificação na aplicação | Assumida |
| D-053 | 2026-11-24 | "Em atraso" e as rondas restantes são calculados na leitura, não gravados | D-046, RF-20.41 | Gravar por job / contador | Assumida |
| D-054 | 2026-11-24 | O admin pode enviar também AI, PSD e ZIP até 50 MB (ficheiros finais); os limites de D-024 são só do cliente | RNF-503 | Mesmos limites do cliente | Assumida |
| D-055 | 2026-11-24 | Fichas em tabelas próprias 1:1 por serviço (`academic_briefs`, `design_specs`), não em `projects.spec jsonb` | Q-050 | `spec jsonb` validado | Aprovada |
| D-056 | 2026-11-24 | Pedidos de ajuste em `adjustment_requests` (aberto, resolvido, recusado), com ligação à versão que resolveu | Q-051 | Mensagens com etiqueta | Aprovada |
| D-057 | 2026-11-24 | Textos-chave do Design como lista livre rótulo + valor (`key_texts jsonb`, até 20) | Q-052 | Colunas fixas | Aprovada |
| D-058 | 2026-11-24 | `academic_sections` guarda o índice atual; cada versão enviada fica no `snapshot` da aprovação | Q-053 | Tabela de versões do índice | Aprovada |
| D-059 | 2026-11-24 | O projeto Académico conclui-se por job diário no fim do prazo de ajustes sem pedidos abertos | RN-34 | Conclusão manual | Assumida |
| D-060 | 2026-11-24 | Sem tabela `design_proofs`: provas = `deliverables` `prova`; rondas = respostas `pedir_alteracoes`; incluídas = `quotes.rounds_included` | D-048, D-049, D-050 | Tabela própria de provas | Assumida |
| D-061 | 2026-11-24 | A fase `ajustes` do Académico aceita anexos do cliente (`client_can_upload = true`) | RF-10.71, PA-001, Q-054 | Anexos só nas mensagens | Aprovada (PA-001) |
| D-062 | 2026-11-24 | Fase `concluida → em_curso` só pelo admin, com motivo; as outras fases não mudam | Q-055 | Concluída é final | Aprovada (PA-002) |
| D-063 | 2026-11-24 | Sequência de fases flexível: várias em curso; fase atual = primeira por concluir | Q-056 | Só a fase atual em curso | Aprovada (PA-002) |
| D-064 | 2026-11-24 | Pausa a pedido do cliente (`client_requested = true`) desliza o prazo; pausa da GeniusFrela não | Q-057 | Sempre; nunca | Aprovada (PA-002) |
| D-065 | 2026-11-24 | Projeto `entregue → ativo` só pelo admin, com motivo; limpa `completed_at`; `cancelado` é final | Q-058 | Entregue é final | Aprovada (PA-002) |
| D-066 | 2026-11-24 | Nova tabela `project_status_events` (só inserção, lida pelo cliente) para os intervalos de pausa e as reaberturas | D-064, D-065 | Usar o `activity_log` (só admin) | Assumida |
| D-067 | 2026-11-24 | O link mágico aponta para `/cliente/entrar?t=…`; o servidor troca o `token_hash` por sessão com `verifyOtp` | Docs Supabase (SSR) | URL de verificação do Supabase | Assumida — confirmar no spike M3-02 |
| D-068 | 2026-11-24 | GET mostra a página com o botão "Entrar"; só o POST gasta o token | Q-059 | Entrada automática | Aprovada |
| D-069 | 2026-11-24 | `access_links` guarda só o SHA-256 do token; um link novo substitui os anteriores | RF-30.57, RNF-306 | Guardar o token | Assumida |
| D-070 | 2026-11-24 | Clientes criados só com link mágico ficam com `must_change_password = false` | D-023 | Pedir senha no 1.º acesso | Assumida |
| D-071 | 2026-11-24 | Aprovação da arte: caixa "Confirmo que os nomes, a data e a quantidade estão certos" ativa o botão | Q-061 | Só o botão; escrever APROVO | Aprovada |
