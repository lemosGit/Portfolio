/**
 * Ficha técnica da peça de Design (M7-01, RF-20.10…12). Tipos, rótulos e leitura do formulário (puras).
 * Tabela design_specs (0014). As colunas da produção e do levantamento entram no ecrã na M7-05.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { longDate } from "@/lib/portal/format";

export const PIECE_TYPES = {
  logotipo_identidade: "Logótipo e identidade",
  convite_digital: "Convite digital",
  convite_impresso: "Convite impresso",
  lona: "Lona",
  camisola: "Camisola",
  outro: "Outra peça",
} as const;
export type PieceType = keyof typeof PIECE_TYPES;

/** Sugestão do formulário por tipo de peça (Q-102): impressão e ficheiros digitais. O admin pode mudar. */
export const PIECE_DEFAULTS: Record<PieceType, { print: boolean; digital: boolean }> = {
  logotipo_identidade: { print: false, digital: true },
  convite_digital: { print: false, digital: true },
  convite_impresso: { print: true, digital: false },
  lona: { print: true, digital: false },
  camisola: { print: true, digital: false },
  outro: { print: true, digital: false },
};

export const MAX_KEY_TEXTS = 20; // D-057

export type KeyText = { label: string; value: string };

export type DesignSpec = {
  pieceType: PieceType;
  pieceLabel: string | null;
  widthCm: number | null;
  heightCm: number | null;
  sizeNotes: string | null;
  material: string | null;
  quantity: number;
  finish: string | null;
  hasPrint: boolean;
  hasDigitalFiles: boolean;
  eventDate: string | null;
  keyTexts: KeyText[];
  /** Produção e entrega (M7-05): estado (só com impressão), data/hora e local de levantamento, entregue. */
  productionStatus?: ProductionStatus | null;
  pickupAt?: string | null;
  pickupPlace?: string | null;
  deliveredAt?: string | null;
};

export type ProductionStatus = "a_imprimir" | "pronto";
export const PRODUCTION_LABEL: Record<ProductionStatus, string> = { a_imprimir: "A imprimir", pronto: "Pronto" };

export type SpecRow = {
  piece_type: PieceType;
  piece_label: string | null;
  width_cm: number | string | null;
  height_cm: number | string | null;
  size_notes: string | null;
  material: string | null;
  quantity: number;
  finish: string | null;
  has_print: boolean;
  has_digital_files: boolean;
  event_date: string | null;
  key_texts: KeyText[];
  production_status?: ProductionStatus | null;
  pickup_at?: string | null;
  pickup_place?: string | null;
  delivered_at?: string | null;
};

export const SPEC_COLS =
  "piece_type, piece_label, width_cm, height_cm, size_notes, material, quantity, finish, has_print, has_digital_files, event_date, key_texts, production_status, pickup_at, pickup_place, delivered_at";

const num = (v: number | string | null) => (v === null || v === undefined ? null : Number(v));

export const mapSpec = (r: SpecRow): DesignSpec => ({
  pieceType: r.piece_type,
  pieceLabel: r.piece_label,
  widthCm: num(r.width_cm),
  heightCm: num(r.height_cm),
  sizeNotes: r.size_notes,
  material: r.material,
  quantity: r.quantity,
  finish: r.finish,
  hasPrint: r.has_print,
  hasDigitalFiles: r.has_digital_files,
  eventDate: r.event_date,
  keyTexts: Array.isArray(r.key_texts) ? r.key_texts : [],
  productionStatus: r.production_status ?? null,
  pickupAt: r.pickup_at ?? null,
  pickupPlace: r.pickup_place ?? null,
  deliveredAt: r.delivered_at ?? null,
});

/** "Noivos: Ana & Paulo" por linha → lista ordenada (Q-102). Sem ":", a linha inteira é o texto. */
export function parseKeyTexts(raw: string): KeyText[] | { error: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > MAX_KEY_TEXTS) return { error: `No máximo ${MAX_KEY_TEXTS} textos (um por linha).` };
  const out: KeyText[] = [];
  for (const l of lines) {
    const i = l.indexOf(":");
    const label = i > 0 ? l.slice(0, i).trim() : "";
    const value = i > 0 ? l.slice(i + 1).trim() : l;
    if (!value) return { error: `Falta o texto depois de "${label}:".` };
    if (label.length > 60 || value.length > 500) return { error: "Cada rótulo tem até 60 caracteres e cada texto até 500." };
    out.push({ label, value });
  }
  return out;
}

export const keyTextsToLines = (list: KeyText[]) => list.map((k) => (k.label ? `${k.label}: ${k.value}` : k.value)).join("\n");

/** Medida em cm, com vírgula ou ponto; vazio = null. */
function cm(raw: string): number | null | { error: string } {
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0 || n >= 100000) return { error: "As medidas são em cm, maiores do que 0." };
  return Math.round(n * 100) / 100;
}

const has = <T extends object>(o: T, k: string): k is Extract<keyof T, string> => Object.prototype.hasOwnProperty.call(o, k);

/** Formulário do admin → linha de design_specs (sem project_id), ou erro em português. */
export function readSpec(get: (k: string) => string): SpecRow | { error: string } {
  const type = get("tipo");
  if (!has(PIECE_TYPES, type)) return { error: "Escolha o tipo de peça." };
  const label = get("descricao");
  if (label.length > 120) return { error: "A descrição curta tem no máximo 120 caracteres." };
  const w = cm(get("largura"));
  const h = cm(get("altura"));
  if (w && typeof w === "object") return w;
  if (h && typeof h === "object") return h;
  const sizeNotes = get("tamanhos");
  if (sizeNotes.length > 300) return { error: "As notas das medidas têm no máximo 300 caracteres." };
  const material = get("material");
  const finish = get("acabamento");
  if (material.length > 120 || finish.length > 120) return { error: "Material e acabamento têm no máximo 120 caracteres." };
  const qty = Number(get("quantidade") || "1");
  if (!Number.isInteger(qty) || qty < 1 || qty > 1_000_000) return { error: "A quantidade é um número inteiro, de 1 para cima." };
  const event = get("evento");
  if (event && !/^\d{4}-\d{2}-\d{2}$/.test(event)) return { error: "Data do evento inválida." };
  const texts = parseKeyTexts(get("textos"));
  if ("error" in texts) return texts;
  return {
    piece_type: type,
    piece_label: label || null,
    width_cm: w as number | null,
    height_cm: h as number | null,
    size_notes: sizeNotes || null,
    material: material || null,
    quantity: qty,
    finish: finish || null,
    has_print: get("impressao") === "1",
    has_digital_files: get("digitais") === "1",
    event_date: event || null,
    key_texts: texts,
  };
}

const fmt = (n: number) => n.toLocaleString("pt-PT", { maximumFractionDigits: 2 });

/** "14,8 × 21 cm" (ou só uma medida). */
export function sizeLabel(s: Pick<DesignSpec, "widthCm" | "heightCm">): string | null {
  if (s.widthCm && s.heightCm) return `${fmt(s.widthCm)} × ${fmt(s.heightCm)} cm`;
  if (s.widthCm) return `${fmt(s.widthCm)} cm de largura`;
  if (s.heightCm) return `${fmt(s.heightCm)} cm de altura`;
  return null;
}

/** Topo da Visão geral (RF-20.02): "Convite impresso · evento a 12 de dezembro de 2026". */
export function specHeadline(s: Pick<DesignSpec, "pieceType" | "eventDate">): string {
  const piece = PIECE_TYPES[s.pieceType];
  return s.eventDate ? `${piece} · evento a ${longDate(s.eventDate)}` : piece;
}

/** Dia (AAAA-MM-DD) em Luanda de um instante. */
const luandaDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Africa/Luanda" });

/**
 * Folga entre o levantamento e o evento, em dias (RF-20.74, wireframe "tem 9 dias de folga").
 * null sem evento ou sem levantamento; negativo se o levantamento for depois do evento.
 */
export function eventSlack(eventDate: string | null | undefined, pickupAt: string | null | undefined): number | null {
  if (!eventDate || !pickupAt) return null;
  return Math.round((Date.parse(`${eventDate}T00:00:00Z`) - Date.parse(`${luandaDay(pickupAt)}T00:00:00Z`)) / 86_400_000);
}

/** Alerta ao admin (RF-20.74): levantamento a menos de 3 dias do evento, ou depois dele. */
export const slackAlert = (slack: number | null) =>
  slack === null ? null : slack < 0 ? "O levantamento fica depois do evento." : slack < 3 ? `O levantamento fica a ${slack} dia${slack === 1 ? "" : "s"} do evento.` : null;

/** "datetime-local" (Luanda) → ISO com +01:00. Vazio = null. */
export function readPickupAt(raw: string): string | null | { error: string } {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return { error: "Data e hora de levantamento inválidas." };
  return `${raw}:00+01:00`;
}

/** ISO → valor de um campo "datetime-local" em hora de Luanda. */
export const pickupInput = (iso: string | null | undefined) =>
  iso ? new Date(new Date(iso).getTime() + 3_600_000).toISOString().slice(0, 16) : "";

/** Link do mapa para o local de levantamento (abre a app de mapas no telemóvel). */
export const mapsUrl = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** Ficha de um projeto (null se ainda não existe). Tolera a tabela em falta (migração por aplicar). */
export async function loadSpec(sb: SupabaseClient, projectId: string): Promise<DesignSpec | null> {
  const { data, error } = await sb.from("design_specs").select(SPEC_COLS).eq("project_id", projectId).maybeSingle<SpecRow>();
  if (error) {
    console.error(`[ficha técnica] Falha a ler o projeto ${projectId}:`, error.message);
    return null;
  }
  return data ? mapSpec(data) : null;
}
