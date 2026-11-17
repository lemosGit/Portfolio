import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SESSION_COOKIE } from "@/lib/portal/session";

/** Termina a sessão (também usado quando a sessão já não é válida). */
export async function GET(req: NextRequest) {
  if (supabaseEnabled) {
    const sb = await createSupabaseServer();
    await sb.auth.signOut();
  }
  const motivo = req.nextUrl.searchParams.get("motivo");
  const url = new URL("/cliente/login", req.url);
  if (motivo) url.searchParams.set("motivo", motivo);
  const res = NextResponse.redirect(url);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
