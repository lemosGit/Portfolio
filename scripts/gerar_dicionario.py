"""Gera docs/02-modelagem/dicionario-dados.md e faz a revisão cruzada MER ↔ dicionário.

Uso: python3 scripts/gerar_dicionario.py
- As tabelas e colunas vivem aqui (fonte única do dicionário).
- Verifica: cada FK aponta para uma tabela/coluna existente; cada entidade e atributo
  dos diagramas `docs/02-modelagem/src/mer-*.mmd` existe no dicionário e vice-versa.
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MOD = RAIZ / "docs" / "02-modelagem"
HOJE = "2026-11-24"  # v1.1: project_status_events (M2-05)

# Coluna: (nome, tipo, tamanho, nulo, chave, default, descrição)
# chave: "PK", "FK→tabela.coluna", "UK(...)", combinações com " · "
def c(nome, tipo, nulo, descr, chave="", default="", tam=""):
    return dict(nome=nome, tipo=tipo, tam=tam, nulo=nulo, chave=chave, default=default, descr=descr)

ID = lambda: c("id", "uuid", "não", "Identificador", "PK", "gen_random_uuid()")
PROJ = lambda descr="Projeto": c("project_id", "uuid", "não", descr + " (on delete cascade)", "FK→projects.id")
CRIADO = lambda: c("created_at", "timestamptz", "não", "Data de criação", default="now()")
ATUAL = lambda: c("updated_at", "timestamptz", "não", "Última alteração", default="now()")
POR = lambda nome="created_by", descr="Quem criou": c(nome, "uuid", "sim", descr + " (on delete set null)", "FK→auth.users.id", "auth.uid()")

TABELAS = {
    # ---------------- M2-01 ----------------
    "projects": dict(
        origem="M2-01 · `mer/fases-servicos.md` §3.1", nova=False,
        descr="Projeto do cliente. Só se listam as colunas **novas ou alteradas**; as restantes estão em `0001_portal.sql`.",
        cols=[
            ID(),
            c("client_id", "uuid", "não", "Cliente dono do projeto (já existe)", "FK→clients.id"),
            c("slug", "text", "não", "Identificador no URL (já existe)", "UK"),
            c("service_type", "text", "não", "Tipo de serviço; imutável depois de criado (RN-02)", default="'development'", tam="enum"),
            c("status", "text", "não", "Estado do projeto; ganha `cancelado` (RF-30.06)", default="'ativo'", tam="enum"),
            c("due_on", "date", "sim", "Prazo acordado; copiado do orçamento aceite, nunca reescrito pelo prazo ajustado (já existe)"),
            c("completed_at", "timestamptz", "sim", "Preenchido ao passar a `entregue`; conta os 90 dias dos ficheiros (RN-08)"),
            c("cancelled_at", "timestamptz", "sim", "Preenchido ao passar a `cancelado`"),
            c("github_owner", "text", "sim", "Só `development` (check) (já existe)"),
            c("github_repo", "text", "sim", "Só `development` (check) (já existe)"),
            c("phase_map", "jsonb", "sim", "Só `development` (check) (já existe)"),
        ]),
    "phase_templates": dict(
        origem="M2-01 · §3.2", nova=True,
        descr="Modelo de fases de cada serviço (Académico e Design). O Desenvolvimento usa o GitHub.",
        cols=[
            ID(),
            c("service_type", "text", "não", "`academic` ou `design`", "UK(service_type, position) · UK(service_type, key)", tam="enum"),
            c("position", "smallint", "não", "Ordem da fase, 1 a 20"),
            c("key", "text", "não", "Identificador estável usado pelo código (ex.: `revisoes`)", tam="≤ 40"),
            c("name", "text", "não", "Nome mostrado ao cliente", tam="≤ 60"),
            c("description", "text", "não", "Frase curta da fase", default="''", tam="≤ 200"),
            c("client_can_upload", "boolean", "não", "O cliente pode enviar ficheiros nesta fase (RF-30.41)", default="false"),
            c("can_be_skipped", "boolean", "não", "A fase pode ficar `nao_aplicavel`", default="false"),
            c("active", "boolean", "não", "Só os modelos ativos são copiados para projetos novos", default="true"),
        ]),
    "project_phases": dict(
        origem="M2-01 · §3.3", nova=True,
        descr="Fases de um projeto Académico ou Design, copiadas do modelo (D-042).",
        cols=[
            ID(), PROJ(),
            c("template_id", "uuid", "sim", "Modelo de origem (on delete set null)", "FK→phase_templates.id"),
            c("position", "smallint", "não", "Ordem (cópia do modelo)", "UK(project_id, position)"),
            c("key", "text", "não", "Identificador (cópia do modelo)", "UK(project_id, key)", tam="≤ 40"),
            c("name", "text", "não", "Nome (cópia do modelo)", tam="≤ 60"),
            c("description", "text", "não", "Descrição (cópia do modelo)", default="''", tam="≤ 200"),
            c("client_can_upload", "boolean", "não", "Cópia do modelo", default="false"),
            c("can_be_skipped", "boolean", "não", "Cópia do modelo; `nao_aplicavel` só se `true` (check B4)", default="false"),
            c("status", "text", "não", "Estado da fase", default="'por_iniciar'", tam="enum"),
            c("due_on", "date", "sim", "Data-limite opcional; passada, a fase é mostrada como atrasada (D-046)"),
            c("next_step", "text", "sim", "Próximo passo visível ao cliente", tam="≤ 200"),
            c("next_step_owner", "text", "sim", "De quem é a ação", tam="enum"),
            c("progress", "smallint", "sim", "Percentagem 0 a 100 quando não há capítulos"),
            c("started_at", "timestamptz", "sim", "Primeira vez em curso (trigger B5)"),
            c("completed_at", "timestamptz", "sim", "Concluída (trigger B5)"),
            ATUAL(),
        ]),
    "phase_events": dict(
        origem="M2-01 · §3.4", nova=True,
        descr="Histórico das mudanças de estado das fases; só inserção. Base do prazo ajustado (RN-21).",
        cols=[
            ID(), PROJ("Projeto (repetido para a RLS)"),
            c("project_phase_id", "uuid", "não", "Fase (on delete cascade)", "FK→project_phases.id"),
            c("from_status", "text", "sim", "Estado anterior; nulo na criação", tam="enum"),
            c("to_status", "text", "não", "Estado novo", tam="enum"),
            c("note", "text", "sim", "Motivo mostrado ao cliente", tam="≤ 500"),
            POR("actor_id", "Autor; nulo quando é o sistema"),
            CRIADO(),
        ]),
    "project_status_events": dict(
        origem="M2-05 · `mer/fases-servicos.md` §3.5", nova=True,
        descr="Histórico das mudanças de estado do projeto; só inserção. Dá os intervalos de pausa a pedido do cliente (D-064, D-066).",
        cols=[
            ID(), PROJ(),
            c("from_status", "text", "sim", "Estado anterior; nulo na criação", tam="enum"),
            c("to_status", "text", "não", "Estado novo", tam="enum"),
            c("client_requested", "boolean", "não", "Pausa a pedido do cliente: desliza o prazo", default="false"),
            c("note", "text", "sim", "Motivo; obrigatório em pausa, cancelamento e reabertura", tam="≤ 500"),
            POR("actor_id", "Autor; nulo quando é o sistema"),
            CRIADO(),
        ]),
    # ---------------- M2-02 ----------------
    "quotes": dict(
        origem="M2-02 · `mer/blocos-comuns.md` §3.1", nova=True,
        descr="Orçamento versionado. Ao ser aceite gera o sinal e o restante (D-050).",
        cols=[
            ID(), PROJ(),
            c("version", "smallint", "não", "1, 2…", "UK(project_id, version)"),
            c("total_kz", "numeric", "não", "Valor total em Kz, > 0", tam="12,2"),
            c("design_kz", "numeric", "sim", "Parte do design (só Design)", tam="12,2"),
            c("print_kz", "numeric", "sim", "Parte da impressão (só Design); design + impressão = total", tam="12,2"),
            c("deposit_pct", "smallint", "não", "% do sinal, 1 a 100 (RN-12)", default="50"),
            c("deposit_kz", "numeric", "não", "Valor do sinal (calculado, ajustável)", tam="12,2"),
            c("delivery_due_on", "date", "sim", "Prazo proposto; copiado para `projects.due_on` ao aceitar"),
            c("rounds_included", "smallint", "sim", "Rondas incluídas (só Design), ≥ 0", default="2"),
            c("status", "text", "não", "Estado do orçamento; só 1 `enviado`/`aceite` por projeto", default="'rascunho'", tam="enum"),
            c("sent_at", "timestamptz", "sim", "Enviado ao cliente"),
            c("accepted_at", "timestamptz", "sim", "Aceite pelo cliente"),
            POR(), CRIADO(),
        ]),
    "payments": dict(
        origem="M2-02 · §3.2", nova=True,
        descr="Pagamentos registados pelo admin; pagos fora do portal (D-009).",
        cols=[
            ID(), PROJ(),
            c("quote_id", "uuid", "sim", "Orçamento que o gerou (sinal e restante)", "FK→quotes.id"),
            c("kind", "text", "não", "Tipo de pagamento", tam="enum"),
            c("description", "text", "não", "Descrição mostrada ao cliente", tam="≤ 200"),
            c("amount_kz", "numeric", "não", "Valor em Kz, > 0", tam="12,2"),
            c("due_on", "date", "sim", "Data limite; passada e pendente = em atraso (D-053)"),
            c("status", "text", "não", "Estado do pagamento", default="'pendente'", tam="enum"),
            c("paid_on", "date", "sim", "Obrigatório se e só se `pago` (check)"),
            c("gates_phase_id", "uuid", "sim", "Fase que não passa a em curso sem este pagamento pago (D-052)", "FK→project_phases.id"),
            POR(), CRIADO(), ATUAL(),
        ]),
    "approvals": dict(
        origem="M2-02 · §3.3", nova=True,
        descr="Pedido de aprovação de uma versão concreta, com cópia fixa do que o cliente viu (D-049).",
        cols=[
            ID(), PROJ(),
            c("project_phase_id", "uuid", "sim", "Fase onde foi pedida", "FK→project_phases.id"),
            c("subject", "text", "não", "Objeto aprovado; o alvo tem de condizer (check)", tam="enum"),
            c("quote_id", "uuid", "sim", "Alvo quando `subject = orcamento`", "FK→quotes.id"),
            c("deliverable_id", "uuid", "sim", "Alvo quando `subject` é `prova` ou `entrega`", "FK→deliverables.id"),
            c("payment_id", "uuid", "sim", "Alvo quando `subject = extra`", "FK→payments.id"),
            c("version_label", "text", "sim", "Ex.: `V3`", tam="≤ 10"),
            c("snapshot", "jsonb", "não", "Cópia imutável do conteúdo mostrado (valores, textos-chave, índice, ficheiros)"),
            c("status", "text", "não", "Estado; só 1 `pendente` por alvo", default="'pendente'", tam="enum"),
            POR("requested_by", "Admin que pediu"),
            c("requested_at", "timestamptz", "não", "Data do pedido", default="now()"),
            c("decided_at", "timestamptz", "sim", "Data da resposta que fechou o pedido"),
        ]),
    "approval_responses": dict(
        origem="M2-02 · §3.4", nova=True,
        descr="Respostas do cliente e reaberturas do admin; só inserção. Um trigger atualiza `approvals.status`.",
        cols=[
            ID(),
            c("approval_id", "uuid", "não", "Pedido (on delete cascade)", "FK→approvals.id"),
            c("kind", "text", "não", "Tipo de resposta; `reabrir` só pelo admin", tam="enum"),
            c("comment", "text", "sim", "Obrigatório em `pedir_alteracoes` e `reabrir`", tam="≤ 2000"),
            c("attachment_deliverable_id", "uuid", "sim", "Imagem opcional do cliente (RF-20.40)", "FK→deliverables.id"),
            c("actor_id", "uuid", "não", "Autor", "FK→auth.users.id", "auth.uid()"),
            c("actor_role", "text", "não", "`client` ou `admin`", tam="enum"),
            CRIADO(),
        ]),
    "deliverables": dict(
        origem="M2-02 · §3.5", nova=True,
        descr="Uma versão (V1, V2…) de um objeto, com 1 ou mais ficheiros (D-048).",
        cols=[
            ID(), PROJ(),
            c("project_phase_id", "uuid", "sim", "Fase onde foi enviada", "FK→project_phases.id"),
            c("role", "text", "não", "Papel; `interno` não é visível ao cliente", tam="enum"),
            c("series_key", "text", "não", "Agrupa as versões do mesmo objeto (ex.: `prova`)", "UK(project_id, series_key, version_no)", tam="≤ 40"),
            c("version_no", "smallint", "não", "1, 2…; a mais alta é a atual"),
            c("label", "text", "não", "Ex.: `V2`", tam="≤ 10"),
            c("title", "text", "sim", "Título", tam="≤ 120"),
            c("notes", "text", "sim", "Notas", tam="≤ 1000"),
            c("uploaded_by_role", "text", "não", "`client` só com `role = referencia` numa fase com upload (RN-09)", tam="enum"),
            c("locked_by_payment_id", "uuid", "sim", "Bloqueia o download até este pagamento estar pago (RF-30.44)", "FK→payments.id"),
            POR(), CRIADO(),
            c("purged_at", "timestamptz", "sim", "Ficheiros apagados aos 90 dias; o registo fica (RN-08)"),
        ]),
    "files": dict(
        origem="M2-02 · §3.6", nova=True,
        descr="Ficheiros de uma versão, no bucket privado `project-files`.",
        cols=[
            ID(),
            c("deliverable_id", "uuid", "não", "Versão (on delete cascade)", "FK→deliverables.id"),
            PROJ("Projeto (repetido para a RLS e o Storage)"),
            c("storage_path", "text", "não", "`{project_id}/{deliverable_id}/{file_id}.{ext}`", "UK", tam="≤ 300"),
            c("original_name", "text", "não", "Nome mostrado ao descarregar", tam="≤ 200"),
            c("mime_type", "text", "não", "Tipo; cliente: JPG, PNG, WebP, HEIC, PDF, DOC, DOCX (D-024); admin também AI, PSD, ZIP (D-054)", tam="≤ 100"),
            c("size_bytes", "bigint", "não", "Tamanho; cliente ≤ 10 MB, admin ≤ 50 MB"),
            c("thumb_path", "text", "sim", "Miniatura WebP ≤ 150 KB (só imagens)", tam="≤ 300"),
            c("width", "integer", "sim", "Largura em px (imagens)"),
            c("height", "integer", "sim", "Altura em px (imagens)"),
            CRIADO(),
            c("purged_at", "timestamptz", "sim", "Objeto apagado do Storage"),
        ]),
    "activity_log": dict(
        origem="M2-02 · §3.7", nova=True,
        descr="Auditoria genérica, só inserção, lida só pelo admin (D-051).",
        cols=[
            c("id", "bigint", "não", "Identificador (identity)", "PK"),
            c("project_id", "uuid", "sim", "Projeto (on delete set null: o rasto sobrevive)", "FK→projects.id"),
            c("entity", "text", "não", "Tabela de origem", tam="enum"),
            c("entity_id", "uuid", "não", "Linha de origem"),
            c("action", "text", "não", "Ação", tam="enum"),
            c("before", "jsonb", "sim", "Linha antes"),
            c("after", "jsonb", "sim", "Linha depois"),
            POR("actor_id", "Autor; nulo quando é o sistema"),
            CRIADO(),
        ]),
    # ---------------- M2-03 ----------------
    "academic_briefs": dict(
        origem="M2-03 · `mer/fichas-servico.md` §3.1", nova=True,
        descr="Ficha do trabalho académico (1:1 com o projeto `academic`).",
        cols=[
            c("project_id", "uuid", "não", "Projeto `academic` (on delete cascade)", "PK · FK→projects.id"),
            c("topic", "text", "não", "Tema do trabalho", tam="≤ 300"),
            c("work_type", "text", "não", "Tipo de trabalho", tam="enum"),
            c("education_level", "text", "não", "Nível de ensino", tam="enum"),
            c("institution", "text", "sim", "Instituição", tam="≤ 150"),
            c("discipline", "text", "sim", "Disciplina ou curso", tam="≤ 150"),
            c("citation_style", "text", "sim", "Normas", tam="enum"),
            c("citation_notes", "text", "sim", "Indicações das normas da instituição", tam="≤ 1000"),
            c("pages_target", "smallint", "sim", "Nº de páginas, > 0"),
            c("uses_chapters", "boolean", "não", "Usa capítulos (D-014)", default="true"),
            c("adjust_days", "smallint", "não", "Dias de ajustes, 0 a 60 (RN-33)", default="7"),
            c("delivered_at", "timestamptz", "sim", "Entrega disponibilizada; começa o prazo de ajustes (RF-10.64)"),
            ATUAL(),
        ]),
    "academic_sections": dict(
        origem="M2-03 · §3.2", nova=True,
        descr="Índice atual e estado de cada capítulo (D-058).",
        cols=[
            ID(), PROJ("Projeto `academic`"),
            c("position", "smallint", "não", "Ordem (deferrable)", "UK(project_id, position)"),
            c("title", "text", "não", "Título do capítulo ou secção", tam="≤ 200"),
            c("status", "text", "não", "Estado do capítulo", default="'por_iniciar'", tam="enum"),
            ATUAL(),
        ]),
    "adjustment_requests": dict(
        origem="M2-03 · §3.3", nova=True,
        descr="Pedidos de ajuste depois da entrega final do Académico (D-056).",
        cols=[
            ID(), PROJ("Projeto `academic`"),
            c("description", "text", "não", "O que o cliente pede", tam="10–2000"),
            c("attachment_deliverable_id", "uuid", "sim", "Anexo do cliente (PA-001)", "FK→deliverables.id"),
            c("status", "text", "não", "Estado do pedido", default="'aberto'", tam="enum"),
            c("resolved_by_deliverable_id", "uuid", "sim", "Nova versão que resolveu; obrigatória em `resolvido`", "FK→deliverables.id"),
            c("admin_note", "text", "sim", "Obrigatória em `recusado`", tam="≤ 1000"),
            POR(), CRIADO(),
            c("resolved_at", "timestamptz", "sim", "Resolvido ou recusado"),
        ]),
    "design_specs": dict(
        origem="M2-03 · §4.1", nova=True,
        descr="Ficha técnica da peça de Design (1:1 com o projeto `design`).",
        cols=[
            c("project_id", "uuid", "não", "Projeto `design` (on delete cascade)", "PK · FK→projects.id"),
            c("piece_type", "text", "não", "Tipo de peça", tam="enum"),
            c("piece_label", "text", "sim", "Descrição curta da peça", tam="≤ 120"),
            c("width_cm", "numeric", "sim", "Largura em cm, > 0", tam="7,2"),
            c("height_cm", "numeric", "sim", "Altura em cm, > 0", tam="7,2"),
            c("size_notes", "text", "sim", "Ex.: tamanhos das camisolas", tam="≤ 300"),
            c("material", "text", "sim", "Material", tam="≤ 120"),
            c("quantity", "integer", "não", "Quantidade, > 0", default="1"),
            c("finish", "text", "sim", "Acabamento", tam="≤ 120"),
            c("has_print", "boolean", "não", "Tem impressão; `false` salta a produção (RN-44)"),
            c("has_digital_files", "boolean", "não", "Tem ficheiros digitais a entregar (RF-20.71)"),
            c("event_date", "date", "sim", "Data do evento"),
            c("key_texts", "jsonb", "não", "Lista `[{label, value}]`, até 20 itens (D-057)", default="'[]'"),
            c("production_status", "text", "sim", "Estado da produção; só com `has_print`", tam="enum"),
            c("pickup_at", "timestamptz", "sim", "Data e hora de entrega ou levantamento"),
            c("pickup_place", "text", "sim", "Local de levantamento", tam="≤ 200"),
            c("delivered_at", "timestamptz", "sim", "Entregue; o projeto passa a `entregue`"),
            ATUAL(),
        ]),
}

ENUMS = [
    ("projects.service_type", "development · academic · design"),
    ("projects.status, project_status_events.from_status/to_status", "ativo · pausado · entregue · cancelado"),
    ("phase_templates.service_type", "academic · design"),
    ("project_phases.status, phase_events.from_status/to_status", "por_iniciar · em_curso · aguarda_cliente · concluida · atrasada · nao_aplicavel"),
    ("project_phases.next_step_owner", "geniusfrela · cliente"),
    ("quotes.status", "rascunho · enviado · aceite · substituido"),
    ("payments.kind", "sinal · restante · extra"),
    ("payments.status", "por_aceitar · pendente · pago · anulado (em atraso = calculado)"),
    ("approvals.subject", "orcamento · indice · prova · extra · entrega"),
    ("approvals.status", "pendente · aprovada · alteracoes_pedidas · cancelada"),
    ("approval_responses.kind", "aprovar · pedir_alteracoes · reabrir"),
    ("approval_responses.actor_role, deliverables.uploaded_by_role", "client · admin"),
    ("deliverables.role", "entregavel · prova · referencia · interno"),
    ("activity_log.entity", "quote · payment · deliverable · file · approval · academic_brief · design_spec"),
    ("activity_log.action", "insert · update · delete · purge"),
    ("academic_briefs.work_type", "escolar · universitario · relatorio · formatacao · revisao"),
    ("academic_briefs.education_level", "ensino_medio · licenciatura · mestrado · outro"),
    ("academic_briefs.citation_style", "APA · ABNT · NP 405 · instituicao · outra"),
    ("academic_sections.status", "por_iniciar · em_curso · concluido"),
    ("adjustment_requests.status", "aberto · resolvido · recusado"),
    ("design_specs.piece_type", "logotipo_identidade · convite_digital · convite_impresso · lona · camisola · outro"),
    ("design_specs.production_status", "a_imprimir · pronto"),
]

# Entidades fora do âmbito deste dicionário que aparecem nos diagramas
EXTERNAS = {"clients"}


def verificar():
    erros = []
    for t, d in TABELAS.items():
        nomes = [x["nome"] for x in d["cols"]]
        if len(nomes) != len(set(nomes)):
            erros.append(f"{t}: colunas repetidas")
        for col in d["cols"]:
            for m in re.finditer(r"FK→([\w.]+)\.(\w+)", col["chave"]):
                alvo, coluna = m.group(1), m.group(2)
                if alvo.startswith("auth.") or alvo in EXTERNAS:
                    continue
                if alvo not in TABELAS or coluna not in [x["nome"] for x in TABELAS[alvo]["cols"]]:
                    erros.append(f"{t}.{col['nome']}: FK para {alvo}.{coluna} inexistente")
    # revisão cruzada com os diagramas
    cruz = []
    for mmd in sorted((MOD / "src").glob("mer-*.mmd")):
        texto = mmd.read_text()
        for bloco in re.finditer(r"^\s{2}(\w+) \{\n(.*?)^\s{2}\}", texto, re.S | re.M):
            ent, corpo = bloco.group(1), bloco.group(2)
            attrs = [l.split()[1] for l in corpo.strip().splitlines() if l.strip()]
            if ent not in TABELAS:
                erros.append(f"{mmd.name}: entidade {ent} não está no dicionário")
                continue
            dic = [x["nome"] for x in TABELAS[ent]["cols"]]
            falta_dic = [a for a in attrs if a not in dic]
            falta_mer = [a for a in dic if a not in attrs] if TABELAS[ent]["nova"] else []
            for a in falta_dic:
                erros.append(f"{mmd.name}: {ent}.{a} está no MER e não no dicionário")
            cruz.append((mmd.name, ent, len(attrs), len(dic), falta_mer))
    return erros, cruz


def gerar(cruz):
    o = [
        "# Dicionário de dados — tabelas novas da v1.1",
        f"> Projeto: GeniusFrela — Área do Cliente multi-serviço · Tarefa: [M2-04] · Issue: #23 · Versão: 1.0 · Data: {HOJE}",
        "> Depende de: `mer/fases-servicos.md`, `mer/blocos-comuns.md`, `mer/fichas-servico.md` · Decisões: D-042…D-061",
        "> Gerado por `scripts/gerar_dicionario.py` — editar lá e voltar a correr. O script falha se uma FK ou um atributo do MER não condizer.",
        "",
        "## Convenções",
        "- **Tipos** do PostgreSQL (Supabase). `text` com limite tem `check (char_length(...) <= n)`; `enum` = `text` com `check (... in (...))`, valores na §3.",
        "- **Chave:** `PK` primária · `FK→tabela.coluna` estrangeira · `UK(...)` única (composta quando tem colunas).",
        "- Dinheiro em **Kz** com `numeric(12,2)`; datas sem hora em `date`; instantes em `timestamptz` (mostrados em Africa/Luanda).",
        "- Todas as tabelas têm **RLS** ativa (provisória nos MER; final na M3-06).",
        "",
        "## 1. Resumo",
        "",
        "| Tabela | Nova? | Colunas | Origem | Descrição |",
        "|---|---|---|---|---|",
    ]
    for t, d in TABELAS.items():
        o.append(f"| `{t}` | {'sim' if d['nova'] else 'alterada'} | {len(d['cols'])} | {d['origem']} | {d['descr']} |")
    o += ["", "## 2. Tabelas", ""]
    for t, d in TABELAS.items():
        o += [f"### `{t}`", d["descr"], "",
              "| Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição |",
              "|---|---|---|---|---|---|---|---|"]
        for x in d["cols"]:
            o.append(f"| {t} | `{x['nome']}` | {x['tipo']} | {x['tam'] or '—'} | {x['nulo']} | {x['chave'] or '—'} | "
                     f"{('`' + x['default'] + '`') if x['default'] else '—'} | {x['descr']} |")
        o.append("")
    o += ["## 3. Domínios (valores permitidos)", "", "| Coluna | Valores |", "|---|---|"]
    o += [f"| `{k}` | {v} |" for k, v in ENUMS]
    o += ["", "## 4. Revisão cruzada MER ↔ dicionário", "",
          "Feita pelo script a cada geração. Os diagramas mostram só os atributos principais; o dicionário é a referência completa.", "",
          "| Diagrama | Entidade | Atributos no MER | Colunas no dicionário | Só no dicionário |", "|---|---|---|---|---|"]
    for f, ent, na, nd, so in cruz:
        o.append(f"| `{f}` | `{ent}` | {na} | {nd} | {', '.join('`'+s+'`' for s in so) or '—'} |")
    o += ["", "Resultado: **0 erros** (todas as FK resolvem; todo o atributo do MER existe no dicionário).", ""]
    (MOD / "dicionario-dados.md").write_text("\n".join(o))


if __name__ == "__main__":
    erros, cruz = verificar()
    if erros:
        print("\n".join(erros))
        sys.exit(1)
    gerar(cruz)
    print(f"{len(TABELAS)} tabelas, {sum(len(d['cols']) for d in TABELAS.values())} colunas, 0 erros")
