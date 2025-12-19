import { api, withAdmin } from './api'

export const validateAdmin = async (token) => {
  const client = withAdmin(token)
  await client.get('/admin/validate')
  return true
}

export const adminListProducts = async () => {
  const { data } = await api.get('/products')
  return data
}
export const adminUpdateProduct = async (id, payload, token) => {
  const client = withAdmin(token)
  const { data } = await client.put(`/products/${id}`, payload)
  return data
}
export const adminDeleteProduct = async (id, token) => {
  const client = withAdmin(token)
  await client.delete(`/products/${id}`)
}

export const adminListWorks = async () => {
  const { data } = await api.get('/works')
  return data
}
export const adminUpdateWork = async (id, payload, token) => {
  const client = withAdmin(token)
  const { data } = await client.put(`/works/${id}`, payload)
  return data
}
export const adminDeleteWork = async (id, token) => {
  const client = withAdmin(token)
  await client.delete(`/works/${id}`)
}
