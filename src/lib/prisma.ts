import { PrismaClient } from '@prisma/client';

// Evitar múltiples instancias en desarrollo (hot reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn']
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
