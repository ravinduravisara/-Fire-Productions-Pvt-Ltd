import { isConnected, prisma } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteAssetByUrl } from '../utils/assets.js'

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value
      .filter((t) => typeof t === 'string' && t.trim())
      .map((t) => t.trim())
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeImageUrls(body = {}) {
  let imageUrls = []

  if (Array.isArray(body.imageUrls)) {
    imageUrls = body.imageUrls
      .filter((u) => typeof u === 'string' && u.trim())
      .map((u) => u.trim())
  }

  if (!body.imageUrl) {
    if (typeof body.image === 'string') {
      body.imageUrl = body.image
    }

    if (typeof body.url === 'string' && body.url.startsWith('/uploads/')) {
      body.imageUrl = body.url
    }
  }

  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    imageUrls = imageUrls.length ? imageUrls : [body.imageUrl.trim()]
  }

  return imageUrls
}

function cleanString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

async function findWorkByAnyId(id) {
  const value = String(id || '').trim()

  if (!value) return null

  return prisma.work.findFirst({
    where: {
      OR: [
        { id: value },
        { oldId: value },
      ],
    },
  })
}

export const listWorks = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const works = await prisma.work.findMany()

  const sortedWorks = works.sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime()
    const bTime = new Date(b.createdAt || 0).getTime()

    return bTime - aTime
  })

  try {
    res.set('Cache-Control', 'no-store')
  } catch {}

  res.json(sortedWorks)
})

export const getWorkById = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const id = String(req.params.id || '').trim()

  if (!id) {
    return res.status(400).json({ message: 'id is required' })
  }

  const work = await findWorkByAnyId(id)

  if (!work) {
    return res.status(404).json({ message: 'Not found' })
  }

  try {
    res.set('Cache-Control', 'public, max-age=120')
  } catch {}

  res.json(work)
})

export const createWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const body = { ...req.body }
  const imageUrls = normalizeImageUrls(body)

  if (!imageUrls.length) {
    return res.status(400).json({
      message: 'At least one image is required. Upload an image first.',
    })
  }

  const title = cleanString(body.title)
  const description = cleanString(body.description)
  const link = cleanString(body.link)
  const category = cleanString(body.category)
  const normalizedCategory = category.toLowerCase()
  const tags = normalizeTags(body.tags)

  if (!title) {
    return res.status(400).json({ message: 'Title is required' })
  }

  if (
    (normalizedCategory === 'acoustic' ||
      normalizedCategory === 'entertainment') &&
    imageUrls.length > 20
  ) {
    return res.status(400).json({
      message: 'Maximum 20 photos are allowed for Acoustic and Entertainment.',
    })
  }

  const now = new Date().toISOString()

  const payload = {
    title,
    description,
    image: imageUrls[0],
    imageUrl: imageUrls[0],
    imageUrls,
    link,
    category,
    tags,
    createdAt: now,
    updatedAt: now,
  }

  const work = await prisma.work.create({
    data: payload,
  })

  res.status(201).json(work)
})

export const updateWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const id = String(req.params.id || '').trim()

  if (!id) {
    return res.status(400).json({ message: 'id is required' })
  }

  const prev = await findWorkByAnyId(id)

  if (!prev) {
    return res.status(404).json({ message: 'Not found' })
  }

  const body = { ...req.body }
  const nextImageUrls = normalizeImageUrls(body)

  const nextCategory =
    typeof body.category === 'string'
      ? body.category.trim()
      : typeof prev.category === 'string'
        ? prev.category.trim()
        : ''

  const normalizedUpdCategory = nextCategory.toLowerCase()

  if (
    (normalizedUpdCategory === 'acoustic' ||
      normalizedUpdCategory === 'entertainment') &&
    nextImageUrls.length > 20
  ) {
    return res.status(400).json({
      message: 'Maximum 20 photos are allowed for Acoustic and Entertainment.',
    })
  }

  const data = {
    updatedAt: new Date().toISOString(),
  }

  if (typeof body.title === 'string') {
    data.title = body.title.trim()
  }

  if (typeof body.description === 'string') {
    data.description = body.description.trim()
  }

  if (typeof body.link === 'string') {
    data.link = body.link.trim()
  }

  if (typeof body.category === 'string') {
    data.category = body.category.trim()
  }

  if (Array.isArray(body.tags) || typeof body.tags === 'string') {
    data.tags = normalizeTags(body.tags)
  }

  if (nextImageUrls.length > 0) {
    data.image = nextImageUrls[0]
    data.imageUrl = nextImageUrls[0]
    data.imageUrls = nextImageUrls
  }

  const item = await prisma.work.update({
    where: {
      id: prev.id,
    },
    data,
  })

  try {
    if (
      prev.imageUrl &&
      data.imageUrl &&
      String(prev.imageUrl) !== String(data.imageUrl)
    ) {
      await deleteAssetByUrl(prev.imageUrl)
    }
  } catch {}

  res.json(item)
})

export const deleteWork = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const id = String(req.params.id || '').trim()

  if (!id) {
    return res.status(400).json({ message: 'id is required' })
  }

  const prev = await findWorkByAnyId(id)

  if (!prev) {
    return res.status(404).json({ message: 'Not found' })
  }

  let item

  try {
    item = await prisma.work.delete({
      where: {
        id: prev.id,
      },
    })
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }

  try {
    const candidates = [
      item.imageUrl,
      item.image,
      item.url,
      ...(Array.isArray(item.imageUrls) ? item.imageUrls : []),
    ].filter((u) => typeof u === 'string' && u.trim())

    for (const u of candidates) {
      try {
        await deleteAssetByUrl(u)
      } catch {}
    }
  } catch {}

  res.status(204).end()
})