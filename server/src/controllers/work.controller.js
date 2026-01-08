import { isConnected, prisma } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteAssetByUrl } from '../utils/assets.js'

export const listWorks = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const works = await prisma.work.findMany({ orderBy: { createdAt: 'desc' } })
  try { res.set('Cache-Control', 'public, max-age=60') } catch {}
  res.json(works)
})

export const getWorkById = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const { id } = req.params
  if (!id) return res.status(400).json({ message: 'id is required' })
  const work = await prisma.work.findUnique({ where: { id } })
  if (!work) return res.status(404).json({ message: 'Not found' })
  try { res.set('Cache-Control', 'public, max-age=120') } catch {}
  res.json(work)
})

export const createWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const body = { ...req.body }
  // Normalize images: accept imageUrls (array) or legacy imageUrl/image/url
  let imageUrls = []
  if (Array.isArray(body.imageUrls)) {
    imageUrls = body.imageUrls.filter((u) => typeof u === 'string' && u.trim())
  }
  if (!body.imageUrl) {
    if (typeof body.image === 'string') body.imageUrl = body.image
    if (typeof body.url === 'string' && body.url.startsWith('/uploads/')) body.imageUrl = body.url
  }
  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    imageUrls = imageUrls.length ? imageUrls : [body.imageUrl.trim()]
  }
  if (!imageUrls.length) {
    return res.status(400).json({ message: 'At least one image is required. Upload an image first.' })
  }
  // Enforce max 20 photos for Acoustic/Entertainment
  const normalizedCategory = typeof body.category === 'string' ? body.category.trim().toLowerCase() : ''
  if ((normalizedCategory === 'acoustic' || normalizedCategory === 'entertainment') && imageUrls.length > 20) {
    return res.status(400).json({ message: 'Maximum 20 photos are allowed for Acoustic and Entertainment.' })
  }
  // Basic validation and normalization
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return res.status(400).json({ message: 'Title is required' })
  }
  const tagsArr = Array.isArray(body.tags)
    ? body.tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
    : typeof body.tags === 'string' && body.tags.trim()
      ? body.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []
  const payload = {
    title: body.title.trim(),
    description: typeof body.description === 'string' ? body.description : '',
    imageUrl: imageUrls[0],
    imageUrls,
    link: typeof body.link === 'string' ? body.link : '',
    category: typeof body.category === 'string' ? body.category : '',
    tags: tagsArr
  }
  const work = await prisma.work.create({ data: payload })
  res.status(201).json(work)
})

export const updateWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const id = req.params.id
  const body = { ...req.body }
  const prev = await prisma.work.findUnique({ where: { id } })
  if (!prev) return res.status(404).json({ message: 'Not found' })
  // Normalize images for update
  let nextImageUrls = []
  if (Array.isArray(body.imageUrls)) {
    nextImageUrls = body.imageUrls.filter((u) => typeof u === 'string' && u.trim())
  }
  if (!body.imageUrl) {
    if (typeof body.image === 'string') body.imageUrl = body.image
    if (typeof body.url === 'string' && body.url.startsWith('/uploads/')) body.imageUrl = body.url
  }
  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    nextImageUrls = nextImageUrls.length ? nextImageUrls : [body.imageUrl.trim()]
  }
  // Enforce max 20 photos for Acoustic/Entertainment on update
  const normalizedUpdCategory = typeof body.category === 'string'
    ? body.category.trim().toLowerCase()
    : typeof prev.category === 'string'
      ? prev.category.trim().toLowerCase()
      : ''
  if ((normalizedUpdCategory === 'acoustic' || normalizedUpdCategory === 'entertainment') && Array.isArray(nextImageUrls) && nextImageUrls.length > 20) {
    return res.status(400).json({ message: 'Maximum 20 photos are allowed for Acoustic and Entertainment.' })
  }
  const payload = {
    title: body.title,
    description: body.description,
    imageUrl: nextImageUrls[0] || body.imageUrl,
    imageUrls: nextImageUrls,
    link: body.link,
    category: body.category,
    tags: body.tags
  }
  const item = await prisma.work.update({ where: { id }, data: payload })
  if (!item) return res.status(404).json({ message: 'Not found' })
  try {
    // If primary image changed, try delete old
    if (prev.imageUrl && payload.imageUrl && String(prev.imageUrl) !== String(payload.imageUrl)) {
      await deleteAssetByUrl(prev.imageUrl)
    }
  } catch {}
  res.json(item)
})

export const deleteWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const id = req.params.id
  let item
  try {
    item = await prisma.work.delete({ where: { id } })
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }
  try {
    const candidates = [item.imageUrl, item.image, item.url, ...(Array.isArray(item.imageUrls) ? item.imageUrls : [])]
      .filter((u) => typeof u === 'string' && u.trim())
    for (const u of candidates) {
      try { await deleteAssetByUrl(u) } catch {}
    }
  } catch {}
  res.status(204).end()
})