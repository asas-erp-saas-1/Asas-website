import { PrismaClient } from '@/generated/prisma-postgres'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getRuntimeDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return raw

  // Vercel runs this Prisma client in serverless workers. The production
  // DATABASE_URL uses Supabase's transaction pooler, where PostgreSQL
  // prepared statements are not supported. Prisma documents `pgbouncer=true`
  // as the compatibility switch that disables prepared statements.
  try {
    const url = new URL(raw)
    if (!url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true')
    }
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '1')
    }
    return url.toString()
  } catch {
    const separator = raw.includes('?') ? '&' : '?'
    return `${raw}${separator}pgbouncer=true&connection_limit=1`
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getRuntimeDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
