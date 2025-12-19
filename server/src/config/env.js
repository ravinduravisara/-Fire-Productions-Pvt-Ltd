import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || process.env.DATABASE_URL || '',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || ''
}