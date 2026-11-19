import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08060f",
        surface: "#110d1f",
        ink: { DEFAULT: "#efedf8", dim: "#a6a2bd", faint: "#6f6a8c" },
        accent: { DEFAULT: "#8b6cff", deep: "#6d4cff", soft: "#b9a6ff" },
        aqua: "#5fd4e8",
        ok: "#3ddc97",
        line: "rgba(167, 139, 250, 0.12)",
      },
      fontFamily: {
        sans: ['"Manrope Variable"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk Variable"', '"Manrope Variable"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        // curva "ease-out" forte: resposta imediata, final suave
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        pulseGlow: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        marquee: { to: { transform: "translateX(-50%)" } },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1.06)" },
          "50%": { transform: "scale(1.12)" },
        },
        sheen: {
          "0%,60%": { backgroundPosition: "150% 0" },
          "100%": { backgroundPosition: "-50% 0" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "spin-slow": "spinSlow 60s linear infinite",
        "spin-slower": "spinSlow 120s linear infinite reverse",
        "pulse-glow": "pulseGlow 3.2s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
        scan: "scan 7s linear infinite",
        breathe: "breathe 14s ease-in-out infinite",
        sheen: "sheen 8s ease-in-out infinite",
        "spin-energy": "spinSlow 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
