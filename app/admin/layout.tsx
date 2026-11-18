import type { Metadata } from "next";
import { countAwaiting } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { accountsEnabled } from "@/lib/supabase/admin";
import { AdminSidebar } from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: { template: "%s · Administração · JP Studio", default: "Administração · JP Studio" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sb, name } = await requireAdmin();
  const awaiting = await countAwaiting(sb).catch(() => 0);

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div
          className="absolute -top-[30%] left-[30%] h-[65vh] w-[60vw] rounded-full opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(109,76,255,0.18), transparent)" }}
        />
      </div>

      <AdminSidebar name={name} awaiting={awaiting} />

      <div className="relative lg:pl-[272px]">
        {!accountsEnabled && (
          <p role="status" className="border-b border-amber-400/20 bg-amber-400/[0.06] px-4 py-2.5 text-center text-[13px] text-amber-200 sm:px-6">
            Falta a <code className="font-mono">SUPABASE_SECRET_KEY</code> no servidor: pode ver e editar dados, mas não criar,
            suspender ou apagar contas, nem redefinir senhas.
          </p>
        )}
        <main id="conteudo" className="mx-auto max-w-[1400px] px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-9">
          {children}
        </main>
      </div>
    </div>
  );
}
