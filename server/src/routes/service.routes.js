import { Router } from 'express'
import { listServices, createService, deleteService, updateService } from '../controllers/service.controller.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

router.get('/', listServices)
router.post('/', adminAuth, createService)
router.put('/:id', adminAuth, updateService)
router.delete('/:id', adminAuth, deleteService)

export default router
