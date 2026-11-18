import { Field, inputCls } from "./forms";

type Defaults = {
  name?: string;
  slug?: string;
  repo?: string;
  startedOn?: string | null;
  dueOn?: string | null;
  tagline?: string;
  description?: string;
};

/** Campos de projeto partilhados por "novo cliente", "novo projeto" e "editar projeto". */
export function ProjectFields({ d = {}, showSlug }: { d?: Defaults; showSlug?: boolean }) {
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
        <Field label="Repositório GitHub" hint="dono/repositorio — de onde vêm as fases e tarefas.">
          <input name="repo" defaultValue={d.repo} className={inputCls} placeholder="lemosGit/nova-app" spellCheck={false} />
        </Field>
      )}
      {showSlug && (
        <Field label="Repositório GitHub" hint="dono/repositorio — de onde vêm as fases e tarefas." className="sm:col-span-2">
          <input name="repo" defaultValue={d.repo} className={inputCls} placeholder="lemosGit/nova-app" spellCheck={false} />
        </Field>
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
    </div>
  );
}
