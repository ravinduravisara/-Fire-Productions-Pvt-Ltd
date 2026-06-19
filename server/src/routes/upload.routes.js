import express from 'express'
import multer from 'multer'
import { adminAuth } from '../middleware/adminAuth.js'
import { uploadBufferToR2 } from '../utils/r2.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'))
    }

    cb(null, true)
  },
})

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const uploaded = await uploadBufferToR2(req.file)

    return res.status(201).json({
      url: uploaded.url,
      key: uploaded.key,
    })
  } catch (err) {
    console.error('R2 upload error:', err)

    return res.status(500).json({
      message: 'Failed to upload image',
      error: err?.message || String(err),
    })
  }
})

export default router