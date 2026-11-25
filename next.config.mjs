const candongueiroPay = "https://lemosgit.github.io/candongueiro_pay";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // O teste do fluxo com o Supabase local (M9-02) tem o seu próprio build, para não pisar o do E2E de demonstração.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Páginas já visitadas reabrem logo a partir da cache do browser durante 30 s.
    // As ações (enviar mensagem, editar projeto…) chamam revalidatePath e limpam-na.
    staleTimes: { dynamic: 30, static: 180 },
    // Importa só os ícones usados, em vez da biblioteca inteira.
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // A imagem de capa do projeto (até 5 MB) segue numa Server Action.
    serverActions: { bodySizeLimit: "6mb" },
  },
  // O Candongueiro Pay está no GitHub Pages. As páginas levam barra final, para
  // o Pages não redirecionar o visitante para fora deste domínio.
  async rewrites() {
    return [
      { source: "/candongueiro_pay", destination: `${candongueiroPay}/` },
      { source: "/candongueiro_pay/:file(.*\\.[^/]+)", destination: `${candongueiroPay}/:file` },
      { source: "/candongueiro_pay/:path*", destination: `${candongueiroPay}/:path*/` },
    ];
  },
};

export default nextConfig;
