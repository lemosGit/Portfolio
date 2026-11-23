# Decisões
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Versão: 1.0 · Data: 2026-11-23

| ID | Data | Decisão | Origem | Alternativas | Estado |
|----|------|---------|--------|--------------|--------|
| D-001 | 2026-11-23 | Fases de Académico/Design guardadas no Supabase como dados por `service_type`; o Desenvolvimento mantém os milestones do GitHub | Q-001 | Tudo na BD, Tech incluído; fases fixas no código | Aprovada |
| D-002 | 2026-11-23 | Pagamentos, Aprovações, Ficheiros e Link mágico construídos uma vez (M5) e usados pelos 3 serviços | Q-002 | Só 3 blocos; nenhum | Aprovada |
| D-003 | 2026-11-23 | Ordem: fundação (M5) → Académico (M6) → Design (M7) | Q-003 | Design primeiro; em paralelo | Aprovada |
| D-004 | 2026-11-23 | Base visual atual mantida; `--accent`/`--accent-2` por serviço (Dev #22D3EE/#3B82F6 · Académico #F59E0B/#1E3A8A · Design #EC4899/#F97316) | Q-004 | Migrar para #0B0F1A/#7C3AED | Aprovada |
| D-005 | 2026-11-23 | Layout Tech mantém as 6 fases já implementadas (o documento lista 7); não se altera neste roteiro | Assumido | Passar o Tech para 7 fases | Assumida — confirmar no G1 |
| D-006 | 2026-11-23 | M6 e M7 são fatias verticais por módulo (BD + admin + cliente), não "backend" e "web" separados | Assumido | Divisão por camada da metodologia | Assumida |
| D-007 | 2026-11-23 | Sem branch `develop`: o repositório já trabalha com `feature/*` → PR → `main` | Assumido (histórico de PRs #1–#10) | Criar `develop` | Assumida |
| D-008 | 2026-11-23 | As labels por omissão do GitHub (bug, enhancement…) mantêm-se; acrescentam-se as da metodologia + `modulo: *` | Assumido | Apagá-las | Assumida |
| D-009 | 2026-11-23 | Pagamentos só mostrados ao cliente; o admin regista sinal/restante/extra; sem gateway | Q-005 | Comprovativo enviado pelo cliente; pagamento online | Aprovada |
| D-010 | 2026-11-23 | O cliente carrega ficheiros de referência nas fases de briefing e revisão (limite de tamanho e tipos) | Q-006 | Só o admin envia | Aprovada |
| D-011 | 2026-11-23 | Link mágico partilhado manualmente (Copiar / wa.me) + email via Resend; sem WhatsApp Business API | Q-007 | WhatsApp API; só email do Supabase | Aprovada |
| D-012 | 2026-11-23 | Uma conta de cliente por projeto; vários utilizadores por projeto ficam fora de âmbito | Q-011 | Contas partilhadas / convidados | Aprovada |
| D-013 | 2026-11-23 | Académico: fase 3 só com aceite + sinal pago; ficheiros finais só com o restante pago (o admin marca como pago) | Q-012 | Pagar no fim; 100% adiantado | Aprovada |
| D-014 | 2026-11-23 | Fase "Estrutura" pode ser "não aplicável" e capítulos são opcionais (trabalhos curtos) | PER-05 | Capítulos obrigatórios | Assumida — confirmar no G1 |
| D-015 | 2026-11-23 | Durante o desenvolvimento o cliente vê só o estado dos capítulos, sem ficheiros | Q-013 | Pré-visualização por capítulo | Aprovada |
| D-016 | 2026-11-23 | Ajustes: N dias após a entrega (por omissão 7, editável por projeto); conclusão automática no fim sem pedidos abertos | Q-014 | Até à data da instituição; nº de pedidos | Aprovada (omissão 7 e conclusão automática assumidas) |
| D-017 | 2026-11-23 | Design: rondas incluídas definidas por projeto (por omissão 2); esgotadas, o cliente pede uma ronda extra com valor registado como extra | Q-016 | Bloquear; 2 rondas fixas | Aprovada |
| D-018 | 2026-11-23 | Design: sinal (por omissão 50%) antes do conceito; restante pago antes da produção | Q-017 | No levantamento; antes dos ficheiros finais | Aprovada (sinal de 50% assumido como no Académico) |
| D-019 | 2026-11-23 | Design: um projeto por peça; várias peças do mesmo evento são projetos separados no seletor | Q-018 | Um projeto com várias peças | Aprovada |
| D-020 | 2026-11-23 | Design: a ficha técnica indica se há impressão e ficheiros digitais; sem impressão, a fase 6 fica "não aplicável" | Q-019 | Sempre PDF+PNG; só peça física | Aprovada (salto da fase 6 assumido) |
| D-021 | 2026-11-23 | O aviso de irreversibilidade repete os textos-chave da ficha (nomes, data, quantidade) antes de aprovar a arte | Personas (Implicações) | Só o aviso genérico | Assumida — confirmar no G1 |
| D-022 | 2026-11-23 | Só o admin reabre uma aprovação de arte, com motivo obrigatório no histórico | PER-01 (permissões) | Irreversível sem exceção | Assumida — confirmar no G1 |
| D-023 | 2026-11-23 | Link mágico de uso único, válido 24 h; ao entrar o cliente fica com sessão longa e a senha é opcional; o admin pode criar clientes sem senha | Q-020 | 1 h; senha obrigatória | Aprovada |
| D-024 | 2026-11-23 | Uploads do cliente: JPG, PNG, WebP, HEIC, PDF, DOC, DOCX; até 10 MB por ficheiro e 10 por fase | Q-021 | 25 MB + ZIP; 5 MB só imagens/PDF | Aprovada (limite de 10 por fase assumido) |
| D-025 | 2026-11-23 | Ficheiros apagados do Storage 90 dias após a conclusão (fica o registo); o admin é avisado 7 dias antes e pode adiar | Q-022 | Para sempre; manual | Aprovada (aviso e adiamento assumidos) |
| D-026 | 2026-11-23 | Pagamentos com valor em Kz, data limite opcional e estado pendente / pago / em atraso (automático, fuso Africa/Luanda) | Q-023 | Só pendente/pago; com comprovativo | Aprovada |
| D-027 | 2026-11-23 | Num projeto concluído, o cliente vê até quando pode descarregar os ficheiros | D-025 | Não mostrar | Assumida |
| D-028 | 2026-11-23 | Meta de desempenho: LCP ≤ 2,5 s em 4G (Lighthouse mobile ≥ 80) e primeira vista ≤ 500 KB | Q-024 | 3G ≤ 4 s; sem meta | Aprovada |
| D-029 | 2026-11-23 | Melhor esforço no plano gratuito; passar a pago com Storage/BD ≥ 80%, 10 projetos ativos ou 1.º incidente > 24 h | Q-025 | Sempre grátis; 99,5% | Aprovada (valores dos gatilhos assumidos) |
| D-030 | 2026-11-23 | Política de privacidade (Lei 22/11), nada de clientes no portfólio sem autorização escrita, eliminação a pedido em ≤ 30 dias; emails sem dados sensíveis | Q-026 | Só a política; nada | Aprovada (prazo de 30 dias e regra dos emails assumidos) |
| D-031 | 2026-11-23 | Backup da BD semanal (RPO 7 dias); Storage sem backup, originais guardados pelo admin | Q-027 | BD diária; BD + ficheiros | Aprovada |
| D-032 | 2026-11-23 | Limite de 5 links mágicos por cliente por hora e URLs assinadas com validade ≤ 1 h | Assumido | Sem limite; URLs de 24 h | Assumida |
| D-033 | 2026-11-23 | O sinal não é reembolsável; o projeto cancelado fica registado e a regra é mostrada antes do aceite | Q-028 | Reembolso parcial; caso a caso | Aprovada |
| D-034 | 2026-11-23 | O tempo "a aguardar o cliente" desliza o prazo; lembrete ao cliente após 2 dias | Q-029 | Prazo fixo; ajuste manual | Aprovada |
| D-035 | 2026-11-23 | Ajuste/revisão incluído = cumprir a ficha; mudar tema, páginas, peça, medidas ou conceito = trabalho novo | Q-030 | Tudo incluído; admin decide | Aprovada |
| D-036 | 2026-11-23 | Atendimento todos os dias, 08h00–20h00; fora de horas, aviso "Entraremos em contacto assim que o horário de abertura estiver disponível." (substitui seg–sex 18h–21h) | Q-031 | — | Aprovada (mesmo horário ao fim de semana assumido) |
| D-037 | 2026-11-23 | Reabrir uma arte aprovada só antes de a produção começar | Assumido | Reabrir em qualquer momento | Assumida — confirmar no G1 |
| D-038 | 2026-11-23 | Must = o piloto não termina sem isto, ou há risco de segurança ou de dinheiro; 12 RF passam de Must a Should (94 → 83 Must) | Q-032 | Manter; só o caminho feliz | Aprovada |
| D-039 | 2026-11-23 | Todos os emails de aviso ao cliente e ao admin, incluindo o lembrete de 2 dias e o envio do link por email, são Should | Q-033 | Must; só os do admin | Aprovada |
| D-040 | 2026-11-23 | Páginas públicas dos serviços Académico e Design ficam Should | Q-034 | Must; Won't | Aprovada |
| D-041 | 2026-11-23 | 36 user stories, uma por passo do fluxo, geradas com a rastreabilidade por `scripts/gerar_us.py` | Q-035 | Uma por RF; só fluxos críticos | Aprovada |
