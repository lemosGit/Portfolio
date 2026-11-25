/**
 * Blocos do Design (M7). Acento Lilás Criativo (ADR-004) pelo data-service do layout.
 */
import { PIECE_TYPES, sizeLabel } from "@/lib/design/spec";
import { longDate } from "@/lib/portal/format";
import { Details } from "../_components/Details";
import { ProofGallery } from "../_components/ProofGallery";
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

/** Bloco "des-proof" (M7-02, RF-20.05, RF-20.80): a prova atual em grande e as outras versões (TEL-30). */
export function DesignProof({ project }: BlockProps) {
  return <ProofGallery project={project} view="overview" />;
}
