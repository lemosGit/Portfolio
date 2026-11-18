import Link from "next/link";
import { listConversations } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { relative } from "@/lib/portal/format";
import { cn } from "@/lib/utils";
import { AdminHeader, Avatar, Badge, Empty } from "../_components/ui";

export const metadata = { title: "Mensagens" };

export default async function InboxPage() {
  const { sb } = await requireAdmin();
  const conversations = await listConversations(sb);
  const awaiting = conversations.filter((c) => c.awaiting).length;

  return (
    <div className="space-y-6">
      <AdminHeader
        trail={[{ href: "/admin/mensagens", label: "Mensagens" }]}
        title="Mensagens"
        subtitle={awaiting ? `${awaiting} ${awaiting === 1 ? "conversa espera" : "conversas esperam"} resposta` : "Está tudo respondido."}
      />

      {conversations.length === 0 ? (
        <Empty>Ainda não há mensagens de clientes.</Empty>
      ) : (
        <ul className="panel divide-y divide-line overflow-hidden p-0">
          {conversations.map((c) => (
            <li key={c.projectId}>
              <Link
                href={`/admin/mensagens/${c.projectId}`}
                className={cn("flex gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]", c.awaiting && "bg-accent/[0.04]")}
              >
                <Avatar name={c.clientName} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{c.clientName}</span>
                      <span className="text-[13px] text-ink-faint">{c.projectName}</span>
                      {c.awaiting && <Badge tone="accent">Por responder</Badge>}
                    </p>
                    <span className="text-xs text-ink-faint">{relative(c.last.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-[13px] text-ink-dim">
                    {c.last.author === "admin" && <span className="text-ink-faint">Você: </span>}
                    {c.last.body}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
