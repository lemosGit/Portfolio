"use client";

import { useState } from "react";
import { SERVICE_TYPES } from "@/lib/admin/project-form";
import type { ServiceType } from "@/lib/portal/types";
import { cn } from "@/lib/utils";
import { Field } from "./forms";
import { inputCls } from "./styles";

/**
 * Tipo de serviço ao criar um projeto (RF-30.01, obrigatório) e o repositório GitHub,
 * que só aparece no Desenvolvimento (RF-30.02).
 */
export function ServicePicker({ defaultRepo }: { defaultRepo?: string }) {
  const [service, setService] = useState<ServiceType | null>(null);
  return (
    <>
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 block text-[13px] font-medium text-ink-dim">Tipo de serviço</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {SERVICE_TYPES.map((s) => (
            <label
              key={s.value}
              data-service={s.value}
              className={cn(
                "cursor-pointer rounded-xl border p-3 transition-colors",
                service === s.value ? "border-accent bg-[var(--m-tint)]" : "border-line hover:border-white/15",
              )}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="servico"
                  value={s.value}
                  required
                  checked={service === s.value}
                  onChange={() => setService(s.value)}
                  className="accent-[rgb(var(--c-accent))]"
                />
                <span className="text-sm font-semibold text-ink">{s.label}</span>
              </span>
              <span className="mt-1 block text-xs text-ink-faint">{s.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {service === "development" && (
        <Field label="Repositório GitHub" hint="dono/repositorio — de onde vêm as fases e tarefas." className="sm:col-span-2">
          <input name="repo" defaultValue={defaultRepo} className={inputCls} placeholder="lemosGit/nova-app" spellCheck={false} />
        </Field>
      )}
    </>
  );
}
