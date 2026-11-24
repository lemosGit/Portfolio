# Dicionário de dados — tabelas novas da v1.1
> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M2-04] · Issue: #23 · Versão: 1.0 · Data: 2026-11-24
> Depende de: `mer/fases-servicos.md`, `mer/blocos-comuns.md`, `mer/fichas-servico.md` · Decisões: D-042…D-061
> Gerado por `scripts/gerar_dicionario.py` — editar lá e voltar a correr. O script falha se uma FK ou um atributo do MER não condizer.

## Convenções
- **Tipos** do PostgreSQL (Supabase). `text` com limite tem `check (char_length(...) <= n)`; `enum` = `text` com `check (... in (...))`, valores na §3.
- **Chave:** `PK` primária · `FK→tabela.coluna` estrangeira · `UK(...)` única (composta quando tem colunas).
- Dinheiro em **Kz** com `numeric(12,2)`; datas sem hora em `date`; instantes em `timestamptz` (mostrados em Africa/Luanda).
- Todas as tabelas têm **RLS** ativa (provisória nos MER; final na M3-06).

## 1. Resumo

| Tabela | Nova? | Colunas | Origem | Descrição |
|---|---|---|---|---|
| `projects` | alterada | 11 | M2-01 · `mer/fases-servicos.md` §3.1 | Projeto do cliente. Só se listam as colunas **novas ou alteradas**; as restantes estão em `0001_portal.sql`. |
| `phase_templates` | sim | 9 | M2-01 · §3.2 | Modelo de fases de cada serviço (Académico e Design). O Desenvolvimento usa o GitHub. |
| `project_phases` | sim | 17 | M2-01 · §3.3 | Fases de um projeto Académico ou Design, copiadas do modelo (D-042). |
| `phase_events` | sim | 8 | M2-01 · §3.4 | Histórico das mudanças de estado das fases; só inserção. Base do prazo ajustado (RN-21). |
| `project_status_events` | sim | 8 | M2-05 · `mer/fases-servicos.md` §3.5 | Histórico das mudanças de estado do projeto; só inserção. Dá os intervalos de pausa a pedido do cliente (D-064, D-066). |
| `quotes` | sim | 15 | M2-02 · `mer/blocos-comuns.md` §3.1 | Orçamento versionado. Ao ser aceite gera o sinal e o restante (D-050). |
| `payments` | sim | 13 | M2-02 · §3.2 | Pagamentos registados pelo admin; pagos fora do portal (D-009). |
| `approvals` | sim | 13 | M2-02 · §3.3 | Pedido de aprovação de uma versão concreta, com cópia fixa do que o cliente viu (D-049). |
| `approval_responses` | sim | 8 | M2-02 · §3.4 | Respostas do cliente e reaberturas do admin; só inserção. Um trigger atualiza `approvals.status`. |
| `deliverables` | sim | 14 | M2-02 · §3.5 | Uma versão (V1, V2…) de um objeto, com 1 ou mais ficheiros (D-048). |
| `files` | sim | 13 | M2-02 · §3.6 | Ficheiros de uma versão, no bucket privado `project-files`. |
| `activity_log` | sim | 9 | M2-02 · §3.7 | Auditoria genérica, só inserção, lida só pelo admin (D-051). |
| `access_links` | sim | 10 | M2-06 · `sequencia/sequencias.md` §1 | Registo dos links mágicos (RF-30.57); guarda só o SHA-256 do token (D-069). |
| `academic_briefs` | sim | 13 | M2-03 · `mer/fichas-servico.md` §3.1 | Ficha do trabalho académico (1:1 com o projeto `academic`). |
| `academic_sections` | sim | 6 | M2-03 · §3.2 | Índice atual e estado de cada capítulo (D-058). |
| `adjustment_requests` | sim | 10 | M2-03 · §3.3 | Pedidos de ajuste depois da entrega final do Académico (D-056). |
| `design_specs` | sim | 18 | M2-03 · §4.1 | Ficha técnica da peça de Design (1:1 com o projeto `design`). |

## 2. Tabelas

### `projects`
Projeto do cliente. Só se listam as colunas **novas ou alteradas**; as restantes estão em `0001_portal.sql`.

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| projects | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| projects | `client_id` | uuid | — | não | FK→clients.id | — | Cliente dono do projeto (já existe) |
| projects | `slug` | text | — | não | UK | — | Identificador no URL (já existe) |
| projects | `service_type` | text | enum | não | — | `'development'` | Tipo de serviço; imutável depois de criado (RN-02) |
| projects | `status` | text | enum | não | — | `'ativo'` | Estado do projeto; ganha `cancelado` (RF-30.06) |
| projects | `due_on` | date | — | sim | — | — | Prazo acordado; copiado do orçamento aceite, nunca reescrito pelo prazo ajustado (já existe) |
| projects | `completed_at` | timestamptz | — | sim | — | — | Preenchido ao passar a `entregue`; conta os 90 dias dos ficheiros (RN-08) |
| projects | `cancelled_at` | timestamptz | — | sim | — | — | Preenchido ao passar a `cancelado` |
| projects | `github_owner` | text | — | sim | — | — | Só `development` (check) (já existe) |
| projects | `github_repo` | text | — | sim | — | — | Só `development` (check) (já existe) |
| projects | `phase_map` | jsonb | — | sim | — | — | Só `development` (check) (já existe) |

### `phase_templates`
Modelo de fases de cada serviço (Académico e Design). O Desenvolvimento usa o GitHub.

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| phase_templates | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| phase_templates | `service_type` | text | enum | não | UK(service_type, position) · UK(service_type, key) | — | `academic` ou `design` |
| phase_templates | `position` | smallint | — | não | — | — | Ordem da fase, 1 a 20 |
| phase_templates | `key` | text | ≤ 40 | não | — | — | Identificador estável usado pelo código (ex.: `revisoes`) |
| phase_templates | `name` | text | ≤ 60 | não | — | — | Nome mostrado ao cliente |
| phase_templates | `description` | text | ≤ 200 | não | — | `''` | Frase curta da fase |
| phase_templates | `client_can_upload` | boolean | — | não | — | `false` | O cliente pode enviar ficheiros nesta fase (RF-30.41) |
| phase_templates | `can_be_skipped` | boolean | — | não | — | `false` | A fase pode ficar `nao_aplicavel` |
| phase_templates | `active` | boolean | — | não | — | `true` | Só os modelos ativos são copiados para projetos novos |

### `project_phases`
Fases de um projeto Académico ou Design, copiadas do modelo (D-042).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| project_phases | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| project_phases | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (on delete cascade) |
| project_phases | `template_id` | uuid | — | sim | FK→phase_templates.id | — | Modelo de origem (on delete set null) |
| project_phases | `position` | smallint | — | não | UK(project_id, position) | — | Ordem (cópia do modelo) |
| project_phases | `key` | text | ≤ 40 | não | UK(project_id, key) | — | Identificador (cópia do modelo) |
| project_phases | `name` | text | ≤ 60 | não | — | — | Nome (cópia do modelo) |
| project_phases | `description` | text | ≤ 200 | não | — | `''` | Descrição (cópia do modelo) |
| project_phases | `client_can_upload` | boolean | — | não | — | `false` | Cópia do modelo |
| project_phases | `can_be_skipped` | boolean | — | não | — | `false` | Cópia do modelo; `nao_aplicavel` só se `true` (check B4) |
| project_phases | `status` | text | enum | não | — | `'por_iniciar'` | Estado da fase |
| project_phases | `due_on` | date | — | sim | — | — | Data-limite opcional; passada, a fase é mostrada como atrasada (D-046) |
| project_phases | `next_step` | text | ≤ 200 | sim | — | — | Próximo passo visível ao cliente |
| project_phases | `next_step_owner` | text | enum | sim | — | — | De quem é a ação |
| project_phases | `progress` | smallint | — | sim | — | — | Percentagem 0 a 100 quando não há capítulos |
| project_phases | `started_at` | timestamptz | — | sim | — | — | Primeira vez em curso (trigger B5) |
| project_phases | `completed_at` | timestamptz | — | sim | — | — | Concluída (trigger B5) |
| project_phases | `updated_at` | timestamptz | — | não | — | `now()` | Última alteração |

### `phase_events`
Histórico das mudanças de estado das fases; só inserção. Base do prazo ajustado (RN-21).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| phase_events | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| phase_events | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (repetido para a RLS) (on delete cascade) |
| phase_events | `project_phase_id` | uuid | — | não | FK→project_phases.id | — | Fase (on delete cascade) |
| phase_events | `from_status` | text | enum | sim | — | — | Estado anterior; nulo na criação |
| phase_events | `to_status` | text | enum | não | — | — | Estado novo |
| phase_events | `note` | text | ≤ 500 | sim | — | — | Motivo mostrado ao cliente |
| phase_events | `actor_id` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Autor; nulo quando é o sistema (on delete set null) |
| phase_events | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |

### `project_status_events`
Histórico das mudanças de estado do projeto; só inserção. Dá os intervalos de pausa a pedido do cliente (D-064, D-066).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| project_status_events | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| project_status_events | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (on delete cascade) |
| project_status_events | `from_status` | text | enum | sim | — | — | Estado anterior; nulo na criação |
| project_status_events | `to_status` | text | enum | não | — | — | Estado novo |
| project_status_events | `client_requested` | boolean | — | não | — | `false` | Pausa a pedido do cliente: desliza o prazo |
| project_status_events | `note` | text | ≤ 500 | sim | — | — | Motivo; obrigatório em pausa, cancelamento e reabertura |
| project_status_events | `actor_id` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Autor; nulo quando é o sistema (on delete set null) |
| project_status_events | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |

### `quotes`
Orçamento versionado. Ao ser aceite gera o sinal e o restante (D-050).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| quotes | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| quotes | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (on delete cascade) |
| quotes | `version` | smallint | — | não | UK(project_id, version) | — | 1, 2… |
| quotes | `total_kz` | numeric | 12,2 | não | — | — | Valor total em Kz, > 0 |
| quotes | `design_kz` | numeric | 12,2 | sim | — | — | Parte do design (só Design) |
| quotes | `print_kz` | numeric | 12,2 | sim | — | — | Parte da impressão (só Design); design + impressão = total |
| quotes | `deposit_pct` | smallint | — | não | — | `50` | % do sinal, 1 a 100 (RN-12) |
| quotes | `deposit_kz` | numeric | 12,2 | não | — | — | Valor do sinal (calculado, ajustável) |
| quotes | `delivery_due_on` | date | — | sim | — | — | Prazo proposto; copiado para `projects.due_on` ao aceitar |
| quotes | `rounds_included` | smallint | — | sim | — | `2` | Rondas incluídas (só Design), ≥ 0 |
| quotes | `status` | text | enum | não | — | `'rascunho'` | Estado do orçamento; só 1 `enviado`/`aceite` por projeto |
| quotes | `sent_at` | timestamptz | — | sim | — | — | Enviado ao cliente |
| quotes | `accepted_at` | timestamptz | — | sim | — | — | Aceite pelo cliente |
| quotes | `created_by` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Quem criou (on delete set null) |
| quotes | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |

### `payments`
Pagamentos registados pelo admin; pagos fora do portal (D-009).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| payments | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| payments | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (on delete cascade) |
| payments | `quote_id` | uuid | — | sim | FK→quotes.id | — | Orçamento que o gerou (sinal e restante) |
| payments | `kind` | text | enum | não | — | — | Tipo de pagamento |
| payments | `description` | text | ≤ 200 | não | — | — | Descrição mostrada ao cliente |
| payments | `amount_kz` | numeric | 12,2 | não | — | — | Valor em Kz, > 0 |
| payments | `due_on` | date | — | sim | — | — | Data limite; passada e pendente = em atraso (D-053) |
| payments | `status` | text | enum | não | — | `'pendente'` | Estado do pagamento |
| payments | `paid_on` | date | — | sim | — | — | Obrigatório se e só se `pago` (check) |
| payments | `gates_phase_id` | uuid | — | sim | FK→project_phases.id | — | Fase que não passa a em curso sem este pagamento pago (D-052) |
| payments | `created_by` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Quem criou (on delete set null) |
| payments | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |
| payments | `updated_at` | timestamptz | — | não | — | `now()` | Última alteração |

### `approvals`
Pedido de aprovação de uma versão concreta, com cópia fixa do que o cliente viu (D-049).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| approvals | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| approvals | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (on delete cascade) |
| approvals | `project_phase_id` | uuid | — | sim | FK→project_phases.id | — | Fase onde foi pedida |
| approvals | `subject` | text | enum | não | — | — | Objeto aprovado; o alvo tem de condizer (check) |
| approvals | `quote_id` | uuid | — | sim | FK→quotes.id | — | Alvo quando `subject = orcamento` |
| approvals | `deliverable_id` | uuid | — | sim | FK→deliverables.id | — | Alvo quando `subject` é `prova` ou `entrega` |
| approvals | `payment_id` | uuid | — | sim | FK→payments.id | — | Alvo quando `subject = extra` |
| approvals | `version_label` | text | ≤ 10 | sim | — | — | Ex.: `V3` |
| approvals | `snapshot` | jsonb | — | não | — | — | Cópia imutável do conteúdo mostrado (valores, textos-chave, índice, ficheiros) |
| approvals | `status` | text | enum | não | — | `'pendente'` | Estado; só 1 `pendente` por alvo |
| approvals | `requested_by` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Admin que pediu (on delete set null) |
| approvals | `requested_at` | timestamptz | — | não | — | `now()` | Data do pedido |
| approvals | `decided_at` | timestamptz | — | sim | — | — | Data da resposta que fechou o pedido |

### `approval_responses`
Respostas do cliente e reaberturas do admin; só inserção. Um trigger atualiza `approvals.status`.

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| approval_responses | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| approval_responses | `approval_id` | uuid | — | não | FK→approvals.id | — | Pedido (on delete cascade) |
| approval_responses | `kind` | text | enum | não | — | — | Tipo de resposta; `reabrir` só pelo admin |
| approval_responses | `comment` | text | ≤ 2000 | sim | — | — | Obrigatório em `pedir_alteracoes` e `reabrir` |
| approval_responses | `attachment_deliverable_id` | uuid | — | sim | FK→deliverables.id | — | Imagem opcional do cliente (RF-20.40) |
| approval_responses | `actor_id` | uuid | — | não | FK→auth.users.id | `auth.uid()` | Autor |
| approval_responses | `actor_role` | text | enum | não | — | — | `client` ou `admin` |
| approval_responses | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |

### `deliverables`
Uma versão (V1, V2…) de um objeto, com 1 ou mais ficheiros (D-048).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| deliverables | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| deliverables | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (on delete cascade) |
| deliverables | `project_phase_id` | uuid | — | sim | FK→project_phases.id | — | Fase onde foi enviada |
| deliverables | `role` | text | enum | não | — | — | Papel; `interno` não é visível ao cliente |
| deliverables | `series_key` | text | ≤ 40 | não | UK(project_id, series_key, version_no) | — | Agrupa as versões do mesmo objeto (ex.: `prova`) |
| deliverables | `version_no` | smallint | — | não | — | — | 1, 2…; a mais alta é a atual |
| deliverables | `label` | text | ≤ 10 | não | — | — | Ex.: `V2` |
| deliverables | `title` | text | ≤ 120 | sim | — | — | Título |
| deliverables | `notes` | text | ≤ 1000 | sim | — | — | Notas |
| deliverables | `uploaded_by_role` | text | enum | não | — | — | `client` só com `role = referencia` numa fase com upload (RN-09) |
| deliverables | `locked_by_payment_id` | uuid | — | sim | FK→payments.id | — | Bloqueia o download até este pagamento estar pago (RF-30.44) |
| deliverables | `created_by` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Quem criou (on delete set null) |
| deliverables | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |
| deliverables | `purged_at` | timestamptz | — | sim | — | — | Ficheiros apagados aos 90 dias; o registo fica (RN-08) |

### `files`
Ficheiros de uma versão, no bucket privado `project-files`.

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| files | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| files | `deliverable_id` | uuid | — | não | FK→deliverables.id | — | Versão (on delete cascade) |
| files | `project_id` | uuid | — | não | FK→projects.id | — | Projeto (repetido para a RLS e o Storage) (on delete cascade) |
| files | `bucket` | text | enum | não | — | — | `client-uploads` (cliente) ou `project-files` (admin) (ADR-003) |
| files | `storage_path` | text | ≤ 300 | não | UK(bucket, storage_path) | — | `{project_id}/{deliverable_id}/{file_id}.{ext}` |
| files | `original_name` | text | ≤ 200 | não | — | — | Nome mostrado ao descarregar |
| files | `mime_type` | text | ≤ 100 | não | — | — | Tipo; cliente: JPG, PNG, WebP, HEIC, PDF, DOC, DOCX (D-024); admin também AI, PSD, ZIP (D-054) |
| files | `size_bytes` | bigint | — | não | — | — | Tamanho; cliente ≤ 10 MB, admin ≤ 50 MB |
| files | `thumb_path` | text | ≤ 300 | sim | — | — | Pré-visualização WebP ≤ 150 KB, 1600 px, gerada no browser e validada no servidor (ADR-003) |
| files | `width` | integer | — | sim | — | — | Largura em px (imagens) |
| files | `height` | integer | — | sim | — | — | Altura em px (imagens) |
| files | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |
| files | `purged_at` | timestamptz | — | sim | — | — | Objeto apagado do Storage |

### `activity_log`
Auditoria genérica, só inserção, lida só pelo admin (D-051).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| activity_log | `id` | bigint | — | não | PK | — | Identificador (identity) |
| activity_log | `project_id` | uuid | — | sim | FK→projects.id | — | Projeto (on delete set null: o rasto sobrevive) |
| activity_log | `entity` | text | enum | não | — | — | Tabela de origem |
| activity_log | `entity_id` | uuid | — | não | — | — | Linha de origem |
| activity_log | `action` | text | enum | não | — | — | Ação |
| activity_log | `before` | jsonb | — | sim | — | — | Linha antes |
| activity_log | `after` | jsonb | — | sim | — | — | Linha depois |
| activity_log | `actor_id` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Autor; nulo quando é o sistema (on delete set null) |
| activity_log | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |

### `access_links`
Registo dos links mágicos (RF-30.57); guarda só o SHA-256 do token (D-069).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| access_links | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| access_links | `client_id` | uuid | — | não | FK→clients.id | — | Cliente (on delete cascade) |
| access_links | `project_id` | uuid | — | não | FK→projects.id | — | Projeto para onde o link leva (on delete cascade) |
| access_links | `token_digest` | text | 64 | não | UK | — | SHA-256 (hex) do hashed_token |
| access_links | `channel` | text | enum | não | — | — | Canal usado pelo admin |
| access_links | `status` | text | enum | não | — | `'ativo'` | Estado do link; expirado = calculado |
| access_links | `expires_at` | timestamptz | — | não | — | — | created_at + 24 h (RNF-301) |
| access_links | `used_at` | timestamptz | — | sim | — | — | Entrada com sucesso |
| access_links | `created_by` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Quem criou (on delete set null) |
| access_links | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |

### `academic_briefs`
Ficha do trabalho académico (1:1 com o projeto `academic`).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| academic_briefs | `project_id` | uuid | — | não | PK · FK→projects.id | — | Projeto `academic` (on delete cascade) |
| academic_briefs | `topic` | text | ≤ 300 | não | — | — | Tema do trabalho |
| academic_briefs | `work_type` | text | enum | não | — | — | Tipo de trabalho |
| academic_briefs | `education_level` | text | enum | não | — | — | Nível de ensino |
| academic_briefs | `institution` | text | ≤ 150 | sim | — | — | Instituição |
| academic_briefs | `discipline` | text | ≤ 150 | sim | — | — | Disciplina ou curso |
| academic_briefs | `citation_style` | text | enum | sim | — | — | Normas |
| academic_briefs | `citation_notes` | text | ≤ 1000 | sim | — | — | Indicações das normas da instituição |
| academic_briefs | `pages_target` | smallint | — | sim | — | — | Nº de páginas, > 0 |
| academic_briefs | `uses_chapters` | boolean | — | não | — | `true` | Usa capítulos (D-014) |
| academic_briefs | `adjust_days` | smallint | — | não | — | `7` | Dias de ajustes, 0 a 60 (RN-33) |
| academic_briefs | `delivered_at` | timestamptz | — | sim | — | — | Entrega disponibilizada; começa o prazo de ajustes (RF-10.64) |
| academic_briefs | `updated_at` | timestamptz | — | não | — | `now()` | Última alteração |

### `academic_sections`
Índice atual e estado de cada capítulo (D-058).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| academic_sections | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| academic_sections | `project_id` | uuid | — | não | FK→projects.id | — | Projeto `academic` (on delete cascade) |
| academic_sections | `position` | smallint | — | não | UK(project_id, position) | — | Ordem (deferrable) |
| academic_sections | `title` | text | ≤ 200 | não | — | — | Título do capítulo ou secção |
| academic_sections | `status` | text | enum | não | — | `'por_iniciar'` | Estado do capítulo |
| academic_sections | `updated_at` | timestamptz | — | não | — | `now()` | Última alteração |

### `adjustment_requests`
Pedidos de ajuste depois da entrega final do Académico (D-056).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| adjustment_requests | `id` | uuid | — | não | PK | `gen_random_uuid()` | Identificador |
| adjustment_requests | `project_id` | uuid | — | não | FK→projects.id | — | Projeto `academic` (on delete cascade) |
| adjustment_requests | `description` | text | 10–2000 | não | — | — | O que o cliente pede |
| adjustment_requests | `attachment_deliverable_id` | uuid | — | sim | FK→deliverables.id | — | Anexo do cliente (PA-001) |
| adjustment_requests | `status` | text | enum | não | — | `'aberto'` | Estado do pedido |
| adjustment_requests | `resolved_by_deliverable_id` | uuid | — | sim | FK→deliverables.id | — | Nova versão que resolveu; obrigatória em `resolvido` |
| adjustment_requests | `admin_note` | text | ≤ 1000 | sim | — | — | Obrigatória em `recusado` |
| adjustment_requests | `created_by` | uuid | — | sim | FK→auth.users.id | `auth.uid()` | Quem criou (on delete set null) |
| adjustment_requests | `created_at` | timestamptz | — | não | — | `now()` | Data de criação |
| adjustment_requests | `resolved_at` | timestamptz | — | sim | — | — | Resolvido ou recusado |

### `design_specs`
Ficha técnica da peça de Design (1:1 com o projeto `design`).

| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |
|---|---|---|---|---|---|---|---|
| design_specs | `project_id` | uuid | — | não | PK · FK→projects.id | — | Projeto `design` (on delete cascade) |
| design_specs | `piece_type` | text | enum | não | — | — | Tipo de peça |
| design_specs | `piece_label` | text | ≤ 120 | sim | — | — | Descrição curta da peça |
| design_specs | `width_cm` | numeric | 7,2 | sim | — | — | Largura em cm, > 0 |
| design_specs | `height_cm` | numeric | 7,2 | sim | — | — | Altura em cm, > 0 |
| design_specs | `size_notes` | text | ≤ 300 | sim | — | — | Ex.: tamanhos das camisolas |
| design_specs | `material` | text | ≤ 120 | sim | — | — | Material |
| design_specs | `quantity` | integer | — | não | — | `1` | Quantidade, > 0 |
| design_specs | `finish` | text | ≤ 120 | sim | — | — | Acabamento |
| design_specs | `has_print` | boolean | — | não | — | — | Tem impressão; `false` salta a produção (RN-44) |
| design_specs | `has_digital_files` | boolean | — | não | — | — | Tem ficheiros digitais a entregar (RF-20.71) |
| design_specs | `event_date` | date | — | sim | — | — | Data do evento |
| design_specs | `key_texts` | jsonb | — | não | — | `'[]'` | Lista `[{label, value}]`, até 20 itens (D-057) |
| design_specs | `production_status` | text | enum | sim | — | — | Estado da produção; só com `has_print` |
| design_specs | `pickup_at` | timestamptz | — | sim | — | — | Data e hora de entrega ou levantamento |
| design_specs | `pickup_place` | text | ≤ 200 | sim | — | — | Local de levantamento |
| design_specs | `delivered_at` | timestamptz | — | sim | — | — | Entregue; o projeto passa a `entregue` |
| design_specs | `updated_at` | timestamptz | — | não | — | `now()` | Última alteração |

## 3. Domínios (valores permitidos)

| Coluna | Valores |
|---|---|
| `projects.service_type` | development · academic · design |
| `projects.status, project_status_events.from_status/to_status` | ativo · pausado · entregue · cancelado |
| `phase_templates.service_type` | academic · design |
| `project_phases.status, phase_events.from_status/to_status` | por_iniciar · em_curso · aguarda_cliente · concluida · atrasada · nao_aplicavel |
| `project_phases.next_step_owner` | geniusfrela · cliente |
| `quotes.status` | rascunho · enviado · aceite · substituido |
| `payments.kind` | sinal · restante · extra |
| `payments.status` | por_aceitar · pendente · pago · anulado (em atraso = calculado) |
| `approvals.subject` | orcamento · indice · prova · extra · entrega |
| `approvals.status` | pendente · aprovada · alteracoes_pedidas · cancelada |
| `approval_responses.kind` | aprovar · pedir_alteracoes · reabrir |
| `approval_responses.actor_role, deliverables.uploaded_by_role` | client · admin |
| `deliverables.role` | entregavel · prova · referencia · interno |
| `activity_log.entity` | quote · payment · deliverable · file · approval · academic_brief · design_spec |
| `activity_log.action` | insert · update · delete · purge |
| `academic_briefs.work_type` | escolar · universitario · relatorio · formatacao · revisao |
| `academic_briefs.education_level` | ensino_medio · licenciatura · mestrado · outro |
| `academic_briefs.citation_style` | APA · ABNT · NP 405 · instituicao · outra |
| `academic_sections.status` | por_iniciar · em_curso · concluido |
| `adjustment_requests.status` | aberto · resolvido · recusado |
| `design_specs.piece_type` | logotipo_identidade · convite_digital · convite_impresso · lona · camisola · outro |
| `design_specs.production_status` | a_imprimir · pronto |
| `access_links.channel` | copiar · whatsapp · email |
| `files.bucket` | client-uploads · project-files |
| `access_links.status` | ativo · usado · substituido (expirado = calculado) |

## 4. Revisão cruzada MER ↔ dicionário

Feita pelo script a cada geração. Os diagramas mostram só os atributos principais; o dicionário é a referência completa.

| Diagrama | Entidade | Atributos no MER | Colunas no dicionário | Só no dicionário |
|---|---|---|---|---|
| `mer-blocos-comuns.mmd` | `quotes` | 12 | 15 | `sent_at`, `created_by`, `created_at` |
| `mer-blocos-comuns.mmd` | `payments` | 11 | 13 | `created_by`, `updated_at` |
| `mer-blocos-comuns.mmd` | `approvals` | 12 | 13 | `requested_by` |
| `mer-blocos-comuns.mmd` | `approval_responses` | 8 | 8 | — |
| `mer-blocos-comuns.mmd` | `deliverables` | 11 | 14 | `title`, `notes`, `created_by` |
| `mer-blocos-comuns.mmd` | `files` | 11 | 13 | `width`, `height` |
| `mer-blocos-comuns.mmd` | `activity_log` | 9 | 9 | — |
| `mer-blocos-comuns.mmd` | `access_links` | 8 | 10 | `created_by`, `created_at` |
| `mer-fases.mmd` | `projects` | 11 | 11 | — |
| `mer-fases.mmd` | `phase_templates` | 9 | 9 | — |
| `mer-fases.mmd` | `project_phases` | 17 | 17 | — |
| `mer-fases.mmd` | `phase_events` | 8 | 8 | — |
| `mer-fases.mmd` | `project_status_events` | 8 | 8 | — |
| `mer-fichas.mmd` | `academic_briefs` | 13 | 13 | — |
| `mer-fichas.mmd` | `academic_sections` | 6 | 6 | — |
| `mer-fichas.mmd` | `adjustment_requests` | 10 | 10 | — |
| `mer-fichas.mmd` | `design_specs` | 18 | 18 | — |

Resultado: **0 erros** (todas as FK resolvem; todo o atributo do MER existe no dicionário).
