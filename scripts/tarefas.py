"""Backlog — Área do Cliente multi-serviço: módulos Académico e Design.

Fonte: docs/references/1/GeniusFrela_Projeto_e_Layouts.md
Decisões: docs/00-gestao/decisoes.md (D-001 … D-008)
O layout de Desenvolvimento (Tech) já existe e serve de modelo.
"""

MILESTONES = {
    "M1": "M1 — Requisitos: Académico & Design",
    "M2": "M2 — Modelagem: serviços, fases e blocos",
    "M3": "M3 — Arquitetura: fases na BD, link mágico, ficheiros",
    "M4": "M4 — UX/UI: layouts Académico & Design",
    "M5": "M5 — Fundação comum multi-serviço",
    "M6": "M6 — Módulo Académico",
    "M7": "M7 — Módulo Design",
    "M9": "M9 — Integração & QA",
    "M10": "M10 — Deploy & Entrega v1.1",
}

MILESTONE_DESC = {
    "M1": "Visão, personas, RF/RNF/RN dos módulos e blocos comuns, MoSCoW, US (G1)",
    "M2": "service_type, fases como dados, pagamentos, aprovações, ficheiros, fichas por serviço",
    "M3": "ADRs: fases BD vs GitHub, link mágico, Storage, tema por serviço, RLS",
    "M4": "Wireframes Académico, Design e blocos comuns; tokens de acento (G2)",
    "M5": "Migrações, motor de fases, tema, admin, Ficheiros, Aprovações, Pagamentos, Link mágico — demo v0.1",
    "M6": "Ficha do trabalho, prazo, capítulos, índice, entrega e ajustes — demo v0.2",
    "M7": "Ficha técnica, galeria de provas, rondas, aprovação da arte, produção — demo v0.3",
    "M9": "E2E, regressão do Tech, segurança, homologação (G3)",
    "M10": "Migrações em produção, release v1.1.0, manual do admin, documentação",
}

T = []


def task(code, title, t, a, p, s, deps=(), ent="", obj="", refs="", per=(), ac=(), extra=(), mod="comum"):
    T.append(dict(code=code, title=title, t=t, a=a if isinstance(a, list) else [a], p=p, s=s,
                  deps=list(deps), ent=ent, obj=obj, refs=refs, per=list(per), ac=list(ac),
                  extra=[f"modulo: {mod}", *extra]))


DOC = "`docs/references/1/GeniusFrela_Projeto_e_Layouts.md`"

# ───────────────────────── M1 — Requisitos ─────────────────────────
task("M1-01", "Registar a visão e o âmbito dos módulos Académico e Design", "docs", "requisitos", "must", "S",
     ent="`docs/01-requisitos/visao-modulos.md`", refs=f"{DOC} §1–§5 · D-001…D-004",
     obj="Descrever o que muda na Área do Cliente quando passa de 1 para 3 serviços, e o que fica fora.",
     ac=["Âmbito e fora de âmbito por módulo", "Diagrama de contexto (cliente, admin, Supabase, GitHub, Resend)",
         "Contradições com o código atual listadas (6 vs 7 fases, paleta, blocos inexistentes)"])
task("M1-02", "Definir as personas dos novos serviços", "docs", "requisitos", "must", "S", ["M1-01"],
     ent="`docs/01-requisitos/personas.md`",
     obj="PER-01 Admin · PER-02 Cliente Tech (existente) · PER-03 Universitário · PER-05 Ensino médio · PER-04 Particular com evento.",
     ac=["Objetivos, dores, dispositivo principal e permissões por persona", "Jornada de cada persona do link de acesso à entrega"])
task("M1-03", "Especificar os requisitos funcionais do Académico", "docs", "requisitos", "must", "M", ["M1-02"],
     ent="`docs/01-requisitos/requisitos-funcionais.md` (grupo RF-10)", refs=f"{DOC} §5.2", per=["PER-01", "PER-03"], mod="academico",
     ac=["RF por fase: briefing, orçamento/aceite, índice, desenvolvimento, revisão, entrega, ajustes",
         "RF dos blocos: contagem do prazo, progresso por capítulos, ficha do trabalho", "Cada RF com persona e origem"])
task("M1-04", "Especificar os requisitos funcionais do Design", "docs", "requisitos", "must", "M", ["M1-02"],
     ent="`docs/01-requisitos/requisitos-funcionais.md` (grupo RF-20)", refs=f"{DOC} §5.3", per=["PER-01", "PER-04"], mod="design",
     ac=["RF por fase: briefing, orçamento+sinal, conceito, revisões, aprovação da arte, produção, entrega",
         "RF dos blocos: galeria de provas, contador de rondas, ficha técnica, aviso de irreversibilidade"])
task("M1-05", "Especificar os requisitos dos blocos comuns", "docs", "requisitos", "must", "M", ["M1-02"],
     ent="`docs/01-requisitos/requisitos-funcionais.md` (grupo RF-30)", refs=f"{DOC} §4 e §7 · D-002", per=["PER-01", "PER-02", "PER-03", "PER-04"],
     ac=["Pagamentos (sinal/restante, registo manual pelo admin)", "Aprovações (aprovar / pedir alterações, com histórico)",
         "Ficheiros/entregáveis (upload admin, download cliente)", "Link mágico (uso único, validade curta) + credenciais como alternativa",
         "Escolha do service_type na criação do projeto"])
task("M1-06", "Definir os requisitos não funcionais", "docs", "requisitos", "must", "S", ["M1-02"],
     ent="`docs/01-requisitos/requisitos-nao-funcionais.md`",
     ac=["Validade do link mágico em minutos e uso único (métrica verificável)",
         "Limites do Supabase gratuito: Storage 1 GB, tamanho máximo por ficheiro, emails de Auth/hora",
         "Privacidade: ficheiros só acessíveis por URL assinada", "Mobile-first: tudo utilizável a 360 px",
         "Regressão zero no layout Tech"])
task("M1-07", "Registar as regras de negócio", "docs", "requisitos", "must", "S", ["M1-03", "M1-04", "M1-05"],
     ent="`docs/01-requisitos/regras-negocio.md`",
     ac=["RN: o trabalho só começa após aceite/sinal", "RN: nº de rondas incluídas no preço; ronda extra é paga",
         "RN: depois de aprovar a arte, a produção não pode ser alterada",
         "RN: ajustes académicos só dentro do prazo acordado", "RN: atendimento humano seg–sex 18h–21h (mensagens fora de horas)"])
task("M1-08", "Priorizar (MoSCoW) e escrever as user stories", "docs", "requisitos", "must", "M", ["M1-07", "M1-06"],
     ent="`docs/01-requisitos/priorizacao-moscow.md`, `docs/01-requisitos/user-stories.md`",
     ac=["Cada Won't justificado", "US-NNN com Dado/Quando/Então e ligação a RF", "Matriz RF ↔ PER ↔ US em `rastreabilidade.md`"])
task("M1-09", "Validar os requisitos (G1)", "entrega-cliente", "gestão", "must", "XS", ["M1-08"],
     ent="`docs/00-gestao/actas/G1-requisitos.md`", extra=["gate: cliente"],
     ac=["D-005 (6 vs 7 fases do Tech) confirmada ou revista", "Acta com decisão e alterações pedidas"])

# ───────────────────────── M2 — Modelagem ─────────────────────────
task("M2-01", "Modelar o service_type e as fases como dados", "docs", "modelagem", "must", "M", ["M1-09"],
     ent="`docs/02-modelagem/mer/` (fonte + PNG)", refs="D-001 · `supabase/migrations/0001_portal.sql`",
     obj="`projects.service_type` (development|academic|design), `phase_templates` (fases por serviço) e `project_phases` (estado por projeto).",
     ac=["Cardinalidades e chaves definidas", "Estados de fase: por iniciar, em curso, a aguardar o cliente, concluída, atrasada",
         "Projetos Tech continuam sem linhas em project_phases (fonte GitHub)"], extra=["entrega: imagem"])
task("M2-02", "Modelar Pagamentos, Aprovações e Ficheiros", "docs", "modelagem", "must", "M", ["M1-09"],
     ent="`docs/02-modelagem/mer/` (atualizado)",
     ac=["`payments` (tipo sinal/restante/extra, valor, estado, data)", "`approvals` (alvo, estado, comentário, decidido_por, decidido_em)",
         "`project_files` (fase, tipo, caminho no Storage, versão)", "Ligação opcional de cada registo a uma fase"], extra=["entrega: imagem"])
task("M2-03", "Modelar as fichas específicas de cada serviço", "docs", "modelagem", "must", "S", ["M2-01"],
     ent="`docs/02-modelagem/fichas-servico.md`",
     obj="Ficha do trabalho (Académico), ficha técnica (Design), capítulos e provas/rondas.",
     ac=["Decisão justificada: colunas próprias ou `projects.spec jsonb` validado", "`academic_sections` (título, ordem, estado)",
         "`design_proofs` (versão Vn, ronda, ficheiro, comentário) e nº de rondas incluídas"])
task("M2-04", "Escrever o dicionário de dados das novas tabelas", "docs", ["modelagem", "database"], "must", "S", ["M2-02", "M2-03"],
     ent="`docs/02-modelagem/dicionario-dados.md`",
     ac=["Tabela | Atributo | Tipo | Tamanho | Nulo | Chave | Default | Descrição", "Revisão cruzada MER ↔ dicionário"])
task("M2-05", "Desenhar os diagramas de estados", "docs", "modelagem", "should", "S", ["M2-02"],
     ent="`docs/02-modelagem/estados/` (fonte + PNG)", extra=["entrega: imagem"],
     ac=["Fase", "Aprovação (pendente → aprovada | alterações pedidas)", "Pagamento (pendente → pago | atrasado)", "Prova de design (enviada → comentada → aprovada)"])
task("M2-06", "Desenhar as sequências do link mágico e da aprovação da arte", "docs", "modelagem", "should", "S", ["M2-02"],
     ent="`docs/02-modelagem/sequencia/` (fonte + PNG)", extra=["entrega: imagem"],
     ac=["Link mágico: admin gera → envio WhatsApp/email → cliente entra → token consumido",
         "Aprovação da arte: cliente aprova → bloqueio → fase Produção"])

# ───────────────────────── M3 — Arquitetura ─────────────────────────
task("M3-01", "Escrever o ADR das fases na BD vs GitHub", "docs", "arquitetura", "must", "S", ["M2-01"],
     ent="`docs/03-arquitetura/adr/ADR-001-fonte-das-fases.md`", refs="D-001 · `lib/github/phases.ts` · `lib/portal/phases.ts`",
     ac=["Interface comum `PhaseSource` (github | database) que devolve `Phase[]`", "Consequências para `ProjectView` e para a % de progresso"])
task("M3-02", "Investigar e decidir o link mágico", "spike", ["arquitetura", "backend"], "must", "S", ["M1-06"],
     ent="`docs/03-arquitetura/adr/ADR-002-link-magico.md`",
     obj="Comparar `auth.admin.generateLink` (magiclink) do Supabase com um token próprio, para envio por WhatsApp.",
     ac=["Uso único e validade comprovados num teste", "Funciona com envio manual por WhatsApp (sem depender só do email)",
         "Convivência com a senha temporária atual e com `must_change_password`", "Limites de rate do plano gratuito"])
task("M3-03", "Decidir o armazenamento de ficheiros e entregáveis", "docs", ["arquitetura", "database"], "must", "S", ["M2-02"],
     ent="`docs/03-arquitetura/adr/ADR-003-ficheiros.md`", refs="`supabase/migrations/0004_project_cover.sql`",
     ac=["Bucket privado `project-files` por pasta de projeto", "URLs assinadas com validade curta", "Tamanho máximo e tipos permitidos (PDF, DOCX, PNG, JPG, AI/PSD?)",
         "Estimativa de uso face a 1 GB do plano gratuito"])
task("M3-04", "Escrever o ADR do tema por serviço", "docs", ["arquitetura", "frontend"], "must", "XS", [],
     ent="`docs/03-arquitetura/adr/ADR-004-tema-por-servico.md`", refs="D-004 · `app/globals.css`",
     ac=["`data-service` no layout define `--accent` e `--accent-2`", "Cores de estado iguais nos 3 serviços", "Contraste AA verificado sobre a base ameixa"])
task("M3-05", "Desenhar o layout genérico por blocos", "docs", ["arquitetura", "frontend"], "must", "M", ["M3-01"],
     ent="`docs/03-arquitetura/layout-por-servico.md`", refs=f"{DOC} §4 e §7 · `app/cliente/(portal)/`",
     obj="Registo `SERVICE_LAYOUTS[service_type]` com fases, blocos específicos e cores, para que um serviço novo seja só configuração.",
     ac=["Blocos comuns e blocos específicos como componentes independentes", "Plano de migração do layout Tech sem regressões"])
task("M3-06", "Definir a matriz de segurança e as políticas RLS", "docs", ["arquitetura", "database"], "must", "S", ["M2-04"],
     ent="`docs/03-arquitetura/seguranca.md`", refs="`public.owns_project`, `public.is_admin`",
     ac=["Matriz persona × tabela × operação", "O cliente só aprova o que é seu e só uma vez; não altera valores de pagamento",
         "Storage: o cliente só lê ficheiros do seu projeto"])

# ───────────────────────── M4 — UX/UI ─────────────────────────
task("M4-01", "Organizar as referências visuais", "docs", "ux-ui", "should", "XS", [],
     ent="`docs/04-ux-ui/referencias.md`", refs="`docs/references/1/`, `docs/references/2/`",
     ac=["Cada referência descrita com o que se aproveita"])
task("M4-02", "Desenhar o fluxo de telas por serviço", "docs", "ux-ui", "must", "S", ["M1-09"],
     ent="`docs/04-ux-ui/fluxo-telas.md`",
     ac=["TEL-NN para entrada (link mágico), visão geral, fase, ficheiros, pagamentos, aprovações, mensagens",
         "Variações por service_type assinaladas"])
task("M4-03", "Desenhar o wireframe da Área do Cliente Académico", "docs", "ux-ui", "must", "M", ["M4-02"],
     ent="`docs/04-ux-ui/wireframes/academico.md` + imagem", mod="academico", extra=["entrega: imagem"],
     ac=["Contagem do prazo em destaque", "Capítulos (ex.: 3 de 5)", "Ficha do trabalho atrás de 'ver detalhes'", "Versão mobile e desktop"])
task("M4-04", "Desenhar o wireframe da Área do Cliente Design", "docs", "ux-ui", "must", "M", ["M4-02"],
     ent="`docs/04-ux-ui/wireframes/design.md` + imagem", mod="design", extra=["entrega: imagem"],
     ac=["Galeria V1/V2/V3 lado a lado", "Ronda X de Y", "Botão 'Aprovar arte para produção' com aviso", "Ficha técnica", "Versão mobile e desktop"])
task("M4-05", "Desenhar os blocos comuns e o ecrã do link mágico", "docs", "ux-ui", "must", "S", ["M4-02"],
     ent="`docs/04-ux-ui/wireframes/blocos-comuns.md` + imagem", extra=["entrega: imagem"],
     ac=["Pagamentos, Aprovações pendentes, Ficheiros", "Link expirado/usado com saída clara (pedir novo link)"])
task("M4-06", "Definir os tokens de acento por serviço", "docs", "ux-ui", "must", "S", ["M3-04"],
     ent="`docs/04-ux-ui/design-system.md` (secção Serviços)", refs="D-004 · memória design-system-portal",
     ac=["Acento, secundária e gradiente de cabeçalho dos 3 serviços", "Cores de estado", "Sem alterar a base ameixa/lavanda"])
task("M4-07", "Aprovar o design (G2)", "entrega-cliente", "gestão", "must", "XS", ["M4-03", "M4-04", "M4-05", "M4-06"],
     ent="`docs/00-gestao/actas/G2-design.md`", extra=["gate: cliente"], ac=["Wireframes aprovados antes de programar"])

# ───────────────────────── M5 — Fundação comum ─────────────────────────
task("M5-01", "Configurar testes (Vitest + Playwright) e CI", "chore", ["devops", "qa"], "must", "S", [],
     ent="`vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`",
     ac=["`npm test` e `npm run e2e` funcionam localmente", "CI corre typecheck + testes em cada PR"])
task("M5-02", "Criar a migração do service_type e das fases como dados", "feature", ["database", "backend"], "must", "S", ["M2-04", "M3-01"],
     ent="`supabase/migrations/0005_service_type_phases.sql`",
     ac=["`projects.service_type` com default `development` (projetos atuais intactos)", "`phase_templates` com seed das 7 fases do Académico e do Design",
         "`project_phases` criadas a partir do template quando o projeto é criado", "RLS conforme `seguranca.md`"])
task("M5-03", "Criar a migração de pagamentos, aprovações e ficheiros", "feature", ["database", "backend"], "must", "M", ["M2-04", "M3-03", "M3-06"],
     ent="`supabase/migrations/0006_blocos_comuns.sql`",
     ac=["Tabelas `payments`, `approvals`, `project_files`", "Bucket privado `project-files` com políticas", "RLS testada com cliente e admin"])
task("M5-04", "Abstrair a fonte das fases (GitHub | BD)", "refactor", "backend", "must", "M", ["M5-02"],
     ent="`lib/portal/phases.ts`, `lib/portal/data.ts`, `lib/portal/supabase-repo.ts`",
     ac=["`ProjectView` igual para os 3 serviços", "Projetos Tech continuam a ler do GitHub sem mudanças visíveis", "Teste unitário da % por fonte"])
task("M5-05", "Aplicar o tema por serviço no portal", "feature", "frontend", "must", "S", ["M4-06"],
     ent="`app/cliente/(portal)/layout.tsx`, `app/globals.css`",
     ac=["`data-service` define `--accent`/`--accent-2`", "Etiqueta do serviço com a cor no cabeçalho", "Tech sem regressão visual"])
task("M5-06", "Criar o esqueleto genérico da Área do Cliente", "feature", "frontend", "must", "M", ["M3-05", "M5-04", "M4-07"],
     ent="`app/cliente/_components/` (Stepper, CurrentPhase, slots de blocos)",
     ac=["Stepper com as fases do serviço e cores de estado", "Fase atual + próximo passo", "Registo `SERVICE_LAYOUTS` com os blocos por serviço"])
task("M5-07", "Permitir escolher o tipo de serviço ao criar o projeto", "feature", ["frontend", "backend"], "must", "S", ["M5-02"],
     ent="`app/admin/_components/ProjectFields.tsx`, `lib/admin/actions.ts`",
     ac=["Campo service_type obrigatório", "Repositório GitHub só pedido para Desenvolvimento", "Fases criadas a partir do template"])
task("M5-08", "Gerir as fases do projeto no admin", "feature", ["frontend", "backend"], "must", "M", ["M5-07"],
     ent="`app/admin/projetos/[id]/fases/`",
     ac=["Avançar/recuar fase, marcar a aguardar o cliente/atrasada", "Nota visível ao cliente por fase", "Prazo por fase opcional",
         "Email ao cliente quando a fase muda (Resend)"])
task("M5-09", "Implementar o bloco Ficheiros", "feature", ["backend", "frontend"], "must", "M", ["M5-03", "M5-06"],
     ent="Admin: upload por fase · Cliente: download por URL assinada e upload de referências no briefing e na revisão (D-010)",
     ac=["Cliente só carrega nas fases de briefing e revisão", "Limite de tamanho e tipos validados no servidor", "O cliente nunca vê ficheiros de outro projeto (teste)", "Versões ordenadas por data", "Disponibilidade de um ficheiro pode depender de um pagamento marcado como pago (D-013)"])
task("M5-09b", "Gerar miniaturas WebP e limpar ficheiros diariamente", "feature", ["backend", "frontend", "devops"], "must", "M", ["M5-09"],
     ent="Browser: pré-visualização WebP (1600 px, ≤ 150 KB) e redução de fotos > 2 MB · `/api/cron/limpeza` (Vercel Cron) · D-133",
     refs="`docs/03-arquitetura/adr/ADR-003-ficheiros.md` §3 e §4",
     ac=["Provas e fotos mostram a miniatura WebP; o original só se descarrega a pedido (RF-20.83, RF-30.46)",
         "O servidor valida a miniatura (RIFF…WEBP, ≤ 150 KB, ≤ 1600 px) e apaga a inválida",
         "Limpeza diária protegida pelo CRON_SECRET: aviso aos 83 dias, apaga aos 90 com purged_at e activity_log (RF-30.47)",
         "Apaga uploads órfãos com mais de 24 h"])
task("M5-10", "Implementar o bloco Aprovações", "feature", ["backend", "frontend"], "must", "M", ["M5-03", "M5-06"],
     ent="Admin cria pedido · Cliente aprova ou pede alterações com comentário",
     ac=["Aprovação irreversível pelo cliente (só o admin reabre)", "Pendentes em destaque na visão geral", "Histórico com data e autor"])
task("M5-11", "Implementar o bloco Pagamentos", "feature", ["backend", "frontend"], "must", "M", ["M5-03", "M5-06"],
     ent="Admin regista sinal/restante/extra · Cliente vê valores e estado",
     ac=["Valores em Kz", "Estados pendente/pago/atrasado com cores de estado", "Sem pagamento online nesta versão (registo manual, D-009)"])
task("M5-12", "Gerar e enviar o link mágico pelo admin", "feature", ["backend", "frontend"], "must", "M", ["M3-02", "M5-06"],
     ent="Admin: botão 'Gerar link' com Copiar, Abrir no WhatsApp (wa.me) e Enviar por email (D-011) · rota de entrada no portal",
     ac=["Uso único e validade conforme RNF", "Ecrã de link expirado/usado", "Login por email + senha continua a funcionar", "Evento registado (quem gerou, quando)"])
task("M5-13", "Testar as políticas RLS das novas tabelas", "test", ["database", "qa"], "must", "S", ["M5-03"],
     ent="`supabase/tests/` ou script em `scripts/`",
     ac=["Cliente A não lê nem escreve dados do cliente B", "Cliente não altera pagamentos nem aprova duas vezes"])
task("M5-14", "Acrescentar projetos Académico e Design aos dados de exemplo", "chore", "frontend", "should", "S", ["M5-06"],
     ent="`lib/portal/mock-data.ts`", ac=["Modo demonstração mostra os 3 layouts sem Supabase"])
task("M5-99", "Demo e entrega parcial v0.1 — fundação multi-serviço", "entrega-cliente", "devops", "must", "XS",
     ["M5-08", "M5-09", "M5-10", "M5-11", "M5-12", "M5-13"], ent="`docs/06-entrega/releases/v0.1.0.md`",
     ac=["Preview Vercel com um projeto de cada serviço", "Notas de versão com limitações conhecidas"])

# (M9-07 acrescentada na M5-99, issue #132 — fica aqui só para a lista completa; a milestone é a M9)
task("M9-07", "Reduzir o tempo de resposta das páginas e ações do admin", "bug", ["backend", "frontend"], "should", "M", ["M5-99"],
     ent="Correções + medições antes/depois em `docs/05-qa/relatorios/desempenho-admin.md`",
     ac=["Medir onde está o tempo (sessão, consultas em série, revalidatePath, região Supabase vs Vercel dub1)",
         "Páginas do admin < 1 s e ações < 2 s no p75", "Feedback visível durante ações longas"])

# ───────────────────────── M6 — Académico ─────────────────────────
task("M6-01", "Implementar a ficha do trabalho académico", "feature", ["backend", "frontend"], "must", "S", ["M5-99"], mod="academico",
     ent="Admin: formulário · Cliente: bloco 'Ficha do trabalho'",
     ac=["Instituição, nível de ensino, disciplina, tema, normas (APA…), nº de páginas, prazo", "Atrás de 'ver detalhes' na primeira vista"])
task("M6-02", "Mostrar a contagem do prazo em destaque", "feature", "frontend", "must", "S", ["M6-01"], mod="academico",
     ent="Bloco `DeadlineCountdown`",
     ac=["Dias restantes em tamanho grande", "Cor muda a ≤ 3 dias (aguardar) e após o prazo (atrasado)", "Fuso Africa/Luanda"])
task("M6-03", "Implementar o progresso por capítulos e secções", "feature", ["backend", "frontend"], "must", "M", ["M5-99"], mod="academico",
     ent="Admin gere capítulos · Cliente vê 'X de Y'",
     ac=["Capítulos opcionais: sem capítulos, o progresso é o da fase (PER-05)", "Reordenar e marcar concluído no admin", "% da fase Desenvolvimento calculada pelos capítulos"])
task("M6-04", "Ligar o orçamento e o aceite ao bloco Aprovações", "feature", "backend", "must", "S", ["M5-99"], mod="academico",
     ent="Fase 2 — botão 'Aceitar'", ac=["Fase Estrutura só começa com aceite + sinal pago (D-013)", "Valor, sinal (50% por omissão) e prazo vêm do bloco Pagamentos"])
task("M6-05", "Permitir aprovar o índice proposto", "feature", ["backend", "frontend"], "must", "S", ["M6-03"], mod="academico",
     ent="Fase 3 — índice para aprovação", ac=["Índice gerado a partir dos capítulos", "Pedir alterações volta a 'em curso' com comentário"])
task("M6-06", "Implementar a entrega final e o pedido de ajustes", "feature", ["backend", "frontend"], "must", "S", ["M5-99"], mod="academico",
     ent="Fases 6 e 7", ac=["Ficheiro final em PDF e Word, disponível só com o restante pago (D-013)", "Prazo de ajustes = N dias após a entrega, por omissão 7 (D-016)", "Fora do prazo: encaminha para mensagens", "Conclusão automática sem pedidos abertos"])
task("M6-07", "Compor o layout Académico na Área do Cliente", "feature", "frontend", "must", "M", ["M6-02", "M6-03", "M6-05", "M6-06"], mod="academico",
     ent="`SERVICE_LAYOUTS.academic`", refs="`docs/04-ux-ui/wireframes/academico.md`",
     ac=["Fiel ao wireframe aprovado (G2)", "Acento âmbar #F59E0B", "Mobile 360 px sem scroll horizontal"])
task("M6-08", "Criar a página pública do serviço Académico", "feature", "frontend", "should", "S", ["M6-07"], mod="academico",
     ent="`app/servicos/academico/page.tsx`", refs=f"{DOC} §3",
     ac=["Cartão do serviço na secção Serviços com a cor", "Filtro Académico no Portfólio", "Botão 'Fale connosco' (WhatsApp)"])
task("M6-09", "Testar os componentes do Académico", "test", "qa", "must", "S", ["M6-07", "M5-01"], mod="academico",
     ent="`__tests__/academico/`", ac=["Contagem do prazo (limites)", "Progresso por capítulos", "Ajuste fora do prazo bloqueado"])
task("M6-99", "Demo e entrega parcial v0.2 — módulo Académico", "entrega-cliente", "devops", "must", "XS", ["M6-07", "M6-09"], mod="academico",
     ent="`docs/06-entrega/releases/v0.2.0.md`", ac=["Projeto académico de teste percorre as 7 fases"])

# ───────────────────────── M7 — Design ─────────────────────────
task("M7-01", "Implementar a ficha técnica da peça", "feature", ["backend", "frontend"], "must", "S", ["M6-99"], mod="design",
     ent="Admin: formulário · Cliente: bloco 'Ficha técnica'",
     ac=["Tipo de peça (logótipo, convite, lona, camisola), medidas, material, quantidade, acabamento, textos, referências"])
task("M7-02", "Implementar a galeria de provas", "feature", ["backend", "frontend"], "must", "M", ["M6-99"], mod="design",
     ent="Bloco `ProofGallery`", ac=["V1, V2, V3… lado a lado (carrossel em mobile)", "Miniatura WebP comprimida; original só a pedido (dados móveis, Q-010)", "Ampliar imagem", "Imagens servidas por URL assinada"])
task("M7-03", "Implementar as rondas de revisão com comentários", "feature", ["backend", "frontend"], "must", "M", ["M7-02"], mod="design",
     ent="Contador 'Ronda X de Y' + comentários por prova",
     ac=["Nº de rondas incluídas definido no orçamento", "Ronda extra assinalada como paga (RN) e gera pagamento 'extra'", "Comentário ligado à versão"])
task("M7-04", "Implementar a aprovação final da arte para produção", "feature", ["backend", "frontend"], "must", "M", ["M7-03"], mod="design",
     ent="Botão 'Aprovar arte para produção'",
     ac=["Confirmação com aviso: após aprovar, a produção não pode ser alterada", "Bloqueia novas rondas e comentários",
         "Avança para Produção e avisa o admin por email"])
task("M7-05", "Mostrar o estado da produção e a entrega/levantamento", "feature", ["backend", "frontend"], "must", "S", ["M7-04"], mod="design",
     ent="Fases 6 e 7", ac=["Estado da produção editável no admin", "Data e local de entrega/levantamento", "Ficheiros finais no bloco Ficheiros"])
task("M7-06", "Ligar o orçamento design + impressão e o sinal", "feature", "backend", "must", "S", ["M6-99"], mod="design",
     ent="Fase 2", ac=["Valores separados de design e impressão", "Conceito só começa com o sinal pago (RN)"])
task("M7-07", "Compor o layout Design na Área do Cliente", "feature", "frontend", "must", "M", ["M7-01", "M7-04", "M7-05", "M7-06"], mod="design",
     ent="`SERVICE_LAYOUTS.design`", refs="`docs/04-ux-ui/wireframes/design.md`",
     ac=["Fiel ao wireframe aprovado (G2)", "Acento magenta #EC4899", "Mobile 360 px sem scroll horizontal"])
task("M7-08", "Criar a página pública do serviço Design", "feature", "frontend", "should", "S", ["M7-07"], mod="design",
     ent="`app/servicos/design/page.tsx`", refs=f"{DOC} §3",
     ac=["Cartão do serviço com a cor", "Filtro Design no Portfólio", "Botão 'Fale connosco' (WhatsApp)"])
task("M7-09", "Testar os componentes do Design", "test", "qa", "must", "S", ["M7-07", "M5-01"], mod="design",
     ent="`__tests__/design/`", ac=["Contador de rondas e ronda extra", "Bloqueio após aprovação da arte", "Galeria com 1 e com N versões"])
task("M7-99", "Demo e entrega parcial v0.3 — módulo Design", "entrega-cliente", "devops", "must", "XS", ["M7-07", "M7-09"], mod="design",
     ent="`docs/06-entrega/releases/v0.3.0.md`", ac=["Projeto de design de teste percorre as 7 fases"])

# ───────────────────────── M9 — Integração & QA ─────────────────────────
task("M9-01", "Escrever o plano de testes a partir dos critérios", "docs", "qa", "must", "S", ["M1-09"],
     ent="`docs/05-qa/plano-testes.md`", ac=["Cada US com caso de teste", "Dados de teste por serviço"])
task("M9-02", "Testar de ponta a ponta o fluxo Académico", "test", "qa", "must", "M", ["M6-99", "M9-01"], mod="academico",
     ent="`e2e/academico.spec.ts`", ac=["Link mágico → aceite → índice → entrega → ajuste", "Corre no CI"])
task("M9-03", "Testar de ponta a ponta o fluxo Design", "test", "qa", "must", "M", ["M7-99", "M9-01"], mod="design",
     ent="`e2e/design.spec.ts`", ac=["Sinal → provas → rondas → aprovação da arte → produção → entrega", "Corre no CI"])
task("M9-04", "Verificar a regressão do layout Desenvolvimento", "test", "qa", "must", "S", ["M7-99"],
     ent="`e2e/desenvolvimento.spec.ts`", ac=["Fases do GitHub, tarefas, demos e mensagens iguais ao v1.0", "Projeto candongueiro-pay de teste intacto"])
task("M9-05", "Rever a segurança (RLS, URLs assinadas, link mágico)", "test", ["qa", "backend"], "must", "M", ["M7-99"],
     ent="`docs/05-qa/relatorios/seguranca-v1.1.md`",
     ac=["Link reutilizado ou expirado é recusado", "URL assinada expira", "Advisors do Supabase sem avisos de segurança", "OWASP: IDOR nas rotas de aprovação/ficheiros"])
task("M9-06", "Homologar com um cliente piloto de cada serviço (G3)", "entrega-cliente", ["qa", "gestão"], "must", "S", ["M9-02", "M9-03", "M9-04", "M9-05"],
     ent="`docs/00-gestao/actas/G3-uat.md`", extra=["gate: cliente"],
     ac=["Um cliente académico e um de design usam o portal", "Ajustes registados em `pedidos-alteracao.md`"])

# ───────────────────────── M10 — Deploy & Entrega ─────────────────────────
task("M10-01", "Aplicar as migrações em produção com backup prévio", "chore", ["devops", "database"], "must", "S", ["M9-06"],
     ent="Registo em `ultima_atualizacao.md`", ac=["Backup cifrado antes", "Migrações 0005+ aplicadas", "Bucket `project-files` criado"])
task("M10-02", "Publicar a release v1.1.0 do portal multi-serviço", "entrega-cliente", "devops", "must", "XS", ["M10-01"],
     ent="`docs/06-entrega/releases/v1.1.0.md` + tag `v1.1.0`", ac=["Merge em main, tag e deploy Vercel verificado"])
task("M10-03", "Escrever o manual do admin por serviço", "docs", "suporte", "should", "S", ["M10-02"],
     ent="`docs/06-entrega/manual-admin.md`", ac=["Criar projeto por serviço, gerir fases, provas, pagamentos, gerar link mágico"])
task("M10-04", "Atualizar a especificação e os diagramas do portal", "docs", ["arquitetura", "modelagem"], "should", "S", ["M10-02"],
     ent="`docs/especificacao_portal_cliente.md`, `docs/diagramas/04-modelo-dados.*`",
     ac=["Modelo de dados com as novas tabelas", "Secção multi-serviço na especificação", f"{DOC} marcado: Académico e Design ✅"])

TASKS = T
