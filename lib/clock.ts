/**
 * Relógio do portal. Em produção é a hora real.
 * Nos testes (Playwright, Vitest), PORTAL_FIXED_NOW fixa o instante para os dados de
 * demonstração e as datas relativas não mudarem de um dia para o outro (capturas de referência).
 */
export function now(): Date {
  const fixed = process.env.PORTAL_FIXED_NOW;
  return fixed ? new Date(fixed) : new Date();
}

export const nowMs = () => now().getTime();
