/**
 * Bilhete de upload (ADR-003 §2, D-131): o passo 1 decide os caminhos no Storage e assina-os;
 * o passo 3 só regista o que vier com uma assinatura válida, do mesmo utilizador e dentro do prazo.
 * Assim o browser não consegue trocar o projeto, a fase, o papel nem os caminhos.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Bucket, FileRole } from "./rules";

if (typeof window !== "undefined") throw new Error("lib/files/ticket.ts só pode correr no servidor.");

export type TicketFile = { id: string; path: string; name: string; mime: string; size: number; previewPath?: string };

export type Ticket = {
  uid: string;
  by: "admin" | "client";
  projectId: string;
  phaseId: string | null;
  role: FileRole;
  bucket: Bucket;
  deliverableId: string;
  seriesKey: string;
  title: string | null;
  notes: string | null;
  files: TicketFile[];
  /** Expira (ms desde 1970). Os URLs de upload assinados duram 2 h; o bilhete, 1 h. */
  exp: number;
};

const TTL = 60 * 60 * 1000;

function key() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("Falta SUPABASE_SECRET_KEY: sem ela não há uploads.");
  // Chave derivada só para os bilhetes (não se usa a chave secreta tal e qual).
  return createHmac("sha256", secret).update("geniusfrela:upload-ticket:v1").digest();
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");

export function signTicket(t: Omit<Ticket, "exp">, now = Date.now()): string {
  const body = b64(JSON.stringify({ ...t, exp: now + TTL }));
  const mac = createHmac("sha256", key()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function readTicket(token: string, uid: string, now = Date.now()): Ticket | { error: string } {
  const [body, mac] = token.split(".");
  if (!body || !mac) return { error: "Pedido de upload inválido." };
  const expected = Buffer.from(createHmac("sha256", key()).update(body).digest("base64url"));
  const got = Buffer.from(mac);
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return { error: "Pedido de upload inválido." };
  let t: Ticket;
  try {
    t = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Ticket;
  } catch {
    return { error: "Pedido de upload inválido." };
  }
  if (t.uid !== uid) return { error: "Este upload foi pedido noutra sessão." };
  if (t.exp < now) return { error: "O pedido de upload expirou. Envie os ficheiros outra vez." };
  return t;
}
