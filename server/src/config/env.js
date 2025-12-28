import dotenv from 'dotenv'
dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  // Deprecated: MONGO_URI retained temporarily during migration
  MONGO_URI: process.env.MONGO_URI || process.env.DATABASE_URL || '',
  POSTGRES_URL: process.env.POSTGRES_URL || '',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',
  MAIL_TO: process.env.MAIL_TO || 'fireproductionspvtltd@gmail.com',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT || 0),
  SMTP_SECURE: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || 'Fire Productions Website',
  MAIL_FROM_EMAIL: process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@fireproductions.lk'
}