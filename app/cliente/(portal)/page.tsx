import { specHeadline } from "@/lib/design/spec";
import { layoutFor } from "@/lib/portal/service-layouts";
import { requirePortal } from "@/lib/portal/session";
import { Blocks } from "../_blocks";
import { PageHeader } from "../_components/PageHeader";

export const metadata = { title: "Visão geral" };

export default async function Overview() {
  const { client, project, unread } = await requirePortal();
  const firstName = client.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        section="Visão geral"
        // RF-20.02: no Design, o tipo de peça e a data do evento no topo (M7-01).
        eyebrow={project.designSpec ? specHeadline(project.designSpec) : "Vamos construir algo bom"}
        unread={unread}
        source={project.source} serviceType={project.serviceType}
        title={
          <>
            Olá, <span className="aurora">{firstName}.</span>
          </>
        }
      />

      <Blocks ids={layoutFor(project.serviceType).pages.overview} grid={layoutFor(project.serviceType).overviewGrid} project={project} unread={unread} />
    </div>
  );
}
