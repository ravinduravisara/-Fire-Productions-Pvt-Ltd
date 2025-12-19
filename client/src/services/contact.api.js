import { api } from './api'

export const sendMessage = async (payload) => {
  const { data } = await api.post('/contact', payload)
  return data
}