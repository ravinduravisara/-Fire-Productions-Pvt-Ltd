import express from 'express';
import multer from 'multer';
// Persist images in PostgreSQL via Prisma
import { adminAuth } from '../middleware/adminAuth.js';
import { prisma } from '../config/db.js';

const router = express.Router();

// Memory storage to save directly into MongoDB
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Protected upload endpoint
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Save into PostgreSQL
  const asset = await prisma.imageAsset.create({
    data: {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer
    }
  });
  const url = `/api/assets/${asset.id}`;
  res.json({ url, id: asset.id });
});

export default router;