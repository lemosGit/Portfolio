import { Download, Globe, Smartphone } from "lucide-react";
import { longDate, relative } from "@/lib/portal/format";
import { requirePortal } from "@/lib/portal/session";
import { AppQr } from "../../_components/AppQr";
import { PageHeader } from "../../_components/PageHeader";
import { PreviewWindow } from "../../_components/Widgets";

export const metadata = { title: "Entregas" };

const KIND = { web: "Web", android: "Android", ios: "iOS" } as const;

export default async function DeliveriesPage() {
  const { project, unread } = await requirePortal();
  const app = project.latestApp;
  const history = [...project.demos].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div className="space-y-6">
      <PageHeader
        section="Entregas"
        title="Experimente a versão mais recente"
        unread={unread}
        syncedAt={project.syncedAt} source={project.source}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="web-title" className="panel">
          <div className="px-7 pt-7">
            <p className="kicker">Demonstração web</p>
            <h2 id="web-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
              Painel do operador
            </h2>
          </div>
          <PreviewWindow demo={project.latestWeb} projectName={project.name} />
        </section>

        <section aria-labelledby="app-title" className="panel flex flex-col p-7">
          <p className="kicker">App mobile</p>
          <h2 id="app-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
            Instalar no telemóvel
          </h2>
          {app ? (
            <>
              <div className="mt-7 flex justify-center">
                <AppQr url={app.url} />
              </div>
              <ol className="mt-7 space-y-2.5 text-[13px] leading-relaxed text-ink-dim">
                <li>1. Abra a câmara do telemóvel Android e aponte para o código.</li>
                <li>2. Toque no link e instale a versão {app.version}.</li>
                <li>3. Se o Android pedir, permita instalar apps desta origem.</li>
              </ol>
              <a href={app.url} target="_blank" rel="noreferrer" className="btn-quiet mt-6 w-full">
                <Download size={16} aria-hidden /> Abrir link da build
              </a>
              <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
                No iPhone a instalação é feita por convite TestFlight, enviado por email.
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-ink-dim">A primeira build da app aparece aqui assim que for gerada.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="hist-title" className="panel p-7">
        <p className="kicker">Histórico</p>
        <h2 id="hist-title" className="mt-2.5 font-display text-[19px] font-semibold text-ink">
          Todas as versões
        </h2>
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {history.map((d) => {
            const Icon = d.kind === "web" ? Globe : Smartphone;
            return (
              <li key={d.id} className="flex flex-wrap items-center gap-4 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03] text-accent-soft">
                  <Icon size={17} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-ink">
                    {KIND[d.kind]} · v{d.version}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-dim">{d.notes}</p>
                </div>
                <time dateTime={d.createdAt} title={longDate(d.createdAt)} className="text-[11px] text-ink-faint">
                  {relative(d.createdAt)}
                </time>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg px-3 py-2 text-[13px] text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
                >
                  Abrir<span className="sr-only"> {KIND[d.kind]} v{d.version}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
