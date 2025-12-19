import { Router } from 'express'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

// Simple endpoint to validate admin password (token)
router.get('/validate', adminAuth, (req, res) => {
  res.json({ ok: true })
})

export default router
