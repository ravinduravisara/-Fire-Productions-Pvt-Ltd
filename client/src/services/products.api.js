import { api, withAdmin } from './api'

export const getProducts = async () => {
  const { data } = await api.get('/products')
  return data
}

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export const createProduct = async (payload, token) => {
  const client = withAdmin(token)
  const { data } = await client.post('/products', payload)
  return data
}