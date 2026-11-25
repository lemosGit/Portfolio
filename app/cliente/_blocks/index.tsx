/**
 * Liga os ids do registo SERVICE_LAYOUTS (lib/portal/service-layouts.ts) aos componentes.
 * Um id sem componente falha no typecheck: o registo e os blocos não se desalinham.
 */
import type { BlockId } from "@/lib/portal/service-layouts";
import { AcademicBrief, AcademicCountdown } from "./academic";
import { Approvals } from "./approvals";
import { NextStep, PhaseBar } from "./common";
import { Payments } from "./payments";
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
  "aca-brief": AcademicBrief,
  "aca-countdown": AcademicCountdown,
};

export function Blocks({ ids, ...props }: BlockProps & { ids: BlockId[] }) {
  return (
    <>
      {ids.map((id) => {
        const Block = BLOCKS[id];
        return <Block key={id} {...props} />;
      })}
    </>
  );
}
