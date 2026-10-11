const nextConfig = {
  distDir: process.env.GOALS_E2E === "1" ? ".next-e2e" : ".next",
  devIndicators: false,
  turbopack: { root: process.cwd() },
  outputFileTracingIncludes: { "/*": ["./src/data/db/migration.sql"] },
  serverExternalPackages: ["better-sqlite3"],
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ] }, { source: "/sw.js", headers: [
      { key: "Cache-Control", value: "no-store, max-age=0" },
      { key: "Service-Worker-Allowed", value: "/" },
    ] }];
  },
};
export default nextConfig;