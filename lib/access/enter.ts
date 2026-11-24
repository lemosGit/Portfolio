"use server";

/**
 * Entrar pelo link mágico (M5-12, ADR-002 §3–4, sequencias.md §1). Só o POST do botão "Entrar"
 * gasta o token (L2, D-068): a pré-visualização do WhatsApp faz GET e não o estraga.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { PROJECT_COOKIE } from "@/lib/portal/session";
import { findLink } from "./find";
import { linkView } from "./links";

export async function enterWithLink(form: FormData): Promise<void> {
  const token = String(form.get("t") ?? "");
  const invalid = `/cliente/entrar?invalido=1`;
  // Guarda dupla (ADR-002 §4): recusamos antes de chamar o Auth; o Auth recusa os antigos e usados.
  const link = await findLink(token);
  if (!link || linkView({ status: link.status, expiresAt: link.expires_at }) !== "ativo") redirect(invalid);

  const sb = await createSupabaseServer();
  const { error } = await sb.auth.verifyOtp({ token_hash: token, type: "email" });
  if (error) redirect(invalid);

  const admin = createSupabaseAdmin();
  await admin.from("access_links").update({ status: "usado", used_at: new Date().toISOString() }).eq("id", link!.id);
  // Q-087: entrar pelo link dispensa a senha obrigatória (RF-30.53).
  await admin.from("clients").update({ must_change_password: false }).eq("id", link!.client_id);
  // Leva o cliente ao projeto do link (seletor de projetos, RF-30.13).
  (await cookies()).set(PROJECT_COOKIE, link!.project_id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 180 });
  redirect("/cliente");
}
