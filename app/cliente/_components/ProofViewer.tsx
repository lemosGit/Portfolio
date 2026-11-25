"use client";

/**
 * Galeria de provas do Design (M7-02, RF-20.80…84; wireframe TEL-30, TEL-31, TEL-32).
 * - "overview": a prova atual em grande, numa moldura neutra (D-109), e as outras versões com "Comparar".
 * - "gallery": as versões lado a lado (carrossel no telemóvel), a atual marcada, e "Comparar V1 e V2".
 * As imagens são as miniaturas WebP (URL assinada de 15 min); o original só se descarrega a pedido (Q-010).
 */
import { useEffect, useRef, useState } from "react";
import { Download, Expand, FileText, Lock, X } from "lucide-react";
import { coverOf, defaultPair, type ProofSeries, type ProofVersion } from "@/lib/design/proofs";
import { fileDownloadUrl } from "@/lib/files/actions";
import type { FileItem } from "@/lib/files/data";
import { humanSize } from "@/lib/files/rules";
import { shortDate } from "@/lib/portal/format";
import { cn } from "@/lib/utils";

type Pair = [ProofVersion, ProofVersion];

export function ProofViewer({ series, view }: { series: ProofSeries; view: "overview" | "gallery" }) {
  const [zoom, setZoom] = useState<{ v: ProofVersion; i: number } | null>(null);
  const [pair, setPair] = useState<Pair | null>(null);
  const current = series.versions[0];
  const others = series.versions.slice(1);
  const first = defaultPair(series);

  return (
    <>
      {view === "overview" ? (
        <section aria-labelledby="prova-title" className="space-y-4">
          <h2 id="prova-title" className="sr-only">
            {`${series.title} ${current.label}, a versão atual`}
          </h2>
          <Current v={current} title={series.title} onZoom={(i) => setZoom({ v: current, i })} />
          {others.length > 0 && (
            <div className="panel p-5">
              <p className="text-[13px] font-medium text-ink-dim">Outras versões</p>
              <ul className="mt-3 space-y-3">
                {others.map((v) => (
                  <li key={v.deliverableId} className="flex items-center gap-4">
                    <Thumb v={v} className="h-[88px] w-[66px] shrink-0" onClick={() => setZoom({ v, i: 0 })} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink">{v.label}</p>
                      <p className="text-xs text-ink-faint">{shortDate(v.createdAt)}</p>
                      <button type="button" onClick={() => setPair([v, current])} className="mt-1 text-[13px] font-medium text-accent underline-offset-4 hover:underline">
                        Comparar com a {current.label}
                      </button>
                      <div className="mt-1.5">
                        <Comments v={v} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <section aria-labelledby="galeria-title" className="space-y-4">
          <h2 id="galeria-title" className="font-display text-[22px] text-ink">
            Provas
          </h2>
          {/* Lado a lado; no telemóvel, um carrossel com encaixe (RF-20.80). */}
          <ul aria-label="Versões" className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
            {series.versions.map((v, i) => (
              <li key={v.deliverableId} className="w-[72%] shrink-0 snap-start sm:w-auto">
                <Thumb v={v} now={i === 0} className="aspect-[3/4] w-full" onClick={() => setZoom({ v, i: 0 })} />
                <p className="mt-2 flex items-baseline justify-between text-[13px]">
                  <b className={cn("font-semibold", i === 0 ? "text-accent" : "text-ink")}>
                    {v.approved ? `${v.label}, aprovada` : i === 0 ? `${v.label}, atual` : v.label}
                  </b>
                  <span className="text-ink-faint">{shortDate(v.createdAt)}</span>
                </p>
              </li>
            ))}
          </ul>
          {first && (
            <button type="button" onClick={() => setPair(first)} className="btn-quiet h-11 w-full justify-center sm:w-auto">
              Comparar {first[0].label} e {first[1].label}
            </button>
          )}
        </section>
      )}

      <Dialog open={!!zoom} onClose={() => setZoom(null)} label={zoom ? `${series.title} ${zoom.v.label}` : "Prova"}>
        {zoom && <Zoom title={series.title} v={zoom.v} start={zoom.i} />}
      </Dialog>
      <Dialog open={!!pair} onClose={() => setPair(null)} label={pair ? `Comparar ${pair[0].label} e ${pair[1].label}` : "Comparar"}>
        {pair && <Compare series={series} pair={pair} onChange={setPair} />}
      </Dialog>
    </>
  );
}

/** A prova atual em grande (TEL-30): moldura neutra, etiqueta "V2, atual", frente/verso e "Ampliar". */
function Current({ v, title, onZoom }: { v: ProofVersion; title: string; onZoom: (i: number) => void }) {
  const images = v.files.filter((f) => f.thumbUrl && !f.purged);
  const [i, setI] = useState(0);
  const shown = images[i] ?? coverOf(v);
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative">
        <span className="absolute left-3 top-3 z-10 rounded-lg bg-bg/85 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur">
          {v.approved ? `${v.label}, aprovada para produção` : `${v.label}, atual`} · {shortDate(v.createdAt)}
        </span>
        {v.locked || !shown?.thumbUrl ? (
          <NoPreview v={v} className="h-[340px] sm:h-[460px]" />
        ) : (
          <button type="button" onClick={() => onZoom(Math.max(0, images.indexOf(shown)))} aria-label={`Ampliar ${title} ${v.label}`} className="group block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shown.thumbUrl} alt={`${title} ${v.label}: ${shown.name}`} className="mx-auto h-[340px] w-full object-contain p-4 sm:h-[460px]" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-bg/85 px-2.5 py-1 text-xs text-ink-dim backdrop-blur group-hover:text-ink">
              <Expand size={13} aria-hidden /> Ampliar
            </span>
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div role="group" aria-label="Imagens desta versão" className="flex gap-2 border-t border-line p-3">
          {images.map((f, j) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={j === i}
              onClick={() => setI(j)}
              className={cn("rounded-lg px-3 py-1.5 text-[13px]", j === i ? "bg-accent/15 text-accent-soft" : "text-ink-dim hover:text-ink")}
            >
              {sideLabel(f, j)}
            </button>
          ))}
        </div>
      )}
      {(v.notes || v.comments.length > 0) && (
        <figcaption className="space-y-2 border-t border-line px-4 py-3 text-[14px] text-ink-dim">
          {v.notes && <p>{v.notes}</p>}
          <Comments v={v} />
        </figcaption>
      )}
    </figure>
  );
}

/** Comentários desta versão (M7-03): quem, quando e o quê. */
function Comments({ v }: { v: ProofVersion }) {
  if (v.comments.length === 0) return null;
  return (
    <ul aria-label={`Comentários à ${v.label}`} className="space-y-1.5 text-[13px]">
      {v.comments.map((c, i) => (
        <li key={i} className="text-ink-dim">
          <span className="text-ink-faint">
            {shortDate(c.at)} · {c.by === "client" ? "Você" : "GeniusFrela"}
            {c.kind === "pedir_alteracoes" ? " pediu alterações" : c.kind === "aprovar" ? " aprovou" : ""}:
          </span>{" "}
          &ldquo;{c.text}&rdquo;
        </li>
      ))}
    </ul>
  );
}

/** "frente"/"verso" a partir do nome do ficheiro; senão "Imagem 2". */
function sideLabel(f: FileItem, j: number) {
  const m = f.name.toLowerCase().match(/frente|verso|capa|interior/);
  return m ? m[0].charAt(0).toUpperCase() + m[0].slice(1) : `Imagem ${j + 1}`;
}

function Thumb({ v, now, className, onClick }: { v: ProofVersion; now?: boolean; className?: string; onClick: () => void }) {
  const cover = coverOf(v);
  const frame = cn("overflow-hidden rounded-xl border bg-surface", now ? "border-accent ring-1 ring-accent/50" : "border-line", className);
  if (v.locked || !cover?.thumbUrl) return <NoPreview v={v} className={frame} />;
  return (
    <button type="button" onClick={onClick} aria-label={`Ampliar ${v.label}`} className={cn(frame, "block")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover.thumbUrl} alt={`${v.label}: ${cover.name}`} loading="lazy" className="h-full w-full object-contain p-1.5" />
    </button>
  );
}

function NoPreview({ v, className }: { v: ProofVersion; className?: string }) {
  return (
    <div className={cn("grid place-items-center rounded-xl border border-line bg-surface p-4 text-center text-xs text-ink-faint", className)}>
      {v.locked ? (
        <span className="inline-flex items-center gap-1.5">
          <Lock size={14} aria-hidden /> Disponível depois do pagamento
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <FileText size={14} aria-hidden /> {v.files[0]?.name ?? "Sem pré-visualização"}
        </span>
      )}
    </div>
  );
}

/** Ampliar: as imagens da versão em tamanho de ecrã (miniatura WebP até 1600 px) e o original a pedido. */
function Zoom({ title, v, start }: { title: string; v: ProofVersion; start: number }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "start" });
  }, []);
  return (
    <div className="space-y-4">
      <h2 className="pr-10 font-display text-lg text-ink">
        {title} {v.label} <span className="text-sm font-normal text-ink-faint">· {shortDate(v.createdAt)}</span>
      </h2>
      <Comments v={v} />
      <ul className="space-y-5">
        {v.files.map((f, j) => (
          <li key={f.id} ref={j === start ? ref : undefined} className="space-y-2">
            {f.thumbUrl && !v.locked && !f.purged ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.thumbUrl} alt={`${title} ${v.label}: ${f.name}`} className="mx-auto max-h-[72vh] w-auto rounded-xl bg-surface object-contain" />
            ) : (
              <NoPreview v={v} className="h-40" />
            )}
            {!v.locked && !f.purged && <Original f={f} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** O original só se descarrega a pedido, com o tamanho à vista (dados móveis, Q-010, RF-20.83). */
function Original({ f }: { f: FileItem }) {
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({});
  return (
    <p className="flex flex-wrap items-center justify-center gap-3 text-xs text-ink-faint">
      <span className="truncate">{f.name}</span>
      <button
        type="button"
        disabled={state.busy}
        onClick={async () => {
          setState({ busy: true });
          const r = await fileDownloadUrl(f.id);
          if (r.ok) {
            window.location.href = r.url;
            setState({});
          } else setState({ error: r.error });
        }}
        className="btn-quiet h-9 py-0 text-[13px]"
      >
        <Download size={14} aria-hidden /> {state.busy ? "…" : `Descarregar original (${humanSize(f.size)})`}
      </button>
      {state.error && (
        <span role="alert" className="w-full text-center text-[#ff8fa3]">
          {state.error}
        </span>
      )}
    </p>
  );
}

/** Comparar duas versões: lado a lado no computador, uma por cima da outra no telemóvel (TEL-32, RF-20.81, RF-20.82). */
function Compare({ series, pair, onChange }: { series: ProofSeries; pair: Pair; onChange: (p: Pair) => void }) {
  const [a, b] = pair;
  const pick = (k: 0 | 1, id: string) => {
    const v = series.versions.find((x) => x.deliverableId === id);
    if (v) onChange(k === 0 ? [v, b] : [a, v]);
  };
  return (
    <div className="space-y-4">
      <h2 className="pr-10 font-display text-lg text-ink">
        {a.label} e {b.label}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[a, b].map((v, k) => (
          <figure key={k} className="space-y-2">
            <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
              <span className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-bg/85 px-2 py-0.5 text-xs font-semibold text-ink">
                {v.label}, {shortDate(v.createdAt)}
              </span>
              {coverOf(v)?.thumbUrl && !v.locked ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverOf(v)!.thumbUrl} alt={`${series.title} ${v.label}`} className="mx-auto h-[38vh] w-full object-contain p-3 md:h-[60vh]" />
              ) : (
                <NoPreview v={v} className="h-[38vh] border-0 md:h-[60vh]" />
              )}
            </div>
            {/* TEL-32: o pedido que levou a esta versão (os comentários completos estão em Ampliar). */}
            {v.request && <figcaption className="text-[13px] text-ink-dim">O seu pedido: &ldquo;{v.request}&rdquo;</figcaption>}
            {series.versions.length > 2 && (
              <select
                aria-label={k === 0 ? "Primeira versão" : "Segunda versão"}
                value={v.deliverableId}
                onChange={(e) => pick(k as 0 | 1, e.target.value)}
                className="field h-10 w-full"
              >
                {series.versions.map((o) => (
                  <option key={o.deliverableId} value={o.deliverableId} className="bg-raised">
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}

/** Folha modal nativa (<dialog>): Esc e clique fora fecham. */
function Dialog({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="max-h-[94vh] w-[min(96vw,1100px)] overflow-y-auto rounded-2xl border border-line bg-bg p-5 text-ink backdrop:bg-black/75 sm:p-6"
    >
      {open && (
        <>
          <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl text-ink-dim hover:bg-white/5 hover:text-ink">
            <X size={18} aria-hidden />
          </button>
          {children}
        </>
      )}
    </dialog>
  );
}
