import { asyncHandler } from '../utils/asyncHandler.js'
import { isConnected } from '../config/db.js'
import { getCategoryModel } from '../models/Category.js'
import mongoose from 'mongoose'

export const listCategories = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const Category = getCategoryModel()
  const cats = await Category.find().sort({ parent: 1, name: 1 })
  res.json(cats)
})

export const createCategory = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const Category = getCategoryModel()
  const name = (req.body?.name || '').trim()
  const parentId = req.body?.parent || null
  if (!name) return res.status(400).json({ message: 'Name is required' })
  let parent = null
  if (parentId) {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: 'Invalid parent id' })
    }
    parent = parentId
  }
  try {
    const cat = await Category.create({ name, parent })
    res.status(201).json(cat)
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Category already exists' })
    }
    throw err
  }
})

export const deleteCategory = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const Category = getCategoryModel()
  const id = req.params.id
  const cat = await Category.findByIdAndDelete(id)
  if (!cat) return res.status(404).json({ message: 'Not found' })
  // Also remove subcategories under this parent
  await Category.deleteMany({ parent: id })
  res.status(204).end()
})
