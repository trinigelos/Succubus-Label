import type { NextConfig } from "next";

// Static export for GitHub Pages: no server, so no next/image optimizer
// and no API routes/middleware. Set NEXT_PUBLIC_BASE_PATH to "/repo-name"
// when the site is served from a GitHub Pages *project* page
// (username.github.io/repo-name) instead of a custom domain or a
// username.github.io repo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
