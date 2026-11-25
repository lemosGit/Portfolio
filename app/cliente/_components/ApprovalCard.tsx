"use client";

/**
 * Cartão de uma aprovação pendente (M5-10, RF-30.31, RF-30.33).
 * "Aprovar" pede um segundo passo no próprio cartão (Q-085): depois de aprovar não há volta.
 * "Pedir alterações" exige um comentário (RN-05).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, TriangleAlert } from "lucide-react";
import { respondToApproval } from "@/lib/approvals/actions";
import { requestExtraRound } from "@/lib/design/actions";
import { changesNotice, roundsLabel, type Rounds } from "@/lib/design/rounds";
import { sizeLabel } from "@/lib/design/spec";
import { approvalTitle, type Approval } from "@/lib/approvals/model";
import { kz } from "@/lib/payments/model";
import { longDate } from "@/lib/portal/format";
import { splitRows, type QuoteSnapshot } from "@/lib/quotes/model";

/** "sent": já respondeu; os botões não voltam enquanto a página se atualiza (M7-09: um 2.º clique dava erro). */
type Mode = "idle" | "confirm" | "changes" | "extra" | "sent";

/**
 * `rounds`: só nas provas do Design (M7-03): "Ronda X de Y", aviso da última ronda e revisão extra.
 * `art`: prova do Design = aprovação final da arte para produção (M7-04, TEL-34): aviso de irreversibilidade,
 * os textos-chave do snapshot (RN-42) e a caixa "Confirmo" que ativa o botão (D-071).
 */
export function ApprovalCard({ a, rounds, art = false, bare = false }: { a: Approval; rounds?: Rounds; art?: boolean; bare?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const title = approvalTitle(a);

  async function sendExtra() {
    setBusy(true);
    setMsg(null);
    const r = await requestExtraRound(a.versionLabel ?? "", comment);
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: r.error });
    setMsg({ ok: true, text: r.message });
    setComment("");
    setMode("idle");
    router.refresh();
  }

  async function send(kind: "aprovar" | "pedir_alteracoes") {
    setBusy(true);
    setMsg(null);
    const r = await respondToApproval(a.id, kind, kind === "aprovar" ? "" : comment);
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: r.error });
    setMsg({ ok: true, text: r.message });
    setMode("sent");
    router.refresh();
  }

  // Orçamento e extra aceitam-se; o resto aprova-se (RF-10.21, RF-30.25).
  const accept = a.subject === "orcamento" || a.subject === "extra";
  const isArt = art && a.subject === "prova";
  const verb = accept ? "Aceitar" : isArt ? "Aprovar arte para produção" : "Aprovar";
  const q = a.subject === "orcamento" ? (a.snapshot as QuoteSnapshot) : null;
  // Rondas só nas provas do Design (RN-35, RN-36).
  const r = a.subject === "prova" ? rounds : undefined;
  const noRounds = r !== undefined && r.remaining <= 0;

  return (
    <article className={bare ? "" : "rounded-2xl border border-action/30 bg-action/[0.05] p-5"} aria-label={`${verb} ${title}`}>
      {/* bare (M7-07): dentro do painel de decisão do Design, que já mostra o estado, a ronda e o título. */}
      {!bare && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-ink">{title}</h3>
          {r && <span className="text-xs font-semibold text-ink-dim">{roundsLabel(r)}</span>}
        </div>
      )}
      {a.snapshot.message && <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">{a.snapshot.message}</p>}
      {a.snapshot.items && a.snapshot.items.length > 0 && (
        <ol className="mt-3 space-y-1 rounded-xl border border-line bg-raised/40 p-3 text-[13px] text-ink">
          {a.snapshot.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      )}
      {!bare && a.snapshot.files && a.snapshot.files.length > 0 && (
        <p className="mt-3 text-[13px] text-ink-dim">
          Ficheiros: {a.snapshot.files.join(", ")} · veja-os em <a href="/cliente/entregas" className="underline">Ficheiros</a>
        </p>
      )}

      {q && q.total_kz != null && (
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            // M7-06: no Design, o detalhe design + impressão antes do total (RF-20.21)
            ...splitRows(q.design_kz, q.print_kz, kz),
            ["Total", kz(Number(q.total_kz))],
            [`Sinal${q.deposit_pct ? ` (${q.deposit_pct}%)` : ""}`, q.deposit_kz != null ? kz(Number(q.deposit_kz)) : "—"],
            ["Restante", q.remaining_kz != null ? kz(Number(q.remaining_kz)) : "—"],
            ["Entrega", q.delivery_due_on ? longDate(q.delivery_due_on) : "A combinar"],
            // M7-03: no Design, as rondas de revisão incluídas (RF-20.21)
            ...(q.rounds_included != null ? [["Rondas incluídas", String(q.rounds_included)]] : []),
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-raised/40 p-2.5">
              <dt className="text-xs text-ink-faint">{k}</dt>
              <dd className={`mt-0.5 text-[14px] font-semibold text-ink ${v.endsWith("Kz") ? "whitespace-nowrap" : ""}`}>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {/* RN-13 / RF-30.06: a regra do sinal fica junto ao botão "Aceitar". */}
      {q?.deposit_rule && <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">{q.deposit_rule}</p>}

      {mode === "idle" && (
        // Wireframe TEL-30 A: no painel do Design, os dois botões ocupam a largura no telemóvel.
        <div className={bare ? "mt-4 grid gap-2 sm:flex sm:flex-wrap [&>button]:justify-center" : "mt-4 flex flex-wrap gap-2"}>
          <button type="button" className="btn-violet h-11" onClick={() => setMode("confirm")}>
            {verb}
          </button>
          {noRounds ? (
            <button type="button" className="btn-quiet h-11 py-0" onClick={() => setMode("extra")}>
              Pedir revisão extra
            </button>
          ) : (
            <button type="button" className="btn-quiet h-11 py-0" onClick={() => setMode("changes")}>
              Pedir alterações
            </button>
          )}
        </div>
      )}

      {mode === "confirm" && isArt && (
        <div role="group" aria-label="Aprovar para produção" className="mt-4 space-y-3 rounded-xl border border-line bg-raised/60 p-4">
          <p className="flex items-start gap-2 text-[14px] text-action">
            <TriangleAlert size={16} aria-hidden className="mt-0.5 shrink-0" />
            {a.snapshot.has_print === false
              ? "Depois de aprovar, esta é a arte final e já não pode ser alterada."
              : "Depois de aprovar, a peça vai para impressão e já não pode ser alterada."}
          </p>
          <dl className="divide-y divide-line rounded-xl border border-line text-[14px]">
            {[
              ...(a.snapshot.key_texts ?? []).map((k) => [k.label || "Texto", k.value] as const),
              ...(a.snapshot.event_date ? [["Data do evento", longDate(a.snapshot.event_date)] as const] : []),
              ...(sizeLabel({ widthCm: a.snapshot.width_cm ?? null, heightCm: a.snapshot.height_cm ?? null })
                ? [["Medidas", sizeLabel({ widthCm: a.snapshot.width_cm ?? null, heightCm: a.snapshot.height_cm ?? null })!] as const]
                : []),
              ...(a.snapshot.quantity ? [["Quantidade", a.snapshot.quantity.toLocaleString("pt-PT")] as const] : []),
              ["Versão", a.versionLabel ?? "—"] as const,
            ].map(([k, v], i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 px-3 py-2">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="text-right font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <label className="flex items-start gap-2.5 text-[14px] text-ink">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#a78bfa]" />
            Confirmo que os nomes, a data e a quantidade estão certos
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !checked} className="btn-violet h-11 disabled:opacity-50" onClick={() => send("aprovar")}>
              {busy ? "A enviar…" : "Aprovar para produção"}
            </button>
            <button type="button" disabled={busy} className="btn-quiet h-11 py-0" onClick={() => { setMode("idle"); setChecked(false); }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mode === "confirm" && !isArt && (
        <div role="group" aria-label={accept ? "Confirmar aceite" : "Confirmar aprovação"} className="mt-4 rounded-xl border border-line bg-raised/60 p-4">
          <p className="flex items-start gap-2 text-[14px] text-ink">
            <TriangleAlert size={16} aria-hidden className="mt-0.5 shrink-0 text-action" />
            {accept
              ? "Depois de aceitar não pode voltar atrás. Se precisar de mudar alguma coisa, peça alterações em vez de aceitar."
              : "Depois de aprovar não pode voltar atrás. Se precisar de mudar alguma coisa, fale com o João."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={busy} className="btn-violet h-11" onClick={() => send("aprovar")}>
              {busy ? "A enviar…" : accept ? "Confirmar aceite" : "Confirmar aprovação"}
            </button>
            <button type="button" disabled={busy} className="btn-quiet h-11 py-0" onClick={() => setMode("idle")}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mode === "extra" && r && (
        <div role="group" aria-label="Pedir revisão extra" className="mt-4 space-y-3 rounded-xl border border-line bg-raised/60 p-4">
          <p className="font-display text-base text-ink">
            Já usou {r.included === 1 ? "a revisão incluída" : `as ${r.included} revisões incluídas`}
          </p>
          <p className="text-[14px] leading-relaxed text-ink-dim">
            Pode aprovar a versão atual, ou pedir uma revisão extra. Dizemos-lhe o valor antes de começar e só avançamos se aceitar.
          </p>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">O que quer mudar?</span>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={1500} className="field" placeholder="Ex.: a data está errada: é domingo, 14 de fevereiro" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || comment.trim().length < 5} className="btn-violet h-11 disabled:opacity-50" onClick={sendExtra}>
              {busy ? "A enviar…" : "Pedir revisão extra"}
            </button>
            <button type="button" disabled={busy} className="btn-quiet h-11 py-0" onClick={() => setMode("confirm")}>
              Voltar e aprovar
            </button>
          </div>
        </div>
      )}

      {mode === "changes" && (
        <div className="mt-4 space-y-3">
          {/* TEL-33: avisa que ronda vai gastar e se é a última incluída (RN-35, RN-36). */}
          {r && changesNotice(r) && <p className="text-[13px] leading-relaxed text-ink-dim">{changesNotice(r)}</p>}
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink-dim">O que quer alterar?</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={2000}
              className="field"
              placeholder="Ex.: falta o capítulo da metodologia"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !comment.trim()} className="btn-violet h-11 disabled:opacity-50" onClick={() => send("pedir_alteracoes")}>
              {busy ? "A enviar…" : "Enviar pedido"}
            </button>
            <button type="button" disabled={busy} className="btn-quiet h-11 py-0" onClick={() => setMode("idle")}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "mt-3 flex items-center gap-1.5 text-[13px] text-ok" : "mt-3 text-[13px] text-[#ff8fa3]"}>
          {msg.ok && <Check size={14} aria-hidden />} {msg.text}
        </p>
      )}
    </article>
  );
}
