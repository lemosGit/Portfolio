import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { profile } from "@/lib/data";

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description:
    "Engenheiro de sistemas e programador focado em criar soluções digitais robustas, escaláveis e pensadas para o mundo real.",
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description: "Construo sistemas que transformam ideias em impacto.",
    type: "website",
    locale: "pt_PT",
  },
};

export const viewport: Viewport = {
  themeColor: "#03060b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <a
          href="#conteudo"
          className="sr-only z-[100] bg-accent px-4 py-2 font-mono text-xs text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar para o conteúdo
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
