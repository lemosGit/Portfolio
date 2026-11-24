# Wireframe — Blocos comuns e link mágico
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M4-05] · Issue: #36 · Versão: 1.0 · Data: 2026-11-24
> Depende de: **Design System V1** (ADR-004), [`ds.css`](ds.css), `fluxo-telas.md` (TEL-03, 04, 05, 21, 22, 23, 24, 57), ADR-002, ADR-003 · Decisões usadas: D-009, D-011, D-019, D-023, D-032, D-036, D-068, D-091, D-111, D-112

**Abrir:** [`blocos-comuns.html`](blocos-comuns.html). **Imagem:** [`img/blocos-comuns.png`](img/blocos-comuns.png).

## O que está desenhado
| TEL | Ecrã | Cor |
|---|---|---|
| TEL-03 | Entrar pelo link: logótipo vertical, "Olá, Teresa", projeto, **Entrar no meu projeto**, validade | marca |
| TEL-04 | Link inválido: porquê + **Pedir um novo link** (WhatsApp) + entrar com senha | marca |
| TEL-57 | Admin, gerar link: URL, **Abrir no WhatsApp**, Copiar, Email, aviso do link anterior, 1 de 5 nesta hora | marca |
| TEL-21 | Pagamentos: já pagou / falta, barra, sinal e restante com estado, enviar comprovativo no WhatsApp | Âmbar (Académico) |
| TEL-22 | Ficheiros: provas (atual marcada), os seus ficheiros, finais com cadeado e motivo | Lilás (Design) |
| TEL-23 | Enviar ficheiros: progresso por ficheiro, erro de 10 MB com o que fazer, 3 de 10 nesta fase | Âmbar |
| TEL-24 | Mensagens fora de horário: aviso com o texto da RN-52 e o horário | Lilás |
| TEL-05 | Os seus projetos: cada um com o chip do seu serviço e o estado ("Ação sua", "Em curso") | por projeto |

## Decisões de desenho
1. **A entrada é um ecrã calmo com um só botão**: o logótipo em cima, a decisão em baixo, ao alcance do polegar. Abrir o link não o gasta; só o botão (D-068).
2. **O link inválido não é um erro, é uma saída**: o botão verde do WhatsApp pede um link novo num toque (RF-30.51).
3. **No admin, o WhatsApp é a ação principal** (D-011), em verde WhatsApp com texto escuro; Copiar e Email são secundários.
4. **Pagamentos só de leitura** (D-009): o que falta aparece na cor do módulo; o comprovativo segue pelo WhatsApp.
5. **Os ficheiros bloqueados dizem porquê** e quando ficam disponíveis (RF-30.44).
6. **Os erros de envio explicam o que fazer** ("Envie uma versão mais leve ou só os capítulos que precisamos"), sem pedir desculpa.
7. **O aviso de fora de horário não bloqueia** o envio (RN-52).
8. **Tokens da marca** (D-111): o DS V1 só define a primária violeta `#8B7CF6`; derivei suave `#C9C2FB`, tinta `#1C1838` e sobre `#0B0F17` (contraste: 5,8 no botão e 10,2 no secundário).

## Correção feita nos três wireframes (D-112)
A revisão em captura mostrou que o ícone usado como logótipo parecia o "G" da Google e não tinha o ponto do logótipo GeniusFrela. Foi substituído pelo "G" em arco com o ponto e o gradiente violeta → azul → ciano, e "Frela" passou a ter o gradiente no nome, como na ficha R2. Corrigido em `academico.html`, `design.html` e `blocos-comuns.html`, com as imagens refeitas. Na M5 usa-se o `components/BrandMark.tsx`, que já existe.

## Para o G2
Confirmar: os tokens derivados da marca; o verde do WhatsApp como botão principal no admin e no link inválido; o texto da validade do link.
