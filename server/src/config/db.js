import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

export const prisma = new PrismaClient()

let connected = false
export function isConnected() {
  return connected
}

export async function connectDB() {
  if (!env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set')
  }
  try {
    await prisma.$connect()
    // Basic ping
    await prisma.$queryRaw`SELECT 1`
    connected = true
    console.log('PostgreSQL connected')
  } catch (err) {
    connected = false
    console.error('PostgreSQL connection error:', err?.message || err)
    throw err
  }
}