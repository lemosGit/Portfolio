import type { Metadata } from "next";
import { requirePortal } from "@/lib/portal/session";
import { Sidebar } from "../_components/Sidebar";

export const metadata: Metadata = {
  title: { template: "%s · Área do cliente · GeniusFrela", default: "Área do cliente · GeniusFrela" },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { client, project, projects, unread } = await requirePortal();

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* luz ambiente */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0">
        <div
          className="absolute -top-[30%] left-[25%] h-[70vh] w-[70vw] rounded-full opacity-70"
          style={{ background: "radial-gradient(closest-side, rgba(109,76,255,0.22), transparent)" }}
        />
        <div
          className="absolute -bottom-[25%] -right-[10%] h-[55vh] w-[45vw] rounded-full opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(40,160,150,0.14), transparent)" }}
        />
      </div>

      <Sidebar
        client={{ name: client.name, initials: client.initials }}
        project={{ id: project.id, name: project.name, percent: project.percent }}
        projects={projects}
        unread={unread}
      />

      <div className="relative lg:pl-[288px]">
        <main id="conteudo" className="mx-auto max-w-[1560px] px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-9">
          {children}
        </main>
        <footer className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-3 px-4 pb-8 text-[11px] text-ink-faint sm:px-6 lg:px-10">
          <p>GeniusFrela · Área do cliente v1.0</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden /> Todos os serviços a funcionar
          </p>
        </footer>
      </div>
    </div>
  );
}
