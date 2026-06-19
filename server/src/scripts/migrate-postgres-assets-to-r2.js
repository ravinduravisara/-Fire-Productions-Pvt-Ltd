import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucketName = process.env.R2_BUCKET_NAME
const publicUrl = process.env.R2_PUBLIC_URL

const BATCH_SIZE = 10

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
  console.error('Missing R2 env values. Check environment variables.')
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
  const total = await prisma.imageAsset.count()

  console.log(`Found ${total} PostgreSQL assets`)
  console.log(`Uploading in batches of ${BATCH_SIZE}`)

  let uploaded = 0
  let skipped = 0
  let cursor = undefined

  while (true) {
    const assets = await prisma.imageAsset.findMany({
      take: BATCH_SIZE,
      ...(cursor
        ? {
            skip: 1,
            cursor: {
              id: cursor,
            },
          }
        : {}),
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        filename: true,
        contentType: true,
        size: true,
        data: true,
      },
    })

    if (!assets.length) break

    for (const asset of assets) {
      cursor = asset.id

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
      console.log(`Uploaded ${uploaded}/${total}: ${key}`)
    }
  }

  console.log(`Upload complete. Uploaded: ${uploaded}, skipped: ${skipped}`)
}

async function updateWorkImageUrls() {
  const works = await prisma.work.findMany({
    select: {
      id: true,
      title: true,
      imageUrl: true,
      imageUrls: true,
    },
  })

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
    console.log(`Updated work ${updated}: ${work.title || work.id}`)
  }

  console.log(`Work update complete. Updated works: ${updated}`)
}

async function main() {
  console.log('Migration started')
  console.log('R2 bucket:', bucketName)
  console.log('R2 public URL:', publicUrl)

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