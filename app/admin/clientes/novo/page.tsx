import { createClientAccount } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/session";
import { ActionForm, Field, inputCls } from "../../_components/forms";
import { ProjectFields } from "../../_components/ProjectFields";
import { AdminHeader, Section } from "../../_components/ui";

export const metadata = { title: "Novo cliente" };

export default async function NewClientPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: "/admin/clientes/novo", label: "Novo" },
        ]}
        title="Novo cliente"
        subtitle="Cria a conta de acesso e o primeiro projeto. No fim, mostra a senha temporária para enviar ao cliente."
      />

      <Section title="Dados do cliente e do projeto" className="max-w-3xl">
        <ActionForm action={createClientAccount} submit="Criar cliente" pendingLabel="A criar…">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome">
              <input name="nome" required className={inputCls} placeholder="Alex Martins" autoComplete="off" />
            </Field>
            <Field label="Email de acesso">
              <input name="email" type="email" required className={inputCls} placeholder="alex@empresa.ao" autoComplete="off" />
            </Field>
            <Field label="Empresa (opcional)" className="sm:col-span-2">
              <input name="empresa" className={inputCls} placeholder="Nova Mobilidade" />
            </Field>
          </div>
          <hr className="border-line" />
          <ProjectFields />
        </ActionForm>
      </Section>
    </div>
  );
}
