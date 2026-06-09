import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export function hasDatabaseUrl() {
  return process.env.MEDTAX_USE_DATABASE === "true" && Boolean(process.env.DATABASE_URL)
}
