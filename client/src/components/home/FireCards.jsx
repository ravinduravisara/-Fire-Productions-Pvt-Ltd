import { useState } from 'react'

function WorkPreviewModal({ open, item, index, onClose, onSetIndex }) {
  if (!open || !item) return null

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const filesBase = apiBase.replace(/\/api$/, '')
  const raws = Array.isArray(item.imageUrls) && item.imageUrls.length
    ? item.imageUrls
    : [item.imageUrl || item.image || item.url].filter(Boolean)
  const images = raws.map((u) => (String(u).startsWith('http') ? u : `${filesBase}${u}`))

  const prev = () => onSetIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => onSetIndex((i) => (i + 1) % images.length)

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close preview"
      />
      <div className="relative mx-auto mt-10 w-full max-w-4xl px-4">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative bg-background">
              {images.length ? (
                <img
                  src={images[Math.min(index, images.length - 1)]}
                  alt={item.title || 'preview'}
                  className="aspect-[4/3] w-full object-contain"
                />
              ) : (
                <div className="aspect-[4/3]" />
              )}

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/40 text-text ring-1 ring-border/60"
                    aria-label="Previous"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/40 text-text ring-1 ring-border/60"
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
                        key={`thumb-${i}`}
                        type="button"
                        onClick={() => onSetIndex(i)}
                        className={[
                          'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border',
                          i === index ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-border/60'
                        ].join(' ')}
                        aria-label={`Show image ${i + 1}`}
                      >
                        <img src={src} alt="thumb" className="h-full w-full object-contain bg-background" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-text">{item.title}</h3>
                  {item.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                      {item.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-background/60 border border-border/40">{t}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-muted">{item.category || 'Project'}</div>
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
                <p className="mt-4 text-sm leading-relaxed text-muted">{item.description}</p>
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

function ImageCarousel({ images = [], base = '' }) {
  const [index, setIndex] = useState(0)

  const raw = images[index] || ''
  const src = raw ? (String(raw).startsWith('http') ? raw : `${base}${raw}`) : ''

  return (
    <div className="relative aspect-video bg-surface">
      {src ? (
        <img src={src} alt="project" className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <div className="absolute inset-0" />
      )}

      {images.length > 1 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length) }}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-text ring-1 ring-border/60 backdrop-blur hover:bg-background"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex((i) => (i + 1) % images.length) }}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-text ring-1 ring-border/60 backdrop-blur hover:bg-background"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function FireCards({ items = [] }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [previewItem, setPreviewItem] = useState(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

  const toggleExpanded = (id) => {
    if (!id) return
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!items.length) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((w, idx) => {
        const isLink = !!w.link
        const Wrapper = isLink ? 'a' : 'div'
        const shouldPreview = ['Acoustic', 'Entertainment'].includes(w.category)
        const wrapperProps = isLink ? { href: w.link, target: '_blank', rel: 'noreferrer' } : {}
        // Ensure a unique, stable id even if backend id/title is missing/duplicated
        const cardId = w.id || w._id || `work-${idx}`
        const isExpanded = cardId ? expandedIds.has(cardId) : false

        return (
          <Wrapper
            key={cardId}
            {...wrapperProps}
            onClick={(e) => {
              if (!shouldPreview) return
              e.preventDefault()
              e.stopPropagation()
              setPreviewItem(w)
              setPreviewIndex(0)
              setPreviewOpen(true)
            }}
            className="relative group rounded-lg overflow-hidden border border-border/60 hover:shadow-lg transition-shadow bg-surface">
          
          {(() => {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
            const filesBase = apiBase.replace(/\/api$/, '')
            const list = Array.isArray(w.imageUrls) && w.imageUrls.length
              ? w.imageUrls
              : [w.imageUrl || w.image || w.url].filter(Boolean)

            if (list.length <= 1) {
              const raw = list[0] || ''
              const imageSrc = raw ? (String(raw).startsWith('http') ? raw : `${filesBase}${raw}`) : ''
              return (
                <div className="relative aspect-video bg-surface">
                  {imageSrc ? (
                    <img src={imageSrc} alt="project" className="absolute inset-0 h-full w-full object-contain" />
                  ) : null}
                </div>
              )
            }

            // For Fire Acoustic and Fire Entertainment, show one-by-one moving images
            const isCarousel = ['Acoustic', 'Entertainment'].includes(w.category)
            if (isCarousel) {
              return <ImageCarousel images={list} base={filesBase} />
            }

            // Fallback: thumbnail grid for other categories
            const six = list.slice(0, 6)
            return (
              <div className="grid grid-cols-3 gap-0.5 bg-surface">
                {six.map((raw, idx) => {
                  const src = String(raw).startsWith('http') ? raw : `${filesBase}${raw}`
                  return (
                    <div key={raw + idx} className="relative pt-[56%] bg-surface">
                      <img src={src} alt="project" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  )
                })}
              </div>
            )
          })()}
          <div className="p-4">
            <h3 className="font-medium group-hover:text-brand-600 text-text">{w.title}</h3>
            {w.description ? (
              <div className="mt-1">
                <button
                  type="button"
                  className="mt-1 text-xs font-semibold text-brand-600 hover:underline"
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
            {w.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                {w.tags.map((t) => (<span key={t} className="px-2 py-0.5 rounded-full bg-background/60 border border-border/40">{t}</span>))}
              </div>
            ) : null}
            {/* Overlay description that does not change card height */}
            {isExpanded && w.description ? (
              <div className="absolute inset-0 z-10 bg-background/90 backdrop-blur-sm p-4 overflow-auto">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-text">{w.title}</h4>
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-600 hover:underline"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpanded(cardId) }}
                  >
                    Close
                  </button>
                </div>
                <p className="mt-2 text-sm text-muted whitespace-pre-line leading-relaxed">{w.description}</p>
              </div>
            ) : null}
          </div>
        </Wrapper>
        )
      })}
    </div>

    <WorkPreviewModal
      open={previewOpen}
      item={previewItem}
      index={previewIndex}
      onClose={() => setPreviewOpen(false)}
      onSetIndex={setPreviewIndex}
    />
  </>
  )
}