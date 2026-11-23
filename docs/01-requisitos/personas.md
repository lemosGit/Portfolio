# Personas — Área do Cliente multi-serviço
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M1-02] · Issue: #12 · Versão: 1.0 · Data: 2026-11-23
> Depende de: `visao-modulos.md` · Perguntas/decisões usadas: Q-008…Q-011, D-012

> Os nomes são **fictícios** e servem só para dar rosto à persona. Os perfis vêm das respostas Q-008 a Q-011. Os pormenores marcados com *(hipótese)* devem ser confirmados com clientes reais na homologação (G3).

## Resumo

| Código | Persona | Serviço | Papel | Peso |
|---|---|---|---|---|
| PER-01 | Admin GeniusFrela | Todos | Gere projetos, fases, ficheiros, pagamentos, links | — |
| PER-02 | Cliente Desenvolvimento | Desenvolvimento | Acompanha o sistema em construção (**já existe**) | — |
| PER-03 | Estudante universitário | Académico | Cliente principal do Académico | Principal |
| PER-05 | Estudante do ensino médio | Académico | Cliente secundário do Académico | Secundária |
| PER-04 | Particular com evento | Design | Cliente principal do Design | Principal |

O pequeno negócio (logótipo e identidade) não tem persona própria nesta versão (Q-009). Se aparecer, segue o fluxo da PER-04 sem a data do evento.

**Contexto comum aos clientes (Q-010, Q-011):**
- Acedem por **telemóvel Android com dados móveis**: rede variável, dados contados, ecrã pequeno.
- Chegam pelo **WhatsApp** e esperam respostas rápidas.
- **Quem acompanha também aprova e paga**, por isso basta uma conta por projeto (D-012).

---

## PER-01 — Admin GeniusFrela
- **Quem:** o João Pereira, que faz o atendimento, a produção e a gestão sozinho.
- **Objetivos:** atualizar o estado de um projeto em segundos, sem duplicar trabalho no WhatsApp, e ter prova escrita de aceites e aprovações.
- **Dores:** referências e provas espalhadas por conversas, clientes a perguntar "já está?", aprovações de arte só "de boca".
- **Contexto:** computador para produzir e telemóvel para responder. O atendimento humano é todos os dias, das 08h às 20h, incluindo fins de semana (Q-031, D-036).
- **Permissões:** tudo. Cria clientes e projetos, escolhe o `service_type`, avança fases, envia ficheiros e provas, regista pagamentos, gera links mágicos e reabre aprovações.
- **Precisa no painel:** lista de projetos com a fase e o próximo passo, "gerar link" em ≤ 2 cliques, upload rápido de provas.

## PER-02 — Cliente Desenvolvimento *(já existe)*
Descrita na `docs/especificacao_portal_cliente.md` §2. Nesta versão ganha os blocos comuns (Ficheiros, Aprovações, Pagamentos e o link mágico). O resto do seu fluxo **não muda** (O5).

## PER-03 — Estudante universitário *(principal Académico)*
**"Kiala", 23 anos, finalista de licenciatura**
- **Pedido típico:** monografia ou TCC, relatório de estágio, formatação ou revisão segundo as normas (APA ou da instituição).
- **Objetivos:** entregar a tempo, cumprir as normas e perceber o trabalho o suficiente para o apresentar *(hipótese: defesa oral)*.
- **Dores:** medo de falhar o prazo, não saber em que ponto está o trabalho, e versões trocadas por WhatsApp.
- **Contexto:** Android com dados móveis; abre o portal em momentos curtos.
- **O que vê primeiro:** **dias até ao prazo** → capítulos feitos (3 de 5) → o que tem de fazer agora (aceitar, aprovar o índice, enviar um enunciado).
- **Permissões:** vê o seu projeto. Aceita o orçamento, aprova ou pede alterações ao índice, carrega referências (enunciado, normas, bibliografia) no briefing e na revisão, descarrega a entrega e pede ajustes dentro do prazo, envia mensagens.
- **Jornada:** WhatsApp → acerto do tema, normas, páginas e prazo → recebe o link mágico → aceita o orçamento → aprova o índice → acompanha os capítulos → recebe o PDF ou Word → pede um pequeno ajuste → fim.

## PER-05 — Estudante do ensino médio *(secundária Académico)*
**"Neusa", 16 anos**
- **Pedido típico:** trabalho escolar ou de grupo, com prazo de poucos dias.
- **Diferenças face à PER-03:** prazos muito curtos (o contador de dias é ainda mais crítico), trabalho mais curto (poucos capítulos ou nenhum) e menos exigência de normas. *(Hipótese: pode ser o encarregado de educação a pagar, mas Q-011 indica que normalmente é a mesma pessoa.)*
- **Implicação:** o layout Académico tem de funcionar **sem capítulos** (o progresso cai para a fase) e com prazo em horas ou dias.

## PER-04 — Particular com evento *(principal Design)*
**"Dona Teresa", 38 anos, organiza o casamento da filha**
- **Pedido típico:** convites (digitais e/ou impressos), lona de festa, camisolas personalizadas. Muitas vezes várias peças para o mesmo evento *(hipótese)*.
- **Objetivos:** ter tudo pronto e impresso **antes da data do evento**, igual ao que imaginou, sem surpresas no preço.
- **Dores:** não perceber qual é a versão mais recente, não saber quantas alterações ainda pode pedir, e medo de um erro de texto (nome ou data) ir para impressão.
- **Contexto:** Android com dados móveis, pouco hábito de portais e confia no WhatsApp. Vê as provas no telemóvel e pode mostrá-las à família.
- **O que vê primeiro:** **a última prova em grande** → "Ronda 1 de 2" → o botão do próximo passo (comentar ou aprovar) → a data e o local de levantamento.
- **Permissões:** vê o seu projeto. Carrega referências (fotos, textos, nomes, cores) no briefing e na revisão, comenta as provas, **aprova a arte para produção** (irreversível, com aviso), vê os pagamentos e a data e local de entrega, e envia mensagens.
- **Jornada:** WhatsApp → acerto das peças, medidas, quantidades e preço → link mágico → paga o sinal fora do portal → recebe o conceito → 1 a 2 rondas de comentários → aprova a arte → produção → levanta no local combinado.

---

## Implicações para os próximos artefactos

| De onde vem | Implicação | Onde entra |
|---|---|---|
| Android + dados móveis | Páginas leves; **provas com miniatura comprimida** (WebP) e original só a pedido | M1-06 (RNF), M7-02 |
| Android + dados móveis | O link mágico abre direto no browser do WhatsApp, sem instalar nada | M3-02, M5-12 |
| PER-04 pouco habituada a portais | Um só botão de ação principal por ecrã; linguagem sem termos técnicos | M4-03…M4-05 |
| PER-04 medo de erros de texto | O aviso de irreversibilidade repete os textos-chave (nomes, data) antes de aprovar *(proposta)* | M1-04, M7-04 |
| PER-05 sem capítulos | O progresso por capítulos é opcional | M1-03, M6-03 |
| PER-03 e PER-05 com prazo crítico | Contador de dias em destaque; a cor muda perto do prazo | M6-02 |
| Q-011: quem aprova é quem paga | Uma conta por projeto; vários utilizadores ficam fora de âmbito | D-012 |
