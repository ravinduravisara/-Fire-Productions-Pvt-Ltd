import express from 'express';
import multer from 'multer';
// No filesystem usage; we persist images in MongoDB only
import { adminAuth } from '../middleware/adminAuth.js';
import { getImageAssetModel } from '../models/ImageAsset.js';

const router = express.Router();

// Memory storage to save directly into MongoDB
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Protected upload endpoint
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Save into MongoDB
  const ImageAsset = getImageAssetModel();
  const asset = await ImageAsset.create({
    filename: req.file.originalname,
    contentType: req.file.mimetype,
    size: req.file.size,
    data: req.file.buffer
  });
  const url = `/api/assets/${asset.id}`;
  res.json({ url, id: asset.id });
});

export default router;