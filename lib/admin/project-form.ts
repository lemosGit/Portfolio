/**
 * Leitura e validação dos campos de projeto do admin (criar e editar).
 * Funções puras (sem Supabase), para testar com o Vitest.
 */
import type { ServiceType } from "@/lib/portal/types";

export const SERVICE_TYPES: { value: ServiceType; label: string; hint: string }[] = [
  { value: "development", label: "Desenvolvimento", hint: "Sites, sistemas e apps. As fases vêm do GitHub." },
  { value: "academic", label: "Académico", hint: "Trabalhos e monografias. 7 fases geridas aqui." },
  { value: "design", label: "Design", hint: "Logótipos, convites, lonas, camisolas. 7 fases geridas aqui." },
];

export type ProjectFields = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  github_owner: string | null;
  github_repo: string | null;
  started_on: string | null;
  due_on: string | null;
};

export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const opt = (f: FormData, k: string) => str(f, k) || null;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const REPO = /^[\w.-]+\/[\w.-]+$/;

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function parseRepo(raw: string): { owner: string | null; repo: string | null } | { error: string } {
  const v = raw.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "");
  if (!v) return { owner: null, repo: null };
  if (!REPO.test(v)) return { error: "Repositório inválido. Use o formato dono/repositorio (ex.: lemosGit/candongueiro_pay)." };
  const [owner, repo] = v.split("/");
  return { owner, repo };
}

/** Tipo de serviço escolhido ao criar (obrigatório, RF-30.01). */
export function readServiceType(f: FormData): ServiceType | { error: string } {
  const v = str(f, "servico");
  if (v === "development" || v === "academic" || v === "design") return v;
  return { error: "Escolha o tipo de serviço do projeto." };
}

/**
 * Campos do projeto. O repositório GitHub só conta no Desenvolvimento (RF-30.02); nos outros
 * serviços fica sempre vazio, mesmo que o pedido traga um (a BD também o recusa, check da 0006).
 */
export function readProject(f: FormData, serviceType: ServiceType, nameKey = "projeto"): ProjectFields | { error: string } {
  const name = str(f, nameKey);
  if (name.length < 2) return { error: "Indique o nome do projeto." };
  const slug = slugify(str(f, "slug") || name);
  if (!slug) return { error: "O identificador (slug) do projeto ficou vazio. Escreva um nome com letras ou números." };
  let repo: { owner: string | null; repo: string | null } = { owner: null, repo: null };
  if (serviceType === "development") {
    const parsed = parseRepo(str(f, "repo"));
    if ("error" in parsed) return parsed;
    repo = parsed;
  }
  const started = opt(f, "inicio");
  const due = opt(f, "entrega");
  if ((started && !DATE.test(started)) || (due && !DATE.test(due))) return { error: "Datas inválidas." };
  if (started && due && due < started) return { error: "A data de entrega é anterior à data de início." };
  return {
    name,
    slug,
    tagline: opt(f, "resumo"),
    description: opt(f, "descricao"),
    github_owner: repo.owner,
    github_repo: repo.repo,
    started_on: started,
    due_on: due,
  };
}
