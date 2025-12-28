import fs from 'fs'
import path from 'path'
import { BSON } from 'bson'
import { prisma } from '../config/db.js'

function readBson(filePath) {
  const buf = fs.readFileSync(filePath)
  const docs = []
  let offset = 0
  while (offset < buf.length) {
    const size = buf.readInt32LE(offset)
    const slice = buf.slice(offset, offset + size)
    const doc = BSON.deserialize(slice)
    docs.push(doc)
    offset += size
  }
  return docs
}

async function seedCategories(baseDir) {
  const file = path.join(baseDir, 'categories.bson')
  if (!fs.existsSync(file)) return
  const docs = readBson(file)
  // First pass: create roots
  const idMap = new Map()
  for (const d of docs) {
    idMap.set(String(d._id), null)
  }
  // Create all with parentId resolved
  for (const d of docs) {
    const parentId = d.parent ? String(d.parent) : null
    const created = await prisma.category.create({ data: { name: d.name, parentId } })
    idMap.set(String(d._id), created.id)
  }
}

async function seedSimple(baseDir, name, createFn) {
  const file = path.join(baseDir, `${name}.bson`)
  if (!fs.existsSync(file)) return
  const docs = readBson(file)
  for (const d of docs) {
    await createFn(d)
  }
}

async function main() {
  const baseDir = path.resolve('../../data/test')
  console.log('Seeding from', baseDir)
  await prisma.$connect()
  await seedCategories(baseDir)
  await seedSimple(baseDir, 'products', async (d) => {
    await prisma.product.create({
      data: {
        title: d.title,
        description: d.description || '',
        imageUrl: d.imageUrl || null,
        imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls : [],
        price: typeof d.price === 'number' ? d.price : 0,
        category: d.category || '',
        subCategory: d.subCategory || ''
      }
    })
  })
  await seedSimple(baseDir, 'services', async (d) => {
    await prisma.service.create({
      data: {
        name: d.name,
        description: d.description,
        imageUrl: d.imageUrl || null,
        category: d.category || '',
        order: typeof d.order === 'number' ? d.order : 0
      }
    })
  })
  await seedSimple(baseDir, 'works', async (d) => {
    await prisma.work.create({
      data: {
        title: d.title,
        description: d.description || '',
        imageUrl: d.imageUrl || null,
        imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls : [],
        link: d.link || '',
        category: d.category || '',
        tags: Array.isArray(d.tags) ? d.tags : []
      }
    })
  })
  await seedSimple(baseDir, 'contactmessages', async (d) => {
    await prisma.contactMessage.create({
      data: { name: d.name, email: d.email, message: d.message }
    })
  })
  await seedSimple(baseDir, 'imageassets', async (d) => {
    await prisma.imageAsset.create({
      data: {
        filename: d.filename,
        contentType: d.contentType,
        size: d.size,
        data: d.data?.buffer ? Buffer.from(d.data.buffer) : Buffer.alloc(0)
      }
    })
  })
  console.log('Seeding completed')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})