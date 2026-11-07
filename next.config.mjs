const candongueiroPay = "https://lemosgit.github.io/candongueiro_pay";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
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
