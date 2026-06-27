import { PrismaClient } from '@prisma/client';

// Prisma Client 单例模式
// 避免在开发环境中创建多个 Prisma Client 实例

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
