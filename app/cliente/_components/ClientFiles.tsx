/**
 * Página "Ficheiros" do Académico e do Design (M5-09, bloco `files` do layout-blocos §4):
 * versões por série e envio de referências nas fases que o permitem (RF-30.41, D-132).
 */
import { FileSeriesList } from "@/components/files/FileSeriesList";
import { Uploader } from "@/components/files/Uploader";
import { loadSeries } from "@/lib/files/data";
import { demoSeries } from "@/lib/files/demo";
import { clientMayUpload } from "@/lib/files/rules";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { longDate } from "@/lib/portal/format";
import type { ProjectView } from "@/lib/portal/types";

export async function ClientFiles({ project }: { project: ProjectView }) {
  const series = supabaseEnabled ? await loadSeries(await createSupabaseServer(), project.id) : demoSeries(project.id);
  const open = project.phaseViews.filter((ph) => clientMayUpload(ph));
  // RF-30.48 / D-027: num projeto concluído, até quando se pode descarregar.
  const purgeOn = project.filesPurgeOn;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section aria-labelledby="files-title" className="panel p-7">
        <p className="kicker">Versões</p>
        <h2 id="files-title" className="mt-2.5 text-base font-medium text-ink">
          Ficheiros do projeto
        </h2>
        {purgeOn && (
          <p className="mt-3 rounded-xl border border-action/30 bg-action/[0.06] px-3 py-2 text-[13px] text-ink-dim">
            Pode descarregar os ficheiros até <b className="font-semibold text-ink">{longDate(purgeOn)}</b>. Depois disso saem do armazenamento.
          </p>
        )}
        <div className="mt-6">
          {"error" in series ? (
            <p className="text-sm text-ink-dim">{series.error}</p>
          ) : (
            <FileSeriesList
              series={series}
              empty={<p className="text-sm text-ink-dim">Ainda não há ficheiros. Quando enviarmos uma versão, aparece aqui.</p>}
            />
          )}
        </div>
      </section>

      <section aria-labelledby="send-title" className="panel p-7">
        <p className="kicker">Enviar</p>
        <h2 id="send-title" className="mt-2.5 text-base font-medium text-ink">
          Enviar referências
        </h2>
        {open.length === 0 ? (
          <p className="mt-4 text-sm text-ink-dim">
            Pode enviar ficheiros (enunciado, normas, fotos, textos) durante o briefing e a revisão. Nesta fase não é preciso enviar nada.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {open.map((ph) => (
              <div key={ph.key}>
                <p className="mb-3 text-[13px] text-ink-dim">
                  Fase {ph.number}. {ph.title} · até 10 ficheiros nesta fase
                </p>
                <Uploader
                  bucket="client-uploads"
                  base={{ projectId: project.id, phaseKey: ph.key }}
                  accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,.doc,.docx"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
