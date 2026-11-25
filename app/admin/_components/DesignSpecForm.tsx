/**
 * Formulário da ficha técnica da peça (M7-01, RF-20.10, RF-20.11). Server Component: as classes vêm de
 * styles.ts (D-148); só o tipo de peça, com a sugestão da impressão, é um componente de cliente.
 */
import { saveDesignSpec } from "@/lib/admin/actions";
import { MAX_KEY_TEXTS, PIECE_DEFAULTS, keyTextsToLines, type DesignSpec } from "@/lib/design/spec";
import { ActionForm, Field } from "./forms";
import { PieceTypeFields } from "./PieceTypeFields";
import { inputCls, textareaCls } from "./styles";

export function DesignSpecForm({ projectId, spec }: { projectId: string; spec: DesignSpec | null }) {
  const type = spec?.pieceType ?? "convite_impresso";
  return (
    <ActionForm action={saveDesignSpec} submit={spec ? "Guardar ficha técnica" : "Criar ficha técnica"}>
      <input type="hidden" name="projeto" value={projectId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PieceTypeFields type={type} print={spec?.hasPrint ?? PIECE_DEFAULTS[type].print} digital={spec?.hasDigitalFiles ?? PIECE_DEFAULTS[type].digital} />
        <Field label="Descrição curta (opcional)" className="sm:col-span-2">
          <input name="descricao" maxLength={120} defaultValue={spec?.pieceLabel ?? ""} className={inputCls} placeholder="Ex.: Convite do casamento, dobrado, com envelope" />
        </Field>
        <Field label="Largura (cm)">
          <input name="largura" inputMode="decimal" defaultValue={spec?.widthCm ?? ""} className={inputCls} placeholder="14,8" />
        </Field>
        <Field label="Altura (cm)">
          <input name="altura" inputMode="decimal" defaultValue={spec?.heightCm ?? ""} className={inputCls} placeholder="21" />
        </Field>
        <Field label="Notas das medidas (opcional)" hint="Ex.: tamanhos das camisolas — 10 M, 8 L." className="sm:col-span-2">
          <input name="tamanhos" maxLength={300} defaultValue={spec?.sizeNotes ?? ""} className={inputCls} />
        </Field>
        <Field label="Material (opcional)">
          <input name="material" maxLength={120} defaultValue={spec?.material ?? ""} className={inputCls} placeholder="Ex.: Papel couché 300 g" />
        </Field>
        <Field label="Acabamento (opcional)">
          <input name="acabamento" maxLength={120} defaultValue={spec?.finish ?? ""} className={inputCls} placeholder="Ex.: Laminação mate" />
        </Field>
        <Field label="Quantidade">
          <input name="quantidade" type="number" min={1} defaultValue={spec?.quantity ?? 1} className={inputCls} />
        </Field>
        <Field label="Data do evento (opcional)" hint="Aparece no topo do portal do cliente.">
          <input name="evento" type="date" defaultValue={spec?.eventDate ?? ""} className={inputCls} />
        </Field>
        <Field label="Textos a incluir" hint={`Um por linha, “Rótulo: texto”. Até ${MAX_KEY_TEXTS}. Ex.: Noivos: Ana & Paulo`} className="sm:col-span-2">
          <textarea name="textos" rows={5} defaultValue={spec ? keyTextsToLines(spec.keyTexts) : ""} className={textareaCls} />
        </Field>
      </div>
    </ActionForm>
  );
}
