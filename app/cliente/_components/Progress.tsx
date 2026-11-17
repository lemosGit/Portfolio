"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Anel de progresso: o único momento animado ao abrir a visão geral. */
export function ProgressRing({ percent, size = 148 }: { percent: number; size?: number }) {
  const reduce = useReducedMotion();
  const stroke = 9;
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
            <stop offset="0%" stopColor="#5f3dff" />
            <stop offset="100%" stopColor="#b59cff" />
          </linearGradient>
          <filter id="ring-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {[{ filter: "url(#ring-glow)", opacity: 0.55 }, { filter: undefined, opacity: 1 }].map((layer, i) => (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            filter={layer.filter}
            opacity={layer.opacity}
            initial={{ strokeDashoffset: reduce ? c * (1 - percent / 100) : c }}
            animate={{ strokeDashoffset: c * (1 - percent / 100) }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-[34px] font-semibold leading-none tracking-tight text-ink">
            {percent}
            <span className="ml-0.5 text-base text-ink-dim">%</span>
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">Concluído</p>
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
    <ul className="flex h-[52px] items-end gap-2.5" aria-label="Tarefas concluídas nos últimos 7 dias">
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
                background: isPeak
                  ? "linear-gradient(180deg, #9d82ff, #6d4cff)"
                  : "linear-gradient(180deg, rgba(139,108,255,0.38), rgba(139,108,255,0.16))",
                boxShadow: isPeak ? "0 0 22px -2px rgba(139,108,255,0.7)" : undefined,
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
