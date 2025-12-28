import { asyncHandler } from '../utils/asyncHandler.js'
import { isConnected, prisma } from '../config/db.js'

export const listCategories = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const cats = await prisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }]
  })
  res.json(cats)
})

export const createCategory = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const name = (req.body?.name || '').trim()
  const parentId = req.body?.parent || null
  if (!name) return res.status(400).json({ message: 'Name is required' })
  // Prevent duplicates
  const exists = await prisma.category.findFirst({ where: { name, parentId: parentId || null } })
  if (exists) return res.status(409).json({ message: 'Category already exists' })
  const cat = await prisma.category.create({ data: { name, parentId: parentId || null } })
  res.status(201).json(cat)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const id = req.params.id
  try {
    await prisma.category.delete({ where: { id } })
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }
  await prisma.category.deleteMany({ where: { parentId: id } })
  res.status(204).end()
})
