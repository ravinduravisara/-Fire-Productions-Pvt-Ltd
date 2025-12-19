import { Router } from 'express'
import { listWorks, createWork, updateWork, deleteWork } from '../controllers/work.controller.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

router.get('/', listWorks)
router.post('/', adminAuth, createWork)
router.put('/:id', adminAuth, updateWork)
router.delete('/:id', adminAuth, deleteWork)

export default router