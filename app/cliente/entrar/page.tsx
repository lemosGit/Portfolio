/**
 * Porta do link mágico (M5-12, RF-30.51, RF-30.53). GET só mostra; o botão "Entrar" faz o POST
 * que gasta o token (L2). Link inexistente, usado, substituído ou expirado → "já não é válido".
 */
import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BrandLockup } from "@/components/BrandMark";
import { enterWithLink } from "@/lib/access/enter";
import { findLink } from "@/lib/access/find";
import { askNewLink, linkView, looksLikeToken } from "@/lib/access/links";
import { profile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Entrar · Área do cliente · GeniusFrela",
  robots: { index: false, follow: false },
  // O token vai no URL: não o passar a outros sites pelo Referer.
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default async function EnterPage({ searchParams }: { searchParams: Promise<{ t?: string; invalido?: string }> }) {
  const { t, invalido } = await searchParams;
  const link = invalido || !looksLikeToken(t) ? undefined : await findLink(t);
  const valid = link && linkView({ status: link.status, expiresAt: link.expires_at }) === "ativo";
  const firstName = link?.clients?.name.trim().split(/\s+/)[0];

  return (
    <main id="conteudo" className="app relative grid min-h-dvh place-items-center px-6 py-10" data-service="brand">
      <div aria-hidden className="app-ambient">
        <i />
        <i />
      </div>
      <div className="relative z-[1] w-full max-w-[400px]">
        <Link href="/" aria-label="GeniusFrela — página inicial" className="inline-block rounded-xl">
          <BrandLockup />
        </Link>

        {valid ? (
          <section aria-labelledby="entrar-title" className="panel mt-10 p-7">
            <p className="kicker">Área do cliente</p>
            <h1 id="entrar-title" className="mt-4 font-display text-[30px] leading-tight text-ink">
              Olá, {firstName}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">
              Vai entrar no projeto <b className="font-semibold text-ink">{link.projects?.name}</b>. Não precisa de senha.
            </p>
            <form action={enterWithLink} className="mt-7">
              <input type="hidden" name="t" value={t} />
              <button type="submit" className="btn-violet h-12 w-full">
                Entrar no meu projeto
              </button>
            </form>
            <p className="mt-4 text-xs text-ink-faint">Este link funciona uma vez. Depois fica com a sessão aberta neste aparelho.</p>
          </section>
        ) : (
          <section aria-labelledby="invalido-title" className="panel mt-10 p-7">
            <p className="kicker">Link de acesso</p>
            <h1 id="invalido-title" className="mt-4 font-display text-[26px] leading-tight text-ink">
              Este link já não é válido
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">
              Os links de acesso funcionam uma vez e valem 24 horas. Peça um novo ao João e entra logo a seguir.
            </p>
            <a href={askNewLink(profile.whatsapp)} target="_blank" rel="noreferrer" className="btn-violet mt-7 h-12 w-full">
              <MessageCircle size={17} aria-hidden /> Pedir um link novo no WhatsApp
            </a>
            <Link href="/cliente/login" className="mt-4 block text-center text-[13px] text-ink-dim underline-offset-4 hover:underline">
              Tenho senha: entrar com email e senha
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
