import { SERVICE_TYPES } from "@/lib/admin/project-form";
import type { ServiceType } from "@/lib/portal/types";
import { Field, inputCls } from "./forms";
import { ServicePicker } from "./ServicePicker";

type Defaults = {
  name?: string;
  slug?: string;
  repo?: string;
  startedOn?: string | null;
  dueOn?: string | null;
  tagline?: string;
  description?: string;
  coverUrl?: string | null;
};

/**
 * Campos de projeto partilhados por "novo cliente", "novo projeto" e "editar projeto".
 * - Criar: escolhe-se o tipo de serviço; o repositório só aparece no Desenvolvimento.
 * - Editar: o tipo não muda (RN-02) e só o Desenvolvimento tem repositório.
 */
export function ProjectFields({
  d = {},
  showSlug,
  serviceType,
}: {
  d?: Defaults;
  showSlug?: boolean;
  /** Só na edição: o tipo do projeto (sem ele, o formulário pede-o). */
  serviceType?: ServiceType;
}) {
  const label = SERVICE_TYPES.find((s) => s.value === serviceType)?.label;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome do projeto">
        <input name="projeto" required defaultValue={d.name} className={inputCls} placeholder="Nova App Mobile" />
      </Field>
      {showSlug ? (
        <Field label="Slug" hint="Identificador curto, usado nos comandos e endereços.">
          <input name="slug" defaultValue={d.slug} className={inputCls} spellCheck={false} />
        </Field>
      ) : (
        <span className="hidden sm:block" aria-hidden />
      )}
      {serviceType ? (
        <>
          <Field label="Tipo de serviço" hint="Não muda depois de criado.">
            <p className={`${inputCls} flex items-center text-ink-dim`}>{label}</p>
          </Field>
          {serviceType === "development" ? (
            <Field label="Repositório GitHub" hint="dono/repositorio — de onde vêm as fases e tarefas.">
              <input name="repo" defaultValue={d.repo} className={inputCls} placeholder="lemosGit/nova-app" spellCheck={false} />
            </Field>
          ) : (
            <span className="hidden sm:block" aria-hidden />
          )}
        </>
      ) : (
        <ServicePicker defaultRepo={d.repo} />
      )}
      <Field label="Início">
        <input name="inicio" type="date" defaultValue={d.startedOn ?? undefined} className={inputCls} />
      </Field>
      <Field label="Entrega prevista">
        <input name="entrega" type="date" defaultValue={d.dueOn ?? undefined} className={inputCls} />
      </Field>
      <Field label="Resumo" hint="Uma frase que aparece no topo do projeto do cliente." className="sm:col-span-2">
        <input name="resumo" defaultValue={d.tagline} className={inputCls} maxLength={160} />
      </Field>
      <Field label="Descrição" className="sm:col-span-2">
        <textarea name="descricao" defaultValue={d.description} rows={3} className={`${inputCls} h-auto py-2.5`} />
      </Field>
      <div className="sm:col-span-2">
        <label htmlFor="capa" className="mb-1.5 block text-[13px] font-medium text-ink-dim">
          Imagem do projeto
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {d.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.coverUrl} alt="Imagem atual do projeto" className="h-16 w-28 shrink-0 rounded-lg border border-line object-cover" />
          )}
          <input
            id="capa"
            name="capa"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="min-w-0 flex-1 text-[13px] text-ink-dim file:mr-3 file:h-10 file:cursor-pointer file:rounded-lg file:border file:border-line file:bg-white/[0.04] file:px-4 file:text-[13px] file:text-ink"
          />
          {d.coverUrl && (
            <label className="flex items-center gap-2 text-[13px] text-ink-dim">
              <input type="checkbox" name="remover_capa" value="1" /> Remover imagem
            </label>
          )}
        </div>
        <span className="mt-1.5 block text-xs text-ink-faint">
          Aparece ao fundo do resumo, na área do cliente. JPG, PNG ou WebP, até 4 MB.
        </span>
      </div>
    </div>
  );
}
