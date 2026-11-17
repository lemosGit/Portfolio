/**
 * Webhook do GitHub: quando uma issue, milestone ou label muda, invalida a cache
 * desse repositório para o portal mostrar logo o estado novo.
 *
 * Configurar em cada repositório: Settings → Webhooks → Add webhook
 *   Payload URL:  https://joao-pereira.dev/api/github/webhook
 *   Content type: application/json
 *   Secret:       o mesmo valor de GITHUB_WEBHOOK_SECRET
 *   Eventos:      Issues, Milestones, Labels
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { githubTag } from "@/lib/github/phases";

const EVENTS = new Set(["issues", "milestone", "label"]);

function validSignature(body: string, header: string | null, secret: string) {
  if (!header?.startsWith("sha256=")) return false;
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "GITHUB_WEBHOOK_SECRET não definido" }, { status: 503 });

  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-hub-signature-256"), secret)) {
    return Response.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event") ?? "";
  if (event === "ping") return Response.json({ ok: true, pong: true });
  if (!EVENTS.has(event)) return Response.json({ ok: true, ignored: event });

  let fullName: string | undefined;
  try {
    fullName = (JSON.parse(body) as { repository?: { full_name?: string } }).repository?.full_name;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!fullName) return Response.json({ error: "Sem repositório no evento" }, { status: 400 });

  const [owner, repo] = fullName.split("/");
  revalidateTag(githubTag(owner, repo));
  return Response.json({ ok: true, revalidated: fullName });
}
