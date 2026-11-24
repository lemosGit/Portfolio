# Revisão cruzada da modelagem
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M2-04] · Issue: #23 · Versão: 1.0 · Data: 2026-11-24

| # | Data | Encontrado | Onde | Correção |
|---|---|---|---|---|
| RV-01 | 2026-11-24 | `approval_responses.attachment_deliverable_id` estava no texto do MER mas não no diagrama | `src/mer-blocos-comuns.mmd` | Atributo e relação `deliverables → approval_responses` acrescentados |
| RV-02 | 2026-11-24 | `activity_log.entity` não incluía as fichas, apesar da regra F6 (M2-03) | `mer/blocos-comuns.md` §3.7 | Valores `academic_brief` e `design_spec` acrescentados |
| RV-03 | 2026-11-24 | Colunas de auditoria (`created_by`, `created_at`, `sent_at`…) e de apresentação (`title`, `notes`, `width`, `height`) não aparecem nos diagramas | `src/mer-blocos-comuns.mmd` | Mantido de propósito: os diagramas mostram o essencial; o dicionário é a referência completa |
| RV-04 | 2026-11-24 | O prazo ajustado precisava dos intervalos de pausa a pedido do cliente, que não existiam em lado nenhum legível pelo cliente | `mer/fases-servicos.md` | Nova tabela `project_status_events` (D-066); dicionário regenerado (16 tabelas, 184 colunas) |

Verificação automática: `python3 scripts/gerar_dicionario.py` (FK válidas e todo o atributo do MER no dicionário). A revisão de classes ↔ MER ↔ dicionário volta a correr na M2-05 e na M2-06, se aparecerem atributos novos.
