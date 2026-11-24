import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, supabaseEnabled } from "@/lib/supabase/config";
import { isAdminUser } from "@/lib/admin/role";
import { getSessionClaims } from "@/lib/supabase/claims";

const DEMO_COOKIE = "jp_portal_session";

/**
 * Protege a Área do Cliente e o painel /admin e (com Supabase) renova a sessão a cada pedido.
 * Encaminha cada conta para a sua área: administrador → /admin, cliente → /cliente.
 * A validação completa é feita no servidor por requirePortal() e requireAdmin().
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // /cliente/entrar é a porta do link mágico: tem de abrir sem sessão (M5-12).
  if (pathname === "/cliente/sair" || pathname === "/cliente/entrar") return NextResponse.next();

  let res = NextResponse.next({ request: req });
  let signedIn: boolean;
  let admin = false;

  if (supabaseEnabled) {
    const sb = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    // Renova o token se expirou e verifica a assinatura localmente (sem ida ao servidor de auth).
    const claims = await getSessionClaims(sb);
    signedIn = Boolean(claims);
    admin = isAdminUser(claims);
  } else {
    signedIn = Boolean(req.cookies.get(DEMO_COOKIE)?.value);
  }

  const isLogin = pathname === "/cliente/login";
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const home = admin ? "/admin" : "/cliente";
  let target: string | null = null;
  if (!signedIn) target = isLogin ? null : "/cliente/login";
  else if (isLogin) target = home;
  else if (isAdminArea !== admin) target = home;
  if (!target) return res;

  // Redireciona sem perder os cookies de sessão renovados.
  const redirect = NextResponse.redirect(new URL(target, req.url));
  res.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export const config = { matcher: ["/cliente", "/cliente/:path*", "/admin", "/admin/:path*"] };
