/**
 * Dados de exemplo do portal. Substituir por Supabase (cliente, demos, reuniões,
 * feedback) e pela API do GitHub (fases e tarefas) — ver docs/especificacao_portal_cliente.md.
 * As datas são relativas a "hoje" para a demonstração nunca parecer desatualizada.
 */
import { mapDbPhases } from "./db-phases";
import { PHASES } from "./phases";
import type { Client, Feedback, Project, Task } from "./types";
import { now as clockNow, nowMs } from "@/lib/clock";

const DAY = 86_400_000;
export function at(days: number, hour = 10, minute = 0) {
  const d = new Date(nowMs() + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const DEMO_CREDENTIALS = { email: "alex@novaapp.ao", password: "jpstudio" };

export const clients: Client[] = [
  {
    id: "c_alex",
    name: "Alex Martins",
    company: "Nova Mobilidade",
    email: DEMO_CREDENTIALS.email,
    initials: "AM",
  },
  {
    id: "c_kiala",
    name: "Kiala Domingos",
    company: "",
    email: "kiala@exemplo.ao",
    initials: "KD",
  },
];

let n = 1;
const t = (
  title: string,
  area: Task["area"],
  state: Task["state"],
  closedDaysAgo?: number,
  extra: Partial<Task> = {},
): Task => ({
  number: n++,
  title,
  area,
  state,
  closedAt: closedDaysAgo !== undefined ? at(-closedDaysAgo, 16) : undefined,
  updatedAt: at(-(closedDaysAgo ?? 1), 16),
  ...extra,
});

export const projects: Project[] = [
  {
    id: "p_nova",
    slug: "nova-app-mobile",
    clientId: "c_alex",
    name: "Nova App Mobile",
    tagline: "Bilhética e pagamentos para transporte urbano",
    description:
      "Aplicação Android e iOS para comprar bilhetes, carregar saldo e validar viagens com QR code, com painel web para os operadores.",
    repo: { owner: "lemosGit", name: "nova-app-mobile" },
    startedOn: at(-46),
    dueOn: at(32),
    team: [
      { initials: "JP", name: "João Pereira" },
      { initials: "ML", name: "Marta Lopes" },
      { initials: "RS", name: "Rui Santos" },
      { initials: "AN", name: "Ana Neto" },
    ],
    phases: [
      {
        number: 1,
        title: PHASES[0].title,
        description: PHASES[0].description,
        dueOn: at(-34),
        closed: true,
        tasks: [
          t("Entrevistas com operadores", "Produto", "closed", 40),
          t("Mapa de funcionalidades", "Produto", "closed", 38),
          t("Escolha da stack e arquitetura", "Infra", "closed", 36),
          t("Documento de requisitos aprovado", "Produto", "closed", 34),
        ],
      },
      {
        number: 2,
        title: PHASES[1].title,
        description: PHASES[1].description,
        dueOn: at(-22),
        closed: true,
        tasks: [
          t("Fluxo de compra de bilhete", "Design", "closed", 30),
          t("Ecrã de carteira e saldo", "Design", "closed", 28),
          t("Validação por QR code", "Design", "closed", 26),
          t("Sistema de cores e tipografia", "Design", "closed", 24),
          t("Protótipo aprovado pelo cliente", "Design", "closed", 22),
        ],
      },
      {
        number: 3,
        title: PHASES[2].title,
        description: PHASES[2].description,
        dueOn: at(12),
        closed: false,
        tasks: [
          t("Autenticação por telefone", "Backend", "closed", 20),
          t("Estrutura de navegação da app", "Frontend", "closed", 19),
          t("Catálogo de rotas e tarifas", "API", "closed", 17),
          t("Carteira e carregamento de saldo", "Frontend", "closed", 15),
          t("Pagamento com Multicaixa Express", "Backend", "closed", 12),
          t("Geração de bilhete com QR code", "Backend", "closed", 9),
          t("Histórico de viagens", "Frontend", "closed", 6),
          t("Modo offline para bilhetes", "Frontend", "closed", 5),
          t("Painel do operador — vendas", "Frontend", "closed", 4),
          t("Dashboard do cliente", "Frontend", "closed", 2),
          t("Integração com GitHub", "API", "closed", 1),
          t("Sistema de notificações", "Backend", "closed", 0),
          t("Leitor de QR para fiscais", "Frontend", "open", undefined, { stage: "progress" }),
          t("Relatórios exportáveis", "API", "open", undefined, { stage: "review" }),
          t("Recuperação de conta", "Backend", "open"),
          t("Ecrã de ajuda e contactos", "Frontend", "open"),
          t("Textos dos termos e da privacidade", "Produto", "open", undefined, { stage: "needs-client" }),
          t("Otimização de arranque", "Frontend", "open"),
        ],
      },
      {
        number: 4,
        title: PHASES[3].title,
        description: PHASES[3].description,
        dueOn: at(22),
        closed: false,
        tasks: [
          t("Testes com 20 passageiros", "Qualidade", "open"),
          t("Correções da ronda de testes", "Frontend", "open"),
        ],
      },
      {
        number: 5,
        title: PHASES[4].title,
        description: PHASES[4].description,
        dueOn: at(32),
        closed: false,
        tasks: [
          t("Publicação na Google Play", "Infra", "open"),
          t("Publicação na App Store", "Infra", "open"),
          t("Formação da equipa do operador", "Produto", "open"),
        ],
      },
      {
        number: 6,
        title: PHASES[5].title,
        description: PHASES[5].description,
        closed: false,
        tasks: [],
      },
    ],
    demos: [
      {
        id: "d_web_3",
        kind: "web",
        url: "https://nova-app-preview.vercel.app",
        version: "0.9.0",
        notes: "Painel do operador com vendas do dia e exportação.",
        createdAt: at(0, 9, 48),
      },
      {
        id: "d_and_3",
        kind: "android",
        url: "https://expo.dev/accounts/jpstudio/projects/nova-app/builds/preview-090",
        version: "0.9.0",
        notes: "Bilhetes funcionam sem internet. Novo histórico de viagens.",
        createdAt: at(-1, 18, 20),
      },
      {
        id: "d_web_2",
        kind: "web",
        url: "https://nova-app-preview-git-0-8.vercel.app",
        version: "0.8.0",
        notes: "Pagamento com Multicaixa Express em ambiente de teste.",
        createdAt: at(-12, 11),
      },
      {
        id: "d_and_2",
        kind: "android",
        url: "https://expo.dev/accounts/jpstudio/projects/nova-app/builds/preview-080",
        version: "0.8.0",
        notes: "Primeira build com carteira e carregamento de saldo.",
        createdAt: at(-13, 17),
      },
    ],
    meetings: [
      {
        id: "m_4",
        title: "Revisão do Sprint 04",
        startsAt: at(9, 14, 30),
        endsAt: at(9, 15, 15),
        callUrl: "https://meet.google.com/jps-nova-s04",
        agenda: ["Demonstração do leitor de QR", "Relatórios para operadores", "Plano de testes"],
      },
      {
        id: "m_3",
        title: "Revisão do Sprint 03",
        startsAt: at(-5, 14, 30),
        endsAt: at(-5, 15, 10),
        callUrl: "https://meet.google.com/jps-nova-s03",
        agenda: ["Pagamentos", "Modo offline"],
        notes: "Modo offline aprovado. Pedido: mostrar o saldo também no ecrã do bilhete.",
      },
      {
        id: "m_2",
        title: "Aprovação do protótipo",
        startsAt: at(-22, 10),
        endsAt: at(-22, 11),
        callUrl: "https://meet.google.com/jps-nova-s02",
        agenda: ["Protótipo navegável", "Sistema visual"],
        notes: "Protótipo aprovado com ajustes no fluxo de carregamento de saldo.",
      },
    ],
    syncedAt: at(0, clockNow().getHours(), Math.max(0, clockNow().getMinutes() - 3)),
    source: "exemplo",
  },
  // Académico (fases como dados, M5-06). Os dados do Design e mais estados chegam na M5-14.
  {
    id: "p_mono",
    slug: "monografia-microcredito",
    clientId: "c_kiala",
    name: "Monografia",
    tagline: "O microcrédito e as zungueiras de Luanda",
    description: "Monografia de licenciatura em Economia, normas APA 7.ª edição, 45 páginas.",
    serviceType: "academic",
    repo: { owner: "", name: "" },
    startedOn: at(-14),
    dueOn: at(12),
    team: [{ initials: "JP", name: "João Pereira" }],
    phases: mapDbPhases([
      { position: 1, key: "pedido-briefing", name: "Pedido e briefing", description: "Tema, normas, páginas e prazo combinados.", status: "concluida", due_on: null, next_step: null, next_step_owner: null, progress: null, client_can_upload: true },
      { position: 2, key: "orcamento-aceite", name: "Orçamento e aceite", description: "Valor, sinal e prazo para aceitar.", status: "concluida", due_on: null, next_step: null, next_step_owner: null, progress: null, client_can_upload: false },
      { position: 3, key: "estrutura", name: "Estrutura (índice)", description: "Índice proposto para aprovar.", status: "concluida", due_on: null, next_step: null, next_step_owner: null, progress: null, client_can_upload: false },
      { position: 4, key: "desenvolvimento", name: "Desenvolvimento", description: "Escrita dos capítulos.", status: "em_curso", due_on: null, next_step: "Estamos a escrever o capítulo 4. Não precisa de fazer nada.", next_step_owner: "geniusfrela", progress: 40, client_can_upload: false },
      { position: 5, key: "revisao-formatacao", name: "Revisão e formatação", description: "Revisão do texto e aplicação das normas.", status: "por_iniciar", due_on: null, next_step: null, next_step_owner: null, progress: null, client_can_upload: true },
      { position: 6, key: "entrega-final", name: "Entrega final", description: "Ficheiros finais em PDF e Word.", status: "por_iniciar", due_on: null, next_step: null, next_step_owner: null, progress: null, client_can_upload: false },
      { position: 7, key: "ajustes", name: "Ajustes", description: "Pequenas correções dentro do prazo combinado.", status: "por_iniciar", due_on: null, next_step: null, next_step_owner: null, progress: null, client_can_upload: true },
    ]),
    // M5-10 (Q-085): um índice atualizado à espera do cliente + o histórico do índice anterior.
    approvals: [
      {
        id: "ap_idx3",
        subject: "indice",
        versionLabel: "V3",
        snapshot: {
          title: "Índice",
          message: "Juntámos a secção 4.3 sobre as taxas de juro, como sugeriu o orientador.",
          items: ["1. Introdução", "2. Revisão da literatura", "3. Metodologia", "4. Resultados", "4.3 Taxas de juro praticadas", "5. Conclusões", "Referências"],
        },
        status: "pendente",
        requestedAt: at(-1, 17),
        decidedAt: null,
        phase: null,
        responses: [],
      },
      {
        id: "ap_idx2",
        subject: "indice",
        versionLabel: "V2",
        snapshot: { title: "Índice", items: ["1. Introdução", "2. Revisão da literatura", "3. Metodologia", "4. Resultados", "5. Conclusões"] },
        status: "aprovada",
        requestedAt: at(-6, 11),
        decidedAt: at(-5, 9),
        phase: { position: 3, name: "Estrutura (índice)" },
        responses: [{ kind: "aprovar", comment: null, actorRole: "client", createdAt: at(-5, 9) }],
      },
      {
        id: "ap_idx1",
        subject: "indice",
        versionLabel: "V1",
        snapshot: { title: "Índice", items: ["1. Introdução", "2. Revisão da literatura", "3. Resultados", "4. Conclusões"] },
        status: "alteracoes_pedidas",
        requestedAt: at(-9, 16),
        decidedAt: at(-8, 10),
        phase: { position: 3, name: "Estrutura (índice)" },
        responses: [{ kind: "pedir_alteracoes", comment: "Falta o capítulo da metodologia.", actorRole: "client", createdAt: at(-8, 10) }],
      },
    ],
    // M5-11: sinal pago e restante por pagar (bloqueia os ficheiros finais, RN-14).
    payments: [
      { id: "pg_sinal", kind: "sinal", description: "Sinal (50%)", amountKz: 45000, dueOn: null, status: "pago", paidOn: at(-12).slice(0, 10), extraRounds: 0, gatesPhase: { key: "estrutura", name: "Estrutura (índice)", position: 3 }, createdAt: at(-13, 9) },
      { id: "pg_rest", kind: "restante", description: "Restante, antes da entrega", amountKz: 45000, dueOn: at(12).slice(0, 10), status: "pendente", paidOn: null, extraRounds: 0, gatesPhase: null, createdAt: at(-13, 9) },
    ],
    demos: [],
    meetings: [],
    syncedAt: at(0, 10),
    source: "exemplo",
  },
];

/** Feedback inicial; novas mensagens ficam em memória até haver base de dados. */
export const feedbackSeed: Record<string, Feedback[]> = {
  p_nova: [
    {
      id: "f1",
      author: "client",
      body: "O fluxo de compra ficou muito claro. Dá para mostrar o saldo também no ecrã do bilhete?",
      target: { kind: "fase", ref: 3 },
      createdAt: at(-5, 15, 40),
    },
    {
      id: "f2",
      author: "admin",
      body: "Dá sim. Já está na build 0.9.0 — o saldo aparece por baixo do QR code.",
      target: { kind: "fase", ref: 3 },
      createdAt: at(-1, 18, 30),
    },
    {
      id: "f3",
      author: "client",
      body: "Testei a build no Android e o modo offline funcionou bem no autocarro.",
      target: { kind: "geral" },
      createdAt: at(-1, 8, 15),
    },
    {
      id: "f4",
      author: "admin",
      body: "Ótimo! Na revisão do Sprint 04 mostro o leitor de QR para os fiscais. Se puder, traga um telemóvel Android.",
      target: { kind: "geral" },
      createdAt: at(0, 9, 10),
    },
  ],
};


