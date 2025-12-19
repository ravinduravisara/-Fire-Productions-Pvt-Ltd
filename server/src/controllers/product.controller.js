import { getProductModel } from '../models/Product.js'
import { isConnected } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getCategoryModel } from '../models/Category.js'
import { deleteAssetByUrl } from '../utils/assets.js'

export const listProducts = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Product = getProductModel()
  const products = await Product.find().sort({ createdAt: -1 })
  res.json(products)
})

export const createProduct = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Product = getProductModel()
  const body = { ...req.body }
  if (!body.imageUrl) {
    if (typeof body.image === 'string') body.imageUrl = body.image
    if (typeof body.url === 'string' && body.url.startsWith('/uploads/')) body.imageUrl = body.url
  }
  if (!body.imageUrl || typeof body.imageUrl !== 'string' || !body.imageUrl.trim()) {
    return res.status(400).json({ message: 'Image URL is required. Upload an image first.' })
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
  const Category = getCategoryModel()
  const parentCat = await Category.findOne({ name: categoryName, parent: null })
  if (!parentCat) {
    return res.status(400).json({ message: 'Category not found. Add it in admin first.' })
  }
  if (subCategoryName) {
    const child = await Category.findOne({ name: subCategoryName, parent: parentCat._id })
    if (!child) {
      return res.status(400).json({ message: 'Subcategory not found for selected category.' })
    }
  }
  const payload = {
    title: body.title.trim(),
    description: typeof body.description === 'string' ? body.description : '',
    imageUrl: body.imageUrl.trim(),
    price: priceNum,
    category: categoryName,
    subCategory: subCategoryName || ''
  }
  const product = await Product.create(payload)
  res.status(201).json(product)
})

export const updateProduct = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Product = getProductModel()
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
    price: body.price,
    category: body.category,
    subCategory: body.subCategory
  }
  const item = await Product.findByIdAndUpdate(id, payload, { new: true })
  if (!item) return res.status(404).json({ message: 'Not found' })
  res.json(item)
})

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }
  const Product = getProductModel()
  const id = req.params.id
  const item = await Product.findByIdAndDelete(id)
  if (!item) return res.status(404).json({ message: 'Not found' })
  // Best-effort: delete linked image asset
  try { await deleteAssetByUrl(item.imageUrl) } catch {}
  res.status(204).end()
})