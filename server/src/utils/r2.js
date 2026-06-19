import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucketName = process.env.R2_BUCKET_NAME
const publicUrl = process.env.R2_PUBLIC_URL

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  console.warn('Cloudflare R2 env values are missing')
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

export function createR2Key(originalName = '') {
  const ext = originalName.includes('.')
    ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase()
    : ''

  return `assets/${randomUUID()}${ext}`
}

export async function uploadBufferToR2(file) {
  const key = createR2Key(file.originalname)

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  )

  return {
    key,
    url: publicUrl ? `${publicUrl}/${key}` : key,
  }
}

export async function deleteFromR2(keyOrUrl) {
  if (!keyOrUrl) return

  let key = String(keyOrUrl)

  if (publicUrl && key.startsWith(publicUrl)) {
    key = key.replace(`${publicUrl}/`, '')
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )
}