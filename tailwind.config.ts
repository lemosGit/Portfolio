import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#03060b",
        surface: "#0a1220",
        ink: { DEFAULT: "#eef3fa", dim: "#9aa6b6", faint: "#5d6a7c" },
        accent: { DEFAULT: "#4db8ff", deep: "#2b7fff" },
      },
      fontFamily: {
        sans: ['"Manrope Variable"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "monospace"],
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
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "spin-slow": "spinSlow 60s linear infinite",
        "spin-slower": "spinSlow 120s linear infinite reverse",
        "pulse-glow": "pulseGlow 3.2s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
        scan: "scan 7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
