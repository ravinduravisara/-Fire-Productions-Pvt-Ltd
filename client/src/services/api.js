import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

export const withAdmin = (token) => {
  const instance = axios.create({ baseURL, headers: { 'Content-Type': 'application/json', 'x-admin-token': token } })
  return instance
}