import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['localhost:3000', 'grantai.su'],
    },
  },
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
