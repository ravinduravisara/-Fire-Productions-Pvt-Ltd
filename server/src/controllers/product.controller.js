import { isConnected, prisma } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { deleteAssetByUrl } from '../utils/assets.js'

export const listProducts = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(products)
})

export const createProduct = asyncHandler(async (req, res) => {
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
  // Basic validation and type coercion
  const priceNum = Number(body.price)
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return res.status(400).json({ message: 'Title is required' })
  }
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return res.status(400).json({ message: 'Price must be a non-negative number' })
  }
  const categoryName = typeof body.category === 'string' ? body.category.trim() : ''
  if (!categoryName) {
    return res.status(400).json({ message: 'Category is required' })
  }
  const subCategoryName = typeof body.subCategory === 'string' ? body.subCategory.trim() : ''
  // Validate against Category model
  const parentCat = await prisma.category.findFirst({ where: { name: categoryName, parentId: null } })
  if (!parentCat) {
    return res.status(400).json({ message: 'Category not found. Add it in admin first.' })
  }
  if (subCategoryName) {
    const child = await prisma.category.findFirst({ where: { name: subCategoryName, parentId: parentCat.id } })
    if (!child) {
      return res.status(400).json({ message: 'Subcategory not found for selected category.' })
    }
  }
  const payload = {
    title: body.title.trim(),
    description: typeof body.description === 'string' ? body.description : '',
    imageUrl: imageUrls[0],
    imageUrls,
    price: priceNum,
    category: categoryName,
    subCategory: subCategoryName || ''
  }
  const product = await prisma.product.create({ data: payload })
  res.status(201).json(product)
})

export const updateProduct = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const id = req.params.id
  const body = { ...req.body }
  // Load existing to compare image changes
  const prev = await prisma.product.findUnique({ where: { id } })
  if (!prev) return res.status(404).json({ message: 'Not found' })

  // Normalize images: prefer provided imageUrls[], else fallback to legacy fields, else keep previous
  let nextImageUrls = []
  if (Array.isArray(body.imageUrls)) {
    nextImageUrls = body.imageUrls.filter((u) => typeof u === 'string' && u.trim())
  }
  if (!nextImageUrls.length) {
    if (!body.imageUrl) {
      if (typeof body.image === 'string') body.imageUrl = body.image
      if (typeof body.url === 'string' && body.url.startsWith('/uploads/')) body.imageUrl = body.url
    }
    if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
      nextImageUrls = [body.imageUrl.trim()]
    }
  }
  // If no new images provided, retain previous
  if (!nextImageUrls.length) {
    nextImageUrls = Array.isArray(prev.imageUrls) && prev.imageUrls.length
      ? prev.imageUrls
      : (prev.imageUrl ? [prev.imageUrl] : [])
  }
  const nextPrimary = nextImageUrls[0] || prev.imageUrl || ''

  const payload = {
    title: body.title,
    description: body.description,
    imageUrl: nextPrimary,
    imageUrls: nextImageUrls,
    price: body.price,
    category: body.category,
    subCategory: body.subCategory
  }
  let item
  try {
    item = await prisma.product.update({ where: { id }, data: payload })
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }
  if (!item) return res.status(404).json({ message: 'Not found' })
  // If images changed, best-effort delete removed assets (including previous primary if removed)
  try {
    const prevImages = [prev.imageUrl, ...(Array.isArray(prev.imageUrls) ? prev.imageUrls : [])]
      .filter((u) => typeof u === 'string' && u.trim())
    const newSet = new Set(nextImageUrls)
    const removed = prevImages.filter((u) => !newSet.has(u))
    for (const u of removed) {
      try { await deleteAssetByUrl(u) } catch {}
    }
  } catch {}
  res.json(item)
})

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const id = req.params.id
  let item
  try {
    item = await prisma.product.delete({ where: { id } })
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }
  // Best-effort: delete linked image assets (primary + array + legacy fields)
  try {
    const candidates = [item.imageUrl, ...(Array.isArray(item.imageUrls) ? item.imageUrls : []), item.image, item.url]
      .filter((u) => typeof u === 'string' && u.trim())
    for (const u of candidates) {
      try { await deleteAssetByUrl(u) } catch {}
    }
  } catch {}
  res.status(204).end()
})