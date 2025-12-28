import { Router } from 'express'
import { prisma } from '../config/db.js'

const router = Router()

// GET /api/assets/:id -> stream image from MongoDB
router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const asset = await prisma.imageAsset.findUnique({ where: { id } })
    if (!asset) return res.status(404).json({ message: 'Not found' })
    res.setHeader('Content-Type', asset.contentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(Buffer.from(asset.data))
  } catch (err) {
    return res.status(400).json({ message: 'Invalid asset id' })
  }
})

export default router
