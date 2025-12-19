import { api, withAdmin } from './api'

export const listCategories = async () => {
  const { data } = await api.get('/categories')
  return data
}

export const createCategory = async (name, token, parent = null) => {
  const client = withAdmin(token)
  const { data } = await client.post('/categories', { name, parent })
  return data
}

export const deleteCategory = async (id, token) => {
  const client = withAdmin(token)
  await client.delete(`/categories/${id}`)
}
