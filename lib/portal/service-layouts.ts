/**
 * Registo dos layouts por serviço (docs/03-arquitetura/layout-blocos.md §5, D-094).
 * Um serviço novo = uma entrada aqui + um modelo de fases na BD + um bloco [data-service] no CSS.
 * As páginas não sabem de que serviço é o projeto: pedem a este registo o menu e os blocos.
 */
import type { ServiceType } from "./types";

/** Blocos que existem em app/cliente/_blocks (o id liga o registo ao componente). */
export type BlockId =
  // Tech — as linhas atuais da Visão geral, sem alterações (D-097, passo 1)
  | "tech-needs-client"
  | "tech-hero-progress"
  | "tech-roadmap-meeting-news"
  | "tech-demo-feedback"
  // comuns (Académico, Design)
  | "phase-bar"
  | "next-step"
  | "approvals"
  | "payments"
  // Académico (M6)
  | "aca-brief"
  | "aca-countdown"
  | "aca-chapters"
  | "aca-adjustments"
  // Design (M7)
  | "des-spec"
  | "des-proof"
  | "des-pickup"
  // Pagamentos compactos (wireframe Académico, M6-07): o que falta + "Ver pagamentos"
  | "payments-compact";

export type NavIcon = "home" | "project" | "files" | "messages" | "agenda";
export type NavItem = { href: string; label: string; icon: NavIcon; badge?: boolean };

export type ServiceLayout = {
  /** Nome curto do serviço, na etiqueta do cabeçalho (DS V1: "TECH", "ACADÉMICO", "DESIGN"). */
  label: string;
  nav: NavItem[];
  pages: { overview: BlockId[] };
  /**
   * Grelha da Visão geral (M6-07). Sem ela, os blocos empilham-se (Tech, Design). Com ela, cada bloco
   * vai num invólucro com a sua classe: no telemóvel ficam pela ordem da lista; no computador as
   * classes põem-nos em colunas (wireframe Académico, D-155).
   */
  overviewGrid?: { container: string; place: Partial<Record<BlockId, string>>; rest: string };
};

const NAV = {
  overview: { href: "/cliente", label: "Visão geral", icon: "home" },
  project: (label: string): NavItem => ({ href: "/cliente/projeto", label, icon: "project" }),
  files: (label: string): NavItem => ({ href: "/cliente/entregas", label, icon: "files" }),
  messages: { href: "/cliente/mensagens", label: "Mensagens", icon: "messages", badge: true },
  agenda: { href: "/cliente/agenda", label: "Agenda", icon: "agenda" },
} satisfies Record<string, NavItem | ((l: string) => NavItem)>;

export const SERVICE_LAYOUTS: Record<ServiceType, ServiceLayout> = {
  development: {
    label: "Tech",
    nav: [NAV.overview, NAV.project("Meu projeto"), NAV.files("Entregas"), NAV.messages, NAV.agenda],
    pages: {
      // A ordem atual de app/cliente/(portal)/page.tsx, bloco a bloco.
      overview: ["tech-needs-client", "tech-hero-progress", "tech-roadmap-meeting-news", "tech-demo-feedback"],
    },
  },
  academic: {
    label: "Académico",
    nav: [NAV.overview, NAV.project("Projeto"), NAV.files("Ficheiros"), NAV.messages],
    // Wireframe aprovado (G2, D-107, M6-07): no telemóvel a contagem é o primeiro elemento; no computador
    // a barra de fases vai em cima e por baixo duas colunas — contagem | próximo passo (com os capítulos),
    // ajustes, aprovações, pagamentos compactos e "Ver detalhes do trabalho".
    pages: { overview: ["aca-countdown", "phase-bar", "next-step", "aca-adjustments", "approvals", "payments-compact", "aca-brief"] },
    // No computador: barra de fases em cima; contagem e pagamentos à esquerda, próximo passo à direita;
    // ajustes, aprovações e a ficha na largura toda (grid-flow-dense preenche a coluna da esquerda).
    overviewGrid: {
      container: "grid gap-6 xl:grid-cols-2 xl:grid-flow-row-dense xl:items-start",
      place: {
        "phase-bar": "xl:order-first xl:col-span-2",
        "aca-countdown": "xl:col-start-1",
        "next-step": "xl:col-start-2 xl:row-span-2",
        "payments-compact": "xl:col-start-1",
      },
      rest: "xl:col-span-2",
    },
  },
  design: {
    label: "Design",
    nav: [NAV.overview, NAV.project("Projeto"), NAV.files("Ficheiros"), NAV.messages],
    // A prova é a protagonista (RF-20.05, M7-02); a ficha técnica fica no fim, atrás de "ver detalhes" (RF-20.12).
    // A arrumação final (prova à esquerda, decisão à direita) é a M7-07.
    // M7-05: a produção e o levantamento vêm logo a seguir às fases (depois da aprovação, o ecrã fala deles).
    pages: { overview: ["phase-bar", "des-pickup", "des-proof", "next-step", "approvals", "payments", "des-spec"] },
  },
};

export const layoutFor = (serviceType: ServiceType | null | undefined): ServiceLayout =>
  SERVICE_LAYOUTS[serviceType ?? "development"];

/** A rota faz parte do menu deste serviço? (D-096: /cliente/agenda só existe no Tech) */
export const hasRoute = (serviceType: ServiceType | null | undefined, href: string) =>
  layoutFor(serviceType).nav.some((n) => n.href === href);
