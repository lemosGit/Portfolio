import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { listClients } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { relative } from "@/lib/portal/format";
import { AccessBadge, AdminHeader, Avatar, Empty, ProjectStatusBadge } from "../_components/ui";

export const metadata = { title: "Clientes e projetos" };

export default async function ClientsPage() {
  const { sb } = await requireAdmin();
  const clients = await listClients(sb);

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[{ href: "/admin/clientes", label: "Clientes" }]}
        title="Clientes e projetos"
        subtitle={`${clients.length} ${clients.length === 1 ? "cliente" : "clientes"}`}
        actions={
          <Link href="/admin/clientes/novo" className="btn-violet h-11">
            <Plus size={17} aria-hidden /> Novo cliente
          </Link>
        }
      />

      {clients.length === 0 ? (
        <Empty>Ainda não há clientes. Crie o primeiro com o botão “Novo cliente”.</Empty>
      ) : (
        <ul className="panel divide-y divide-line overflow-hidden p-0">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/clientes/${c.id}`}
                className="group flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] md:flex-row md:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={c.name} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{c.name}</span>
                      <AccessBadge c={c} />
                    </p>
                    <p className="truncate text-[13px] text-ink-faint">
                      {c.company ? `${c.company} · ` : ""}
                      {c.email}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-wrap gap-2 md:w-[38%]">
                  {c.projects.length === 0 ? (
                    <span className="text-[13px] text-ink-faint">Sem projetos</span>
                  ) : (
                    c.projects.map((p) => (
                      <span key={p.id} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] px-2.5 py-1 text-[13px] text-ink-dim">
                        {p.name} <ProjectStatusBadge status={p.status} />
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-ink-faint md:w-40 md:justify-end">
                  <span>
                    {c.account?.lastSignInAt ? `Entrou ${relative(c.account.lastSignInAt)}` : "Nunca entrou"}
                  </span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
