import { env } from '../config/env.js'

export function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token']
  if (!env.ADMIN_TOKEN) {
    return res.status(503).json({ message: 'Admin not configured' })
  }
  if (!token || token !== env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}