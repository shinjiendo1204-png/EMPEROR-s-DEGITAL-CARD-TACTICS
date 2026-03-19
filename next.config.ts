import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,   // ← これ重要
  },

  assetPrefix: "./",     // ← これ最重要
}

export default nextConfig