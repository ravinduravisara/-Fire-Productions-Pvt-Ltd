import { getContactMessageModel } from '../models/ContactMessage.js'
import { isConnected } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const sendContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  if (!isConnected()) {
    return res.status(202).json({ ok: true, id: 'queued-demo', note: 'DB not connected; message accepted for demo only.' })
  }
  const ContactMessage = getContactMessageModel()
  const saved = await ContactMessage.create({ name, email, message })
  res.status(201).json({ ok: true, id: saved.id })
})