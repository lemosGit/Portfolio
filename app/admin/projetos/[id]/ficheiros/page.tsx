import { notFound } from "next/navigation";
import { FileSeriesList } from "@/components/files/FileSeriesList";
import { Uploader } from "@/components/files/Uploader";
import { getProjectById } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { loadSeries } from "@/lib/files/data";
import { ROLE_LABEL } from "@/lib/files/rules";
import { accountsEnabled } from "@/lib/supabase/admin";
import { Field, inputCls } from "../../../_components/forms";
import { AdminHeader, Empty, Section } from "../../../_components/ui";

export const metadata = { title: "Ficheiros do projeto" };

export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();

  const [series, { data: phases }] = await Promise.all([
    loadSeries(sb, p.id),
    sb
      .from("project_phases")
      .select("id, position, name")
      .eq("project_id", p.id)
      .order("position")
      .returns<{ id: string; position: number; name: string }[]>(),
  ]);
  const own = "error" in series ? [] : series.filter((s) => s.role !== "referencia");

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
          { href: `/admin/projetos/${p.id}`, label: p.name },
          { href: `/admin/projetos/${p.id}/ficheiros`, label: "Ficheiros" },
        ]}
        title="Ficheiros do projeto"
        subtitle="Uma versão nova nunca apaga a anterior. O cliente vê os entregáveis e as provas, nunca os internos."
      />

      <Section title="Carregar ficheiros" description="Até 5 ficheiros por versão (ex.: PDF e Word da entrega final).">
        {!accountsEnabled ? (
          <Empty>Falta a SUPABASE_SECRET_KEY no servidor: sem ela não há uploads.</Empty>
        ) : (
          <Uploader bucket="project-files" base={{ projectId: p.id }} submitLabel="Carregar">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="O que é">
                <select name="serie" defaultValue="" className={inputCls}>
                  <option value="" className="bg-raised">Novo ficheiro (escreva o título)</option>
                  {own.map((s) => (
                    <option key={s.key} value={s.key} className="bg-raised">
                      Nova versão de: {s.title} (agora {s.versions[0].label})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Título (só para um ficheiro novo)">
                <input name="titulo" maxLength={120} className={inputCls} placeholder="Ex.: Convite, Entrega final" />
              </Field>
              <Field label="Papel" hint="Os internos não aparecem ao cliente.">
                <select name="papel" defaultValue="entregavel" className={inputCls}>
                  {(["entregavel", "prova", "interno"] as const).map((r) => (
                    <option key={r} value={r} className="bg-raised">
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fase">
                <select name="fase" defaultValue="" className={inputCls}>
                  <option value="" className="bg-raised">Sem fase</option>
                  {(phases ?? []).map((ph) => (
                    <option key={ph.id} value={ph.id} className="bg-raised">
                      {ph.position}. {ph.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Notas (opcional)" hint="O cliente vê-as junto da versão." className="sm:col-span-2">
                <input name="notas" maxLength={1000} className={inputCls} placeholder="Ex.: corrigidas as margens da página 3" />
              </Field>
            </div>
            <p className="text-xs text-ink-faint">
              Na fase “Entrega final” do Académico, o entregável fica bloqueado até o restante estar pago (RN-14).
            </p>
          </Uploader>
        )}
      </Section>

      <Section title="Ficheiros e versões">
        {"error" in series ? (
          <Empty>{series.error}</Empty>
        ) : (
          <FileSeriesList series={series} admin empty={<Empty>Ainda não há ficheiros neste projeto.</Empty>} />
        )}
      </Section>
    </div>
  );
}
