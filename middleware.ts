import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, supabaseEnabled } from "@/lib/supabase/config";

const DEMO_COOKIE = "jp_portal_session";

/**
 * Protege a Área do Cliente e (com Supabase) renova a sessão a cada pedido.
 * A validação completa é feita no servidor por requirePortal().
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/cliente/sair") return NextResponse.next();

  let res = NextResponse.next({ request: req });
  let signedIn: boolean;

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
    const {
      data: { user },
    } = await sb.auth.getUser();
    signedIn = Boolean(user);
  } else {
    signedIn = Boolean(req.cookies.get(DEMO_COOKIE)?.value);
  }

  const isLogin = pathname === "/cliente/login";
  const target = !signedIn && !isLogin ? "/cliente/login" : signedIn && isLogin ? "/cliente" : null;
  if (!target) return res;

  // Redireciona sem perder os cookies de sessão renovados.
  const redirect = NextResponse.redirect(new URL(target, req.url));
  res.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export const config = { matcher: ["/cliente", "/cliente/:path*"] };
