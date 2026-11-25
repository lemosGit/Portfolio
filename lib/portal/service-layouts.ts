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
  | "aca-brief";

export type NavIcon = "home" | "project" | "files" | "messages" | "agenda";
export type NavItem = { href: string; label: string; icon: NavIcon; badge?: boolean };

export type ServiceLayout = {
  /** Nome curto do serviço, na etiqueta do cabeçalho (DS V1: "TECH", "ACADÉMICO", "DESIGN"). */
  label: string;
  nav: NavItem[];
  pages: { overview: BlockId[] };
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
    // A contagem do prazo (M6-02) e os capítulos (M6-03) entram a seguir; a ficha fica no fim, em "ver detalhes".
    pages: { overview: ["phase-bar", "next-step", "approvals", "payments", "aca-brief"] },
  },
  design: {
    label: "Design",
    nav: [NAV.overview, NAV.project("Projeto"), NAV.files("Ficheiros"), NAV.messages],
    // A última prova e as rondas entram com a M7.
    pages: { overview: ["phase-bar", "next-step", "approvals", "payments"] },
  },
};

export const layoutFor = (serviceType: ServiceType | null | undefined): ServiceLayout =>
  SERVICE_LAYOUTS[serviceType ?? "development"];

/** A rota faz parte do menu deste serviço? (D-096: /cliente/agenda só existe no Tech) */
export const hasRoute = (serviceType: ServiceType | null | undefined, href: string) =>
  layoutFor(serviceType).nav.some((n) => n.href === href);
