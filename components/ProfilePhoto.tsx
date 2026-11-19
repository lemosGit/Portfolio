"use client";

import { useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { profile } from "@/lib/data";

/** Partículas em órbita: ângulo inicial, distância à moldura (px), duração (s), cor, tamanho (px). */
const PARTICLES = [
  { a: 0, r: 28, d: 18, c: "#8b6cff", s: 6 },
  { a: 120, r: 44, d: 24, c: "#5fd4e8", s: 4 },
  { a: 240, r: 20, d: 30, c: "#b9a6ff", s: 5 },
  { a: 60, r: 56, d: 36, c: "#5fd4e8", s: 3 },
];

/**
 * Retrato em arco que flutua no espaço: levitação suave, inclinação 3D com
 * paralaxe por camadas, moldura de energia em rotação, reflexo holográfico,
 * marcas HUD e partículas em órbita. Respeita `prefers-reduced-motion`.
 * Se a foto não carregar, mostra um monograma.
 */
export function ProfilePhoto() {
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 110, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), spring);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-11, 11]), spring);
  // a imagem desloca-se no sentido oposto → sensação de profundidade
  const imgX = useSpring(useTransform(mx, [-0.5, 0.5], [10, -10]), spring);
  const imgY = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), spring);
  // o brilho segue o cursor
  const glareX = useTransform(mx, [-0.5, 0.5], [10, 90]);
  const glareY = useTransform(my, [-0.5, 0.5], [10, 90]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(185,166,255,0.28), transparent 45%)`;

  const floatAnim = reduce
    ? undefined
    : { y: [0, -16, -6, -18, 0], rotateZ: [0, 0.8, -0.4, -0.8, 0] };
  const floatTransition = { duration: 9, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div
      className="relative mx-auto w-full max-w-[400px] [perspective:1200px]"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* halo e anéis orbitais */}
      <div aria-hidden className="absolute -inset-16 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(109,76,255,0.38),rgba(95,212,232,0.08)_45%,transparent_68%)] blur-2xl" />
      <div aria-hidden className="absolute -inset-10 animate-spin-slow rounded-full border border-accent/10">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_#8b6cff]" />
      </div>
      <div aria-hidden className="absolute -inset-20 animate-spin-slower rounded-full border border-dashed border-accent/[0.07]" />

      {/* partículas em órbita */}
      {!reduce &&
        PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ inset: -p.r }}
            initial={{ rotate: p.a }}
            animate={{ rotate: p.a + (i % 2 ? -360 : 360) }}
            transition={{ duration: p.d, repeat: Infinity, ease: "linear" }}
          >
            <motion.span
              className="absolute left-1/2 top-0 block -translate-x-1/2 rounded-full"
              style={{
                width: p.s,
                height: p.s,
                background: p.c,
                boxShadow: `0 0 14px ${p.c}`,
              }}
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ))}

      {/* levitação */}
      <motion.div animate={floatAnim} transition={floatTransition} className="relative">
        {/* inclinação 3D */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative"
        >
          {/* moldura de energia em rotação */}
          <div
            aria-hidden
            className="absolute -inset-[2px] overflow-hidden rounded-t-[999px] rounded-b-[30px] opacity-90"
          >
            <div className="absolute -inset-1/2 animate-spin-energy bg-[conic-gradient(from_0deg,transparent_0deg,#8b6cff_60deg,transparent_120deg,transparent_180deg,#5fd4e8_240deg,transparent_300deg)]" />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[28px] bg-surface shadow-[0_0_90px_-10px_rgba(109,76,255,0.6),0_40px_80px_-20px_rgba(0,0,0,0.9)]">
            {failed ? (
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(109,76,255,0.35),transparent_60%)]">
                <span className="select-none bg-gradient-to-b from-white to-accent bg-clip-text font-light text-[7rem] leading-none tracking-tighter text-transparent">
                  JL
                </span>
              </div>
            ) : (
              <motion.div style={{ x: imgX, y: imgY }} className="absolute -inset-3">
                <Image
                  src={profile.photo}
                  alt={`Retrato de ${profile.name}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 85vw, 420px"
                  // sujeito à direita da foto original → enquadra rosto e tronco
                  className="animate-breathe object-cover object-[88%_20%] [transform-origin:68%_30%]"
                  onError={() => setFailed(true)}
                />
              </motion.div>
            )}

            {/* integração com o ambiente: tinta violeta, fade inferior, scan e reflexos */}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(109,76,255,0.12),transparent_40%,rgba(8,6,15,0.7)_100%)] mix-blend-screen" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(8,6,15,0.85))]" />
            <div aria-hidden className="absolute inset-x-0 top-0 h-1/4 animate-scan bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
            <div aria-hidden className="absolute inset-0 animate-sheen bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.12)_48%,rgba(95,212,232,0.1)_52%,transparent_65%)] bg-[length:250%_100%] mix-blend-screen" />
            <motion.div aria-hidden style={{ background: glare }} className="absolute inset-0 mix-blend-screen" />
            <div aria-hidden className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />

            {/* marcas HUD */}
            <span aria-hidden className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-aqua/60" />
            <span aria-hidden className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-aqua/60" />
            <p aria-hidden className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.3em] text-ink-dim">
              <span className="h-1 w-1 animate-pulse rounded-full bg-ok shadow-[0_0_6px_#3ddc97]" />
              online
            </p>
          </div>

          {/* etiqueta glass com profundidade própria */}
          <div
            className="glass absolute -bottom-3 -right-2 px-4 py-3 sm:-right-6"
            style={{ transform: "translateZ(60px)" }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint">Baseado em</p>
            <p className="mt-1 flex items-center gap-2 text-[13px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#8b6cff]" />
              {profile.location}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* sombra no "chão" que respira com a levitação */}
      <motion.div
        aria-hidden
        className="mx-auto mt-8 h-4 w-3/5 rounded-[50%] bg-accent-deep/40 blur-xl"
        animate={reduce ? undefined : { scaleX: [1, 0.82, 0.92, 0.8, 1], opacity: [0.7, 0.4, 0.55, 0.35, 0.7] }}
        transition={floatTransition}
      />

      <p aria-hidden className="absolute -right-2 -top-4 hidden font-mono text-[9px] tracking-[0.2em] text-ink-faint sm:block">
        {profile.coords}
      </p>
    </div>
  );
}
