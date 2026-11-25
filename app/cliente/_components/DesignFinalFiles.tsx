/**
 * Ficheiros digitais finais do Design (M7-05, RF-20.71): os entregáveis da fase Entrega/levantamento,
 * com download (o mesmo bloco de Ficheiros). Lidos com a sessão do cliente (RLS).
 */
import { FileSeriesList } from "@/components/files/FileSeriesList";
import { loadSeries } from "@/lib/files/data";
import { demoSeries } from "@/lib/files/demo";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function DesignFinalFiles({ projectId }: { projectId: string }) {
  const all = supabaseEnabled ? await loadSeries(await createSupabaseServer(), projectId) : demoSeries(projectId);
  if ("error" in all) return null;
  const finals = all.filter((s) => s.role === "entregavel" && s.phase?.key === "entrega-levantamento");
  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="text-[13px] font-medium text-ink-dim">Ficheiros digitais</p>
      <div className="mt-2">
        <FileSeriesList series={finals} empty={<p className="text-[13px] text-ink-faint">Os ficheiros finais aparecem aqui quando estiverem prontos.</p>} />
      </div>
    </div>
  );
}
