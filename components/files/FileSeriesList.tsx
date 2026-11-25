"use client";

/**
 * Séries de ficheiros com as versões (a mais recente marcada "atual", RF-20.80) e descarga
 * por link temporário (RF-30.45). Bloqueados mostram o cadeado e não descarregam (RF-30.44).
 */
import { useState } from "react";
import { Download, FileText, Image as ImageIcon, Lock } from "lucide-react";
import type { FileItem, FileSeries } from "@/lib/files/data";
import { fileDownloadUrl } from "@/lib/files/actions";
import { ROLE_LABEL, humanSize } from "@/lib/files/rules";
import { longDate } from "@/lib/portal/format";

export function FileSeriesList({ series, admin = false, empty }: { series: FileSeries[]; admin?: boolean; empty: React.ReactNode }) {
  if (!series.length) return <>{empty}</>;
  return (
    <ul className="space-y-4">
      {series.map((s) => (
        <li key={s.key} className="rounded-2xl border border-line p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-ink">{s.title}</p>
            <p className="text-xs text-ink-faint">
              {admin && `${ROLE_LABEL[s.role]} · `}
              {s.phase ? `Fase ${s.phase.position}. ${s.phase.name}` : "Sem fase"}
            </p>
          </div>
          <ol className="mt-3 space-y-3">
            {s.versions.map((v, i) => (
              <li key={v.deliverableId} className="border-t border-line pt-3 first:border-0 first:pt-0">
                <p className="flex flex-wrap items-center gap-2 text-xs text-ink-dim">
                  <span className="font-semibold text-ink">{v.label}</span>
                  {i === 0 && s.versions.length > 1 && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent-soft">atual</span>}
                  <span>{longDate(v.createdAt)}</span>
                  <span>· {v.uploadedBy === "client" ? (admin ? "enviado pelo cliente" : "enviado por si") : "GeniusFrela"}</span>
                  {v.locked && (
                    <span className="inline-flex items-center gap-1 text-action">
                      <Lock size={12} aria-hidden /> disponível depois do pagamento
                    </span>
                  )}
                </p>
                {v.notes && <p className="mt-1 text-xs text-ink-faint">{v.notes}</p>}
                <ul className="mt-2 space-y-1.5">
                  {v.files.map((f) => (
                    <FileRow key={f.id} f={f} locked={v.locked && !admin} purged={v.purged || f.purged} />
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  );
}

function FileRow({ f, locked, purged }: { f: FileItem; locked: boolean; purged: boolean }) {
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({});
  const Icon = f.mime.startsWith("image/") ? ImageIcon : FileText;
  return (
    <li className="flex flex-wrap items-center gap-3 text-sm">
      {f.thumbUrl && !locked && !purged ? (
        // Miniatura WebP comprimida; o original só se descarrega a pedido (RF-20.83, RF-30.46).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.thumbUrl} alt={`Pré-visualização de ${f.name}`} loading="lazy" className="h-28 w-full rounded-xl border border-line object-contain sm:h-24 sm:w-32" />
      ) : (
        <Icon size={15} aria-hidden className="shrink-0 text-ink-faint" />
      )}
      <span className="min-w-0 flex-1 truncate text-ink">{f.name}</span>
      <span className="text-xs text-ink-faint">{humanSize(f.size)}</span>
      {purged ? (
        <span className="text-xs text-ink-faint">apagado</span>
      ) : locked ? (
        <Lock size={15} aria-label="Bloqueado" className="text-ink-faint" />
      ) : (
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
          <Download size={14} aria-hidden /> {state.busy ? "…" : f.thumbUrl ? "Original" : "Descarregar"}
        </button>
      )}
      {state.error && (
        <span role="alert" className="w-full text-xs text-[#ff8fa3]">
          {state.error}
        </span>
      )}
    </li>
  );
}
