import { getWorkModel } from '../models/Work.js'
import { isConnected } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteAssetByUrl } from '../utils/assets.js'

export const listWorks = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Work = getWorkModel()
  const works = await Work.find().sort({ createdAt: -1 })
  res.json(works)
})

export const createWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Work = getWorkModel()
  const body = { ...req.body }
  if (!body.imageUrl) {
    if (typeof body.image === 'string') body.imageUrl = body.image
    if (typeof body.url === 'string' && body.url.startsWith('/uploads/')) body.imageUrl = body.url
  }
  if (!body.imageUrl || typeof body.imageUrl !== 'string' || !body.imageUrl.trim()) {
    return res.status(400).json({ message: 'Image URL is required. Upload an image first.' })
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
    imageUrl: body.imageUrl.trim(),
    link: typeof body.link === 'string' ? body.link : '',
    category: typeof body.category === 'string' ? body.category : '',
    tags: tagsArr
  }
  const work = await Work.create(payload)
  res.status(201).json(work)
})

export const updateWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Work = getWorkModel()
  const id = req.params.id
  const body = { ...req.body }
  if (!body.imageUrl) {
    if (typeof body.image === 'string') body.imageUrl = body.image
    if (typeof body.url === 'string' && body.url.startsWith('/uploads/')) body.imageUrl = body.url
  }
  const payload = {
    title: body.title,
    description: body.description,
    imageUrl: body.imageUrl,
    link: body.link,
    category: body.category,
    tags: body.tags
  }
  const item = await Work.findByIdAndUpdate(id, payload, { new: true })
  if (!item) return res.status(404).json({ message: 'Not found' })
  res.json(item)
})

export const deleteWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Work = getWorkModel()
  const id = req.params.id
  const item = await Work.findByIdAndDelete(id)
  if (!item) return res.status(404).json({ message: 'Not found' })
  try { await deleteAssetByUrl(item.imageUrl) } catch {}
  res.status(204).end()
})