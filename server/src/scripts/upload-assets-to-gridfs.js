import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { MongoClient, GridFSBucket } from 'mongodb'

dotenv.config()

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI
const DB_NAME = process.env.MONGO_DB_NAME || 'firedb'

const ASSETS_DIR = path.resolve(process.cwd(), 'uploads/assets')

function detectContentType(filePath) {
  const buffer = fs.readFileSync(filePath)

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png'
  }

  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    return 'image/webp'
  }

  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif'
  }

  return 'application/octet-stream'
}

async function uploadOne(bucket, filePath, assetId) {
  const contentType = detectContentType(filePath)

  const existing = await bucket
    .find({
      $or: [
        { filename: assetId },
        { 'metadata.oldId': assetId },
      ],
    })
    .toArray()

  for (const file of existing) {
    await bucket.delete(file._id)
  }

  await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(assetId, {
      contentType,
      metadata: {
        oldId: assetId,
        originalPath: `/api/assets/${assetId}`,
        contentType,
      },
    })

    fs.createReadStream(filePath)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', resolve)
  })

  console.log(`Uploaded ${assetId}`)
}

async function main() {
  if (!MONGO_URI) {
    throw new Error('DATABASE_URL or MONGO_URI is not set')
  }

  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`Assets folder not found: ${ASSETS_DIR}`)
  }

  const files = fs
    .readdirSync(ASSETS_DIR)
    .filter((name) => /^[a-zA-Z0-9-]+$/.test(name))

  console.log(`Found ${files.length} asset files`)

  const client = new MongoClient(MONGO_URI)
  await client.connect()

  const db = client.db(DB_NAME)
  const bucket = new GridFSBucket(db, {
    bucketName: 'imageassets',
  })

  for (const fileName of files) {
    const filePath = path.join(ASSETS_DIR, fileName)

    if (!fs.statSync(filePath).isFile()) continue

    await uploadOne(bucket, filePath, fileName)
  }

  await client.close()

  console.log('All assets uploaded to MongoDB GridFS')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})