# Regras de negócio — Área do Cliente multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-07] · Issue: #17 · Versão: 1.0 · Data: 2026-11-23
> Depende de: `requisitos-funcionais.md` (RF-10, RF-20, RF-30), `requisitos-nao-funcionais.md`, `personas.md` · Perguntas/decisões usadas: Q-012…Q-014, Q-016…Q-019, Q-022, Q-023, Q-028…Q-031, D-009, D-012…D-027, D-033…D-037

## Convenções
- Uma **regra de negócio (RN)** é uma política da GeniusFrela que o sistema tem de respeitar, seja qual for o ecrã. Os RF dizem *o que* o sistema faz; as RN dizem *em que condições*.
- **Aplicação:** `Sistema` = o portal impõe a regra (bloqueia, calcula, avisa) · `Admin` = o admin cumpre-a por procedimento, o portal só mostra ou regista.
- Fuso de todas as datas e prazos: **Africa/Luanda** (RNF-208).

---

## RN-0 Gerais (os 3 serviços)

| Código | Regra | Aplicação | RF / RNF | Origem |
|---|---|---|---|---|
| RN-01 | Cada projeto tem **uma conta de cliente**. Quem acompanha também aprova e paga | Sistema | RF-30.13 | Q-011, D-012 |
| RN-02 | O tipo de serviço de um projeto **não muda** depois de criado | Sistema | RF-30.01 | visão §5.1 |
| RN-03 | Os pagamentos acontecem **fora do portal**. Só o admin regista um pagamento como pago | Sistema | RF-30.22, RF-30.23 | D-009 |
| RN-04 | Um pagamento com data limite ultrapassada e ainda pendente passa a **em atraso** | Sistema | RF-30.21 | D-026 |
| RN-05 | Uma aprovação dada pelo cliente é **definitiva**. Só o admin a reabre, com motivo registado | Sistema | RF-30.33 | D-022 |
| RN-06 | "Pedir alterações" exige sempre um comentário | Sistema | RF-30.31 | visão §5.1 |
| RN-07 | Um **extra** (trabalho fora do orçamento) só conta depois de o cliente o **aceitar** | Sistema | RF-30.25 | D-017 |
| RN-08 | Ficheiros de um projeto concluído são apagados **90 dias** depois da conclusão; o admin é avisado 7 dias antes e pode adiar | Sistema | RF-30.47 | D-025 |
| RN-09 | O cliente só envia ficheiros nas fases de **briefing e revisão**, até 10 MB cada e 10 por fase | Sistema | RF-30.41, RF-30.42 | D-010, D-024 |
| RN-10 | Nenhum cliente, trabalho ou peça aparece no portfólio público sem **autorização escrita** | Admin | RNF-402 | D-030 |

## RN-1 Início do trabalho e pagamentos

| Código | Regra | Aplicação | RF / RNF | Origem |
|---|---|---|---|---|
| RN-11 | **O trabalho só começa depois do aceite do orçamento e do sinal pago.** Antes disso, a fase seguinte ao orçamento não avança | Sistema | RF-10.23, RF-20.23 | D-013, D-018 |
| RN-12 | O sinal é, por omissão, **50% do total**; o admin pode alterar o valor por projeto | Sistema | RF-10.20, RF-20.20 | Q-012, D-018 |
| RN-13 | **O sinal não é reembolsável.** Se o cliente desistir, o admin marca o projeto como **cancelado** e o registo mantém-se. O cliente vê esta regra **antes de aceitar** o orçamento | Sistema + Admin | RF novo → M1-08 | Q-028, D-033 |
| RN-14 | Académico: os ficheiros finais só ficam disponíveis com o **restante pago** | Sistema | RF-10.61, RF-30.44 | D-013 |
| RN-15 | Design: a **produção só começa** com a arte aprovada **e** o **restante pago** (incluindo extras aceites) | Sistema | RF-20.60 | Q-017, D-018 |

## RN-2 Prazos e atrasos

| Código | Regra | Aplicação | RF / RNF | Origem |
|---|---|---|---|---|
| RN-21 | O tempo em que a fase está **"a aguardar o cliente"** (aprovação ou pagamento pendente) **não conta** para o prazo da GeniusFrela: o prazo de entrega **desliza os mesmos dias** | Sistema | RF-10.80, RF-30.04 → M1-08 | Q-029, D-034 |
| RN-22 | Com uma ação do cliente pendente há **2 dias**, o cliente recebe um **lembrete** por email | Sistema | RF-30.61 | Q-029, D-034 |
| RN-23 | Quando o prazo desliza, o cliente vê a nova data e o motivo ("à espera da sua aprovação desde DD/MM") | Sistema | RF-10.80 | D-034 |
| RN-24 | Um atraso **da GeniusFrela** não desliza o prazo: a contagem fica a vermelho (atrasado) e o admin escreve o próximo passo | Sistema | RF-10.82, RF-30.04 | L§6 |

## RN-3 Ajustes, revisões e trabalho novo

| Código | Regra | Aplicação | RF / RNF | Origem |
|---|---|---|---|---|
| RN-31 | Um pedido está **incluído** se corrige o resultado para cumprir o que está na **ficha** (Académico: tema, normas, nº de páginas; Design: medidas, textos, material, quantidade) | Admin | RF-10.71, RF-20.40 | Q-030, D-035 |
| RN-32 | Mudar o **tema**, o **nº de páginas**, a **peça**, as **medidas** ou o **conceito** depois de aprovado é **trabalho novo**: o admin regista um extra (RN-07) ou um novo projeto | Admin | RF-20.43, RF-30.25 | Q-030, D-035 |
| RN-33 | Académico: os ajustes só se pedem **dentro do prazo de ajustes** (por omissão 7 dias após a entrega, editável por projeto) | Sistema | RF-10.70…72 | Q-014, D-016 |
| RN-34 | Académico: terminado o prazo de ajustes sem pedidos abertos, o projeto **conclui-se sozinho** | Sistema | RF-10.74 | D-016 |
| RN-35 | Design: cada pedido de alterações sobre a prova atual gasta **uma ronda**. As rondas incluídas são definidas por projeto (por omissão 2) | Sistema | RF-20.40, RF-20.41 | Q-016, D-017 |
| RN-36 | Design: esgotadas as rondas, só há nova ronda como **extra pago e aceite** | Sistema | RF-20.43 | D-017 |

## RN-4 Aprovação da arte e produção (Design)

| Código | Regra | Aplicação | RF / RNF | Origem |
|---|---|---|---|---|
| RN-41 | **Depois de aprovar a arte, a produção não pode ser alterada.** Não há mais comentários nem rondas sobre essa peça | Sistema | RF-20.52 | L§5.3 |
| RN-42 | Antes de aprovar, o cliente vê o aviso de irreversibilidade e os **textos-chave** da ficha (nomes, data, quantidade) | Sistema | RF-20.51 | D-021 |
| RN-43 | Reabrir uma arte aprovada só é possível **antes de a produção começar** e só pelo admin | Sistema | RF-20.53 | D-022, D-037 |
| RN-44 | Uma peça sem impressão salta a fase de produção | Sistema | RF-20.62 | D-020 |
| RN-45 | Cada peça é um projeto próprio, com o seu orçamento, rondas e aprovação | Sistema | RF-20 (âmbito) | D-019 |

## RN-5 Atendimento e comunicação

| Código | Regra | Aplicação | RF / RNF | Origem |
|---|---|---|---|---|
| RN-51 | O atendimento humano é **todos os dias, das 08h00 às 20h00** (incluindo fins de semana) | Admin | RF-30.60 | Q-031, D-036 |
| RN-52 | As mensagens são aceites a qualquer hora. **Fora do horário**, o cliente vê: *"Entraremos em contacto assim que o horário de abertura estiver disponível."* | Sistema | RF-30.60 → M1-08 | Q-031, D-036 |
| RN-53 | O link mágico expira em **24 h** e só funciona uma vez; um novo link é pedido pelo WhatsApp | Sistema | RF-30.51 | D-023 |
| RN-54 | Os emails de aviso dizem só o que mudou e levam ao portal, sem ficheiros nem dados sensíveis | Sistema | RNF-405 | D-030 |

---

## Novos RF que estas regras pedem (entram na M1-08)
| Regra | RF a acrescentar |
|---|---|
| RN-13 | Estado **cancelado** do projeto, marcado pelo admin; texto da regra do sinal junto ao botão "Aceitar" |
| RN-21…RN-23 | Contagem do tempo "a aguardar o cliente" e cálculo do prazo ajustado |
| RN-43 | Bloquear a reabertura da arte depois de a produção começar |
| RN-52 | Aviso de fora de horário nas mensagens |
