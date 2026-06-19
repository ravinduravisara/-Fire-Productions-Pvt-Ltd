import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucketName = process.env.R2_BUCKET_NAME
const publicUrl = process.env.R2_PUBLIC_URL

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
  console.error('Missing R2 env values. Check server/.env')
  process.exit(1)
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

function cleanPublicUrl() {
  return publicUrl.replace(/\/$/, '')
}

function getR2Key(assetId) {
  return `assets/${assetId}`
}

function getR2Url(assetId) {
  return `${cleanPublicUrl()}/${getR2Key(assetId)}`
}

function extractAssetId(value) {
  if (!value) return ''

  const text = String(value).trim()

  if (!text.startsWith('/api/assets/')) return ''

  return text.split('/').filter(Boolean).pop()
}

function convertUrl(value) {
  if (!value) return value

  const text = String(value).trim()

  if (text.startsWith('http://') || text.startsWith('https://')) {
    return text
  }

  const assetId = extractAssetId(text)

  if (!assetId) return value

  return getR2Url(assetId)
}

async function uploadAssetsToR2() {
  const assets = await prisma.imageAsset.findMany({
    select: {
      id: true,
      filename: true,
      contentType: true,
      size: true,
      data: true,
    },
  })

  console.log(`Found ${assets.length} PostgreSQL assets`)

  let uploaded = 0
  let skipped = 0

  for (const asset of assets) {
    if (!asset.data) {
      skipped += 1
      console.log(`Skipped ${asset.id} - no data`)
      continue
    }

    const key = getR2Key(asset.id)

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: Buffer.from(asset.data),
        ContentType: asset.contentType || 'application/octet-stream',
        Metadata: {
          oldId: asset.id,
          filename: asset.filename || '',
        },
      })
    )

    uploaded += 1
    console.log(`Uploaded ${uploaded}/${assets.length}: ${key}`)
  }

  console.log(`Upload complete. Uploaded: ${uploaded}, skipped: ${skipped}`)
}

async function updateWorkImageUrls() {
  const works = await prisma.work.findMany()

  console.log(`Found ${works.length} works`)

  let updated = 0

  for (const work of works) {
    const nextImageUrl = convertUrl(work.imageUrl)

    const nextImageUrls = Array.isArray(work.imageUrls)
      ? work.imageUrls.map(convertUrl)
      : []

    const changed =
      nextImageUrl !== work.imageUrl ||
      JSON.stringify(nextImageUrls) !== JSON.stringify(work.imageUrls || [])

    if (!changed) continue

    await prisma.work.update({
      where: {
        id: work.id,
      },
      data: {
        imageUrl: nextImageUrl,
        imageUrls: nextImageUrls,
      },
    })

    updated += 1
    console.log(`Updated work: ${work.title || work.id}`)
  }

  console.log(`Work update complete. Updated works: ${updated}`)
}

async function main() {
  await uploadAssetsToR2()
  await updateWorkImageUrls()

  console.log('Migration complete')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })