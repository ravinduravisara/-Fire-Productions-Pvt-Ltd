import { api, withAdmin } from './api'

export const listServices = async () => {
  const { data } = await api.get('/services')
  return data
}

export const createService = async (payload, token) => {
  const client = withAdmin(token)
  const { data } = await client.post('/services', payload)
  return data
}

export const deleteService = async (id, token) => {
  const client = withAdmin(token)
  const { data } = await client.delete(`/services/${id}`)
  return data
}

export const updateService = async (id, payload, token) => {
  const client = withAdmin(token)
  const { data } = await client.put(`/services/${id}`, payload)
  return data
}
