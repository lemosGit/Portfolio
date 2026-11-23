# Requisitos não funcionais — Área do Cliente multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-06] · Issue: #16 · Versão: 1.0 · Data: 2026-11-23
> Depende de: `personas.md`, `requisitos-funcionais.md` (RF-10, RF-20, RF-30), `docs/especificacao_portal_cliente.md` §6, `docs/supabase-setup.md` · Perguntas/decisões usadas: Q-010, Q-020…Q-027, D-004, D-009, D-011, D-023…D-031

## Convenções
- Cada RNF tem uma **métrica verificável** e a forma de a verificar. A verificação é feita na M9 (#74–#78).
- **Prioridade** provisória; a final sai da M1-08 (MoSCoW).
- Contexto que guia tudo: o cliente usa **Android com dados móveis**, abre o portal a partir do WhatsApp, em momentos curtos (Q-010, personas).

---

## RNF-1 Desempenho e consumo de dados

| Código | Requisito | Métrica | Como verificar | Prioridade | Origem |
|---|---|---|---|---|---|
| RNF-101 | A primeira vista da Área do Cliente carrega depressa em rede móvel | **LCP ≤ 2,5 s** em 4G simulado (Lighthouse mobile) e **pontuação de desempenho ≥ 80** | Lighthouse mobile nas páginas Visão geral dos 3 serviços | Must | Q-024, D-028 |
| RNF-102 | A primeira vista gasta poucos dados | **≤ 500 KB transferidos** na primeira vista (HTML + CSS + JS + imagens), sem contar com as provas em tamanho original | DevTools → Network, cache desligada | Must | Q-024, D-028 |
| RNF-103 | As provas e imagens chegam comprimidas | Miniaturas em **WebP, ≤ 150 KB** cada; o original só é pedido quando o cliente o abre | Network ao abrir a galeria (RF-20.83, RF-30.46) | Must | Q-010 |
| RNF-104 | As páginas do admin respondem depressa | Tempo do servidor **≤ 1 s** (p95) nas listas de projetos e no detalhe | Logs da Vercel; hoje ~0,45 s acima da rede (PR #5) | Should | PR #5 |
| RNF-105 | Uploads do cliente mostram progresso e podem falhar sem perder o resto | Barra de progresso por ficheiro; uma falha não cancela os outros ficheiros | Teste manual com rede limitada (DevTools "Slow 4G") | Should | Q-010, RF-30.42 |

## RNF-2 Usabilidade e acessibilidade

| Código | Requisito | Métrica | Como verificar | Prioridade | Origem |
|---|---|---|---|---|---|
| RNF-201 | **Mobile-first**: tudo funciona num ecrã pequeno | Todas as páginas do cliente utilizáveis a **360 px** de largura, **sem scroll horizontal** | DevTools 360 × 740 nas páginas dos 3 serviços | Must | #16, Q-010 |
| RNF-202 | Um só botão de ação principal por ecrã | Cada ecrã do cliente tem **no máximo 1 botão primário** | Revisão do protótipo (G2) e das telas (M9) | Must | Personas (Implicações) |
| RNF-203 | Alvos de toque fáceis de acertar | Botões e links com **≥ 44 × 44 px** | Revisão visual / Lighthouse "tap targets" | Must | Q-010 |
| RNF-204 | Texto legível e com contraste | Contraste **WCAG 2.1 AA** (≥ 4,5:1 no texto normal) também com as cores de destaque de cada serviço | Lighthouse Acessibilidade **≥ 90** | Must | D-004, spec §6 |
| RNF-205 | Acessibilidade de base mantém-se | `prefers-reduced-motion`, foco visível, HTML semântico, imagens com `alt` | Lighthouse + teclado | Must | spec §6 |
| RNF-206 | Linguagem sem termos técnicos | Nenhum termo como "milestone", "issue", "upload", "status" na Área do Cliente de Académico e Design | Revisão de textos (M4, M9) | Should | Personas (PER-04) |
| RNF-207 | Funciona no browser do WhatsApp | O link mágico abre e o portal funciona no **browser interno do WhatsApp** e no **Chrome Android** (2 últimas versões) | Teste num Android real a partir do WhatsApp | Must | D-011, personas |
| RNF-208 | Idioma e fuso | Português (variante do site); datas e horas em **Africa/Luanda**; valores em **Kz** | Revisão + teste de prazos à meia-noite | Must | spec §6, D-026 |

## RNF-3 Segurança

| Código | Requisito | Métrica | Como verificar | Prioridade | Origem |
|---|---|---|---|---|---|
| RNF-301 | Link mágico seguro | **Uso único** e validade de **24 h (86 400 s)**, que é o máximo que o Supabase permite; um 2.º uso é recusado | Teste: usar o mesmo link 2 vezes; usar um link com > 24 h | Must | D-023, docs Supabase (OTP ≤ 86 400 s) |
| RNF-302 | Um cliente só vê o seu projeto | **RLS** em todas as tabelas novas (pagamentos, aprovações, ficheiros, fases); um cliente de teste não lê nem escreve dados de outro projeto | Testes de RLS (M5-13, #51) | Must | spec §5, D-012 |
| RNF-303 | Ficheiros nunca públicos | Bucket **privado**; acesso só por **URL assinada com validade ≤ 1 h**; uma URL expirada devolve erro | Teste: abrir URL assinada depois de expirar; tentar URL pública | Must | #16, RF-30.45 |
| RNF-304 | Ficheiros bloqueados por pagamento não fogem | Um ficheiro bloqueado (RF-30.44) **não gera URL assinada** para o cliente, nem por pedido direto à API | Teste com sessão de cliente | Must | D-013 |
| RNF-305 | Uploads validados no servidor | Tipo (pela assinatura do ficheiro, não só pela extensão) e tamanho (**≤ 10 MB**) verificados no servidor e no bucket, não só no browser | Teste com ficheiro renomeado e ficheiro de 11 MB | Must | D-024 |
| RNF-306 | Segredos só no servidor | O token GitHub, a `SUPABASE_SECRET_KEY` e a `RESEND_API_KEY` **nunca** chegam ao browser nem ao repositório (que é público) | Pesquisa no bundle do cliente e no histórico git | Must | spec §5, memória |
| RNF-307 | Ações do admin confirmadas no servidor | Todas as ações de admin usam `requireAdminStrict` (validação do utilizador na Auth, não só do JWT) | Revisão de código (M9-05, #78) | Must | PR #5 |
| RNF-308 | Aprovações e pagamentos com rasto | Cada aprovação, reabertura e mudança de pagamento guarda **autor, data/hora e valor anterior**; o cliente não consegue alterar o histórico | Teste RLS + revisão | Must | RF-30.22, RF-30.32 |
| RNF-309 | Limitar abusos | No máximo **5 links mágicos por cliente por hora** e **10 uploads por fase** | Teste de limites | Should | D-024, docs Supabase (rate limits) |

## RNF-4 Privacidade e confidencialidade

| Código | Requisito | Métrica | Como verificar | Prioridade | Origem |
|---|---|---|---|---|---|
| RNF-401 | Política de privacidade | Página pública `/privacidade` com que dados se recolhem, para quê, onde ficam (Supabase UE, Vercel, Resend), por quanto tempo e como pedir a eliminação, segundo a **Lei n.º 22/11 de Angola** (proteção de dados pessoais) | Página publicada e ligada no rodapé e no login | Must | Q-026, D-030 |
| RNF-402 | Confidencialidade dos clientes | **Nenhum** nome de cliente, trabalho académico, prova ou peça aparece no portfólio público sem **autorização escrita** registada | Revisão do portfólio antes de cada publicação | Must | Q-026, D-030 |
| RNF-403 | Direito à eliminação | A pedido do cliente, o admin apaga a conta, as mensagens e os ficheiros do projeto em **≤ 30 dias**; ficam só os registos de pagamento necessários | Procedimento escrito no manual do admin (M10-03) | Should | Q-026, D-030 |
| RNF-404 | Retenção de ficheiros | Ficheiros apagados do Storage **90 dias** após a conclusão do projeto (aviso ao admin 7 dias antes) | Teste do job com uma data simulada | Should | D-025 |
| RNF-405 | Emails sem dados sensíveis | Os emails de aviso dizem só **o que mudou** e levam ao portal; não incluem ficheiros, valores detalhados nem o tema do trabalho académico | Revisão dos modelos de email | Should | D-030 (assumido) |

## RNF-5 Disponibilidade, capacidade e custos (plano gratuito)

| Código | Requisito | Métrica | Como verificar | Prioridade | Origem |
|---|---|---|---|---|---|
| RNF-501 | Serviço de **melhor esforço**, sem SLA | O Supabase não pausa: o keepalive diário (`/api/keepalive`) responde **200** todos os dias | Logs do Vercel Cron | Must | Q-025, D-029, spec §6 |
| RNF-502 | Armazenamento dentro do gratuito | Ficheiros ocupam **< 80% de 1 GB** do Storage; a BD **< 80% de 500 MB** | Painel do Supabase (Usage) e RF-30.49 | Must | Q-025, D-029 |
| RNF-503 | Tamanho máximo por ficheiro | Limite do bucket em **10 MB** para o cliente e **50 MB** para o admin (o máximo do plano gratuito) | Configuração do bucket | Must | D-024, docs Supabase (Free: 50 MB) |
| RNF-504 | Emails dentro dos limites | Avisos por Resend dentro da quota gratuita (**100/dia, 3 000/mês** — a confirmar no painel); emails de Auth pelo SMTP próprio, com o limite inicial de **30/hora** ajustado | Painel do Resend e do Supabase (Rate limits) | Must | docs Supabase (SMTP), D-011 |
| RNF-505 | **Gatilhos para passar a plano pago** | Passa-se a Supabase Pro (e revê-se o plano da Vercel) quando se atingir **qualquer** um: Storage ≥ 80% · BD ≥ 80% · **10 projetos ativos** em simultâneo · **1.º incidente** com perda de acesso de um cliente > 24 h | Revisão mensal do Usage; registo em `riscos.md` | Must | Q-025, D-029 |
| RNF-506 | Funciona sem Supabase em demonstração | Sem as variáveis do Supabase, o portal continua em **modo demonstração** com dados de exemplo dos 3 serviços | `npm run dev` sem `.env.local` | Should | memória, M5-14 |

## RNF-6 Fiabilidade e recuperação

| Código | Requisito | Métrica | Como verificar | Prioridade | Origem |
|---|---|---|---|---|---|
| RNF-601 | Backup da base de dados | Backup **semanal cifrado** (GitHub Actions + GPG). Perda máxima aceite: **7 dias** de dados (RPO) | Workflow "Backup Supabase" verde todos os domingos | Must | Q-027, D-031 |
| RNF-602 | Restauro testado | O backup restaura numa BD vazia em **≤ 1 h** (RTO), seguindo `docs/supabase-setup.md` | Ensaio de restauro antes da release v1.1.0 (M10-01) | Should | D-031 |
| RNF-603 | Ficheiros sem cópia no portal | O Storage **não** tem backup próprio; o admin guarda os **originais** das provas e entregáveis no seu computador | Procedimento no manual do admin | Must | Q-027, D-031 |
| RNF-604 | Migrações seguras | Cada migração nova é aplicada primeiro num ambiente de teste e, em produção, **depois de um backup manual** | Checklist do M10-01 | Must | #80 |

## RNF-7 Manutenção e compatibilidade

| Código | Requisito | Métrica | Como verificar | Prioridade | Origem |
|---|---|---|---|---|---|
| RNF-701 | **Regressão zero no layout Desenvolvimento** | As páginas atuais do cliente Desenvolvimento (visão geral, fases, tarefas, entregas, reuniões, mensagens) mantêm o comportamento; testes E2E do fluxo atual passam | Playwright (M9-04, #77) + comparação visual | Must | #16, O5 |
| RNF-702 | Testes automáticos no CI | Vitest e Playwright correm em cada PR; o PR não entra com testes a falhar | GitHub Actions (M5-01, #39) | Must | #39 |
| RNF-703 | Novo serviço sem reescrever o portal | Acrescentar um 4.º serviço exige **só** um novo modelo de fases, um tema de cores e os blocos específicos — sem mexer no esqueleto comum | Revisão da arquitetura (M3-05) | Should | D-002 |
| RNF-704 | Código e decisões explicáveis | Cada escolha técnica tem um ADR em `docs/03-arquitetura/adr/` | Revisão na M3 | Should | Metodologia |

---

## Riscos encontrados ao escrever os RNF
| Risco | Porquê | Proposta |
|---|---|---|
| O plano **Hobby da Vercel** é só para uso **não comercial** | O portal serve clientes pagantes da GeniusFrela | Rever na M3 (stack e custos): Vercel Pro ou outro alojamento. Registado como pendente |
| A validade de 24 h é o **máximo** do Supabase | Não há margem para aumentar se os clientes abrirem o link tarde | O ecrã de link expirado leva ao WhatsApp para pedir outro (RF-30.51) |
| Ficheiros sem backup (D-031) | Um erro no Storage perde provas e entregáveis | Os originais ficam no computador do admin (RNF-603); rever no gatilho RNF-505 |
