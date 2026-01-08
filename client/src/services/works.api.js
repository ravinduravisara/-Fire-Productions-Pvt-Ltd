import { api, withAdmin } from './api'

export const getWorks = async () => {
  const { data } = await api.get('/works')
  return data
}

export const getWorkById = async (id) => {
  const { data } = await api.get(`/works/${id}`)
  return data
}

export const createWork = async (payload, token) => {
  const client = withAdmin(token)
  const { data } = await client.post('/works', payload)
  return data
}