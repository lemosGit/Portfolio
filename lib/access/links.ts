/**
 * Link mágico (M5-12, ADR-002, sequencias.md §1). Funções puras.
 * O token (hashed_token do Supabase) nunca é guardado: access_links tem só o SHA-256 (L3, D-069).
 */
export type LinkStatus = "ativo" | "usado" | "substituido";
export type LinkView = "ativo" | "usado" | "substituido" | "expirado";
export type LinkChannel = "copiar" | "whatsapp" | "email";

/** Validade: 24 h (RNF-301, D-023). Tem de bater com o "Email OTP Expiration" do painel (86 400 s, D-078). */
export const LINK_TTL_MS = 24 * 60 * 60 * 1000;
/** Limite por cliente e por hora (L5, D-032, RNF-309). */
export const LINKS_PER_HOUR = 5;

/** Os hashed_token do Supabase são hex; recusa lixo antes de ir à BD. */
export const looksLikeToken = (t: string | undefined): t is string => Boolean(t && /^[A-Za-z0-9_-]{20,200}$/.test(t));

export function linkView(l: { status: LinkStatus; expiresAt: string }, now = Date.now()): LinkView {
  if (l.status !== "ativo") return l.status;
  return Date.parse(l.expiresAt) <= now ? "expirado" : "ativo";
}

export const VIEW_LABEL: Record<LinkView, string> = {
  ativo: "Ativo",
  usado: "Usado",
  substituido: "Substituído",
  expirado: "Expirado",
};

export const entryUrl = (site: string, token: string) => `${site.replace(/\/$/, "")}/cliente/entrar?t=${encodeURIComponent(token)}`;

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Mensagem do WhatsApp com o link (RF-30.52). */
export const linkMessage = (o: { clientName: string; projectName: string; url: string }) =>
  `Olá ${firstName(o.clientName)}! Aqui está o seu acesso ao projeto ${o.projectName} na Área do Cliente GeniusFrela:\n${o.url}\n\nO link funciona uma vez e vale 24 horas.`;

/** wa.me sem número: o WhatsApp pede o contacto (Q-087). */
export const whatsappShare = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/** Botão do ecrã "link inválido": pedir um link novo ao João (RF-30.51, L6). */
export const askNewLink = (whatsapp: string) =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá João, o meu link de acesso à Área do Cliente já não funciona. Pode enviar-me um novo?")}`;
