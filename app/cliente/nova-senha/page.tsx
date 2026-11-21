import type { Metadata } from "next";
import { BrandLockup } from "@/components/BrandMark";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = {
  title: "Definir senha · Área do cliente · GeniusFrela",
  robots: { index: false, follow: false },
};

/** Primeiro acesso: o cliente troca a senha temporária recebida por email. */
export default function NewPasswordPage() {
  return (
    <main id="conteudo" className="app relative grid min-h-dvh place-items-center px-6 py-12">
      <div aria-hidden className="app-ambient">
        <i />
        <i />
      </div>
      <div className="rise relative w-full max-w-[400px]">
        <BrandLockup />
        <p className="kicker mt-12">Primeiro acesso</p>
        <h1 className="mt-5 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.03em] text-ink">
          Defina a <span className="aurora">sua senha.</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          É o seu primeiro acesso. Troque a senha temporária que recebeu por uma só sua.
        </p>
        <div className="mt-10">
          <PasswordForm />
        </div>
      </div>
    </main>
  );
}
