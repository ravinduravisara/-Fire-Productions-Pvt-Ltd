import { useState } from 'react'

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
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
      {items.map((w, idx) => {
        const isLink = !!w.link
        const Wrapper = isLink ? 'a' : 'div'
        const wrapperProps = isLink ? { href: w.link, target: '_blank', rel: 'noreferrer' } : {}
        // Ensure a unique, stable id even if backend id/title is missing/duplicated
        const cardId = w.id || w._id || `work-${idx}`
        const isExpanded = cardId ? expandedIds.has(cardId) : false

        return (
          <Wrapper key={cardId} {...wrapperProps}
            className="block break-inside-avoid mb-6 group rounded-lg overflow-hidden border border-border/60 hover:shadow-lg transition-shadow bg-surface">
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
                {isExpanded ? (
                  <p className="text-sm text-muted whitespace-pre-line leading-relaxed">{w.description}</p>
                ) : null}

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
          </div>
        </Wrapper>
        )
      })}
    </div>
  )
}