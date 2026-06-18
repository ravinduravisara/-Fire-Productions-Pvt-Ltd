import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const FILES_BASE = API_BASE.replace(/\/api\/?$/, '')

function getWorkId(item) {
  return item?.id || item?._id || item?.oldId || ''
}

function resolveMediaUrl(value) {
  if (!value) return ''

  const url = String(value).trim()
  if (!url) return ''

  if (/^https?:\/\//i.test(url)) return url

  if (url.startsWith('/api/')) {
    return `${FILES_BASE}${url}`
  }

  if (url.startsWith('/uploads/')) {
    return `${FILES_BASE}${url}`
  }

  if (url.startsWith('/')) {
    return `${FILES_BASE}${url}`
  }

  return url
}

function getWorkImages(item) {
  if (!item) return []

  const rawImages =
    Array.isArray(item.imageUrls) && item.imageUrls.length
      ? item.imageUrls
      : Array.isArray(item.images) && item.images.length
        ? item.images
        : [item.imageUrl || item.image || item.url].filter(Boolean)

  return rawImages
    .map(resolveMediaUrl)
    .filter(Boolean)
}

function hasTag(item, tag) {
  return (
    Array.isArray(item?.tags) &&
    item.tags.some(
      (t) => String(t).toLowerCase() === String(tag).toLowerCase()
    )
  )
}

function openExternalLink(link) {
  const safeLink = String(link || '').trim()

  if (!safeLink) return false

  window.open(safeLink, '_blank', 'noopener,noreferrer')
  return true
}

function LazyImage({
  src,
  alt,
  aspect = 'video',
  mode = 'cover',
  onImageError,
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [src])

  const aspectClass = aspect === 'video' ? 'aspect-video' : 'aspect-[4/3]'
  const objectClass = mode === 'cover' ? 'object-cover' : 'object-contain'

  return (
    <div className={`relative ${aspectClass} overflow-hidden bg-surface`}>
      {!loaded && !error ? (
        <div className="absolute inset-0 animate-pulse bg-surface" />
      ) : null}

      {src && !error ? (
        <img
          key={src}
          src={src}
          alt={alt || 'project'}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setLoaded(true)
            setError(false)
          }}
          onError={() => {
            console.error('Image failed:', src)
            setError(true)
            setLoaded(true)

            if (typeof onImageError === 'function') {
              onImageError(src)
            }
          }}
          className={`absolute inset-0 h-full w-full ${objectClass}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface px-4 text-center text-xs text-muted">
          No image available
        </div>
      )}
    </div>
  )
}

function WorkPreviewModal({ open, item, index, onClose, onSetIndex, offsetTop }) {
  if (!open || !item) return null

  const images = getWorkImages(item)
  const safeIndex = Math.min(index, Math.max(images.length - 1, 0))

  const prev = () => {
    if (!images.length) return
    onSetIndex((i) => (i - 1 + images.length) % images.length)
  }

  const next = () => {
    if (!images.length) return
    onSetIndex((i) => (i + 1) % images.length)
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close preview"
      />

      <div
        className="absolute left-1/2 w-full max-w-7xl -translate-x-1/2 px-4"
        style={{
          top:
            typeof offsetTop === 'number'
              ? Math.max(20, offsetTop - 40)
              : 40,
        }}
      >
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="relative bg-background md:col-span-2">
              <LazyImage
                src={images[safeIndex]}
                alt={item.title || 'preview'}
                aspect="4/3"
                mode="contain"
              />

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/40 text-text ring-1 ring-border/60"
                    aria-label="Previous"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/40 text-text ring-1 ring-border/60"
                    aria-label="Next"
                  >
                    →
                  </button>
                </>
              ) : null}

              {images.length > 1 ? (
                <div className="border-t border-border/60 bg-background/50 p-3">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {images.map((src, i) => (
                      <button
                        key={`thumb-${src}-${i}`}
                        type="button"
                        onClick={() => onSetIndex(i)}
                        className={[
                          'relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border',
                          i === safeIndex
                            ? 'border-brand-600 ring-2 ring-brand-600/30'
                            : 'border-border/60',
                        ].join(' ')}
                        aria-label={`Show image ${i + 1}`}
                      >
                        <img
                          src={src}
                          alt="thumb"
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full bg-background object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-text">
                    {item.title || 'Untitled project'}
                  </h3>

                  {item.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border/40 bg-background/60 px-2 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-muted">
                      {item.category || 'Project'}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card/30 p-2 text-text transition hover:bg-card/50"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {item.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              ) : null}

              {item.link ? (
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
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageCarousel({ images = [] }) {
  const [index, setIndex] = useState(0)
  const [failedImages, setFailedImages] = useState(() => new Set())

  useEffect(() => {
    setIndex(0)
    setFailedImages(new Set())
  }, [images.join('|')])

  const availableImages = images.filter((src) => !failedImages.has(src))
  const safeImages = availableImages.length ? availableImages : images
  const safeIndex = Math.min(index, Math.max(safeImages.length - 1, 0))
  const src = safeImages[safeIndex] || ''

  const markFailed = (failedSrc) => {
    setFailedImages((prev) => {
      const next = new Set(prev)
      next.add(failedSrc)
      return next
    })

    setIndex(0)
  }

  return (
    <div className="relative">
      <LazyImage
        src={src}
        alt="project"
        aspect="4/3"
        mode="cover"
        onImageError={markFailed}
      />

      {safeImages.length > 1 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIndex((i) => (i - 1 + safeImages.length) % safeImages.length)
            }}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-text ring-1 ring-border/60 backdrop-blur hover:bg-background"
          >
            ←
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIndex((i) => (i + 1) % safeImages.length)
            }}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-text ring-1 ring-border/60 backdrop-blur hover:bg-background"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function FireCards({ items = [], serviceKey, serviceTag }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [previewItem, setPreviewItem] = useState(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewOffsetTop, setPreviewOffsetTop] = useState(null)

  const isFromServices = location.pathname.startsWith('/services')
  const isFromHome = location.pathname === '/'
  const isReturnable = ['Acoustic', 'Entertainment'].includes(String(serviceTag))

  const toggleExpanded = (id) => {
    if (!id) return

    setExpandedIds((prev) => {
      const next = new Set(prev)

      if (next.has(id)) next.delete(id)
      else next.add(id)

      return next
    })
  }

  const openWork = (e, work) => {
    e.preventDefault()
    e.stopPropagation()

    if (openExternalLink(work.link)) {
      return
    }

    const targetId = getWorkId(work)

    if (!targetId) {
      const y = e.nativeEvent?.clientY ?? e.clientY

      if (typeof y === 'number') {
        setPreviewOffsetTop(y)
      }

      setPreviewItem(work)
      setPreviewIndex(0)
      setPreviewOpen(true)
      return
    }

    try {
      if (isFromServices && isReturnable) {
        sessionStorage.setItem('returnToWorkId', String(targetId))
        sessionStorage.setItem('returnToSource', 'services')
        sessionStorage.setItem('returnToTime', String(Date.now()))

        if (serviceKey) {
          sessionStorage.setItem('returnToServiceKey', String(serviceKey))
        }

        if (serviceTag) {
          sessionStorage.setItem('returnToServiceTag', String(serviceTag))
        }
      }

      const categoryLc = String(work.category || '').toLowerCase()
      const isEntertainmentItem =
        categoryLc === 'entertainment' || hasTag(work, 'Entertainment')

      if (isFromHome && isEntertainmentItem) {
        sessionStorage.setItem('returnToWorkId', String(targetId))
        sessionStorage.setItem('returnToSource', 'home')
        sessionStorage.setItem('returnToServiceTag', 'Entertainment')
        sessionStorage.setItem('returnToTime', String(Date.now()))
      }
    } catch {}

    navigate(`/works/${targetId}`)
  }

  if (!items.length) {
    return null
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((w, idx) => {
          const workId = getWorkId(w)
          const cardId =
            workId ||
            `${String(w.title || 'work').toLowerCase()}-${String(
              w.createdAt || w.imageUrl || w.url || idx
            )}`

          const categoryLc = String(w.category || '').toLowerCase()
          const shouldPreview =
            categoryLc === 'acoustic' ||
            categoryLc === 'entertainment' ||
            hasTag(w, 'Acoustic') ||
            hasTag(w, 'Entertainment')

          const isExpanded = expandedIds.has(cardId)
          const images = getWorkImages(w)
          const hasManyImages = images.length > 1
          const clickable = Boolean(w.link || shouldPreview || workId)

          return (
            <motion.div
              key={cardId}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                delay: idx * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <div
                id={workId ? `work-card-${workId}` : undefined}
                className="group relative block overflow-hidden rounded-lg border border-border/60 bg-surface transition-shadow hover:shadow-xl hover:shadow-brand-600/5"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    if (clickable) openWork(e, w)
                  }}
                  className={[
                    'block w-full text-left',
                    clickable ? 'cursor-pointer' : 'cursor-default',
                  ].join(' ')}
                >
                  {hasManyImages ? (
                    <ImageCarousel images={images} />
                  ) : (
                    <LazyImage
                      src={images[0]}
                      alt={w.title || 'project'}
                      aspect="video"
                      mode="cover"
                    />
                  )}
                </button>

                <div className="p-4">
                  <h3 className="font-medium text-text group-hover:text-brand-600">
                    {w.title || 'Untitled project'}
                  </h3>

                  {w.category ? (
                    <p className="mt-1 text-xs text-muted">{w.category}</p>
                  ) : null}

                  {w.description ? (
                    <div className="mt-1">
                      <button
                        type="button"
                        className="text-xs font-semibold text-brand-600 hover:underline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleExpanded(cardId)
                        }}
                      >
                        {isExpanded ? 'Less' : 'More'}
                      </button>
                    </div>
                  ) : null}

                  {Array.isArray(w.tags) && w.tags.length ? (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                      {w.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border/40 bg-background/60 px-2 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <AnimatePresence>
                    {isExpanded && w.description ? (
                      <motion.div
                        className="absolute inset-0 z-10 overflow-auto bg-background/90 p-4 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-sm font-semibold text-text">
                            {w.title || 'Project'}
                          </h4>

                          <button
                            type="button"
                            className="text-xs font-semibold text-brand-600 hover:underline"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleExpanded(cardId)
                            }}
                          >
                            Close
                          </button>
                        </div>

                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                          {w.description}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <WorkPreviewModal
        open={previewOpen}
        item={previewItem}
        index={previewIndex}
        onClose={() => setPreviewOpen(false)}
        onSetIndex={setPreviewIndex}
        offsetTop={previewOffsetTop}
      />
    </>
  )
}