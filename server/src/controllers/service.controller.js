import { getServiceModel } from '../models/Service.js'
import { isConnected } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listServices = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const Service = getServiceModel()
  const services = await Service.find().sort({ order: 1, createdAt: -1 })
  res.json(services)
})

export const createService = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const Service = getServiceModel()
  const { name, description, imageUrl, category } = req.body
  if (!name || !description) return res.status(400).json({ message: 'Name and description are required' })
  const exists = await Service.findOne({ name })
  if (exists) return res.status(409).json({ message: 'Service with this name already exists' })
  const last = await Service.findOne().sort({ order: -1 })
  const nextOrder = (last && typeof last.order === 'number') ? last.order + 1 : 1
  const svc = await Service.create({ name: name.trim(), description, imageUrl, category: typeof category === 'string' ? category.trim() : '', order: nextOrder })
  res.status(201).json(svc)
})

export const deleteService = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const Service = getServiceModel()
  const { id } = req.params
  const svc = await Service.findByIdAndDelete(id)
  if (!svc) return res.status(404).json({ message: 'Not found' })
  res.status(204).end()
})

export const updateService = asyncHandler(async (req, res) => {
  if (!isConnected()) return res.status(503).json({ message: 'DB not connected' })
  const Service = getServiceModel()
  const { id } = req.params
  const body = { ...req.body }
  const payload = {
    name: body.name,
    description: body.description,
    imageUrl: body.imageUrl,
    category: body.category,
    order: typeof body.order === 'number' ? body.order : undefined
  }
  const item = await Service.findByIdAndUpdate(id, payload, { new: true })
  if (!item) return res.status(404).json({ message: 'Not found' })
  res.json(item)
})
