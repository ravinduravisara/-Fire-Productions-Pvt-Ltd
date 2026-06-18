import { api, withAdmin } from './api'

function normalizeWork(work) {
  if (!work) return work

  return {
    ...work,

    // Support both MongoDB _id and old PostgreSQL id
    id: work.id || work._id,

    // Make sure frontend always has these fields
    title: work.title || '',
    description: work.description || '',
    category: work.category || '',
    tags: Array.isArray(work.tags) ? work.tags : [],

    // Support single image and multiple images
    imageUrl: work.imageUrl || work.image || '',
    imageUrls: Array.isArray(work.imageUrls) ? work.imageUrls : [],
  }
}

export const getWorks = async () => {
  const { data } = await api.get('/works')

  if (Array.isArray(data)) {
    return data.map(normalizeWork)
  }

  if (Array.isArray(data?.works)) {
    return data.works.map(normalizeWork)
  }

  return []
}

export const getWorkById = async (id) => {
  const { data } = await api.get(`/works/${id}`)
  return normalizeWork(data)
}

export const createWork = async (payload, token) => {
  const client = withAdmin(token)
  const { data } = await client.post('/works', payload)
  return normalizeWork(data)
}