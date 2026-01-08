import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SEO from '../components/seo/SEO'
import { getWorkById } from '../services/works.api'

function LazyImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="relative h-[70vh] w-full bg-surface">
      {!loaded ? <div className="absolute inset-0 animate-pulse bg-surface" /> : null}
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full object-contain bg-background"
        />
      ) : null}
    </div>
  )
}

export default function WorkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        if (!id) return
        // Try fetch a single work by id for faster detail load
        const data = await getWorkById(id)
        if (data && typeof data === 'object') {
          setItems([data])
          return setLoading(false)
        }
      } catch (e) {
        // Fallback: ignore and try the old list fetch
      }
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const res = await fetch(`${apiBase}/works`)
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to fetch works', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const item = useMemo(() => {
    return items.find((w) => String(w.id) === String(id))
  }, [items, id])

  const filesBase = useMemo(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    return apiBase.replace(/\/api$/, '')
  }, [])

  const images = useMemo(() => {
    if (!item) return []
    const raws = Array.isArray(item.imageUrls) && item.imageUrls.length
      ? item.imageUrls
      : [item.imageUrl || item.image || item.url].filter(Boolean)
    return raws.map((u) => (String(u).startsWith('http') ? u : `${filesBase}${u}`))
  }, [item, filesBase])

  useEffect(() => { setIndex(0) }, [id])

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  const category = item?.category || ''
  const title = item?.title || 'Project'
  const isAcoustic = String(category).toLowerCase() === 'acoustic' || (Array.isArray(item?.tags) && item.tags.includes('Acoustic'))
  const isEntertainment = String(category).toLowerCase() === 'entertainment' || (Array.isArray(item?.tags) && item.tags.includes('Entertainment'))

  return (
    <>
      <SEO title={`${title} — Project`} description={item?.description || ''} path={`/works/${id}`} />
      <section className="py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (isAcoustic) return navigate('/services#acoustic')
                if (isEntertainment) return navigate('/services#entertainment')
                navigate(-1)
              }}
              className="inline-flex items-center rounded-md border border-border/60 bg-card/30 px-3 py-2 text-sm font-semibold text-text hover:bg-card/50"
            >
              ← Back
            </button>
          </div>
        </div>
      </section>

      <section className="py-2">
        <div className="container">
          <h1 className="text-xl font-semibold text-text">{title}</h1>
          {item?.tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
              {item.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-background/60 border border-border/40">{t}</span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          {loading && !item ? (
            <div className="h-[70vh] rounded-2xl bg-surface animate-pulse" />
          ) : !item ? (
            <div className="text-sm text-muted">Project not found.</div>
          ) : (
            <div className="relative">
              <LazyImage src={images[index]} alt={title} />
              {images.length > 1 ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
                  <button
                    type="button"
                    onClick={prev}
                    className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-text ring-1 ring-border/60 backdrop-blur hover:bg-background"
                    aria-label="Previous"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-text ring-1 ring-border/60 backdrop-blur hover:bg-background"
                    aria-label="Next"
                  >
                    →
                  </button>
                </div>
              ) : null}

              {images.length > 1 ? (
                <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                  {images.map((src, i) => (
                    <button
                      key={`thumb-${i}`}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={[
                        'relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border',
                        i === index ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-border/60'
                      ].join(' ')}
                      aria-label={`Show image ${i + 1}`}
                    >
                      <img src={src} alt="thumb" loading="lazy" decoding="async" className="h-full w-full object-contain bg-background" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {item?.description ? (
            <div className="mt-6">
              <p className="text-sm leading-relaxed text-muted whitespace-pre-line">{item.description}</p>
            </div>
          ) : null}

          {item?.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white ring-1 ring-brand-600/25 hover:bg-brand-500"
            >
              Visit Link
            </a>
          ) : null}
        </div>
      </section>
    </>
  )
}
