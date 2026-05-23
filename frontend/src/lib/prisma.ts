import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        // Add connection pool parameters to the URL at runtime
        // This reduces cold-start latency by reusing connections
        url: (() => {
          const url = process.env.DATABASE_URL || '';
          if (!url || url.includes('connection_limit')) return url;
          const separator = url.includes('?') ? '&' : '?';
          return `${url}${separator}connection_limit=10&pool_timeout=20`;
        })(),
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
