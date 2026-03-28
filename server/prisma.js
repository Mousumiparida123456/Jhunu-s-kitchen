import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

if (!globalForPrisma.__jhunuPrisma) {
  globalForPrisma.__jhunuPrisma = new PrismaClient();
}

export const prisma = globalForPrisma.__jhunuPrisma;

