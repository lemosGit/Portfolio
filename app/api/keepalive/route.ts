import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, supabaseEnabled } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * Chamado uma vez por dia pelo Cron da Vercel (vercel.json). Faz uma consulta leve
 * ao Supabase para o projeto gratuito não ser pausado por inatividade.
 * A Vercel envia "Authorization: Bearer <CRON_SECRET>" quando CRON_SECRET existe.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
  }
  if (!supabaseEnabled) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado" }, { status: 503 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/keepalive`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, status: res.status }, { status: 502 });
  }
  return NextResponse.json({ ok: true, at: await res.json() });
}
