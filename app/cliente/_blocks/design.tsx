/**
 * Blocos do Design (M7). Acento Lilás Criativo (ADR-004) pelo data-service do layout.
 */
import { MapPin } from "lucide-react";
import type { Approval } from "@/lib/approvals/model";
import { proofReadyTitle } from "@/lib/design/proofs";
import { remainingNotice, roundsLabel } from "@/lib/design/rounds";
import { PIECE_TYPES, eventSlack, mapsUrl, sizeLabel } from "@/lib/design/spec";
import { longDate } from "@/lib/portal/format";
import type { ProjectView } from "@/lib/portal/types";
import { ApprovalCard } from "../_components/ApprovalCard";
import { Details } from "../_components/Details";
import { DesignFinalFiles } from "../_components/DesignFinalFiles";
import { ProofGallery } from "../_components/ProofGallery";
import { Approvals } from "./approvals";
import { NextStep, StateChip } from "./common";
import type { BlockProps } from "./types";

/**
 * Bloco "des-spec" (M7-01, RF-20.10…12): a ficha técnica atrás de "Ver detalhes da peça", nunca na
 * primeira vista. O tipo de peça e a data do evento já aparecem no topo (RF-20.02, specHeadline).
 */
export function DesignSpecBlock({ project }: BlockProps) {
  const s = project.designSpec;
  if (!s) return null;
  const rows: [string, string | null][] = [
    ["Peça", s.pieceLabel ? `${PIECE_TYPES[s.pieceType]} — ${s.pieceLabel}` : PIECE_TYPES[s.pieceType]],
    ["Medidas", [sizeLabel(s), s.sizeNotes].filter(Boolean).join(" · ") || null],
    ["Material", s.material],
    ["Quantidade", s.quantity.toLocaleString("pt-PT")],
    ["Acabamento", s.finish],
    ["Impressão", s.hasPrint ? "Sim" : "Não (só design)"],
    ["Ficheiros digitais", s.hasDigitalFiles ? "Sim, entregues no fim" : "Não"],
    ["Evento", s.eventDate ? longDate(s.eventDate) : null],
  ];
  return (
    <section aria-labelledby="ficha-peca-title" className="px-1">
      <h2 id="ficha-peca-title" className="sr-only">
        Ficha técnica
      </h2>
      <Details label="Ver detalhes da peça" className="[&>summary]:font-semibold [&>summary]:text-accent">
        <dl className="grid gap-x-6 gap-y-2.5 text-[14px] sm:grid-cols-[160px_1fr]">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
        </dl>
        {s.keyTexts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-[13px] font-medium text-ink-dim">Textos da peça</h3>
            <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
              {s.keyTexts.map((k, i) => (
                <li key={i} className="flex flex-col gap-0.5 px-3 py-2 text-[14px] sm:flex-row sm:gap-3">
                  {k.label && <span className="shrink-0 text-ink-faint sm:w-36">{k.label}</span>}
                  <span className="text-ink">{k.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 text-[13px] text-ink-faint">
          Há algum nome ou data errados? <a href="/cliente/mensagens" className="underline">Diga-nos nas mensagens</a>.
        </p>
      </Details>
    </section>
  );
}

/** Bloco "des-proof" (M7-02, RF-20.05; M7-07): a prova atual em grande, a protagonista (TEL-30). */
export function DesignProof({ project }: BlockProps) {
  return <ProofGallery project={project} view="current" />;
}

/** Bloco "des-versions" (M7-02, RF-20.80; M7-07): as outras versões, com "Comparar" e os comentários. */
export function DesignVersions({ project }: BlockProps) {
  return <ProofGallery project={project} view="versions" />;
}

/** A prova à espera do cliente (a mais recente), se houver. */
const pendingProof = (project: ProjectView): Approval | undefined =>
  (project.approvals ?? []).find((a) => a.subject === "prova" && a.status === "pendente");

/**
 * Bloco "des-decision" (M7-07, wireframe TEL-30 A e computador): com uma prova à espera, um só painel com o
 * estado, a ronda, "A segunda versão está pronta", a mensagem, os dois botões, as revisões que ainda cabem no
 * preço e o levantamento previsto. Sem prova à espera, o próximo passo de sempre (ex.: "Pagar o restante").
 */
export function DesignDecision(props: BlockProps) {
  const { project } = props;
  const a = pendingProof(project);
  if (!a) {
    return (
      <div className="space-y-3">
        <NextStep {...props} />
        <PickupLine project={project} />
      </div>
    );
  }
  const r = project.rounds;
  return (
    <section aria-labelledby="decisao-title" className="panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StateChip tone="action">Aguarda a sua resposta</StateChip>
        {r && <span className="text-[13px] text-ink-dim">{roundsLabel(r)}</span>}
      </div>
      <h2 id="decisao-title" className="mt-3 font-display text-[22px] leading-tight text-ink">
        {proofReadyTitle(a.versionLabel)}
      </h2>
      <ApprovalCard a={a} rounds={r} art bare />
      {r && <p className="mt-3 text-[13px] text-ink-faint">{remainingNotice(r)}</p>}
      <PickupLine project={project} boxed />
    </section>
  );
}

/** Bloco "des-approvals": as Aprovações sem a prova, que já está no painel de decisão. */
export function DesignApprovals(props: BlockProps) {
  return <Approvals {...props} shownAbove={pendingProof(props.project)?.id} />;
}

const pickupWhen = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Luanda" });
const pickupHour = (iso: string) => new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Luanda" });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Bloco "des-pickup" (M7-05, RF-20.61, RF-20.70…72; wireframe TEL-30 A e C):
 * - Entrega em curso (ou produção pronta): "Pronto para levantar" com a data e o local em destaque,
 *   "Abrir no mapa", os ficheiros digitais (se a ficha os prevê) e a folga até ao evento.
 * - Produção em curso: o estado com uma frase curta e o levantamento previsto.
 * - Antes disso, só uma linha com o levantamento previsto, se já houver data.
 */
export function DesignPickup({ project }: BlockProps) {
  const s = project.designSpec;
  if (!s) return null;
  const phase = (k: string) => project.phaseViews.find((p) => p.key === k);
  const prod = phase("producao");
  const ent = phase("entrega-levantamento");
  const where = s.pickupPlace;
  const slack = eventSlack(s.eventDate, s.pickupAt);

  if (s.deliveredAt) {
    return (
      <section aria-labelledby="levantar-title" className="panel p-5 sm:p-6">
        <StateChip tone="done">Entregue</StateChip>
        <h2 id="levantar-title" className="mt-3 font-display text-[22px] text-ink">
          Peça entregue a {new Date(s.deliveredAt).toLocaleDateString("pt-PT", { day: "numeric", month: "long", timeZone: "Africa/Luanda" })}
        </h2>
        {s.hasDigitalFiles && <DesignFinalFiles projectId={project.id} />}
      </section>
    );
  }

  const ready = ent?.status === "current" || s.productionStatus === "pronto";
  if (ready) {
    return (
      <section aria-labelledby="levantar-title" className="panel p-5 sm:p-6">
        <StateChip tone="done">{s.hasPrint ? "Pronto para levantar" : "Pronto"}</StateChip>
        <h2 id="levantar-title" className="sr-only">
          Entrega e levantamento
        </h2>
        {s.pickupAt ? (
          <>
            <p className="mt-3 font-display text-[28px] leading-tight text-ink">{cap(pickupWhen(s.pickupAt))}</p>
            <p className="mt-1 text-[15px] text-ink">
              {where ?? "Local a combinar"} <span className="text-ink-dim">· às {pickupHour(s.pickupAt)}</span>
            </p>
          </>
        ) : (
          <p className="mt-3 text-[15px] text-ink-dim">Vamos combinar consigo a data e o local {s.hasPrint ? "de levantamento" : "de entrega"}.</p>
        )}
        {where && (
          <a href={mapsUrl(where)} target="_blank" rel="noopener noreferrer" className="btn-violet mt-4 h-11 w-full justify-center sm:w-auto">
            <MapPin size={16} aria-hidden /> Abrir no mapa
          </a>
        )}
        {s.hasDigitalFiles && <DesignFinalFiles projectId={project.id} />}
        {slack !== null && slack >= 0 && s.eventDate && (
          <p className="mt-4 text-[13px] text-ink-dim">
            O evento é a {new Date(`${s.eventDate}T12:00:00Z`).toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}: tem {slack} dia{slack === 1 ? "" : "s"} de folga.
          </p>
        )}
      </section>
    );
  }

  if (prod?.status === "current") {
    return (
      <section aria-labelledby="levantar-title" className="panel p-5 sm:p-6">
        <StateChip tone="now">Em produção</StateChip>
        <h2 id="levantar-title" className="mt-3 font-display text-[22px] text-ink">
          {s.productionStatus === "a_imprimir" ? `Estamos a imprimir ${s.quantity > 1 ? `as ${s.quantity.toLocaleString("pt-PT")} peças` : "a sua peça"}.` : "A sua peça está em produção."}
        </h2>
        {s.pickupAt && (
          <p className="mt-2 text-[14px] text-ink-dim">
            Levantamento previsto: {pickupWhen(s.pickupAt)}
            {where ? ` · ${where}` : ""}
          </p>
        )}
      </section>
    );
  }

  // TEL-30 A: antes da produção, a linha do levantamento previsto vai no painel de decisão (M7-07).
  return null;
}

/** Antes da produção, a linha "Levantamento previsto" (TEL-30 A), se já houver data. */
function PickupLine({ project, boxed = false }: { project: ProjectView; boxed?: boolean }) {
  const s = project.designSpec;
  const phase = (k: string) => project.phaseViews.find((p) => p.key === k)?.status;
  if (!s?.pickupAt || s.deliveredAt || s.productionStatus || phase("producao") === "current" || phase("entrega-levantamento") === "current") return null;
  return (
    <p className={boxed ? "mt-4 flex flex-wrap justify-between gap-x-3 gap-y-0.5 rounded-xl border border-line px-3 py-2.5 text-[13px] text-ink-dim" : "px-1 text-[13px] text-ink-dim"}>
      <span>Levantamento previsto</span>
      <b className="font-semibold text-ink">
        {pickupWhen(s.pickupAt)}
        {s.pickupPlace ? ` · ${s.pickupPlace}` : ""}
      </b>
    </p>
  );
}
