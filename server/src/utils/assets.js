import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { getImageAssetModel } from '../models/ImageAsset.js'

export function extractAssetIdFromUrl(url) {
  if (typeof url !== 'string') return null
  const m = url.match(/\/api\/assets\/([a-fA-F0-9]{24})(?:$|[/?#])/)
  return m ? m[1] : null
}

export async function deleteAssetByUrl(url) {
  if (!url || typeof url !== 'string') return false
  // Try DB-backed asset first
  const assetId = extractAssetIdFromUrl(url)
  if (assetId && mongoose.Types.ObjectId.isValid(assetId)) {
    const ImageAsset = getImageAssetModel()
    const res = await ImageAsset.findByIdAndDelete(assetId)
    return !!res
  }
  // Backward compatibility: remove local file if it points to /uploads
  const localMatch = url.match(/\/(?:uploads)\/(.+)$/i)
  if (localMatch) {
    const filename = localMatch[1].split('?')[0]
    const filePath = path.resolve('uploads', filename)
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      return true
    } catch {
      return false
    }
  }
  return false
}
