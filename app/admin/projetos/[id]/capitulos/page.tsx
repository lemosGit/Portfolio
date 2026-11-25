import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { addSections, deleteSection, importSectionsFromIndex, moveSection, requestIndexApproval, updateSection } from "@/lib/admin/actions";
import { getProjectById } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { loadBrief } from "@/lib/academic/brief";
import { SECTION_LABEL, chapterProgress, loadSections, type Section } from "@/lib/academic/chapters";
import { ActionForm, Field } from "../../../_components/forms";
import { inputCls, textareaCls } from "../../../_components/styles";
import { AdminHeader, Badge, Empty, NotifyClient, Progress, Section as Panel } from "../../../_components/ui";

export const metadata = { title: "Capítulos do trabalho" };

const TONE = { por_iniciar: "neutral", em_curso: "accent", concluido: "ok" } as const;

export default async function ChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const p = await getProjectById(sb, id);
  if (!p) notFound();

  const trail = [
    { href: "/admin/clientes", label: "Clientes" },
    { href: `/admin/clientes/${p.clientId}`, label: p.clientName },
    { href: `/admin/projetos/${p.id}`, label: p.name },
    { href: `/admin/projetos/${p.id}/capitulos`, label: "Capítulos" },
  ];
  if (p.serviceType !== "academic") {
    return (
      <div className="space-y-6">
        <AdminHeader trail={trail} title="Capítulos do trabalho" />
        <Empty>Os capítulos só existem em projetos Académico.</Empty>
      </div>
    );
  }

  const [sections, brief, { data: pending }] = await Promise.all([
    loadSections(sb, p.id),
    loadBrief(sb, p.id),
    sb.from("approvals").select("version_label").eq("project_id", p.id).eq("subject", "indice").eq("status", "pendente").maybeSingle<{ version_label: string | null }>(),
  ]);
  const pendingIndex = pending ? (pending.version_label ?? "atual") : null;
  const { done, total, ratio } = chapterProgress(sections);
  const usesChapters = brief?.usesChapters ?? true;

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={trail}
        title="Capítulos do trabalho"
        subtitle="O cliente vê só o título e o estado de cada capítulo, nunca o texto (D-015). A % da fase Desenvolvimento vem daqui."
      />

      {!usesChapters && (
        <Empty>
          Na ficha do trabalho está marcado “sem capítulos”: o cliente vê o progresso da fase (definido em Gerir fases), não esta lista.
        </Empty>
      )}

      <Panel title={total ? `Índice · ${done} de ${total} concluídos` : "Índice"} description="Reordene com as setas; o estado muda a % da fase Desenvolvimento.">
        {total > 0 && <Progress percent={Math.round(ratio * 100)} className="mb-5" />}
        {sections.length === 0 ? (
          <div className="space-y-4">
            <Empty>Ainda não há capítulos.</Empty>
            <ActionForm action={importSectionsFromIndex} submit="Copiar do último índice aprovado" variant="quiet" pendingLabel="A copiar…">
              <input type="hidden" name="projeto" value={p.id} />
            </ActionForm>
          </div>
        ) : (
          <ol className="space-y-2">
            {/* M6-99: a chave muda com o estado e o título; senão o React 19 repõe o formulário no valor
                antigo depois de guardar (o seletor voltava a "Por iniciar"). */}
            {sections.map((s) => (
              <SectionItem key={`${s.id}:${s.status}:${s.title}`} s={s} />
            ))}
          </ol>
        )}
      </Panel>

      {sections.length > 0 && (
        <Panel
          title="Pedir aprovação do índice"
          description={
            pendingIndex
              ? `O índice ${pendingIndex} está à espera do cliente. Para enviar outro, cancele-o em Aprovações.`
              : "O índice enviado é a lista de capítulos acima, nesta ordem. Com a fase Estrutura em curso, ela fica a aguardar o cliente; se ele pedir alterações, volta a em curso e recebe um email."
          }
        >
          {!pendingIndex && (
            <ActionForm action={requestIndexApproval} submit="Pedir aprovação do índice" pendingLabel="A pedir…">
              <input type="hidden" name="projeto" value={p.id} />
              <Field label="Mensagem ao cliente (opcional)">
                <input name="mensagem" maxLength={1000} className={inputCls} placeholder="Ex.: juntámos o capítulo da metodologia, como pediu" />
              </Field>
              <NotifyClient />
            </ActionForm>
          )}
        </Panel>
      )}

      <Panel title="Acrescentar capítulos" description="Um capítulo ou secção por linha; entram no fim do índice.">
        <ActionForm action={addSections} submit="Acrescentar" resetOnOk pendingLabel="A acrescentar…">
          <input type="hidden" name="projeto" value={p.id} />
          <Field label="Capítulos">
            <textarea name="titulos" rows={4} className={textareaCls} placeholder={"1. Introdução\n2. Revisão da literatura\n3. Metodologia"} />
          </Field>
        </ActionForm>
      </Panel>
    </div>
  );
}

function SectionItem({ s }: { s: Section }) {
  return (
    <li className="rounded-2xl border border-line bg-white/[0.015] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-7 text-center text-xs text-ink-faint">{s.position}</span>
        <div className="flex gap-1">
          <ActionForm action={moveSection} inline variant="quiet" submit={<ArrowUp size={14} aria-label={`Subir ${s.title}`} />} pendingLabel="…">
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="direcao" value="cima" />
          </ActionForm>
          <ActionForm action={moveSection} inline variant="quiet" submit={<ArrowDown size={14} aria-label={`Descer ${s.title}`} />} pendingLabel="…">
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="direcao" value="baixo" />
          </ActionForm>
        </div>
        <div className="min-w-0 flex-1">
          <ActionForm action={updateSection} inline variant="quiet" submit="Guardar" pendingLabel="…" className="flex-wrap">
            <input type="hidden" name="id" value={s.id} />
            <input name="titulo" defaultValue={s.title} maxLength={200} aria-label="Título do capítulo" className={`${inputCls} min-w-[14rem] flex-1`} />
            <select name="estado" defaultValue={s.status} aria-label="Estado do capítulo" className={`${inputCls} w-40`}>
              {(["por_iniciar", "em_curso", "concluido"] as const).map((st) => (
                <option key={st} value={st} className="bg-raised">
                  {SECTION_LABEL[st]}
                </option>
              ))}
            </select>
          </ActionForm>
        </div>
        <Badge tone={TONE[s.status]}>{SECTION_LABEL[s.status]}</Badge>
        <ActionForm action={deleteSection} inline variant="quiet" submit={<Trash2 size={14} aria-label={`Apagar ${s.title}`} />} pendingLabel="…">
          <input type="hidden" name="id" value={s.id} />
        </ActionForm>
      </div>
    </li>
  );
}
