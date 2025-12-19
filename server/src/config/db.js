import mongoose from 'mongoose'
import { env } from './env.js'

let connected = false
export function isConnected() {
  return connected
}

export async function connectDB() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is not set')
  }
  const uri = env.MONGO_URI
  await mongoose.connect(uri, {
    // useNewUrlParser/useUnifiedTopology are defaults in Mongoose v6+
  })
  connected = true
  console.log('MongoDB connected')
}