import { isConnected, prisma } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendContactMail } from '../utils/mail.js'

export const sendContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  // Attempt to send email regardless of DB status
  let mailSent = false
  try { mailSent = await sendContactMail({ name, email, message }) } catch {}

  if (!isConnected()) {
    return res.status(mailSent ? 201 : 202).json({ ok: true, mailSent })
  }

  const saved = await prisma.contactMessage.create({ data: { name, email, message } })
  res.status(201).json({ ok: true, id: saved.id, mailSent })
})