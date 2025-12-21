import { useState } from 'react'
import SectionTitle from '../components/ui/SectionTitle'
import { validateAdmin } from '../services/admin.api'
import SEO from '../components/seo/SEO'

export default function AdminLogin() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!token) return
    setLoading(true)
    try {
      await validateAdmin(token)
      localStorage.setItem('admin_token', token)
      window.location.assign('/admin/dashboard')
    } catch (err) {
      setError('Invalid password')
    } finally {
      setLoading(false)
    }
  }
  return (
    <section className="py-16">
      <div className="container max-w-md">
        <SEO title="Admin Login" path="/admin/login" noindex />
        <SectionTitle title="Admin Login" />
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2" />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} className="rounded-md bg-brand-600 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Checking…' : 'Continue'}</button>
        </form>
      </div>
    </section>
  )
}