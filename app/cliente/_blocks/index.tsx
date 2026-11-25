/**
 * Liga os ids do registo SERVICE_LAYOUTS (lib/portal/service-layouts.ts) aos componentes.
 * Um id sem componente falha no typecheck: o registo e os blocos não se desalinham.
 */
import type { BlockId, ServiceLayout } from "@/lib/portal/service-layouts";
import { AcademicAdjustments, AcademicBrief, AcademicChapters, AcademicCountdown } from "./academic";
import { Approvals } from "./approvals";
import { DesignSpecBlock } from "./design";
import { NextStep, PhaseBar } from "./common";
import { Payments, PaymentsCompact } from "./payments";
import { TechDemoFeedback, TechHeroProgress, TechNeedsClient, TechRoadmapMeetingNews } from "./tech";
import type { BlockProps } from "./types";

const BLOCKS: Record<BlockId, (p: BlockProps) => React.ReactNode> = {
  "tech-needs-client": TechNeedsClient,
  "tech-hero-progress": TechHeroProgress,
  "tech-roadmap-meeting-news": TechRoadmapMeetingNews,
  "tech-demo-feedback": TechDemoFeedback,
  "phase-bar": PhaseBar,
  "next-step": NextStep,
  approvals: Approvals,
  payments: Payments,
  "payments-compact": PaymentsCompact,
  "aca-brief": AcademicBrief,
  "aca-countdown": AcademicCountdown,
  "aca-chapters": AcademicChapters,
  "aca-adjustments": AcademicAdjustments,
  "des-spec": DesignSpecBlock,
};

export function Blocks({ ids, grid, ...props }: BlockProps & { ids: BlockId[]; grid?: ServiceLayout["overviewGrid"] }) {
  if (grid) {
    // Cada bloco num invólucro com a sua posição; os blocos que não se mostram (null) não ocupam célula.
    return (
      <div className={grid.container}>
        {ids.map((id) => {
          const Block = BLOCKS[id];
          return (
            <div key={id} className={`min-w-0 empty:hidden ${grid.place[id] ?? grid.rest}`}>
              <Block {...props} />
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <>
      {ids.map((id) => {
        const Block = BLOCKS[id];
        return <Block key={id} {...props} />;
      })}
    </>
  );
}
