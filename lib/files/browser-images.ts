/**
 * Imagens no browser (#122, ADR-003 §3, D-082). Só corre no cliente (canvas).
 * - Pré-visualização WebP: 1600 px no lado maior, até 150 KB. O original do admin nunca é mexido.
 * - Fotos do cliente acima de 2 MB: reduzidas a 2560 px (JPEG 0,85) antes de enviar, para poupar dados móveis.
 * Se o browser não conseguir ler a imagem (ex.: HEIC no Chrome Android), devolve undefined e segue sem ela.
 */
import { PREVIEW, hasPreview } from "./rules";

const REDUCE_OVER = 2 * 1024 * 1024;
const REDUCE_TO = 2560;

async function draw(file: Blob, maxSide: number): Promise<HTMLCanvasElement | undefined> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return undefined;
  }
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return canvas;
}

const toBlob = (c: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob | null>((res) => c.toBlob(res, type, q));

/** Pré-visualização WebP ≤ 150 KB, ou undefined (tipo sem pré-visualização ou browser sem suporte). */
export async function makePreview(file: File, mime: string): Promise<Blob | undefined> {
  if (!hasPreview(mime)) return undefined;
  let side: number = PREVIEW.maxSide;
  for (let attempt = 0; attempt < 4; attempt++) {
    const canvas = await draw(file, side);
    if (!canvas) return undefined;
    for (const q of [0.8, 0.65, 0.5, 0.35]) {
      const blob = await toBlob(canvas, "image/webp", q);
      if (!blob || blob.type !== "image/webp") return undefined; // Safari antigo não gera WebP
      if (blob.size <= PREVIEW.maxBytes) return blob;
    }
    side = Math.round(side * 0.75);
  }
  return undefined;
}

/** Foto do cliente > 2 MB → JPEG com 2560 px no lado maior. Outros ficheiros ficam iguais. */
export async function reduceClientPhoto(file: File, mime: string): Promise<File> {
  if (file.size <= REDUCE_OVER || (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/webp")) return file;
  const canvas = await draw(file, REDUCE_TO);
  if (!canvas) return file;
  const blob = await toBlob(canvas, "image/jpeg", 0.85);
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.(png|webp)$/i, ".jpg"), { type: "image/jpeg" });
}
