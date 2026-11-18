import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageSquare } from "lucide-react";
import { createProject, deleteClient, resetClientPassword, setClientSuspended, updateClient } from "@/lib/admin/actions";
import { getClientById } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { longDate, relative, shortDate } from "@/lib/portal/format";
import { ActionForm, ConfirmDelete, Field, inputCls } from "../../_components/forms";
import { ProjectFields } from "../../_components/ProjectFields";
import { AccessBadge, AdminHeader, Empty, ProjectStatusBadge, Section } from "../../_components/ui";

export const metadata = { title: "Cliente" };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireAdmin();
  const c = await getClientById(sb, id);
  if (!c) notFound();

  const suspended = Boolean(c.account?.suspended);

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[
          { href: "/admin/clientes", label: "Clientes" },
          { href: `/admin/clientes/${c.id}`, label: c.name },
        ]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {c.name} <AccessBadge c={c} />
          </span>
        }
        subtitle={
          <>
            Cliente desde {longDate(c.createdAt)} ·{" "}
            {c.account?.lastSignInAt ? `último acesso ${relative(c.account.lastSignInAt)}` : "ainda não entrou"}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Dados do cliente">
          <ActionForm action={updateClient} submit="Guardar">
            <input type="hidden" name="id" value={c.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome">
                <input name="nome" required defaultValue={c.name} className={inputCls} />
              </Field>
              <Field label="Empresa">
                <input name="empresa" defaultValue={c.company} className={inputCls} />
              </Field>
              <Field label="Email de acesso" hint="Mudar o email muda também o login do cliente." className="sm:col-span-2">
                <input name="email" type="email" required defaultValue={c.email} className={inputCls} />
              </Field>
            </div>
          </ActionForm>
        </Section>

        <Section
          title="Acesso"
          description="A senha temporária obriga o cliente a escolher uma nova no próximo acesso. A suspensão bloqueia o login sem apagar dados."
        >
          <div className="space-y-6">
            <ActionForm action={resetClientPassword} submit="Gerar senha temporária nova" variant="quiet" pendingLabel="A gerar…">
              <input type="hidden" name="id" value={c.id} />
            </ActionForm>
            <hr className="border-line" />
            <ActionForm
              action={setClientSuspended}
              submit={suspended ? "Reativar acesso" : "Suspender acesso"}
              variant={suspended ? "primary" : "danger"}
              pendingLabel="A aplicar…"
            >
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="suspender" value={suspended ? "0" : "1"} />
            </ActionForm>
          </div>
        </Section>
      </div>

      <Section title="Projetos" description="O cliente vê no portal o projeto mais recente.">
        {c.projects.length === 0 ? (
          <Empty>Este cliente ainda não tem projetos.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {c.projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <Link href={`/admin/projetos/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <span className="font-semibold text-ink group-hover:underline">{p.name}</span>
                  <ProjectStatusBadge status={p.status} />
                  {p.dueOn && <span className="text-xs text-ink-faint">entrega {shortDate(p.dueOn)}</span>}
                </Link>
                <Link href={`/admin/mensagens/${p.id}`} className="btn-quiet h-9 py-0 text-[13px]">
                  <MessageSquare size={14} aria-hidden /> Mensagens
                </Link>
                <Link href={`/admin/projetos/${p.id}`} className="btn-quiet h-9 py-0 text-[13px]">
                  Gerir <ArrowRight size={14} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <details className="group mt-5 rounded-2xl border border-line bg-white/[0.015] p-4 open:pb-5">
          <summary className="cursor-pointer list-none text-sm font-semibold text-accent-soft marker:hidden">
            + Novo projeto para {c.name.split(" ")[0]}
          </summary>
          <div className="mt-4">
            <ActionForm action={createProject} submit="Criar projeto" pendingLabel="A criar…">
              <input type="hidden" name="cliente" value={c.id} />
              <ProjectFields />
            </ActionForm>
          </div>
        </details>
      </Section>

      <Section
        title="Apagar cliente"
        tone="danger"
        description="Apaga a conta, os projetos, as demos, as reuniões e as mensagens. Não é possível desfazer. Para bloquear o acesso sem perder dados, use “Suspender acesso”."
      >
        <ConfirmDelete action={deleteClient} id={c.id} expected={c.email} what="o email do cliente" label="Apagar cliente e todos os dados" />
      </Section>
    </div>
  );
}
