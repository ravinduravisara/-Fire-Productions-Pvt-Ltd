import { api } from './api'

export async function uploadImage(file, token) {
  const form = new FormData()
  form.append('image', file)
  const res = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data', 'x-admin-token': token }
  })
  return res.data
}
