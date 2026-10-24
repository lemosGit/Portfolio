"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { profile } from "@/lib/data";

/**
 * Retrato em arco com halo luminoso, inclinação 3D subtil e etiqueta glass.
 * Se /public/foto.jpg não existir, mostra um monograma até a foto ser adicionada.
 */
export function ProfilePhoto() {
  const [failed, setFailed] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 18 });

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
      <div aria-hidden className="absolute -inset-16 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(43,127,255,0.35),transparent_65%)] blur-2xl" />
      <div aria-hidden className="absolute -inset-10 animate-spin-slow rounded-full border border-accent/10">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_#4db8ff]" />
      </div>
      <div aria-hidden className="absolute -inset-20 animate-spin-slower rounded-full border border-dashed border-accent/[0.07]" />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[28px] border border-accent/30 bg-surface shadow-[0_0_80px_-10px_rgba(43,127,255,0.55),0_40px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        {failed ? (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(43,127,255,0.35),transparent_60%)]">
            <span className="select-none bg-gradient-to-b from-white to-accent bg-clip-text font-light text-[7rem] leading-none tracking-tighter text-transparent">
              JL
            </span>
          </div>
        ) : (
          <Image
            src={profile.photo}
            alt={`Retrato de ${profile.name}`}
            fill
            priority
            sizes="(max-width: 1024px) 80vw, 400px"
            className="object-cover object-top"
            onError={() => setFailed(true)}
          />
        )}
        {/* integração com o ambiente: tinta azul, fade inferior e linha de scan */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,127,255,0.14),transparent_40%,rgba(3,6,11,0.8)_100%)] mix-blend-screen" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(3,6,11,0.85))]" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-1/4 animate-scan bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
      </motion.div>

      <div className="glass absolute -bottom-3 -right-2 animate-float px-4 py-3 sm:-right-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-faint">Baseado em</p>
        <p className="mt-1 flex items-center gap-2 text-[13px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#4db8ff]" />
          {profile.location}
        </p>
      </div>

      <p aria-hidden className="absolute -right-2 -top-4 hidden font-mono text-[9px] tracking-[0.2em] text-ink-faint sm:block">
        {profile.coords}
      </p>
    </div>
  );
}
