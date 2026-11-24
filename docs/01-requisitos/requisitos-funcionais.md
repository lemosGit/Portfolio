# Requisitos funcionais — Área do Cliente multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefas: [M1-03] RF-10 · [M1-04] RF-20 · [M1-05] RF-30 · Issues: #13, #14, #15 · Versão: 1.4 (RF-10, RF-20, RF-30; prioridades revistas na M1-08; PA-001) · Data: 2026-11-23
> Depende de: `visao-modulos.md`, `personas.md`, `docs/references/1/GeniusFrela_Projeto_e_Layouts.md` §5.2 e §5.3 · Perguntas/decisões usadas: Q-005, Q-006, Q-008…Q-010, Q-012…Q-023, D-001, D-002, D-004, D-009…D-027

## Convenções
- **Grupos:** RF-10 Académico · RF-20 Design (M1-04) · RF-30 Blocos comuns (M1-05).
- **Prioridade** revista na M1-08 com o critério de D-038 (Must = o piloto não chega ao fim sem isto, ou há risco de segurança ou de dinheiro). Ver `priorizacao-moscow.md`.
- **Origem:** `L§x` = documento de layouts · `Q-NNN` = resposta registada · `PER` = implicação das personas.
- Os RF que dependem de um bloco comum (Pagamentos, Aprovações, Ficheiros) remetem para o RF-30 correspondente.

---

## RF-10 — Académico

Fluxo: **1** Pedido e briefing → **2** Orçamento e aceite → **3** Estrutura (índice) → **4** Desenvolvimento → **5** Revisão e formatação → **6** Entrega final → **7** Ajustes.

### RF-10.0 Projeto e cabeçalho
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.01 | O admin deve poder criar um projeto com `service_type = academic`, sem repositório GitHub, e o sistema cria as 7 fases a partir do modelo do Académico | PER-01 | Must | L§7, D-001 |
| RF-10.02 | O cliente deve ver, no topo, a etiqueta "Académico" na cor do serviço (âmbar), o prazo de entrega e o estado do projeto | PER-03, PER-05 | Must | L§4, L§5.2 |
| RF-10.03 | O cliente deve ver a barra de fases com as 7 fases e o estado de cada uma (concluída, em curso, a aguardar o cliente, atrasada, por iniciar) | PER-03, PER-05 | Must | L§4, L§6 |
| RF-10.04 | O cliente deve ver a fase atual com uma frase curta e o **próximo passo** (de quem está a ação: GeniusFrela ou o cliente) | PER-03, PER-05 | Must | L§4, PER |

### RF-10.1 Pedido e briefing (fase 1)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.10 | O admin deve registar a **ficha do trabalho**: tema, tipo (trabalho escolar, universitário, relatório, formatação, revisão), nível de ensino, instituição, disciplina, normas (ex.: APA), nº de páginas e prazo | PER-01 | Must | L§5.2 |
| RF-10.11 | O cliente deve ver a ficha do trabalho atrás de "ver detalhes", não na primeira vista | PER-03, PER-05 | Should | L§5.2, `docs/melhorar_designer.txt` |
| RF-10.12 | O cliente deve poder carregar ficheiros de referência (enunciado, normas da instituição, bibliografia, modelos) durante a fase 1 → RF-30 Ficheiros | PER-03, PER-05 | Must | Q-006, D-010 |
| RF-10.13 | O cliente deve poder assinalar um erro na ficha (ex.: prazo errado) por mensagem ligada à fase 1 | PER-03 | Should | L§4 (Mensagens) |

### RF-10.2 Orçamento e aceite (fase 2)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.20 | O admin deve registar o orçamento: valor total, valor do sinal (por omissão 50%) e prazo de entrega → RF-30 Pagamentos | PER-01 | Must | L§5.2, Q-012 |
| RF-10.21 | O cliente deve ver o valor, o sinal, o prazo e um botão **"Aceitar"** → RF-30 Aprovações | PER-03, PER-05 | Must | L§5.2 |
| RF-10.22 | O sistema deve registar o aceite com a data, a hora e o autor | PER-01 | Must | O2 (visão) |
| RF-10.23 | A fase 3 só pode começar depois de **aceite + sinal registado como pago** pelo admin. Antes disso, o próximo passo do cliente mostra "Pagar o sinal" | PER-01, PER-03 | Must | Q-012, D-013 |

### RF-10.3 Estrutura / índice (fase 3)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.30 | O admin deve registar o índice proposto como uma lista ordenada de capítulos ou secções | PER-01 | Must | L§5.2 |
| RF-10.31 | O cliente deve ver o índice e poder **aprovar** ou **pedir alterações** com comentário → RF-30 Aprovações | PER-03 | Must | L§5.2 |
| RF-10.32 | Um pedido de alterações deve voltar a fase 3 a "em curso" e avisar o admin | PER-01 | Must | L§5.2 |
| RF-10.33 | Em trabalhos sem capítulos (ex.: ensino médio), o admin pode marcar a fase 3 como "não aplicável" e ela é saltada | PER-05 | Should | PER, D-014 |

### RF-10.4 Desenvolvimento (fase 4)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.40 | O admin deve marcar cada capítulo como por iniciar, em curso ou concluído | PER-01 | Must | L§5.2 |
| RF-10.41 | O cliente deve ver o progresso como **"X de Y capítulos"** e a % da fase calculada pelos capítulos | PER-03 | Must | L§5.2 |
| RF-10.42 | O cliente vê **só o estado** dos capítulos. Os ficheiros com o texto não ficam disponíveis antes da entrega final | PER-03 | Must | Q-013, D-015 |
| RF-10.43 | Sem capítulos, o progresso mostrado é o da fase (o admin define a % ou só o estado) | PER-05 | Should | PER, D-014 |

### RF-10.5 Revisão e formatação (fase 5)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.50 | O cliente deve ver que o documento está em revisão e que normas estão a ser aplicadas (da ficha) | PER-03 | Should | L§5.2 |
| RF-10.51 | O cliente pode carregar ficheiros de referência adicionais nesta fase (ex.: indicações do orientador) → RF-30 Ficheiros | PER-03 | Should | D-010 |

### RF-10.6 Entrega final (fase 6)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.60 | O admin deve carregar o ficheiro final em **PDF e em Word** → RF-30 Ficheiros | PER-01 | Must | Q-015 |
| RF-10.61 | Os ficheiros finais só ficam disponíveis ao cliente depois de o admin registar o **restante como pago** | PER-01, PER-03 | Must | Q-012, D-013 |
| RF-10.62 | Antes do pagamento do restante, o cliente vê "Entrega pronta, falta pagar o restante" com o valor | PER-03, PER-05 | Should | Q-012 |
| RF-10.63 | O cliente deve receber um email quando a entrega fica disponível | PER-03 | Should | `lib/email` (existente) |
| RF-10.64 | Ao disponibilizar a entrega, o sistema regista a **data de entrega**, que inicia o prazo de ajustes | PER-01 | Must | Q-014 |

### RF-10.7 Ajustes (fase 7)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.70 | O admin deve definir, por projeto, o **nº de dias de ajustes** após a entrega (por omissão 7) | PER-01 | Must | Q-014, D-016 |
| RF-10.71 | O cliente deve ver quantos dias de ajustes restam e poder **pedir um ajuste** com descrição e ficheiro opcional | PER-03, PER-05 | Must | L§5.2, Q-014 |
| RF-10.72 | Depois do prazo de ajustes, o botão é substituído por "Prazo de ajustes terminado — fale connosco", que abre as mensagens | PER-03 | Should | RN (M1-07) |
| RF-10.73 | O admin deve poder carregar uma nova versão (PDF + Word) em resposta a um ajuste. Fica como versão nova, sem apagar a anterior | PER-01 | Must | RF-30 Ficheiros |
| RF-10.74 | O admin deve poder dar o projeto como **concluído**. Sem ação, o projeto conclui-se sozinho quando o prazo de ajustes termina sem pedidos abertos | PER-01 | Should | Assumido (D-016) |

### RF-10.8 Contagem do prazo
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-10.80 | O cliente deve ver, em destaque na primeira vista, os **dias restantes até ao prazo** de entrega | PER-03, PER-05 | Must | L§5.2 |
| RF-10.81 | Com menos de 2 dias, a contagem deve passar a **horas** | PER-05 | Should | PER (prazos curtos) |
| RF-10.82 | A cor muda para "a aguardar" (`#EAB308`) a ≤ 3 dias e para "atrasado" (`#EF4444`) depois do prazo, com o fuso Africa/Luanda | PER-03, PER-05 | Should | L§6, M6-02 |
| RF-10.83 | Depois da entrega final, a contagem do prazo dá lugar à contagem dos dias de ajustes (RF-10.71) | PER-03 | Should | Q-014 |

---

## RF-20 — Design

Fluxo: **1** Briefing → **2** Orçamento e sinal → **3** Conceito / esboço → **4** Revisões → **5** Aprovação final da arte → **6** Produção / impressão → **7** Entrega / levantamento.

Âmbito: **um projeto = uma peça** (Q-018, D-019). Um evento com convite, lona e camisolas dá três projetos, que o cliente alterna no seletor de projetos que já existe.

### RF-20.0 Projeto e cabeçalho
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.01 | O admin deve poder criar um projeto com `service_type = design`, sem repositório GitHub, e o sistema cria as 7 fases a partir do modelo do Design | PER-01 | Must | L§7, D-001 |
| RF-20.02 | O cliente deve ver, no topo, a etiqueta "Design" na cor do serviço (magenta), o tipo de peça e a data do evento, se existir | PER-04 | Must | L§4, L§5.3 |
| RF-20.03 | O cliente deve ver a barra de fases com as 7 fases e o estado de cada uma (concluída, em curso, a aguardar o cliente, atrasada, por iniciar) | PER-04 | Must | L§4, L§6 |
| RF-20.04 | O cliente deve ver a fase atual com uma frase curta e **um só botão** para o próximo passo (comentar, aprovar, pagar ou levantar) | PER-04 | Must | L§4, PER |
| RF-20.05 | A primeira vista do cliente deve mostrar, por esta ordem: a **última prova em grande**, a ronda ("Ronda 1 de 2"), o botão do próximo passo e a data e o local de levantamento | PER-04 | Should | PER-04 ("O que vê primeiro") |

### RF-20.1 Briefing e ficha técnica (fase 1)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.10 | O admin deve registar a **ficha técnica** da peça: tipo (logótipo e identidade, convite digital, convite impresso, lona, camisola, outro), medidas, material, quantidade, acabamento, textos a incluir e data do evento (opcional) | PER-01 | Must | L§5.3 |
| RF-20.11 | A ficha técnica deve indicar se a peça tem **impressão** e se tem **ficheiros digitais** a entregar | PER-01 | Must | Q-019, D-020 |
| RF-20.12 | O cliente deve ver a ficha técnica atrás de "ver detalhes", não na primeira vista | PER-04 | Should | `docs/melhorar_designer.txt` |
| RF-20.13 | O cliente deve poder carregar referências (fotos, textos, nomes, cores, logótipos) durante a fase 1 → RF-30 Ficheiros | PER-04 | Must | Q-006, D-010 |
| RF-20.14 | O cliente deve poder assinalar um erro na ficha (ex.: nome ou data errados) por mensagem ligada à fase 1 | PER-04 | Should | L§4 (Mensagens) |

### RF-20.2 Orçamento e sinal (fase 2)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.20 | O admin deve registar o orçamento com o valor do **design** e o valor da **impressão** em separado, o total, o sinal (por omissão 50%) e o nº de **rondas incluídas** (por omissão 2) → RF-30 Pagamentos | PER-01 | Must | L§5.3, Q-016 |
| RF-20.21 | O cliente deve ver o total, o detalhe design + impressão, o sinal, as rondas incluídas e um botão **"Aceitar"** → RF-30 Aprovações | PER-04 | Must | L§5.3 |
| RF-20.22 | O sistema deve registar o aceite com a data, a hora e o autor | PER-01 | Must | O2 (visão) |
| RF-20.23 | A fase 3 só pode começar depois de **aceite + sinal registado como pago** pelo admin. Antes disso, o próximo passo do cliente mostra "Pagar o sinal" | PER-01, PER-04 | Must | D-018 |

### RF-20.3 Conceito / esboço (fase 3)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.30 | O admin deve carregar a primeira proposta visual como **prova V1** (uma ou mais imagens) → RF-20.8 Galeria de provas | PER-01 | Must | L§5.3 |
| RF-20.31 | Ao carregar a V1, a fase 3 conclui-se e o cliente é avisado por email de que há uma prova para ver | PER-01, PER-04 | Should | `lib/email` (existente) |

### RF-20.4 Revisões (fase 4)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.40 | O cliente deve poder **comentar a prova atual** e pedir alterações, com texto e imagem opcional. Cada pedido gasta uma ronda | PER-04 | Must | L§5.3, Q-016 |
| RF-20.41 | O cliente deve ver o **contador de rondas**: "Ronda X de N" e quantas ainda restam | PER-04 | Must | L§5.3 |
| RF-20.42 | O admin deve responder a uma ronda carregando a prova seguinte (V2, V3…), que passa a ser a prova atual | PER-01 | Must | L§5.3 |
| RF-20.43 | Com as rondas incluídas esgotadas, o cliente pode **pedir uma ronda extra**. O admin indica o valor, que fica registado como **extra** em Pagamentos; a ronda só começa depois de o cliente a aceitar | PER-01, PER-04 | Must | Q-016, D-017, D-009 |
| RF-20.44 | Em qualquer ronda, o cliente pode passar diretamente à aprovação (fase 5), sem gastar mais rondas | PER-04 | Must | L§5.3 |

### RF-20.5 Aprovação final da arte (fase 5)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.50 | O cliente deve ver o botão **"Aprovar arte para produção"** sobre a prova atual → RF-30 Aprovações | PER-04 | Must | L§5.3 |
| RF-20.51 | Antes de confirmar, o sistema mostra o **aviso de irreversibilidade** ("Depois de aprovar, a produção não pode ser alterada") e repete os textos-chave da ficha (nomes, data, quantidade) para o cliente verificar | PER-04 | Must | L§5.3, D-021 |
| RF-20.52 | O sistema regista a aprovação com a data, a hora, o autor e a **versão aprovada** (ex.: V3). A partir daí não se aceitam comentários nem novas rondas | PER-01 | Must | O2 (visão) |
| RF-20.53 | Só o admin pode **reabrir** uma aprovação (ex.: o cliente detetou um erro antes de imprimir), com motivo obrigatório, que fica no histórico | PER-01 | Should | PER-01 (permissões), D-022 |
| RF-20.54 | A reabertura de uma arte aprovada fica **bloqueada** depois de a produção começar | PER-01 | Should | RN-43, D-037 |

### RF-20.6 Produção / impressão (fase 6)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.60 | A produção só pode começar depois de a arte estar aprovada **e** o **restante registado como pago**. Antes disso, o próximo passo do cliente mostra "Pagar o restante" com o valor (incluindo extras) | PER-01, PER-04 | Must | Q-017, D-018 |
| RF-20.61 | O admin deve atualizar o estado da produção (a imprimir, pronto) e o cliente vê esse estado com uma frase curta | PER-01, PER-04 | Must | L§5.3 |
| RF-20.62 | Peças sem impressão (ex.: convite digital, logótipo) saltam a fase 6, que fica "não aplicável" | PER-04 | Should | Q-019, D-020 |

### RF-20.7 Entrega / levantamento (fase 7)
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.70 | O admin deve registar a **data e o local** de entrega ou levantamento, e o cliente vê-os em destaque na primeira vista | PER-01, PER-04 | Must | L§5.3 |
| RF-20.71 | Se a ficha indicar ficheiros digitais, o admin carrega os **ficheiros finais** (ex.: PDF/PNG do convite, logótipo em vários formatos) e o cliente pode descarregá-los → RF-30 Ficheiros | PER-01, PER-04 | Must | Q-019, D-020 |
| RF-20.72 | O cliente deve receber um email quando a peça estiver pronta para levantar ou os ficheiros finais disponíveis | PER-04 | Should | `lib/email` (existente) |
| RF-20.73 | O admin deve marcar a peça como **entregue**, o que conclui o projeto | PER-01 | Must | L§5.3 |
| RF-20.74 | Com data de evento definida, o sistema avisa o admin quando a data de levantamento fica a menos de 3 dias do evento ou depois dele | PER-01 | Could | PER-04 (objetivo) |

### RF-20.8 Galeria de provas
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-20.80 | O cliente deve ver todas as versões (V1, V2, V3…) numa galeria, com a mais recente em destaque e marcada como "atual" | PER-04 | Must | L§5.3 |
| RF-20.81 | O cliente deve poder comparar duas versões **lado a lado** (no telemóvel, uma por cima da outra) | PER-04 | Should | L§5.3 |
| RF-20.82 | Cada versão mostra a data e os comentários da ronda que lhe deu origem | PER-04 | Should | L§5.3 |
| RF-20.83 | As provas mostram-se em **miniatura comprimida** (WebP) e o original só abre a pedido | PER-04 | Must | Q-010, personas (Implicações) |
| RF-20.84 | As provas não substituem as anteriores: uma versão nova nunca apaga a antiga | PER-01 | Must | RF-30 Ficheiros |

## RF-30 — Blocos comuns

Construídos uma vez (M5) e usados pelos 3 serviços (D-002). Para o Desenvolvimento (PER-02), o fluxo atual não muda: ganha os blocos Pagamentos, Aprovações e Ficheiros e o link mágico (O5).

### RF-30.0 Tipo de serviço e fases como dados
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-30.01 | Ao criar um projeto, o admin deve escolher o **tipo de serviço**: Desenvolvimento, Académico ou Design. O tipo não muda depois de criado | PER-01 | Must | visão §5.1 |
| RF-30.02 | Só os projetos Desenvolvimento pedem o repositório GitHub. Os outros dois não mostram esse campo | PER-01 | Must | D-001 |
| RF-30.03 | Em Académico e Design, o sistema cria as fases do projeto a partir do **modelo de fases** do serviço (nome, ordem, descrição curta) | PER-01 | Must | D-001, Q-001 |
| RF-30.04 | O admin deve poder avançar uma fase, marcá-la como "a aguardar o cliente", "atrasada" ou "não aplicável", e escrever o **próximo passo** visível ao cliente | PER-01 | Must | L§4, RF-10.33, RF-20.62 |
| RF-30.05 | O Desenvolvimento continua a ler as fases dos milestones do GitHub, sem alterações | PER-02 | Must | D-001, D-005 |
| RF-30.06 | O admin deve poder marcar um projeto como **cancelado**. O sinal não é devolvido e o registo mantém-se. Junto ao botão "Aceitar" do orçamento, o cliente vê a regra do sinal não reembolsável | PER-01, PER-03, PER-04 | Must | RN-13, D-033 |
| RF-30.07 | Enquanto a fase está "a aguardar o cliente", o sistema conta esses dias e **desliza o prazo de entrega**; o cliente vê a nova data e o motivo | PER-01, PER-03, PER-04 | Should | RN-21…23, D-034 |

### RF-30.1 Esqueleto comum e tema
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-30.10 | Todas as Áreas do Cliente partilham o mesmo esqueleto: etiqueta do serviço · prazo · estado · barra de fases · fase atual + próximo passo · blocos | PER-02, PER-03, PER-04 | Must | L§4 |
| RF-30.11 | A cor de destaque (`--accent`, `--accent-2`) muda conforme o tipo de serviço, sobre a base visual atual | PER-02, PER-03, PER-04 | Should | D-004 |
| RF-30.12 | A primeira vista mostra pouco texto. Os pormenores ficam atrás de "ver detalhes" | PER-03, PER-04 | Should | `docs/melhorar_designer.txt` |
| RF-30.13 | Um cliente com vários projetos (ex.: várias peças de Design) alterna entre eles no seletor de projetos atual | PER-04 | Must | D-019, PR #3 |

### RF-30.2 Pagamentos
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-30.20 | O admin deve registar os pagamentos de um projeto: tipo (**sinal**, **restante**, **extra**), descrição, valor em Kz e **data limite** opcional | PER-01 | Must | D-009, Q-023 |
| RF-30.21 | Cada pagamento tem o estado **pendente**, **pago** ou **em atraso**. O estado passa a "em atraso" sozinho depois da data limite (fuso Africa/Luanda) | PER-01, PER-03, PER-04 | Should | Q-023, D-026 |
| RF-30.22 | O admin marca um pagamento como pago com a **data do pagamento**. Pode desfazer essa marcação se se enganar, e a alteração fica no histórico | PER-01 | Must | D-009 |
| RF-30.23 | O cliente vê só a leitura dos pagamentos: total, pago, em falta e a lista com o estado de cada um. Não há pagamento nem comprovativo no portal | PER-02, PER-03, PER-04 | Must | D-009 |
| RF-30.24 | Um pagamento pendente que bloqueia uma fase (RF-10.23, RF-10.61, RF-20.23, RF-20.60) aparece como **próximo passo do cliente** ("Pagar o sinal", "Pagar o restante") com o valor | PER-03, PER-04 | Must | D-013, D-018 |
| RF-30.25 | Os pagamentos extra (ex.: ronda de revisão adicional) têm de ser aceites pelo cliente antes de contarem → RF-30.3 Aprovações | PER-04 | Must | D-017, RF-20.43 |

### RF-30.3 Aprovações
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-30.30 | O admin deve pedir uma aprovação ao cliente sobre um objeto: **orçamento**, **índice**, **prova/arte**, **extra** ou **entrega** | PER-01 | Must | visão §5.1, RF-10/RF-20 |
| RF-30.31 | O cliente responde com **Aprovar** ou **Pedir alterações**. "Pedir alterações" exige um comentário | PER-02, PER-03, PER-04 | Must | visão §5.1 |
| RF-30.32 | O sistema regista cada resposta com a data, a hora, o autor, a decisão, o comentário e a **versão** do objeto (ex.: V3) | PER-01 | Must | O2 (visão) |
| RF-30.33 | Uma aprovação dada é **definitiva** para o cliente. Só o admin a pode reabrir, com motivo obrigatório | PER-01 | Must | visão §5.1, D-022 |
| RF-30.34 | O cliente vê as **aprovações pendentes** em destaque na primeira vista e o histórico atrás de "ver detalhes" | PER-02, PER-03, PER-04 | Must | L§4 |
| RF-30.35 | O admin recebe um aviso por email quando o cliente aprova ou pede alterações | PER-01 | Should | PER-01 (dores) |

### RF-30.4 Ficheiros e entregáveis
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-30.40 | O admin deve carregar ficheiros num projeto, associados a uma fase e a um papel: **entregável**, **prova** ou **interno** | PER-01 | Must | visão §5.1 |
| RF-30.41 | O cliente pode carregar **referências** apenas nas fases de briefing e revisão (Académico: fases 1 e 5; Design: fases 1 e 4) e, no Académico, como anexo de um pedido de ajuste na fase 7 (PA-001) | PER-03, PER-04 | Must | D-010, Q-006 |
| RF-30.42 | Limites do cliente: **JPG, PNG, WebP, HEIC, PDF, DOC, DOCX**; até **10 MB** por ficheiro e **10 ficheiros por fase**. Fora dos limites, aparece uma mensagem clara antes do envio | PER-03, PER-04 | Must | Q-021, D-024 |
| RF-30.43 | Os ficheiros guardam **versões**: um ficheiro novo com o mesmo papel não apaga o anterior | PER-01 | Must | RF-10.73, RF-20.84 |
| RF-30.44 | Um ficheiro pode ficar **bloqueado** até um pagamento estar pago (ex.: entrega final do Académico). O cliente vê que existe, mas não o descarrega | PER-01, PER-03 | Must | D-013 |
| RF-30.45 | O cliente só descarrega ficheiros por **links temporários**. Nenhum ficheiro é público | PER-02, PER-03, PER-04 | Must | repo público, segurança (M3-03) |
| RF-30.46 | Imagens mostram-se em **miniatura comprimida** e o original só abre a pedido | PER-03, PER-04 | Must | Q-010 |
| RF-30.47 | **90 dias** depois de o projeto ser concluído, os ficheiros são apagados do armazenamento e fica só o registo (nome, data, autor). O admin é avisado 7 dias antes e pode adiar | PER-01 | Should | Q-022, D-025 |
| RF-30.48 | O cliente vê, num projeto concluído, até quando pode descarregar os ficheiros | PER-03, PER-04 | Should | D-025, D-027 |
| RF-30.49 | O admin vê o espaço ocupado no armazenamento, no total e por projeto | PER-01 | Could | plano gratuito (1 GB) |

### RF-30.5 Link mágico e acesso
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-30.50 | O admin deve gerar um **link mágico** para o cliente de um projeto, em ≤ 2 cliques a partir do projeto | PER-01 | Must | D-011, PER-01 |
| RF-30.51 | O link é de **uso único** e **expira em 24 horas**. Um link expirado ou já usado mostra "Este link já não é válido — peça um novo" com o botão do WhatsApp | PER-01, PER-03, PER-04 | Must | Q-020, D-023 |
| RF-30.52 | O admin pode **Copiar** o link, **Abrir no WhatsApp** (`wa.me` com a mensagem e o link já preenchidos) ou **Enviar por email** (Resend; o envio por email é Should, D-039) | PER-01 | Must | D-011 |
| RF-30.53 | Ao abrir o link, o cliente entra direto na Área do Cliente do projeto e fica com **sessão longa** no telemóvel. **Não é obrigatório** definir uma senha | PER-03, PER-04 | Must | Q-020, D-023 |
| RF-30.54 | O cliente pode **definir uma senha opcional** nas definições, para entrar depois com email e senha | PER-02, PER-03, PER-04 | Should | D-011 |
| RF-30.55 | O acesso por **email + senha temporária** com troca no 1.º acesso continua a funcionar como alternativa | PER-02 | Must | D-011, spec §4 |
| RF-30.56 | O admin pode criar um cliente **sem senha** (só com o link mágico) | PER-01 | Must | D-023 |
| RF-30.57 | O sistema regista quando cada link foi gerado, por que canal e quando foi usado | PER-01 | Should | segurança (M3-06) |

### RF-30.6 Mensagens e avisos
| Código | Descrição | Persona | Prioridade | Origem |
|---|---|---|---|---|
| RF-30.60 | As mensagens assíncronas atuais passam a existir nos 3 serviços. Em Académico e Design, uma mensagem pode ser **geral** ou **sobre uma fase** | PER-02, PER-03, PER-04 | Must | spec §5.5, L§4 |
| RF-30.61 | O cliente recebe email (Resend) quando: há resposta a uma mensagem, uma aprovação lhe é pedida, um pagamento fica pendente ou um ficheiro novo é disponibilizado | PER-02, PER-03, PER-04 | Should | `lib/email` (existente) |
| RF-30.62 | O admin recebe email quando o cliente envia uma mensagem, um ficheiro ou responde a uma aprovação | PER-01 | Should | spec §5.5 ("por fazer") |
| RF-30.63 | Fora do horário de atendimento (08h00–20h00, todos os dias), a página de mensagens mostra: *"Entraremos em contacto assim que o horário de abertura estiver disponível."* | PER-02, PER-03, PER-04 | Should | RN-51/52, D-036 |
| RF-30.64 | Com uma ação do cliente pendente há 2 dias, o cliente recebe um **lembrete** por email | PER-03, PER-04 | Should | RN-22, D-034 |

