/**
 * Retenção dos ficheiros (#122, RN-08, D-025, Q-091). Funções puras.
 * A data de limpeza vem da BD (`files_purge_on`, 0008): conclusão + 90 dias, ou o adiamento se for maior.
 */

/** Aviso ao admin a partir de 7 dias antes (RN-08). */
export const WARN_DAYS = 7;
/** Cada "Adiar" acrescenta 30 dias (Q-091). */
export const POSTPONE_DAYS = 30;

const DAY = 86_400_000;
const utc = (d: string) => Date.parse(`${d}T00:00:00Z`);
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Dias de `today` até `purgeOn` (negativo = já passou). Datas AAAA-MM-DD. */
export const daysUntil = (purgeOn: string, today: string) => Math.round((utc(purgeOn) - utc(today)) / DAY);

export type RetentionProject = { id: string; purgeOn: string | null; hasFiles: boolean };

/** O que a limpeza diária faz a cada projeto: avisar (≤ 7 dias), apagar (data chegou) ou nada. */
export function classify<T extends RetentionProject>(list: T[], today: string) {
  const warn: (T & { days: number })[] = [];
  const purge: T[] = [];
  for (const p of list) {
    if (!p.purgeOn || !p.hasFiles) continue;
    const days = daysUntil(p.purgeOn, today);
    if (days <= 0) purge.push(p);
    else if (days <= WARN_DAYS) warn.push({ ...p, days });
  }
  return { warn, purge };
}

/** Novo `files_keep_until` ao adiar: 30 dias depois da data atual de limpeza (ou de hoje, se já passou). */
export function postponeTo(purgeOn: string, today: string): string {
  return fmt(Math.max(utc(purgeOn), utc(today)) + POSTPONE_DAYS * DAY);
}

/** Objetos com mais de 24 h sem linha em `files` são órfãos (upload não confirmado, ADR-003 §2). */
export const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000;
export const isOrphan = (o: { path: string; createdAt: string }, known: Set<string>, now = Date.now()) =>
  !known.has(o.path) && now - Date.parse(o.createdAt) > ORPHAN_AGE_MS;
