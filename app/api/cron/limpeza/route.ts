import { NextResponse, type NextRequest } from "next/server";
import { runCleanup } from "@/lib/files/cleanup";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseEnabled } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Limpeza diária dos ficheiros (#122, D-085), chamada pelo Cron da Vercel (vercel.json).
 * Protegida como o keepalive: a Vercel envia "Authorization: Bearer <CRON_SECRET>" (T13).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 401 });
  }
  if (!supabaseEnabled) {
    return NextResponse.json({ ok: false, error: "Supabase não configurado" }, { status: 503 });
  }
  try {
    const report = await runCleanup(createSupabaseAdmin());
    if (report.errors.length) console.error("[limpeza]", report.errors);
    return NextResponse.json({ ok: report.errors.length === 0, ...report });
  } catch (e) {
    console.error("[limpeza] falhou:", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "erro" }, { status: 500 });
  }
}
