# Priorização MoSCoW — v1.1 multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-08] · Issue: #18 · Versão: 1.0 · Data: 2026-11-23
> Depende de: `requisitos-funcionais.md` (v1.3), `requisitos-nao-funcionais.md`, `regras-negocio.md`, `visao-modulos.md` §6 · Perguntas/decisões usadas: Q-032…Q-035, D-005, D-009, D-011, D-012, D-015, D-019, D-029, D-031, D-033, D-038…D-041

## Critério (D-038)
- **Must:** sem isto, um projeto piloto de cada serviço não chega ao fim (G3), **ou** há risco de segurança ou de dinheiro (pagamentos, aceites, ficheiros bloqueados).
- **Should:** melhora a experiência ou poupa trabalho ao admin, mas o piloto termina sem isso. Faz-se no fim da milestone do módulo, se houver tempo.
- **Could:** só se sobrar tempo; candidato à v1.2.
- **Won't (v1.1):** fora de âmbito nesta versão, com justificação.

## Resumo

| Grupo | Must | Should | Could | Total |
|---|---|---|---|---|
| Académico | 23 | 13 | 0 | 36 |
| Design | 28 | 10 | 1 | 39 |
| Comum | 32 | 13 | 1 | 46 |
| **Total RF** | **83** | **36** | **2** | **121** |
| RNF (`requisitos-nao-funcionais.md`) | 30 | 11 | 0 | 41 |

Os Must baixaram de 94 para 83. A maioria dos que ficam é o próprio fluxo de 7 fases de cada serviço: sem eles, o piloto não termina. A redução veio sobretudo de RF de apresentação e de RF duplicados por um bloco comum.

## Alterações feitas nesta priorização

| RF | Antes | Depois | Porquê |
|---|---|---|---|
| RF-10.11 | Must | Should | Apresentação; o piloto termina com a ficha visível |
| RF-10.43 | Must | Should | Só para trabalhos sem capítulos (D-014); a fase pode ficar com estado simples |
| RF-10.50 | Must | Should | Informativo |
| RF-10.62 | Must | Should | Coberto pelo próximo passo (RF-30.24, Must) |
| RF-10.72 | Must | Should | Depois do prazo, o cliente usa as mensagens |
| RF-10.82 | Must | Should | Cor da contagem; a contagem em si (RF-10.80) é Must |
| RF-20.05 | Must | Should | Ordem da primeira vista; tratada no wireframe (M4-04) |
| RF-20.12 | Must | Should | Apresentação |
| RF-20.62 | Must | Should | O admin marca a fase como "não aplicável" (RF-30.04, Must) |
| RF-30.11 | Must | Should | Tema por serviço; o portal funciona com o acento atual |
| RF-30.12 | Must | Should | Princípio de UX; aplicado no M4 |
| RF-30.21 | Must | Should | O estado "em atraso" automático não trava o piloto; o admin vê a data limite |
| RF-20.54 | — (novo) | Should | Pedido pelas regras de negócio (M1-07) |
| RF-30.06 | — (novo) | Must | Pedido pelas regras de negócio (M1-07) |
| RF-30.07 | — (novo) | Should | Pedido pelas regras de negócio (M1-07) |
| RF-30.63 | — (novo) | Should | Pedido pelas regras de negócio (M1-07) |
| RF-30.64 | — (novo) | Should | Pedido pelas regras de negócio (M1-07) |
| Emails de aviso (RF-10.63, RF-20.31, RF-20.72, RF-30.35, RF-30.52 (email), RF-30.61, RF-30.62, RF-30.64) | Should | Should | O cliente vive no WhatsApp; o admin avisa por lá enquanto os emails não existirem (D-039) |

## Should e Could (v1.1, se houver tempo)

### Should

| RF | Descrição |
|---|---|
| RF-10.11 | O cliente deve ver a ficha do trabalho atrás de "ver detalhes", não na primeira vista |
| RF-10.13 | O cliente deve poder assinalar um erro na ficha (ex.: prazo errado) por mensagem ligada à fase 1 |
| RF-10.33 | Em trabalhos sem capítulos (ex.: ensino médio), o admin pode marcar a fase 3 como "não aplicável" e ela é saltada |
| RF-10.43 | Sem capítulos, o progresso mostrado é o da fase (o admin define a % ou só o estado) |
| RF-10.50 | O cliente deve ver que o documento está em revisão e que normas estão a ser aplicadas (da ficha) |
| RF-10.51 | O cliente pode carregar ficheiros de referência adicionais nesta fase (ex.: indicações do orientador) |
| RF-10.62 | Antes do pagamento do restante, o cliente vê "Entrega pronta, falta pagar o restante" com o valor |
| RF-10.63 | O cliente deve receber um email quando a entrega fica disponível |
| RF-10.72 | Depois do prazo de ajustes, o botão é substituído por "Prazo de ajustes terminado — fale connosco", que abre as mensagens |
| RF-10.74 | O admin deve poder dar o projeto como concluído. Sem ação, o projeto conclui-se sozinho quando o prazo de ajustes termina sem pedidos… |
| RF-10.81 | Com menos de 2 dias, a contagem deve passar a horas |
| RF-10.82 | A cor muda para "a aguardar" (#EAB308) a ≤ 3 dias e para "atrasado" (#EF4444) depois do prazo, com o fuso Africa/Luanda |
| RF-10.83 | Depois da entrega final, a contagem do prazo dá lugar à contagem dos dias de ajustes (RF-10.71) |
| RF-20.05 | A primeira vista do cliente deve mostrar, por esta ordem: a última prova em grande, a ronda ("Ronda 1 de 2"), o botão do próximo passo e… |
| RF-20.12 | O cliente deve ver a ficha técnica atrás de "ver detalhes", não na primeira vista |
| RF-20.14 | O cliente deve poder assinalar um erro na ficha (ex.: nome ou data errados) por mensagem ligada à fase 1 |
| RF-20.31 | Ao carregar a V1, a fase 3 conclui-se e o cliente é avisado por email de que há uma prova para ver |
| RF-20.53 | Só o admin pode reabrir uma aprovação (ex.: o cliente detetou um erro antes de imprimir), com motivo obrigatório, que fica no histórico |
| RF-20.54 | A reabertura de uma arte aprovada fica bloqueada depois de a produção começar |
| RF-20.62 | Peças sem impressão (ex.: convite digital, logótipo) saltam a fase 6, que fica "não aplicável" |
| RF-20.72 | O cliente deve receber um email quando a peça estiver pronta para levantar ou os ficheiros finais disponíveis |
| RF-20.81 | O cliente deve poder comparar duas versões lado a lado (no telemóvel, uma por cima da outra) |
| RF-20.82 | Cada versão mostra a data e os comentários da ronda que lhe deu origem |
| RF-30.07 | Enquanto a fase está "a aguardar o cliente", o sistema conta esses dias e desliza o prazo de entrega; o cliente vê a nova data e o motivo |
| RF-30.11 | A cor de destaque (--accent, --accent-2) muda conforme o tipo de serviço, sobre a base visual atual |
| RF-30.12 | A primeira vista mostra pouco texto. Os pormenores ficam atrás de "ver detalhes" |
| RF-30.21 | Cada pagamento tem o estado pendente, pago ou em atraso. O estado passa a "em atraso" sozinho depois da data limite (fuso Africa/Luanda) |
| RF-30.35 | O admin recebe um aviso por email quando o cliente aprova ou pede alterações |
| RF-30.47 | 90 dias depois de o projeto ser concluído, os ficheiros são apagados do armazenamento e fica só o registo (nome, data, autor). O admin é… |
| RF-30.48 | O cliente vê, num projeto concluído, até quando pode descarregar os ficheiros |
| RF-30.54 | O cliente pode definir uma senha opcional nas definições, para entrar depois com email e senha |
| RF-30.57 | O sistema regista quando cada link foi gerado, por que canal e quando foi usado |
| RF-30.61 | O cliente recebe email (Resend) quando: há resposta a uma mensagem, uma aprovação lhe é pedida, um pagamento fica pendente ou um… |
| RF-30.62 | O admin recebe email quando o cliente envia uma mensagem, um ficheiro ou responde a uma aprovação |
| RF-30.63 | Fora do horário de atendimento (08h00–20h00, todos os dias), a página de mensagens mostra: *"Entraremos em contacto assim que o horário… |
| RF-30.64 | Com uma ação do cliente pendente há 2 dias, o cliente recebe um lembrete por email |

### Could

| RF | Descrição |
|---|---|
| RF-20.74 | Com data de evento definida, o sistema avisa o admin quando a data de levantamento fica a menos de 3 dias do evento ou depois dele |
| RF-30.49 | O admin vê o espaço ocupado no armazenamento, no total e por projeto |

Itens do backlog com a mesma regra: páginas públicas dos serviços Académico e Design (M6-08 #61, M7-08 #71) ficam **Should** (D-040).

## Won't (fora da v1.1) — com justificação

| Item | Porquê fica de fora | Decisão | Rever em |
|---|---|---|---|
| Pagamento online (gateway, referência Multicaixa) | Custo e âmbito; o registo manual chega para a transparência | D-009 | v1.2 |
| Comprovativo de pagamento enviado ou anexado no portal | O comprovativo continua no WhatsApp; anexar exige mais Storage e regras | Q-023 | v1.2 |
| Faturação e emissão de recibos | Exige regras fiscais e numeração; continua fora, como na v1.2 da spec | spec §1.2 | — |
| Envio automático por WhatsApp Business API | Fornecedor, templates aprovados e custo por mensagem; o `wa.me` manual resolve | D-011 | Quando o volume o justificar |
| Chat em tempo real | As mensagens assíncronas chegam com atendimento das 08h às 20h | spec §1.2, D-036 | — |
| Registo público de clientes | As contas continuam a ser criadas só pelo admin | spec §1.2 | — |
| Vários utilizadores por projeto (ex.: orientador, família) | Quem acompanha é quem aprova e paga | D-012 | v1.2 |
| Várias peças num só projeto de Design | Um projeto por peça é mais simples; o seletor já resolve | D-019 | v1.2 |
| Pré-visualização dos capítulos durante o desenvolvimento | O cliente vê só o estado; o texto só na entrega | D-015 | — |
| Reembolso parcial do sinal | O sinal não é reembolsável | D-033 | — |
| Mudar o Desenvolvimento para 7 fases | Fica com as 6 atuais; regressão zero (RNF-701) | D-005 | G1 |
| Backup do Storage (ficheiros) | Os originais ficam no computador do admin | D-031 | Gatilho RNF-505 |
| Meta de disponibilidade (SLA 99,5%) | Plano gratuito em melhor esforço | D-029 | Gatilho RNF-505 |
| Gestão da produção com gráficas externas | O cliente só vê o estado da produção | visão §6 | — |
| App mobile nativa | O portal é web mobile-first e abre no browser do WhatsApp | visão §6 | — |
