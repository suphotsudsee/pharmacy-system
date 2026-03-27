import { PrismaClient } from '../generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ใช้ DATABASE_URL จาก environment variable (ปลอดภัยกว่า hard-coded)
// รองรับทั้ง SQLite (file:./dev.db) และ LibSQL
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

const adapter = new PrismaLibSql({
  url: databaseUrl
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma