"use client";

/**
 * Tipo de peça + impressão + ficheiros digitais (M7-01). Ao mudar o tipo, sugere as duas opções
 * (Q-102: logótipo e convite digital sem impressão; convite impresso, lona e camisola com impressão).
 * O admin pode mudá-las à mão; a sugestão só corre quando o tipo muda.
 */
import { useState } from "react";
import { PIECE_DEFAULTS, PIECE_TYPES, type PieceType } from "@/lib/design/spec";
import { Field } from "./forms";
import { inputCls } from "./styles";

export function PieceTypeFields({ type, print, digital }: { type: PieceType; print: boolean; digital: boolean }) {
  const [t, setT] = useState(type);
  const [p, setP] = useState(print);
  const [d, setD] = useState(digital);
  return (
    <>
      <Field label="Tipo de peça">
        <select
          name="tipo"
          value={t}
          onChange={(e) => {
            const v = e.target.value as PieceType;
            setT(v);
            setP(PIECE_DEFAULTS[v].print);
            setD(PIECE_DEFAULTS[v].digital);
          }}
          className={inputCls}
        >
          {Object.entries(PIECE_TYPES).map(([v, l]) => (
            <option key={v} value={v} className="bg-raised">
              {l}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex flex-col justify-end gap-2 pb-1 text-[13px] text-ink-dim">
        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="impressao" value="1" checked={p} onChange={(e) => setP(e.target.checked)} className="h-4 w-4 rounded border-line accent-[#8863e6]" />
          Tem impressão (sem impressão, a fase Produção fica &ldquo;não se aplica&rdquo;)
        </label>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="digitais" value="1" checked={d} onChange={(e) => setD(e.target.checked)} className="h-4 w-4 rounded border-line accent-[#8863e6]" />
          Tem ficheiros digitais a entregar
        </label>
      </div>
    </>
  );
}
