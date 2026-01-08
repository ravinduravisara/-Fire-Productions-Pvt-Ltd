import { useEffect, useMemo, useState } from 'react'
import { getWorks } from '../../services/works.api'
import SectionTitle from '../ui/SectionTitle'
import FireCards from './FireCards'

// Service groups to display: match by `category` or `tags`
const SERVICE_GROUPS = [
  { key: 'music', title: 'Fire Music', tag: 'Music' },
  { key: 'acoustic', title: 'Fire Acoustic', tag: 'Acoustic' },
  { key: 'entertainment', title: 'Fire Entertainment', tag: 'Entertainment' },
  { key: 'films', title: 'Fire Films', tag: 'Films' },
]

export default function LatestWorks() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        // Try read cache first for instant render
        const cached = sessionStorage.getItem('worksCache')
        if (cached) {
          try { setItems(JSON.parse(cached) || []) } catch {}
        }
        const data = await getWorks()
        const list = Array.isArray(data) ? data : []
        setItems(list)
        // Write cache for subsequent visits
        try { sessionStorage.setItem('worksCache', JSON.stringify(list)) } catch {}
      } catch (e) {
        console.error('Failed to fetch works', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Build per-service latest 3 items, matching by category or tags
  const groups = useMemo(() => {
    if (!Array.isArray(items) || !items.length) return []
    const results = []
    for (const grp of SERVICE_GROUPS) {
      const picked = []
      for (const w of items) {
        const category = String(w.category || '')
        const tags = Array.isArray(w.tags) ? w.tags : []
        const match = category === grp.tag || tags.includes(grp.tag)
        if (match) {
          picked.push(w)
          if (picked.length >= 3) break
        }
      }
      results.push({ ...grp, items: picked })
    }
    return results
  }, [items])

  return (
    <section className="py-16">
      <div className="container">
        <SectionTitle title="Latest Works" subtitle="Latest 3 from each service" />
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-40 rounded bg-surface animate-pulse" />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((__, j) => (
                    <div key={j} className="h-40 rounded-lg bg-surface animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-12">
            {groups.map((g) => (
              <div key={g.key}>
                <h3 className="text-lg font-semibold text-text">{g.title}</h3>
                {g.items.length ? (
                  <div className="mt-4">
                    <FireCards items={g.items} />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted">No recent projects yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}