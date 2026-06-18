import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

export const prisma = new PrismaClient()

let connected = false

export function isConnected() {
  return connected
}

export async function connectDB() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  try {
    await prisma.$connect()

    connected = true
    console.log('MongoDB connected')
  } catch (err) {
    connected = false
    console.error('MongoDB connection error:', err?.message || err)
    throw err
  }
}