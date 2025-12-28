import fs from 'fs'
import path from 'path'
import { prisma } from '../config/db.js'

export function extractAssetIdFromUrl(url) {
  if (typeof url !== 'string') return null
  // UUID v4 pattern (case-insensitive)
  const m = url.match(/\/api\/assets\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})(?:$|[/?#])/)
  return m ? m[1] : null
}

export async function deleteAssetByUrl(url) {
  if (!url || typeof url !== 'string') return false
  // Try DB-backed asset first
  const assetId = extractAssetIdFromUrl(url)
  if (assetId) {
    try {
      await prisma.imageAsset.delete({ where: { id: assetId } })
      return true
    } catch {}
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
