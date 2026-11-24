# User stories — Área do Cliente multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-08] · Issue: #18 · Versão: 1.0 · Data: 2026-11-23
> Depende de: `requisitos-funcionais.md`, `regras-negocio.md`, `personas.md` · Perguntas/decisões usadas: Q-032…Q-035, D-038…D-041
> Gerado por `scripts/gerar_us.py` — editar lá e voltar a correr.

## Convenções
- Uma US por **passo do fluxo** (D-041). Cada US liga a vários RF; todos os RF têm pelo menos uma US.
- A prioridade da US é a do RF mais alto que cobre. Os RF Should dentro de uma US Must podem ficar para o fim da milestone.
- As telas (TEL-NN) estão em `docs/04-ux-ui/fluxo-telas.md`; "— (email)" = a US não tem tela própria.

## Comum

### US-001 — Criar um projeto do tipo certo
Como **PER-01**, quero criar um projeto escolhendo Desenvolvimento, Académico ou Design, para que o portal mostre as fases e os blocos certos sem configuração manual.

**Critérios:** Dado que estou no painel de admin a criar um projeto · Quando escolho Académico ou Design · Então o campo do repositório GitHub desaparece e as 7 fases do serviço são criadas a partir do modelo.

Prioridade: **Must** · RF: RF-30.01, RF-30.02, RF-30.03, RF-10.01, RF-20.01 · Tela: TEL-51

### US-002 — Enviar o link mágico ao cliente
Como **PER-01**, quero gerar um link de acesso e enviá-lo pelo WhatsApp em 2 cliques, para o cliente entrar sem ter de criar ou lembrar-se de uma senha.

**Critérios:** Dado que o cliente foi criado sem senha · Quando carrego em "Gerar link" e depois em "Abrir no WhatsApp" · Então abre o `wa.me` com a mensagem e o link preenchidos; o link vale 24 h e só funciona uma vez.

Prioridade: **Must** · RF: RF-30.50, RF-30.51, RF-30.52, RF-30.56, RF-30.57 · Tela: TEL-57

### US-003 — Entrar pelo link mágico
Como **PER-04**, quero abrir o link que recebi no WhatsApp e ver logo o meu projeto, para não ter de instalar nada nem decorar senhas.

**Critérios:** Dado que recebi um link válido · Quando toco no link no WhatsApp · Então entro na Área do Cliente do meu projeto e continuo com sessão aberta no telemóvel; se o link já tiver sido usado ou expirado, vejo "peça um novo" com o botão do WhatsApp.

Prioridade: **Must** · RF: RF-30.53, RF-30.51, RF-30.54, RF-30.55 · Tela: TEL-03, TEL-04, TEL-01, TEL-02, TEL-06

### US-004 — Ver onde está o projeto
Como **PER-03**, quero ver de relance a fase atual e o próximo passo, para saber se estou à espera da GeniusFrela ou se a ação é minha.

**Critérios:** Dado que entrei na Área do Cliente · Quando abro a visão geral · Então vejo a etiqueta do serviço, a barra de fases com o estado de cada uma e a fase atual com uma frase curta e um só botão de ação.

Prioridade: **Must** · RF: RF-30.10, RF-30.11, RF-30.12, RF-10.02, RF-10.03, RF-10.04, RF-20.02, RF-20.03, RF-20.04, RF-20.05 · Tela: TEL-10, TEL-30, TEL-40

### US-005 — Avançar as fases
Como **PER-01**, quero avançar uma fase e escrever o próximo passo, para manter o cliente informado sem mensagens repetidas no WhatsApp.

**Critérios:** Dado que um projeto Académico está na fase 4 · Quando marco a fase como concluída ou "a aguardar o cliente" · Então a barra de fases e o próximo passo do cliente mudam de imediato; uma fase pode ficar "não aplicável".

Prioridade: **Must** · RF: RF-30.04, RF-10.33, RF-20.62 · Tela: TEL-52

### US-006 — Alternar entre projetos
Como **PER-04**, quero mudar entre o convite e a lona do mesmo evento, para acompanhar todas as peças com a mesma conta.

**Critérios:** Dado que tenho 2 projetos de Design · Quando escolho o outro projeto no seletor · Então vejo as fases, provas e pagamentos desse projeto.

Prioridade: **Must** · RF: RF-30.13 · Tela: TEL-05

### US-007 — Cancelar um projeto
Como **PER-01**, quero marcar um projeto como cancelado, para fechar o registo quando o cliente desiste.

**Critérios:** Dado que o cliente desistiu depois de pagar o sinal · Quando marco o projeto como cancelado · Então o projeto fica cancelado, o sinal continua registado como pago e não há reembolso.

Prioridade: **Must** · RF: RF-30.06 · Tela: TEL-52

### US-008 — Manter o Desenvolvimento como está
Como **PER-02**, quero continuar a ver as fases e tarefas vindas do GitHub, para não perder nada do que já usava.

**Critérios:** Dado que sou cliente de um projeto Desenvolvimento · Quando abro o portal depois da v1.1 · Então as páginas atuais funcionam como antes e ganho os blocos Pagamentos, Aprovações e Ficheiros.

Prioridade: **Must** · RF: RF-30.05 · Tela: TEL-40, TEL-41, TEL-42, TEL-44

## Pagamentos

### US-009 — Registar pagamentos
Como **PER-01**, quero registar sinal, restante e extras com valor e data limite, para ter prova do que foi combinado e pago.

**Critérios:** Dado que o cliente aceitou o orçamento · Quando registo o sinal de 50% e marco-o como pago com a data · Então o pagamento fica pago, a alteração fica no histórico e posso desfazê-la se me enganar.

Prioridade: **Must** · RF: RF-30.20, RF-30.22, RF-10.20, RF-20.20 · Tela: TEL-53

### US-010 — Ver os pagamentos
Como **PER-04**, quero ver quanto já paguei e quanto falta, para não ter surpresas no preço.

**Critérios:** Dado que tenho um sinal pago e o restante pendente · Quando abro os pagamentos · Então vejo total, pago, em falta e o estado de cada pagamento (pendente, pago, em atraso); não há botão de pagar no portal.

Prioridade: **Must** · RF: RF-30.23, RF-30.21 · Tela: TEL-21

### US-011 — Saber que um pagamento me trava
Como **PER-03**, quero ver como próximo passo o pagamento de que o trabalho depende, para perceber porque é que o trabalho não avança.

**Critérios:** Dado que aceitei o orçamento mas o sinal está pendente · Quando abro a visão geral · Então o próximo passo diz "Pagar o sinal" com o valor e a fase seguinte não avança.

Prioridade: **Must** · RF: RF-30.24, RF-10.23, RF-20.23, RF-10.62 · Tela: TEL-10, TEL-30

## Aprovações

### US-012 — Aceitar o orçamento
Como **PER-03**, quero aceitar o orçamento no portal, para o trabalho poder começar e ficar registado o que aceitei.

**Critérios:** Dado que o admin registou o orçamento · Quando carrego em "Aceitar" · Então vejo antes a regra do sinal não reembolsável; o aceite fica com data, hora e autor.

Prioridade: **Must** · RF: RF-10.21, RF-10.22, RF-20.21, RF-20.22, RF-30.30, RF-30.32, RF-30.06 · Tela: TEL-20, TEL-55

### US-013 — Responder a uma aprovação
Como **PER-04**, quero aprovar ou pedir alterações com um comentário, para dar a minha decisão por escrito.

**Critérios:** Dado que tenho uma aprovação pendente · Quando escolho "Pedir alterações" sem escrever nada · Então o sistema pede o comentário; ao enviar, fica registado com a versão e o admin é avisado.

Prioridade: **Must** · RF: RF-30.31, RF-30.32, RF-30.34, RF-30.35 · Tela: TEL-20, TEL-55

### US-014 — Reabrir uma aprovação
Como **PER-01**, quero reabrir uma aprovação com motivo, para corrigir um erro detetado depois de o cliente aprovar.

**Critérios:** Dado que o cliente aprovou a arte e a produção ainda não começou · Quando reabro com o motivo "nome errado" · Então a aprovação volta a pendente, o motivo fica no histórico; depois de a produção começar, a reabertura está bloqueada.

Prioridade: **Must** · RF: RF-30.33, RF-20.53, RF-20.54 · Tela: TEL-55

## Ficheiros

### US-015 — Enviar referências
Como **PER-04**, quero enviar fotos e textos de referência no briefing, para a GeniusFrela ter tudo o que preciso num só sítio.

**Critérios:** Dado que o projeto está na fase de briefing · Quando envio uma foto de 4 MB e um PDF de 12 MB · Então a foto entra com barra de progresso; o PDF é recusado antes do envio com a indicação do limite de 10 MB.

Prioridade: **Must** · RF: RF-30.41, RF-30.42, RF-10.12, RF-20.13, RF-10.51 · Tela: TEL-23

### US-016 — Carregar entregáveis e provas
Como **PER-01**, quero carregar um ficheiro como entregável, prova ou interno, numa fase, para o cliente ver só o que deve ver.

**Critérios:** Dado que estou no projeto · Quando carrego uma nova versão de um entregável · Então a versão anterior mantém-se e a nova passa a ser a atual.

Prioridade: **Must** · RF: RF-30.40, RF-30.43 · Tela: TEL-54

### US-017 — Descarregar com segurança
Como **PER-03**, quero descarregar os meus ficheiros, para ter os entregáveis sem que mais alguém os veja.

**Critérios:** Dado que tenho um ficheiro disponível · Quando carrego em descarregar · Então o download usa um link temporário; um ficheiro bloqueado por pagamento aparece mas não se descarrega.

Prioridade: **Must** · RF: RF-30.44, RF-30.45, RF-30.46 · Tela: TEL-22

### US-018 — Gerir o espaço e a retenção
Como **PER-01**, quero ser avisado antes de os ficheiros de um projeto concluído serem apagados, para não esgotar o armazenamento gratuito sem perder nada importante.

**Critérios:** Dado que um projeto foi concluído há 83 dias · Quando chega o aviso dos 7 dias · Então posso adiar; sem ação, os ficheiros são apagados aos 90 dias e fica o registo; o cliente via até quando podia descarregar.

Prioridade: **Should** · RF: RF-30.47, RF-30.48, RF-30.49 · Tela: TEL-50

## Mensagens

### US-019 — Escrever à GeniusFrela
Como **PER-04**, quero enviar uma mensagem geral ou sobre uma fase, para tirar dúvidas sem perder o histórico.

**Critérios:** Dado que são 22h · Quando envio uma mensagem sobre a fase de briefing · Então a mensagem fica guardada e vejo "Entraremos em contacto assim que o horário de abertura estiver disponível.".

Prioridade: **Must** · RF: RF-30.60, RF-30.63, RF-10.13, RF-20.14 · Tela: TEL-24, TEL-58

### US-020 — Receber avisos por email
Como **PER-03**, quero ser avisado por email quando algo depende de mim ou fica pronto, para não ter de abrir o portal para saber se há novidades.

**Critérios:** Dado que uma aprovação me foi pedida há 2 dias e não respondi · Quando passa o 2.º dia · Então recebo um lembrete por email, sem dados sensíveis, com o link para o portal.

Prioridade: **Should** · RF: RF-30.61, RF-30.62, RF-30.64, RF-10.63, RF-20.31, RF-20.72 · Tela: — (email)

### US-021 — Ver o prazo ajustado
Como **PER-03**, quero ver a nova data de entrega quando o atraso foi meu, para saber com o que posso contar.

**Critérios:** Dado que a fase esteve 3 dias "a aguardar o cliente" · Quando abro a visão geral · Então a data de entrega aparece 3 dias depois, com o motivo "à espera da sua aprovação desde DD/MM".

Prioridade: **Should** · RF: RF-30.07 · Tela: TEL-10, TEL-30

## Académico

### US-022 — Registar a ficha do trabalho
Como **PER-01**, quero registar tema, tipo, nível, instituição, disciplina, normas, páginas e prazo, para ter tudo o que foi acordado num só sítio.

**Critérios:** Dado que criei um projeto Académico · Quando preencho a ficha · Então o cliente vê-a atrás de "ver detalhes".

Prioridade: **Must** · RF: RF-10.10, RF-10.11 · Tela: TEL-56, TEL-13

### US-023 — Ver o prazo em destaque
Como **PER-05**, quero ver quantos dias faltam para o prazo, para não entrar em pânico nem falhar a entrega.

**Critérios:** Dado que faltam 36 horas · Quando abro a visão geral · Então vejo a contagem em horas, na cor de "a aguardar"; depois do prazo fica a vermelho.

Prioridade: **Must** · RF: RF-10.80, RF-10.81, RF-10.82, RF-10.83 · Tela: TEL-10

### US-024 — Aprovar o índice
Como **PER-03**, quero aprovar o índice proposto ou pedir alterações, para garantir a estrutura antes de o texto ser escrito.

**Critérios:** Dado que o admin registou o índice · Quando peço alterações com um comentário · Então a fase 3 volta a "em curso" e o admin é avisado; num trabalho curto, a fase pode ficar "não aplicável".

Prioridade: **Must** · RF: RF-10.30, RF-10.31, RF-10.32, RF-10.33 · Tela: TEL-20, TEL-56

### US-025 — Acompanhar os capítulos
Como **PER-03**, quero ver quantos capítulos já estão prontos, para saber em que ponto está o trabalho.

**Critérios:** Dado que o admin marcou 3 de 5 capítulos como concluídos · Quando abro a fase de desenvolvimento · Então vejo "3 de 5 capítulos" e a percentagem, sem acesso ao texto; sem capítulos, vejo só o progresso da fase.

Prioridade: **Must** · RF: RF-10.40, RF-10.41, RF-10.42, RF-10.43, RF-10.50 · Tela: TEL-11

### US-026 — Receber a entrega final
Como **PER-03**, quero descarregar o trabalho em PDF e Word, para entregá-lo na instituição.

**Critérios:** Dado que o admin carregou os ficheiros finais e o restante está pendente · Quando abro a entrega · Então vejo "Entrega pronta, falta pagar o restante" com o valor; depois de o admin registar o pagamento, descarrego os dois ficheiros e começa o prazo de ajustes.

Prioridade: **Must** · RF: RF-10.60, RF-10.61, RF-10.62, RF-10.64 · Tela: TEL-11, TEL-22

### US-027 — Pedir um ajuste
Como **PER-05**, quero pedir um ajuste dentro do prazo, para corrigir o que o professor apontou.

**Critérios:** Dado que restam 4 dos 7 dias de ajustes · Quando peço um ajuste com descrição e ficheiro · Então o admin recebe o pedido e responde com uma nova versão, sem apagar a anterior; depois do prazo, o botão leva às mensagens.

Prioridade: **Must** · RF: RF-10.70, RF-10.71, RF-10.72, RF-10.73 · Tela: TEL-14, TEL-59

### US-028 — Concluir o projeto
Como **PER-01**, quero que o projeto se conclua sozinho no fim do prazo de ajustes, para não ter de fechar projetos à mão.

**Critérios:** Dado que o prazo de ajustes terminou sem pedidos abertos · Quando passa o último dia · Então o projeto fica concluído e começa a contagem dos 90 dias dos ficheiros.

Prioridade: **Should** · RF: RF-10.74 · Tela: TEL-52

## Design

### US-029 — Registar a ficha técnica
Como **PER-01**, quero registar tipo de peça, medidas, material, quantidade, acabamento, textos e data do evento, para produzir sem ambiguidades.

**Critérios:** Dado que criei um projeto Design · Quando indico que a peça é um convite digital sem impressão · Então a ficha fica visível ao cliente atrás de "ver detalhes" e a fase de produção fica "não aplicável".

Prioridade: **Must** · RF: RF-20.10, RF-20.11, RF-20.12, RF-20.62 · Tela: TEL-56, TEL-35

### US-030 — Ver a última prova em grande
Como **PER-04**, quero ver a prova mais recente logo ao abrir, para mostrá-la à família e decidir depressa.

**Critérios:** Dado que o admin carregou a V2 · Quando abro o projeto · Então a V2 aparece em grande, em miniatura comprimida, com "Ronda 1 de 2" e um só botão (comentar ou aprovar).

Prioridade: **Must** · RF: RF-20.05, RF-20.30, RF-20.80, RF-20.83 · Tela: TEL-30

### US-031 — Comparar versões
Como **PER-04**, quero comparar a V1 com a V2, para perceber o que mudou.

**Critérios:** Dado que há duas versões · Quando abro a galeria e escolho comparar · Então vejo as duas, uma por cima da outra no telemóvel, cada uma com a data e os comentários da ronda.

Prioridade: **Must** · RF: RF-20.81, RF-20.82, RF-20.84 · Tela: TEL-32, TEL-31

### US-032 — Pedir uma ronda de revisão
Como **PER-04**, quero comentar a prova atual e pedir alterações, para ter a peça igual ao que imaginei.

**Critérios:** Dado que estou na ronda 1 de 2 · Quando envio um comentário com uma imagem · Então gasto 1 ronda, o contador passa a "Ronda 2 de 2" e o admin responde com a V seguinte.

Prioridade: **Must** · RF: RF-20.40, RF-20.41, RF-20.42 · Tela: TEL-33

### US-033 — Pedir uma ronda extra
Como **PER-04**, quero pedir mais uma ronda quando as incluídas acabaram, para continuar a afinar a peça sabendo quanto custa.

**Critérios:** Dado que usei as 2 rondas incluídas · Quando peço uma ronda extra · Então o admin indica o valor; a ronda só começa depois de eu aceitar o extra, que fica em Pagamentos.

Prioridade: **Must** · RF: RF-20.43, RF-30.25 · Tela: TEL-33, TEL-53

### US-034 — Aprovar a arte para produção
Como **PER-04**, quero aprovar a arte final, para a peça ir para produção sem erros.

**Critérios:** Dado que estou satisfeita com a V3 · Quando carrego em "Aprovar arte para produção" · Então vejo o aviso de irreversibilidade e os nomes, a data e a quantidade da ficha; ao confirmar, fica registada a V3 e não há mais comentários.

Prioridade: **Must** · RF: RF-20.44, RF-20.50, RF-20.51, RF-20.52 · Tela: TEL-34

### US-035 — Acompanhar a produção
Como **PER-04**, quero ver se a peça já está a ser impressa, para planear o levantamento.

**Critérios:** Dado que aprovei a arte mas o restante está pendente · Quando abro o projeto · Então o próximo passo é "Pagar o restante"; depois de pago, vejo "a imprimir" e depois "pronto".

Prioridade: **Must** · RF: RF-20.60, RF-20.61 · Tela: TEL-30, TEL-53

### US-036 — Levantar a peça
Como **PER-04**, quero saber quando e onde levanto a peça e descarregar os ficheiros digitais, para ter tudo pronto antes do evento.

**Critérios:** Dado que a peça está pronta · Quando abro o projeto · Então vejo a data e o local em destaque e, se houver, os ficheiros finais; o admin marca como entregue e o projeto conclui-se.

Prioridade: **Must** · RF: RF-20.70, RF-20.71, RF-20.73, RF-20.74 · Tela: TEL-30, TEL-52
