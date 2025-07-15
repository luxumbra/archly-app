import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['gsap'],
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
