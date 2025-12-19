import { Router } from 'express'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js'
import { adminAuth } from '../middleware/adminAuth.js'

const router = Router()

router.get('/', listProducts)
router.post('/', adminAuth, createProduct)
router.put('/:id', adminAuth, updateProduct)
router.delete('/:id', adminAuth, deleteProduct)

export default router