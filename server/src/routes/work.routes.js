import { Router } from 'express'
import { listWorks, getWorkById, createWork, updateWork, deleteWork } from '../controllers/work.controller.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

router.get('/', listWorks)
router.get('/:id', getWorkById)
router.post('/', adminAuth, createWork)
router.put('/:id', adminAuth, updateWork)
router.delete('/:id', adminAuth, deleteWork)

export default router