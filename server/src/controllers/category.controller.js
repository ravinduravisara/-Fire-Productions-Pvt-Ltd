import { asyncHandler } from '../utils/asyncHandler.js'
import { isConnected, prisma } from '../config/db.js'

export const listCategories = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const cats = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  res.json(cats)
})

export const createCategory = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const name = String(req.body?.name || '').trim()

  if (!name) {
    return res.status(400).json({ message: 'Name is required' })
  }

  const exists = await prisma.category.findFirst({
    where: {
      name,
    },
  })

  if (exists) {
    return res.status(409).json({ message: 'Category already exists' })
  }

  const cat = await prisma.category.create({
    data: {
      name,
    },
  })

  res.status(201).json(cat)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ message: 'DB not connected' })
  }

  const id = String(req.params.id || '').trim()

  if (!id) {
    return res.status(400).json({ message: 'Category id is required' })
  }

  try {
    await prisma.category.delete({
      where: {
        id,
      },
    })

    return res.status(204).end()
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }
})