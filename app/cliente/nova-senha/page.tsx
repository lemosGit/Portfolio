import type { Metadata } from "next";
import { BrandLockup } from "@/components/BrandMark";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = {
  title: "Definir senha · Área do cliente · JP Studio",
  robots: { index: false, follow: false },
};

/** Primeiro acesso: o cliente troca a senha temporária recebida por email. */
export default function NewPasswordPage() {
  return (
    <main id="conteudo" className="relative grid min-h-dvh place-items-center px-6 py-12">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div
          className="absolute left-1/2 top-[-20%] h-[60vh] w-[70vw] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(109,76,255,0.2), transparent)" }}
        />
      </div>
      <div className="relative w-full max-w-[420px]">
        <BrandLockup />
        <h1 className="mt-12 font-display text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink">
          Defina a sua senha
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">
          É o seu primeiro acesso. Troque a senha temporária que recebeu por uma só sua.
        </p>
        <div className="mt-10">
          <PasswordForm />
        </div>
      </div>
    </main>
  );
}
