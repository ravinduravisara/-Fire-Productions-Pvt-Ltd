import { useEffect, useMemo, useState } from 'react'
import { getWorks } from '../../services/works.api'
import SectionTitle from '../ui/SectionTitle'
import DriftWall from '../ui/DriftWall'

export default function LatestWorks() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [didAutoScroll, setDidAutoScroll] = useState(false)

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

  const musicItems = useMemo(() => {
    if (!Array.isArray(items) || !items.length) return []

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const filesBase = apiBase.replace(/\/api$/, '')

    const isMusicWork = (work) => {
      const category = String(work.category || '').toLowerCase()
      const tags = Array.isArray(work.tags) ? work.tags.map((tag) => String(tag).toLowerCase()) : []
      return category === 'music' || tags.includes('music')
    }

    const flatten = items
      .filter(isMusicWork)
      .flatMap((work, index) => {
      const raws = Array.isArray(work.imageUrls) && work.imageUrls.length
        ? work.imageUrls
        : [work.imageUrl || work.image || work.url].filter(Boolean)

      return raws.map((raw, imageIndex) => ({
        id: work.id || work._id || `${index}-${imageIndex}`,
        image: String(raw).startsWith('http') ? raw : `${filesBase}${raw}`,
        title: work.title || 'Latest Work',
        href: work.link || (work.id || work._id ? `/works/${work.id || work._id}` : undefined),
      }))
      })

    return flatten.slice(0, 15)
  }, [items])

  return (
    <section className="py-16">
      <div className="container">
        <SectionTitle title="Latest Music Works" subtitle="Recent music projects only" />
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
        ) : musicItems.length ? (
          <div className="mt-8">
            <div className="h-[min(82vh,46rem)] rounded-[2rem] border border-border/60 bg-surface/30 p-2 shadow-2xl shadow-black/10 sm:p-4">
              <DriftWall
                items={musicItems}
                columns={5}
                tileWidth={200}
                tileHeight={132}
                gap={18}
                tilt={14}
                turn={-12}
                perspective={1200}
                depth={120}
                speed={30}
                direction="up"
                variance={0.38}
                parallax={0.45}
                pauseOnHover={false}
                lift={54}
                fade={0.55}
                dim={0.58}
                grayscale={false}
                overlayColor="#060010"
              />
            </div>
            <p className="mt-4 text-sm text-muted">
              
            </p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted">No recent music projects yet.</p>
        )}
      </div>
    </section>
  )
}