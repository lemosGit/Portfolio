# Relatório — regressão do layout Desenvolvimento (Tech)
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M9-04] · Issue: #77 · Versão: 1.0 · Data: 2026-11-26
> Depende de: `docs/05-qa/plano-testes.md` (CT-008, US-008), D-097 (migração do Tech em 5 passos), D-114 (capturas só locais)

**Critérios de aceitação:**
- Fases do GitHub, tarefas, demos e mensagens iguais à v1.0 → **cumprido**
- Projeto `candongueiro-pay` de teste intacto → **cumprido**

## 1. Conteúdo das páginas do Tech (E2E, CI)
`tests/e2e/desenvolvimento.spec.ts`, com o cliente de demonstração Alex (Nova App Mobile), a 360 px e 1280 px: **14 de 14 OK**.

| Página | O que se verifica |
|---|---|
| Menu | As 5 entradas da v1.0 (Visão geral, Meu projeto, Entregas, Mensagens, **Agenda**), `data-service="development"`, etiqueta TECH |
| Visão geral | Tarefa à espera do cliente ("Textos dos termos e da privacidade"); progresso 66%; as **6 fases do GitHub** pela ordem, com o estado de cada uma (Concluída, Em curso 67%, Prevista 17 Dez…); próxima reunião; as 3 novidades das issues; a demo v0.9.0; sem erros de página |
| Meu projeto | As 6 etapas, "Agora" na fase em curso; separador **Tarefas** (`?vista=tarefas`) com as tarefas; separador **Demonstração** (`?vista=demonstracao`) com a versão web e a app v0.9.0 e "Todas as versões" |
| Entregas | Demo web, app mobile com QR e "Instalar v0.9.0", histórico das 4 versões (Web e Android v0.9.0 e v0.8.0) |
| Mensagens | O histórico com o tema de cada mensagem ("Sobre: Desenvolvimento"); o formulário com Geral, as etapas e as tarefas que precisam do cliente |
| Agenda | Próxima reunião com "Entrar na reunião", e as 2 reuniões anteriores |
| Blocos novos | Aprovações, Pagamentos, fichas e "Fase N de 7" **não** aparecem no Tech (D-097) |

## 2. Aspeto (capturas de referência, local)
`npm run e2e:visual -- --grep "@visual Tech|Login @visual"`: **12 de 12 OK, sem regravar** (Visão geral, Meu projeto, Entregas, Mensagens, Agenda e Login, a 360 px e 1280 px). As capturas são as aprovadas a 2026-11-24 depois do DS V1 (Q-081, Q-082); nenhuma das entregas v0.2 e v0.3 nem da M9 as mudou.

## 3. Produção: projeto `candongueiro-pay` (só leitura, 2026-11-26)
| Verificação | Resultado |
|---|---|
| Tipo de serviço | `development` ✅ |
| Origem das fases | GitHub (`lemosGit/candongueiro_pay`); **0** linhas em `project_phases` (as fases não passaram para a BD) ✅ |
| Fases calculadas no admin (25/11, Chrome) | "fase: Descoberta & Requisitos · 40%" ✅ |
| Demos | 2 registadas ✅ |
| Dados dos serviços novos | 0 orçamentos, 0 pagamentos, 0 aprovações, 0 entregáveis ✅ |
| Alterações | Nenhum registo em `activity_log` desde a criação (22/11) ✅ |

## 4. Conclusão
Sem regressões no Tech. O menu, as páginas, os dados do GitHub e o aspeto são os da v1.0 (com o DS V1 aprovado), e o projeto real de teste não foi tocado pelas migrações 0006…0018.
