import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['localhost:3000', 'grantai.su'],
    },
  },
  // Increase timeout for long-running API routes (AI pipeline)
  httpAgentOptions: {
    keepAlive: true,
  },
  serverExternalPackages: ['@prisma/client'],
  async headers() {
    return [
      // Static assets with content hashes — cache forever
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // HTML pages — never cache, always fetch fresh
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
