/**
 * Bloco `ProofGallery` (M7-02): lê as provas do projeto (com a sessão do cliente; RLS) e entrega-as ao
 * ProofViewer. As miniaturas vêm assinadas por 15 min (loadSeries, #122); no modo de demonstração
 * são os SVG de public/demo/provas.
 */
import { proofsFrom } from "@/lib/design/proofs";
import { loadSeries } from "@/lib/files/data";
import { demoSeries } from "@/lib/files/demo";
import type { ProjectView } from "@/lib/portal/types";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ProofViewer } from "./ProofViewer";

export async function ProofGallery({ project, view }: { project: ProjectView; view: "overview" | "gallery" }) {
  const series = supabaseEnabled ? await loadSeries(await createSupabaseServer(), project.id) : demoSeries(project.id);
  if ("error" in series) return null;
  const proofs = proofsFrom(series, project.approvals ?? []);
  // A série com novidades (a peça principal) é a que aparece; as outras continuam em Ficheiros.
  const main = proofs[0];
  if (!main) return null;
  return <ProofViewer series={main} view={view} />;
}
