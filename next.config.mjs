const candongueiroPay = "https://lemosgit.github.io/candongueiro_pay";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Páginas já visitadas reabrem logo a partir da cache do browser durante 30 s.
    // As ações (enviar mensagem, editar projeto…) chamam revalidatePath e limpam-na.
    staleTimes: { dynamic: 30, static: 180 },
    // Importa só os ícones usados, em vez da biblioteca inteira.
    optimizePackageImports: ["lucide-react", "framer-motion"],
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
