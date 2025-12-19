import { Router } from 'express'
import { listCategories, createCategory, deleteCategory } from '../controllers/category.controller.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

router.get('/', listCategories)
router.post('/', adminAuth, createCategory)
router.delete('/:id', adminAuth, deleteCategory)

export default router
