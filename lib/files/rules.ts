/**
 * Regras do bloco Ficheiros (M5-09, ADR-003). Funções puras, testáveis sem BD nem Storage.
 * Os limites repetem os dos buckets (0007): o Storage recusa sozinho o que passar daqui,
 * mas assim o aviso chega antes do envio (RF-30.42).
 */

export type Bucket = "client-uploads" | "project-files";
export type FileRole = "entregavel" | "prova" | "referencia" | "interno";

export const ROLE_LABEL: Record<FileRole, string> = {
  entregavel: "Entregável",
  prova: "Prova",
  referencia: "Referência",
  interno: "Interno",
};

const CLIENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/** O admin pode enviar também AI/EPS, PSD, ZIP e SVG (D-054). */
const ADMIN_TYPES: Record<string, string> = {
  ...CLIENT_TYPES,
  "image/svg+xml": "svg",
  "application/postscript": "ai",
  "image/vnd.adobe.photoshop": "psd",
  "application/zip": "zip",
};

export const LIMITS: Record<Bucket, { maxBytes: number; types: Record<string, string> }> = {
  "client-uploads": { maxBytes: 10 * 1024 * 1024, types: CLIENT_TYPES },
  "project-files": { maxBytes: 50 * 1024 * 1024, types: ADMIN_TYPES },
};

/** Máximo de ficheiros que o cliente envia por fase (RN-09). */
export const CLIENT_FILES_PER_PHASE = 10;
/** Máximo de ficheiros numa só versão (ex.: PDF + Word da entrega final). */
export const FILES_PER_VERSION = 5;

/** A fase aceita envios do cliente enquanto está a decorrer (D-132): em curso, a aguardar o cliente ou atrasada. */
export const uploadOpen = (status: string | undefined) =>
  status === "em_curso" || status === "aguarda_cliente" || status === "atrasada";

/** Fases onde o cliente carrega referências (RF-30.41): client_can_upload no modelo e fase aberta. */
export const clientMayUpload = (phase: { clientCanUpload?: boolean; state?: string } | undefined) =>
  Boolean(phase?.clientCanUpload) && uploadOpen(phase?.state);

/** Os browsers nem sempre dão o tipo (HEIC, DOC, AI…): deduz pela extensão. */
const BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(ADMIN_TYPES).map(([mime, ext]) => [ext, mime]),
);
BY_EXT.jpeg = "image/jpeg";
BY_EXT.eps = "application/postscript";

export function resolveMime(name: string, type: string): string {
  if (type && ADMIN_TYPES[type]) return type;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return BY_EXT[ext] ?? type ?? "";
}

export type FileMeta = { name: string; type: string; size: number; /** Tamanho da pré-visualização WebP gerada no browser (#122). */ preview?: number };

/** Valida nome, tipo e tamanho declarados (o passo 3 confirma com os bytes reais). */
export function checkFile(bucket: Bucket, f: FileMeta): { mime: string; ext: string } | { error: string } {
  const name = f.name.trim();
  if (!name || name.length > 200) return { error: "O nome do ficheiro tem de ter entre 1 e 200 caracteres." };
  const mime = resolveMime(name, f.type);
  const ext = LIMITS[bucket].types[mime];
  if (!ext) {
    return {
      error:
        bucket === "client-uploads"
          ? `“${name}”: só pode enviar JPG, PNG, WebP, HEIC, PDF, DOC ou DOCX.`
          : `“${name}”: tipo de ficheiro não aceite.`,
    };
  }
  if (!(f.size > 0)) return { error: `“${name}” está vazio.` };
  if (f.size > LIMITS[bucket].maxBytes) {
    return { error: `“${name}” passa dos ${LIMITS[bucket].maxBytes / 1024 / 1024} MB.` };
  }
  return { mime, ext };
}

/* ───────────── Assinatura dos bytes (D-084) ───────────── */

const startsWith = (b: Uint8Array, sig: number[], at = 0) => sig.every((x, i) => b[at + i] === x);
const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.slice(from, to));
const contains = (b: Uint8Array, text: string) => {
  const s = new TextDecoder("latin1").decode(b);
  return s.includes(text);
};

/**
 * Os primeiros bytes batem com o tipo? Não confia na extensão nem no Content-Type.
 * `head` deve ter pelo menos os primeiros 4 KB (o DOCX procura "[Content_Types].xml" no início do ZIP).
 */
export function signatureMatches(mime: string, head: Uint8Array): boolean {
  switch (mime) {
    case "application/pdf":
      return startsWith(head, [0x25, 0x50, 0x44, 0x46]); // %PDF
    case "image/jpeg":
      return startsWith(head, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      return ascii(head, 0, 4) === "RIFF" && ascii(head, 8, 12) === "WEBP";
    case "image/heic":
    case "image/heif":
      return ascii(head, 4, 8) === "ftyp" && ["heic", "heix", "hevc", "heim", "heis", "mif1", "msf1"].includes(ascii(head, 8, 12));
    case "application/msword":
      return startsWith(head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return startsWith(head, [0x50, 0x4b, 0x03, 0x04]) && contains(head, "[Content_Types].xml");
    case "application/zip":
      return startsWith(head, [0x50, 0x4b, 0x03, 0x04]) || startsWith(head, [0x50, 0x4b, 0x05, 0x06]);
    case "image/vnd.adobe.photoshop":
      return ascii(head, 0, 4) === "8BPS";
    case "application/postscript":
      // AI moderno é um PDF; EPS começa por "%!PS" ou pelo cabeçalho binário C5 D0 D3 C6.
      return ascii(head, 0, 4) === "%PDF" || ascii(head, 0, 4) === "%!PS" || startsWith(head, [0xc5, 0xd0, 0xd3, 0xc6]);
    case "image/svg+xml": {
      const s = new TextDecoder().decode(head).trimStart().toLowerCase();
      return s.startsWith("<svg") || (s.startsWith("<?xml") && s.includes("<svg"));
    }
    default:
      return false;
  }
}

/* ───────────── Séries e versões (Q-084) ───────────── */

/** "Convite de casamento" → "convite-de-casamento" (series_key, 1–40). */
export function seriesKey(title: string): string {
  const k = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return k || "ficheiro";
}

export const versionLabel = (n: number) => `V${n}`;

/** Próximo número de versão de uma série (as anteriores nunca se apagam, RF-30.43). */
export const nextVersion = (existing: number[]) => (existing.length ? Math.max(...existing) + 1 : 1);

/** Caminho no bucket: {project_id}/{deliverable_id}/{file_id}.{ext} (ADR-003 §1). */
export const storagePath = (projectId: string, deliverableId: string, fileId: string, ext: string) =>
  `${projectId}/${deliverableId}/${fileId}.${ext}`;

/** Bloqueado enquanto o pagamento que o trava não estiver pago (RF-30.44, D-013). */
export const isLocked = (lockedByPaymentId: string | null, paymentStatus: string | null | undefined) =>
  Boolean(lockedByPaymentId) && paymentStatus !== "pago";

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/* ───────────── Miniaturas WebP (D-082) ───────────── */

/** Limites da pré-visualização: 1600 px no lado maior e 150 KB. */
export const PREVIEW = { maxSide: 1600, maxBytes: 150 * 1024 } as const;

/** Imagens que ganham pré-visualização (HEIC não: o browser quase nunca a lê). */
export const hasPreview = (mime: string) => mime === "image/jpeg" || mime === "image/png" || mime === "image/webp";

/** Caminho da pré-visualização ao lado do original (ADR-003 §3). */
export const previewPath = (path: string) => path.replace(/\.[a-z0-9]+$/, ".preview.webp");

/** Largura e altura de um WebP pelos primeiros bytes (VP8, VP8L ou VP8X); undefined se não for WebP. */
export function webpSize(b: Uint8Array): { width: number; height: number } | undefined {
  if (b.length < 30 || ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 12) !== "WEBP") return undefined;
  const chunk = ascii(b, 12, 16);
  if (chunk === "VP8X") {
    const w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    const h = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
    return { width: w, height: h };
  }
  if (chunk === "VP8 ") {
    // frame tag (3) + start code 9D 01 2A, depois 14 bits de largura e de altura
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return undefined;
    return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
  }
  if (chunk === "VP8L") {
    if (b[20] !== 0x2f) return undefined;
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  return undefined;
}

/** A pré-visualização enviada pelo browser é aceitável? (o servidor valida sempre, ADR-003 §3) */
export function previewOk(head: Uint8Array, size: number): boolean {
  const dim = webpSize(head);
  return Boolean(dim) && size > 0 && size <= PREVIEW.maxBytes && Math.max(dim!.width, dim!.height) <= PREVIEW.maxSide;
}
