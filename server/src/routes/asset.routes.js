import { Router } from 'express'
import { GridFSBucket, MongoClient } from 'mongodb'

const router = Router()

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI
const DB_NAME = process.env.MONGO_DB_NAME || 'firedb'

let client = null
let bucket = null

function safeAssetId(value) {
  const id = String(value || '').trim()

  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return ''
  }

  return id
}

async function getBucket() {
  if (bucket) return bucket

  if (!MONGO_URI) {
    throw new Error('DATABASE_URL or MONGO_URI is not set')
  }

  client = new MongoClient(MONGO_URI)
  await client.connect()

  const db = client.db(DB_NAME)

  bucket = new GridFSBucket(db, {
    bucketName: 'imageassets',
  })

  return bucket
}

router.get('/:id', async (req, res) => {
  const oldId = safeAssetId(req.params.id)

  if (!oldId) {
    return res.status(400).json({ message: 'Invalid asset id' })
  }

  try {
    const imageBucket = await getBucket()

    const files = await imageBucket
      .find({
        $or: [
          { filename: oldId },
          { 'metadata.oldId': oldId },
        ],
      })
      .limit(1)
      .toArray()

    const file = files[0]

    if (!file) {
      return res.status(404).json({
        message: 'Asset not found in MongoDB GridFS',
        oldId,
      })
    }

    const contentType =
      file.contentType ||
      file.metadata?.contentType ||
      'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'no-store')

    const downloadStream = imageBucket.openDownloadStream(file._id)

    downloadStream.on('error', (err) => {
      console.error('GridFS stream error:', err)

      if (!res.headersSent) {
        return res.status(500).json({
          message: 'Failed to stream asset',
          error: err?.message || String(err),
        })
      }

      return res.end()
    })

    return downloadStream.pipe(res)
  } catch (err) {
    console.error('Asset fetch error:', err)

    return res.status(500).json({
      message: 'Failed to load asset',
      error: err?.message || String(err),
    })
  }
})

export default router