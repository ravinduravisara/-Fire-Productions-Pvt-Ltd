import { Router } from 'express'
import mongoose from 'mongoose'
import { getImageAssetModel } from '../models/ImageAsset.js'

const router = Router()

// GET /api/assets/:id -> stream image from MongoDB
router.get('/:id', async (req, res) => {
  const id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid asset id' })
  }
  const ImageAsset = getImageAssetModel()
  const asset = await ImageAsset.findById(id)
  if (!asset) return res.status(404).json({ message: 'Not found' })
  res.setHeader('Content-Type', asset.contentType)
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.send(asset.data)
})

export default router
