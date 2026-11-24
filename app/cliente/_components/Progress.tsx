"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Anel de progresso: o único momento animado ao abrir a visão geral. */
export function ProgressRing({ percent, size = 148 }: { percent: number; size?: number }) {
  const reduce = useReducedMotion();
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}% do projeto concluído`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "rgb(var(--c-accent))" }} />
            <stop offset="100%" style={{ stopColor: "rgb(var(--c-accent-soft))" }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: reduce ? c * (1 - percent / 100) : c }}
            animate={{ strokeDashoffset: c * (1 - percent / 100) }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
          />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p
            className="font-display font-semibold leading-none tracking-tight text-ink"
            style={{ fontSize: Math.round(size * 0.24) }}
          >
            {percent}
            <span className="ml-0.5 text-[0.45em] text-ink-dim">%</span>
          </p>
          <p className="mt-1.5 text-xs text-ink-faint">Concluído</p>
        </div>
      </div>
    </div>
  );
}

/** Tarefas concluídas por dia, últimos 7 dias. O dia com mais entregas fica destacado. */
export function WeekBars({ data }: { data: { day: string; closed: number }[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.closed));
  const peak = data.findIndex((d) => d.closed === max);

  return (
    <ul className="flex h-11 items-end gap-2.5" aria-label="Tarefas concluídas nos últimos 7 dias">
      {data.map((d, i) => {
        const h = 10 + (d.closed / max) * 42;
        const isPeak = i === peak && d.closed > 0;
        return (
          <li key={i} className="group relative flex-1" title={`${d.day}: ${d.closed} ${d.closed === 1 ? "tarefa" : "tarefas"}`}>
            <span className="sr-only">
              {d.day}: {d.closed} {d.closed === 1 ? "tarefa concluída" : "tarefas concluídas"}
            </span>
            <motion.span
              aria-hidden
              className="block w-full origin-bottom rounded-t-[4px]"
              style={{
                height: h,
                background: isPeak ? "linear-gradient(180deg, rgb(var(--c-accent-soft)), rgb(var(--c-accent)))" : "rgb(var(--c-accent) / 0.22)",
              }}
              initial={{ scaleY: reduce ? 1 : 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.35 + i * 0.04 }}
            />
          </li>
        );
      })}
    </ul>
  );
}
