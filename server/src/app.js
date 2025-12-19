import express from 'express'
import cors from 'cors'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import workRoutes from './routes/work.routes.js'
import contactRoutes from './routes/contact.routes.js'
import productRoutes from './routes/product.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import assetRoutes from './routes/asset.routes.js'
import categoryRoutes from './routes/category.routes.js'
import serviceRoutes from './routes/service.routes.js'
import adminRoutes from './routes/admin.routes.js'
import path from 'path'

const app = express()

app.use(cors())
app.use(express.json())

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve('uploads')))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'fire-creative-api' })
})

app.use('/api/works', workRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/products', productRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/assets', assetRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

export default app