import { isConnected, prisma } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listServices = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const services = await prisma.service.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
  })
  res.json(services)
})

export const createService = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const { name, description, imageUrl, category } = req.body
  if (!name || !description) return res.status(400).json({ message: 'Name and description are required' })
  const exists = await prisma.service.findUnique({ where: { name } })
  if (exists) return res.status(409).json({ message: 'Service with this name already exists' })
  const last = await prisma.service.findMany({ orderBy: { order: 'desc' }, take: 1 })
  const nextOrder = (last[0] && typeof last[0].order === 'number') ? last[0].order + 1 : 1
  const svc = await prisma.service.create({ data: { name: name.trim(), description, imageUrl, category: typeof category === 'string' ? category.trim() : '', order: nextOrder } })
  res.status(201).json(svc)
})

export const deleteService = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const { id } = req.params
  try {
    await prisma.service.delete({ where: { id } })
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }
  res.status(204).end()
})

export const updateService = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const { id } = req.params
  const body = { ...req.body }
  const payload = {
    name: body.name,
    description: body.description,
    imageUrl: body.imageUrl,
    category: body.category,
    order: typeof body.order === 'number' ? body.order : undefined
  }
  try {
    const item = await prisma.service.update({ where: { id }, data: payload })
    res.json(item)
  } catch {
    return res.status(404).json({ message: 'Not found' })
  }
})
