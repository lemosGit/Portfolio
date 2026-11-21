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
    <div className="app relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="app-ambient">
        <i />
        <i />
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
        <footer className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-3 px-4 pb-8 text-xs text-ink-faint sm:px-6 lg:px-10">
          <p>GeniusFrela · Área do cliente v1.0</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden /> Todos os serviços a funcionar
          </p>
        </footer>
      </div>
    </div>
  );
}
