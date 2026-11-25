/**
 * Todo o conteúdo do portfólio vive aqui.
 * Edita este ficheiro para atualizar textos, projetos e ligações.
 */

export const profile = {
  name: "João Lemos Pereira",
  role: "Systems Engineer",
  email: "lemos.trabalho.7@gmail.com", // ← substitui pelo teu email profissional
  location: "Luanda, Angola",
  coords: "8°50′S · 13°14′E",
  linkedin: "https://www.linkedin.com/in/jo%C3%A3o-lemos-pereira-3013932a0/?isSelfProfile=true", // ← o teu perfil
  github: "https://github.com/lemosGit/", // ← o teu perfil
  photo: "/perfil.png", // ← fotografia de apresentação em public/perfil.png
  whatsapp: "244957392400", // ← indicativo + número, só dígitos (Angola +244)
};

/** Mensagem que já aparece escrita quando o visitante abre o WhatsApp. */
export const projectRequestMessage =
  "Olá, João! Vim pelo teu portfólio e gostava de pedir um projeto. Podemos conversar para acertar os detalhes?";

/** Link wa.me que abre a conversa com a mensagem preenchida (app no telemóvel, WhatsApp Web no computador). */
export const whatsappLink = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(projectRequestMessage)}`;

/** Link wa.me com outra mensagem já escrita (ex.: a página de um serviço). */
export const whatsappWith = (message: string) =>
  `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(message)}`;

export const academicRequestMessage =
  "Olá! Vim pelo site da GeniusFrela e gostava de pedir um trabalho académico. Podemos conversar sobre o tema, as normas e o prazo?";

export const designRequestMessage =
  "Olá! Vim pelo site da GeniusFrela e gostava de pedir um trabalho de design. Podemos conversar sobre a peça, a quantidade e a data do evento?";

/** Mensagem do WhatsApp por serviço (páginas dos serviços e estado vazio do Portfólio). */
export const requestMessageFor = (service: ServiceId | "all") =>
  service === "academic" ? academicRequestMessage : service === "design" ? designRequestMessage : projectRequestMessage;

export const navLinks = [
  { id: "sobre", label: "Sobre" },
  { id: "servicos", label: "Serviços" },
  { id: "competencias", label: "Competências" },
  { id: "projetos", label: "Projetos" },
  { id: "percurso", label: "Percurso" },
];

export const skillGroups = [
  {
    index: "01",
    title: "Engenharia de Sistemas",
    icon: "server",
    items: [
      "Arquitetura limpa e em camadas",
      "Linux & Redes",
      "Bases de dados (PostgreSQL)",
      "IoT e sistemas embebidos (ESP32)",
    ],
  },
  {
    index: "02",
    title: "FrontEnd & Back-end",
    icon: "braces",
    items: [
      "FRONT-END", 
      "TypeScript / JavaScript",
      "React, Next.js & junior React Native",

      "BACK-END",
      "Python,",
      "FastAPI & APIs REST",
      "C, C++ -> Algoritmos"
    ],
  },
  {
    index: "03",
    title: "Junior em Operações & Qualidade",
    icon: "gauge",
    items: [
      "Docker & CI/CD",
      "Testes automatizados",
      "Git workflows",
      "Performance & caching",
    ],
  },
] as const;

export const techTicker = [
  "TypeScript",
  "Next.js",
  "React Native",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "Docker",
  "Linux",
  "C / C++",
  "Supabase",
  "ESP32",
  "WebSocket",
  "Alembic",
  "Git",
];

/** Os 3 serviços da GeniusFrela (GeniusFrela_Projeto_e_Layouts §1 e §3; cores do DS V1, ADR-004). */
export type ServiceId = "development" | "academic" | "design";

export type Service = {
  id: ServiceId;
  name: string;
  short: string;
  examples: string[];
  /** Cor do serviço (classe Tailwind `svc-*`). */
  tone: "dev" | "aca" | "design";
  /** Página do serviço; sem ela o cartão fica "Em breve". */
  href?: string;
};

export const services: Service[] = [
  {
    id: "development",
    name: "Desenvolvimento de Soluções Digitais",
    short: "Desenvolvimento",
    examples: ["Sites e sistemas web", "Apps mobile e desktop", "Integrações"],
    tone: "dev",
    href: "#projetos",
  },
  {
    id: "academic",
    name: "Académico",
    short: "Académico",
    examples: ["Trabalhos escolares e universitários", "Formatação nas normas", "Revisão do texto"],
    tone: "aca",
    href: "/servicos/academico",
  },
  {
    id: "design",
    name: "Design",
    short: "Design",
    examples: ["Logótipos", "Convites e lonas de festa", "Camisolas personalizadas"],
    tone: "design",
    href: "/servicos/design",
  },
];

export type Project = {
  id: string;
  service: ServiceId;
  title: string;
  kind: string;
  problem: string;
  architecture: string[];
  stack: string[];
  results: string[];
  screenshot?: string; // ex.: "/projects/priceguard.png"
  link?: string;
};

export const projects: Project[] = [
  {
    id: "priceguard",
    service: "development",
    title: "Kero PriceGuard",
    kind: "Case study · Retalho",
    problem:
      "Detetar automaticamente que preços mudaram num ficheiro exportado do SAP com mais de 25.000 produtos — e gerar tarefas para corrigir as etiquetas físicas nas prateleiras.",
    architecture: ["Excel SAP", "Parser", "Diff Engine", "PostgreSQL", "FastAPI", "App móvel"],
    stack: ["Python", "FastAPI", "PostgreSQL", "React Native", "Alembic"],
    results: [
      "147 testes automatizados (backend e camada de dados mobile)",
      "Cache invalidada a cada carga: de 312 para 997 pedidos/s num teste de carga",
      "Histórico permanente de preços e auditoria de quem resolve cada tarefa",
    ],
    screenshot: "/projects/priceguard.png",
  },
   {
    id: "candongueiro-pay",
    service: "development",
    title: "Front-End -> Candongueiro Pay",
    kind: "Case study · Fintech",
    problem:
      "Dar a gestores de táxis em Angola uma forma simples de acompanhar viaturas, gestores e pagamentos num único painel.",
    architecture: ["Next.js App Router", "AuthContext", "Supabase Auth", "Supabase DB"],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    results: [
      "Autenticação real com login, registo e contexto de sessão",
      "Painel com gestores, transações e viaturas",
    ],
    screenshot: "/projects/candongueiro-pay.png",
  },

  {
    id: "minishell",
    service: "development",
    title: "Minishell Project",
    kind: "Case study · Sistemas Operativos & C",
    problem:
      "Criar um interpretador de comandos (shell) funcional a partir do zero em C, replicando o comportamento essencial do Bash e compreendendo a gestão interna de processos e sinais em sistemas Unix.",
    architecture: ["Lexer & Tokenizer", "Parser", "Executor", "Built-ins", "Unix Process Manager"],
    stack: ["C", "Unix System Calls", "GNU Readline", "Makefile", "Valgrind"],
    results: [
      "Arquitetura modular dividida entre Parsing/Expansões e Execução de processos encadeados por Pipes",
      "Gestão rigorosa de memória e descritores de ficheiros que previne Segfaults e Memory Leaks",
    ],
    screenshot: "/projects/minishell.png",
  },
   {
    id: "girassol",
    service: "development",
    title: "Monitorização Condomínio Girassol",
    kind: "Case study · IoT",
    problem:
      "Monitorizar sensores residenciais em tempo real, com um fluxo fiável desde o microcontrolador até ao painel web, mesmo com falhas de rede.",
    architecture: ["ESP32 + sensores", "API batch", "FastAPI", "PostgreSQL", "WebSocket", "Dashboard Next.js"],
    stack: ["ESP32 / FreeRTOS", "FastAPI", "Next.js", "WebSocket"],
    results: [
      "Firmware multi-sensor com reconexão WiFi e envio em lote",
      "Atualizações em tempo real com reconexão exponencial e fallback por polling",
      "Validado com inquérito a 33 moradores e documentado numa monografia de 41 páginas",
    ],
    screenshot: "/projects/girassol.png",
  },


];

export const journey = [
  {
    label: "Formação superior",
    title: "Universidade Óscar Ribas",
    detail: "Engenharia Informática e Comunicação · Luanda",
  },
  {
    label: "Estagio Profissional",
    title: "Hallow Tecnology -> FrontEnd React",
    detail: "Engenharia de Software · Odoo-python developer",
  },
  {
    label: "Formação intensiva",
    title: "42 Luanda",
    detail: "Engenharia de Software · Peer-to-peer learning",
  },
  {
    label: "Experiência",
    title: "Kero · Técnico de TI",
    detail: "Supervisor operacional e, hoje, tecnologia — com visão das lojas e dos serviços centrais",
  },
  {
    label: "Hoje",
    title: "Aprendizagem contínua",
    detail: "Sistemas, cloud e tecnologias Emergentes",
  },
];
