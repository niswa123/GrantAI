import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow Server Actions to run for up to 120 seconds (LLM pipeline is slow)
    serverActionsBodySizeLimit: '10mb',
  },
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
