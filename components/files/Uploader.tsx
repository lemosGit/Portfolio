"use client";

/**
 * Envio de ficheiros em 3 passos (ADR-003 §2): pedir → enviar direto para o Storage → confirmar.
 * Usado no admin (com fase, papel e série) e no portal do cliente (só a fase).
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, TriangleAlert, Upload } from "lucide-react";
import { confirmUpload, startUpload, type StartInput } from "@/lib/files/actions";
import { checkFile, humanSize, type Bucket } from "@/lib/files/rules";
import { cn } from "@/lib/utils";

type Msg = { tone: "ok" | "error"; text: string } | null;

export function Uploader({
  bucket,
  base,
  accept,
  children,
  submitLabel = "Enviar",
  multiple = true,
}: {
  bucket: Bucket;
  /** Campos fixos do pedido (projeto, fase…). Os campos do formulário (`fase`, `papel`, `serie`, `titulo`, `notas`) juntam-se a estes. */
  base: Omit<StartInput, "files">;
  accept?: string;
  children?: React.ReactNode;
  submitLabel?: string;
  multiple?: boolean;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);

  // Aviso imediato, antes do envio (RF-30.42). O servidor volta a validar tudo.
  const problem = files.map((f) => checkFile(bucket, { name: f.name, type: f.type, size: f.size })).find((c) => "error" in c);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!files.length || problem) return;
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim() || undefined;
    setMsg(null);
    setBusy("A preparar…");
    try {
      const start = await startUpload({
        ...base,
        phaseId: get("fase") ?? base.phaseId,
        role: (get("papel") as StartInput["role"]) ?? base.role,
        series: get("serie"),
        title: get("titulo"),
        notes: get("notas"),
        files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      });
      if (!start.ok) return setMsg({ tone: "error", text: start.error });

      for (const [i, u] of start.uploads.entries()) {
        setBusy(`A enviar ${i + 1} de ${start.uploads.length}…`);
        const res = await fetch(u.url, {
          method: "PUT",
          body: files[i],
          headers: { "content-type": u.mime, "x-upsert": "false", "cache-control": "max-age=3600" },
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { message?: string };
          return setMsg({ tone: "error", text: `“${u.name}” não foi enviado${body.message ? `: ${body.message}` : ""}.` });
        }
      }

      setBusy("A verificar…");
      const done = await confirmUpload(start.ticket);
      if (!done.ok) return setMsg({ tone: "error", text: done.error });
      setMsg({ tone: "ok", text: done.message });
      setFiles([]);
      form.current?.reset();
      router.refresh();
    } catch {
      setMsg({ tone: "error", text: "A ligação falhou. Verifique a internet e tente outra vez." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <form ref={form} onSubmit={submit} className="space-y-4" noValidate>
      {children}
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-dim transition-colors hover:border-accent/50">
        <Upload size={18} aria-hidden className="text-accent-soft" />
        <span>{files.length ? `${files.length} ficheiro${files.length > 1 ? "s" : ""} escolhido${files.length > 1 ? "s" : ""}` : "Escolher ficheiros"}</span>
        <span className="text-xs text-ink-faint">
          {bucket === "client-uploads" ? "JPG, PNG, WebP, HEIC, PDF, DOC ou DOCX · até 10 MB cada" : "Até 50 MB cada (também AI, PSD, SVG e ZIP)"}
        </span>
        <input
          type="file"
          name="ficheiros"
          multiple={multiple}
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            setMsg(null);
            setFiles(Array.from(e.currentTarget.files ?? []));
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="space-y-1 text-xs text-ink-dim">
          {files.map((f) => (
            <li key={f.name + f.size} className="flex justify-between gap-3">
              <span className="truncate">{f.name}</span>
              <span className="shrink-0 text-ink-faint">{humanSize(f.size)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!files.length || Boolean(problem) || Boolean(busy)} className="btn-violet h-11 disabled:opacity-50">
          {busy ?? submitLabel}
        </button>
        <div aria-live="polite" className="min-h-5 text-[13px]">
          {problem && "error" in problem ? (
            <p role="alert" className="flex items-center gap-1.5 text-[#ff8fa3]">
              <TriangleAlert size={14} aria-hidden /> {problem.error}
            </p>
          ) : msg ? (
            <p role={msg.tone === "error" ? "alert" : undefined} className={cn("flex items-center gap-1.5", msg.tone === "ok" ? "text-ok" : "text-[#ff8fa3]")}>
              {msg.tone === "ok" ? <Check size={14} aria-hidden /> : <TriangleAlert size={14} aria-hidden />} {msg.text}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
